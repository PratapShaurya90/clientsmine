const { fetchStaticHtml, fetchApiJson, fetchDynamicHtml } = require('../../utils/antiBotScraper');
const cheerio = require('cheerio');

const scraperAgentNode = async (state) => {
    console.log("[Node] ScraperAgent");

    const scrapePromises = (state.targetSites || []).map(async (site) => {
        try {
            console.log(`[ScraperAgent] Scraping ${site.name} at ${site.fullUrl}`);
            let rawContent;

            if (site.name === 'HackerNews') {
                // HackerNews Algolia is a public JSON API — use fast fetcher, no delays needed
                rawContent = await fetchApiJson(site.fullUrl);
                console.log(`[ScraperAgent] HackerNews API returned ${rawContent.length} chars`);
                return { site: site.name, url: site.fullUrl, html: rawContent.substring(0, 120000) };
            }

            if (site.type === 'dynamic') {
                try {
                    rawContent = await fetchDynamicHtml(site.fullUrl);
                } catch (error) {
                    console.log(`[ScraperAgent] Dynamic fetch failed for ${site.name}: ${error.message}. Trying static fallback...`);
                    try {
                        rawContent = await fetchStaticHtml(site.fullUrl);
                    } catch (fallbackError) {
                        console.error(`[ScraperAgent] Static fallback also failed for ${site.name}:`, fallbackError.message);
                        return null;
                    }
                }
            } else {
                rawContent = await fetchStaticHtml(site.fullUrl);
            }

            // Strip HTML for all non-API sources
            const $ = cheerio.load(rawContent);
            $('script, style, svg, nav, footer, iframe, noscript, head').remove();
            const cleanedHtml = $('body').html() || '';
            const strippedContent = cleanedHtml.replace(/\s+/g, ' ').substring(0, 150000);

            console.log(`[ScraperAgent] Successfully scraped ${site.name} — ${strippedContent.length} chars`);
            return { site: site.name, url: site.fullUrl, html: strippedContent };

        } catch (error) {
            console.error(`[ScraperAgent] Error scraping ${site.name}:`, error.message);
            return null;
        }
    });

    const settledResults = await Promise.allSettled(scrapePromises);
    const htmlResults = [];

    for (const r of settledResults) {
        if (r.status === 'fulfilled' && r.value) {
            htmlResults.push(r.value);
        }
    }

    console.log(`[ScraperAgent] Successfully scraped ${htmlResults.length}/${state.targetSites.length} sites`);
    return { ...state, rawHtmlResults: htmlResults };
};

module.exports = scraperAgentNode;
