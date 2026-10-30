const { GoogleGenerativeAI } = require('@google/generative-ai');
const cheerio = require('cheerio');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─────────────────────────────────────────────────────────────────────────────
// Direct JS Parsers — zero LLM cost, instant
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

const extractEmailsFromText = (text) => {
    if (!text) return 'NA';
    const matches = text.match(EMAIL_REGEX);
    return matches ? matches[0] : 'NA';
};

const splitLocation = (locStr) => {
    if (!locStr || locStr === 'NA') return { city: 'NA', country: 'NA' };
    const parts = locStr.split(',').map(s => s.trim());
    if (parts.length === 1) {
        // If it's a single word like "India" or "Remote", it could be either, but let's default to city for safety unless we do complex NLP.
        return { city: parts[0], country: 'NA' };
    }
    const country = parts.pop();
    const city = parts.join(', ');
    return { city, country };
};

// HackerNews Algolia API → parse JSON directly, no LLM
const parseHackerNews = (rawJson, jobRole) => {
    try {
        const data = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
        const hits = data.hits || [];
        const leads = [];

        for (const hit of hits) {
            const text = hit.story_text || hit.comment_text || '';
            const title = hit.title || hit.story_title || '';

            // Only include if somewhat related to the role
            const combined = (text + title).toLowerCase();
            const roleWords = jobRole.toLowerCase().split(' ');
            const isRelevant = roleWords.some(w => w.length > 3 && combined.includes(w));
            if (!isRelevant && !combined.includes('hiring')) continue;

            const email = extractEmailsFromText(text);

            // Try to extract company from "at CompanyName" or "| CompanyName" patterns
            let company = 'NA';
            const companyMatch = title.match(/(?:at|@|\|)\s+([A-Z][A-Za-z0-9\s&.,-]{2,30})/);
            if (companyMatch) company = companyMatch[1].trim();

            const sourceUrl = hit.objectID
                ? `https://news.ycombinator.com/item?id=${hit.objectID}`
                : 'NA';

            if (sourceUrl === 'NA') continue;

            leads.push({
                company_name: company,
                job_title: title || jobRole,
                posted_date: hit.created_at ? new Date(hit.created_at).toLocaleDateString() : 'NA',
                email,
                phone: 'NA',
                website: 'NA',
                linkedin: 'NA',
                source_url: sourceUrl,
            });
        }

        console.log(`[DataCollector] HackerNews direct parse: ${leads.length} leads`);
        return leads;
    } catch (err) {
        console.error('[DataCollector] HackerNews parse error:', err.message);
        return [];
    }
};

// RemoteOK JSON API → parse directly, no LLM
const parseRemoteOK = (rawJson, jobRole) => {
    try {
        let data = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
        // RemoteOK API returns an array, first element is a legal notice object — skip it
        if (Array.isArray(data)) data = data.filter(item => item.id && item.company);

        const leads = [];
        for (const job of data.slice(0, 20)) {
            const { city, country } = splitLocation(job.location);
            leads.push({
                company_name: job.company || 'NA',
                job_title: job.position || jobRole,
                posted_date: job.date ? new Date(job.date * 1000).toLocaleDateString() : 'NA',
                email: job.apply && job.apply.startsWith('mailto:') ? job.apply.replace('mailto:', '') : 'NA',
                phone: 'NA',
                website: job.company_logo ? new URL(job.url || '').origin : 'NA',
                linkedin: 'NA',
                source_url: job.url || `https://remoteok.com/remote-jobs/${job.id}`,
                city: city,
                country: country,
                domain: 'NA',
                paying_amount: job.salary_min && job.salary_max ? `$${job.salary_min} - $${job.salary_max}` : 'NA',
            });
        }

        console.log(`[DataCollector] RemoteOK direct parse: ${leads.length} leads`);
        return leads;
    } catch (err) {
        console.error('[DataCollector] RemoteOK parse error:', err.message);
        return [];
    }
};

// LinkedIn guest jobs API → parse with Cheerio directly, no LLM
const parseLinkedIn = (html, jobRole) => {
    try {
        const $ = cheerio.load(html);
        const leads = [];

        $('li').each((_, el) => {
            const $el = $(el);

            const jobTitle = $el.find('.base-search-card__title, h3').first().text().trim();
            const company = $el.find('.base-search-card__subtitle a, h4 a, .hidden-nested-link').first().text().trim();
            const location = $el.find('.job-search-card__location').first().text().trim();
            const dateEl = $el.find('time');
            const postedDate = dateEl.attr('datetime') || dateEl.text().trim() || 'NA';
            const jobLink = $el.find('a.base-card__full-link, a[href*="/jobs/view/"]').first().attr('href');

            if (!jobTitle || !jobLink) return;

            // Clean URL — remove tracking params after '?'
            const cleanUrl = jobLink.split('?')[0];
            const { city, country } = splitLocation(location);

            leads.push({
                company_name: company || 'NA',
                job_title: jobTitle,
                posted_date: postedDate,
                email: 'NA',
                phone: 'NA',
                website: 'NA',
                linkedin: cleanUrl,    // job posting IS on LinkedIn
                source_url: cleanUrl,
                city: city,
                country: country,
                domain: 'NA',
                paying_amount: 'NA',
            });
        });

        console.log(`[DataCollector] LinkedIn direct parse: ${leads.length} leads`);
        return leads;
    } catch (err) {
        console.error('[DataCollector] LinkedIn parse error:', err.message);
        return [];
    }
};

// WeWorkRemotely → Fast Direct Cheerio parse (instant, zero LLM latency)
const parseWeWorkRemotely = (html, jobRole) => {
    try {
        const $ = cheerio.load(html);
        const leads = [];

        $('section.jobs li:not(.view-all), li.feature, article.job').each((_, el) => {
            const $el = $(el);
            const title = $el.find('.title, .job-title, h4, h3').first().text().trim();
            const company = $el.find('.company, .company-name, strong').first().text().trim();
            const region = $el.find('.region, .location').first().text().trim();
            const link = $el.find('a[href*="/remote-jobs/"], a').first().attr('href');

            if (!title || !link || link === '#' || link.includes('/categories/')) return;

            const fullUrl = link.startsWith('http') ? link : `https://weworkremotely.com${link}`;
            const { city, country } = splitLocation(region);

            leads.push({
                company_name: company || 'NA',
                job_title: title || jobRole,
                posted_date: 'NA',
                email: 'NA',
                phone: 'NA',
                website: 'NA',
                linkedin: 'NA',
                source_url: fullUrl,
                city: city,
                country: country,
                domain: 'NA',
                paying_amount: 'NA'
            });
        });

        console.log(`[DataCollector] WeWorkRemotely direct parse: ${leads.length} leads`);
        return leads;
    } catch (err) {
        console.error('[DataCollector] WeWorkRemotely direct parse error:', err.message);
        return [];
    }
};

// WeWorkRemotely → Cheerio pre-extract fallback → send only job card text to LLM (much smaller)
const preExtractWWR = (html) => {
    try {
        const $ = cheerio.load(html);
        const jobs = [];

        // WWR job cards are in <li> elements inside <section>
        $('section.jobs li').each((_, el) => {
            const $el = $(el);
            const title = $el.find('.title, .job-title, h4, h3').first().text().trim();
            const company = $el.find('.company, .company-name, strong').first().text().trim();
            const link = $el.find('a').first().attr('href');
            const fullUrl = link ? (link.startsWith('http') ? link : `https://weworkremotely.com${link}`) : null;

            if (title && fullUrl) {
                jobs.push(`Company: ${company || 'NA'} | Role: ${title} | URL: ${fullUrl}`);
            }
        });

        // Fallback: generic article/li with links
        if (jobs.length === 0) {
            $('article, .job, li').each((_, el) => {
                const $el = $(el);
                const title = $el.find('h2, h3, h4, .title').first().text().trim();
                const link = $el.find('a').first().attr('href');
                if (title && link) {
                    const fullUrl = link.startsWith('http') ? link : `https://weworkremotely.com${link}`;
                    jobs.push(`Role: ${title} | URL: ${fullUrl}`);
                }
            });
        }

        return jobs.slice(0, 30).join('\n');
    } catch (e) {
        return html.substring(0, 8000); // last resort fallback
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// LLM fallback for unstructured HTML — but with tiny pre-extracted context
// ─────────────────────────────────────────────────────────────────────────────

const extractWithLLM = async (model, compactText, siteName, jobRole, siteUrl) => {
    const prompt = `
    Extract job leads from this pre-extracted job listing data.
    Target Role: ${jobRole}
    Source: ${siteName}

    Data (one job per line):
    ${compactText}

    Return a JSON array. Each element:
    {
        "company_name": "string or NA",
        "job_title": "string",
        "posted_date": "NA",
        "email": "string or NA",
        "phone": "NA",
        "website": "NA",
        "linkedin": "NA",
        "source_url": "full URL string",
        "city": "extract city if present, else NA",
        "country": "extract country if present, else NA",
        "domain": "string or NA",
        "paying_amount": "string or NA"
    }
    Return [] if no jobs found. No explanation, JSON only.
    `;

    const llmResult = await model.generateContent(prompt);
    const parsed = JSON.parse(llmResult.response.text());
    return Array.isArray(parsed) ? parsed : [];
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Node
// ─────────────────────────────────────────────────────────────────────────────

const dataCollectorNode = async (state) => {
    console.log("[Node] DataCollector");
    const extractedLeads = [];

    const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        generationConfig: { responseMimeType: "application/json" }
    });

    for (const result of state.rawHtmlResults) {
        const { site, html, url } = result;
        const jobRole = state.intentData.job_role;

        try {
            let leads = [];

            if (site === 'HackerNews') {
                // ✅ Direct JSON parse — ~0ms LLM time
                leads = parseHackerNews(html, jobRole);

            } else if (site === 'RemoteOK') {
                // ✅ Try direct JSON parse first (RemoteOK API)
                // If not JSON (HTML fallback), use LLM with small context
                try {
                    JSON.parse(html); // test if it's valid JSON
                    leads = parseRemoteOK(html, jobRole);
                } catch {
                    const compact = preExtractWWR(html); // reuse Cheerio extractor
                    leads = await extractWithLLM(model, compact, site, jobRole, url);
                }

            } else if (site === 'LinkedIn') {
                // ✅ Direct Cheerio parse of LinkedIn guest jobs API HTML — no LLM
                leads = parseLinkedIn(html, jobRole);

            } else if (site === 'WeWorkRemotely') {
                // Try ultra-fast direct Cheerio parse first
                leads = parseWeWorkRemotely(html, jobRole);

                // If direct Cheerio found 0 leads, fallback to LLM
                if (leads.length === 0) {
                    const compact = preExtractWWR(html);
                    if (compact.trim()) {
                        leads = await extractWithLLM(model, compact, site, jobRole, url);
                    } else {
                        console.log(`[DataCollector] WWR: no job cards found in HTML`);
                    }
                }

            } else {
                // Generic HTML fallback — Cheerio extract then LLM
                const compact = preExtractWWR(html);
                leads = await extractWithLLM(model, compact, site, jobRole, url);
            }

            console.log(`[DataCollector] ${site}: ${leads.length} leads extracted`);
            extractedLeads.push(...leads);

        } catch (error) {
            console.error(`[DataCollector] Failed on ${site}:`, error.message);
        }
    }

    console.log(`[DataCollector] Total leads: ${extractedLeads.length}`);
    return { ...state, extractedLeads };
};

module.exports = dataCollectorNode;
