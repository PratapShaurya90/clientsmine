const ScrapedLead = require('../models/scrapedLead');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePhone = (phoneStr) => {
    if (!phoneStr || phoneStr === 'NA') return 'NA';
    const digits = phoneStr.replace(/\D/g, '');
    if (digits.length >= 10) return `+${digits}`;
    return phoneStr;
};

// ─────────────────────────────────────────────────────────────────────────────
// Date Age Check
// Rule: Keep leads posted within 1 month (preferred), hard cut at 2 months.
// If date is unparseable or 'NA' → keep it (can't verify, be lenient).
// ─────────────────────────────────────────────────────────────────────────────

const TWO_MONTHS_MS = 1000 * 60 * 60 * 24 * 61; // 61 days

const parseRelativeDate = (dateStr) => {
    if (!dateStr || dateStr === 'NA') return null;

    const s = dateStr.toLowerCase().trim();
    const now = Date.now();

    // Relative: "2 days ago", "1 week ago", "3 months ago"
    const relMatch = s.match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/);
    if (relMatch) {
        const n = parseInt(relMatch[1]);
        const unit = relMatch[2];
        const multipliers = {
            second: 1000,
            minute: 60 * 1000,
            hour: 3600 * 1000,
            day: 86400 * 1000,
            week: 7 * 86400 * 1000,
            month: 30 * 86400 * 1000,
            year: 365 * 86400 * 1000,
        };
        return new Date(now - n * multipliers[unit]);
    }

    // Absolute date strings: "2024-06-15", "June 15, 2024", etc.
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) return parsed;

    return null; // unparseable
};

const isWithinTwoMonths = (dateStr) => {
    const date = parseRelativeDate(dateStr);
    if (!date) return true; // unknown date → keep
    return (Date.now() - date.getTime()) <= TWO_MONTHS_MS;
};

// ─────────────────────────────────────────────────────────────────────────────

const optimizeAndSaveLeads = async (userId, userMessageId, rawLeads, intentData) => {
    if (!rawLeads || rawLeads.length === 0) return [];

    const candidates = [];

    for (let raw of rawLeads) {
        // 1. Date Filter — hard cut at 2 months
        if (!isWithinTwoMonths(raw.posted_date)) {
            console.log(`[Optimizer] Skipping stale lead (>2 months): ${raw.company_name} — ${raw.posted_date}`);
            continue;
        }

        // 2. Validation & Normalization
        let email = 'NA';
        if (raw.email && emailRegex.test(raw.email)) {
            email = raw.email.trim().toLowerCase();
        }

        let phone = normalizePhone(raw.phone);
        let website = raw.website || 'NA';
        let linkedin = raw.linkedin || 'NA';
        let companyName = (raw.company_name || 'NA').trim();
        let jobTitle = (raw.job_title || 'Unknown Title').trim();
        let city = (raw.city || 'NA').trim();
        let country = (raw.country || 'NA').trim();
        let domain = (raw.domain || 'NA').trim();
        let paying_amount = (raw.paying_amount || 'NA').trim();

        // 3. Skip if no source URL
        if (!raw.source_url || raw.source_url === 'NA' || raw.source_url === '') {
            console.log(`[Optimizer] Skipping lead with no source_url: ${companyName}`);
            continue;
        }

        // 4. Clean redirect URLs (Google/DuckDuckGo)
        let sourceUrl = raw.source_url;
        if (sourceUrl.includes('/url?q=')) {
            try {
                const parsedUrl = new URL(sourceUrl, 'https://www.google.com');
                const target = parsedUrl.searchParams.get('q');
                if (target) sourceUrl = decodeURIComponent(target);
            } catch (e) { /* keep as-is */ }
        } else if (sourceUrl.includes('uddg=')) {
            try {
                const cleanUrl = sourceUrl.startsWith('//') ? `https:${sourceUrl}` : sourceUrl;
                const parsedUrl = new URL(cleanUrl);
                const target = parsedUrl.searchParams.get('uddg');
                if (target) sourceUrl = decodeURIComponent(target);
            } catch (e) { /* keep as-is */ }
        }

        // 5. Extract domain from website/source_url if website is NA
        if (website === 'NA' && sourceUrl !== 'NA') {
            try {
                const u = new URL(sourceUrl);
                // Don't use job board domains as the company website
                const jobBoards = ['linkedin.com', 'remoteok.com', 'weworkremotely.com', 'news.ycombinator.com'];
                if (!jobBoards.some(jb => u.hostname.includes(jb))) {
                    website = u.origin;
                }
            } catch (e) { /* skip */ }
        }

        // 6. Tier Assignment — email is now the primary contact signal
        let tier;
        if (email !== 'NA') {
            tier = 1; // Has email → highest value
        } else if (phone !== 'NA' || website !== 'NA') {
            tier = 2; // Has some contact info
        } else {
            tier = 3; // Link only
        }

        candidates.push({
            userId,
            userMessageId,
            domain_category: intentData ? intentData.domain_category : 'NA',
            company_name: companyName,
            job_title: jobTitle,
            city,
            country,
            domain,
            paying_amount,
            posted_date: raw.posted_date || 'NA',
            email,
            phone,
            website,
            linkedin,
            source_url: sourceUrl,
            scraped_at_utc: new Date(),
            tier
        });
    }

    if (candidates.length === 0) return [];

    // 7. Ultra-Fast Single Batch DB Query for Deduplication (replaces N sequential roundtrips)
    const queryPairs = candidates.map(c => ({
        company_name: c.company_name,
        job_title: c.job_title
    }));

    const existingDocs = await ScrapedLead.find({
        userId,
        $or: queryPairs
    }).select('company_name job_title').lean();

    const existingSet = new Set(
        existingDocs.map(d => `${d.company_name.toLowerCase()}|||${d.job_title.toLowerCase()}`)
    );

    const seenInBatch = new Set();
    const optimizedLeads = [];

    for (const lead of candidates) {
        const key = `${lead.company_name.toLowerCase()}|||${lead.job_title.toLowerCase()}`;
        if (existingSet.has(key) || seenInBatch.has(key)) {
            console.log(`[Optimizer] Dedup: ${lead.company_name} - ${lead.job_title}`);
            continue;
        }
        seenInBatch.add(key);
        optimizedLeads.push(lead);
    }

    // 8. Sort: email leads first (tier 1), then rest
    optimizedLeads.sort((a, b) => a.tier - b.tier);

    // 9. Save to DB in one bulk operation
    if (optimizedLeads.length > 0) {
        await ScrapedLead.insertMany(optimizedLeads);
        console.log(`[Optimizer] Saved ${optimizedLeads.length} leads (Tier 1: ${optimizedLeads.filter(l => l.tier === 1).length}, Tier 2: ${optimizedLeads.filter(l => l.tier === 2).length}, Tier 3: ${optimizedLeads.filter(l => l.tier === 3).length})`);
    }

    return optimizedLeads;
};

module.exports = { optimizeAndSaveLeads };
