const siteSelectorNode = async (state) => {
    console.log("[Node] SiteSelector");
    const { domain_category, job_role } = state.intentData;

    // Normalize to lowercase for safe matching
    const category = (domain_category || '').toLowerCase().replace(/\s+/g, '_');

    let sites = [];

    if (['software_engineering', 'ai_ml', 'ai_agents'].includes(category)) {
        sites = [
            { name: 'LinkedIn', type: 'static', url: 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=' },
            { name: 'RemoteOK', type: 'static', url: 'https://remoteok.com/remote-' },
            { name: 'WeWorkRemotely', type: 'static', url: 'https://weworkremotely.com/remote-jobs/search?term=' },
        ];
    } else if (['web_design', 'ui_design', 'graphic_design'].includes(category)) {
        sites = [
            { name: 'LinkedIn', type: 'static', url: 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=' },
            { name: 'WeWorkRemotely', type: 'static', url: 'https://weworkremotely.com/remote-jobs/search?term=' },
            { name: 'RemoteOK', type: 'static', url: 'https://remoteok.com/remote-' },
        ];
    } else if (['freelance'].includes(category)) {
        sites = [
            { name: 'LinkedIn', type: 'static', url: 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=' },
            { name: 'WeWorkRemotely', type: 'static', url: 'https://weworkremotely.com/remote-jobs/search?term=' },
            { name: 'RemoteOK', type: 'static', url: 'https://remoteok.com/remote-' },
        ];
    } else if (['content_writing', 'copywriting'].includes(category)) {
        sites = [
            { name: 'LinkedIn', type: 'static', url: 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=' },
            { name: 'WeWorkRemotely', type: 'static', url: 'https://weworkremotely.com/remote-jobs/search?term=' },
            { name: 'RemoteOK', type: 'static', url: 'https://remoteok.com/remote-' },
        ];
    } else {
        // Default: all sources
        sites = [
            { name: 'LinkedIn', type: 'static', url: 'https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=' },
            { name: 'WeWorkRemotely', type: 'static', url: 'https://weworkremotely.com/remote-jobs/search?term=' },
            { name: 'RemoteOK', type: 'static', url: 'https://remoteok.com/remote-' },
        ];
    }

    // HackerNews removed by user request

    // Build full URLs
    const query = encodeURIComponent(job_role);
    const locationStr = state.intentData.location ? encodeURIComponent(state.intentData.location) : 'Worldwide';

    sites = sites.map(site => {
        // RemoteOK: slug-style URL
        if (site.name === 'RemoteOK') {
            const slug = job_role.toLowerCase().replace(/\s+/g, '-');
            return { ...site, fullUrl: `https://remoteok.com/remote-${slug}-jobs` };
        }
        // LinkedIn guest API: needs &start=0 to get first page of results
        if (site.name === 'LinkedIn') {
            return { ...site, fullUrl: `${site.url}${query}&location=${locationStr}&start=0` };
        }
        return { ...site, fullUrl: site.url + query };
    });


    console.log(`[SiteSelector] Selected ${sites.length} sites for category "${category}":`, sites.map(s => s.name));

    return { ...state, targetSites: sites };
};

module.exports = siteSelectorNode;
