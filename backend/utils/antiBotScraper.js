const axios = require('axios');
const http = require('http');
const https = require('https');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// Reusable HTTP / HTTPS agents with keep-alive for rapid connection reuse
const httpAgent = new http.Agent({ keepAlive: true });
const httpsAgent = new https.Agent({ keepAlive: true });

// --- Concurrency Limiter (Semaphore) ---
const MAX_CONCURRENT_BROWSERS = 2;
let activeBrowsers = 0;
const browserQueue = [];

const acquireBrowserSlot = () => {
    if (activeBrowsers < MAX_CONCURRENT_BROWSERS) {
        activeBrowsers++;
        return Promise.resolve();
    }
    return new Promise(resolve => browserQueue.push(resolve));
};

const releaseBrowserSlot = () => {
    if (browserQueue.length > 0) {
        const next = browserQueue.shift();
        next();
    } else {
        activeBrowsers--;
    }
};
// ---------------------------------------

const USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0"
];

// Track last request time per domain to enforce 3 second rule
const domainLastRequest = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Dynamic/Puppeteer: 1.5-3s when browser simulation is needed
const getDynamicDelay = () => Math.floor(Math.random() * (3000 - 1500) + 1500);

// Static HTML sites: minimal jitter (30-80ms) to avoid exact lockstep while being ultra fast
const getStaticDelay = () => Math.floor(Math.random() * 50 + 30);

// Open APIs: 0ms delay
const getApiDelay = () => 0;

const enforceDomainRateLimit = async (url) => {
    try {
        const domain = new URL(url).hostname;
        const lastReq = domainLastRequest.get(domain) || 0;
        const now = Date.now();
        const timeSinceLast = now - lastReq;
        
        // HARD RULE: Max 1 request per 3 seconds to the SAME domain
        if (lastReq > 0 && timeSinceLast < 3000) {
            const waitTime = 3000 - timeSinceLast;
            console.log(`[AntiBot] Rate limit for ${domain}. Waiting ${waitTime}ms`);
            await sleep(waitTime);
        }
        domainLastRequest.set(domain, Date.now());
    } catch (e) {
        console.warn("[AntiBot] Invalid URL for rate limiting:", url);
    }
};

const getRandomUserAgent = () => {
    return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
};

// Standard static HTML scraper — fast with keepAlive agents
const fetchStaticHtml = async (url, retries = 3) => {
    await enforceDomainRateLimit(url);
    await sleep(getStaticDelay());

    let attempt = 0;
    while (attempt < retries) {
        try {
            const response = await axios.get(url, {
                httpAgent,
                httpsAgent,
                headers: {
                    'User-Agent': getRandomUserAgent(),
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Accept-Encoding': 'gzip, deflate, br'
                },
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            attempt++;
            if (error.response && error.response.status === 429) {
                const backoff = Math.pow(2, attempt) * 1000;
                console.log(`[AntiBot] 429 on ${url}. Retrying in ${backoff}ms...`);
                await sleep(backoff);
            } else if (error.response && (error.response.status === 403 || error.response.status === 401)) {
                console.error(`[AntiBot] Access Denied on ${url}`);
                throw new Error("ACCESS_DENIED");
            } else {
                if (attempt === retries) throw error;
            }
        }
    }
    throw new Error("MAX_RETRIES_REACHED");
};

// Fast open-API scraper — zero artificial delay, connection pooling
const fetchApiJson = async (url, retries = 2) => {
    let attempt = 0;
    while (attempt < retries) {
        try {
            const response = await axios.get(url, {
                httpAgent,
                httpsAgent,
                headers: { 'User-Agent': getRandomUserAgent(), 'Accept': 'application/json' },
                timeout: 8000
            });
            return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        } catch (error) {
            attempt++;
            if (attempt === retries) throw error;
            await sleep(300);
        }
    }
    throw new Error("MAX_RETRIES_REACHED");
};

const fetchDynamicHtml = async (url) => {
    await acquireBrowserSlot();
    try {
        await enforceDomainRateLimit(url);
        await sleep(getDynamicDelay());

        let browser;
        try {
            browser = await puppeteer.launch({
                headless: 'new',
                args: [
                    '--no-sandbox', 
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-accelerated-2d-canvas',
                    '--no-first-run',
                    '--no-zygote',
                    '--disable-gpu'
                ],
                timeout: 15000
            });
            
            const page = await browser.newPage();
            page.setDefaultNavigationTimeout(25000); 
            await page.setUserAgent(getRandomUserAgent());
            
            let activePage = page;
            let response;
            try {
                response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 25000 });
            } catch (err) {
                if (
                    err.message.includes('detached') || 
                    err.message.includes('destroyed') || 
                    err.message.includes('navigation')
                ) {
                    console.log(`[AntiBot] Redirect or navigation issue during page.goto: ${err.message}. Waiting 4s for page to settle...`);
                    await sleep(4000);
                    // Re-acquire active page to avoid detached frame references
                    const pages = await browser.pages();
                    activePage = pages[pages.length - 1] || page;
                } else if (err.message.includes('timeout')) {
                    console.log(`[AntiBot] Timeout of 25s reached on ${url}, attempting to extract partial HTML anyway...`);
                } else {
                    throw err;
                }
            }
            
            let title = "";
            let currentUrl = "";
            try {
                title = await activePage.title();
                currentUrl = activePage.url();
            } catch (e) {
                console.log(`[AntiBot] Error reading title/URL from current page reference: ${e.message}. Re-acquiring page...`);
                await sleep(2000);
                const pages = await browser.pages();
                activePage = pages[pages.length - 1] || activePage;
                try {
                    title = await activePage.title();
                    currentUrl = activePage.url();
                } catch (e2) {
                    console.log(`[AntiBot] Failed to read title/URL on retry: ${e2.message}`);
                }
            }

            // Google Consent Page Handling
            if (currentUrl.includes('consent.google.com') || title.includes('Before you continue') || title.toLowerCase().includes('consent')) {
                console.log(`[AntiBot] Google Consent page detected. Attempting bypass...`);
                try {
                    const buttons = await activePage.$$('button');
                    let clicked = false;
                    for (const button of buttons) {
                        const text = await activePage.evaluate(el => el.textContent, button);
                        if (text && (
                            text.includes('Accept all') || 
                            text.includes('I agree') || 
                            text.includes('Accept') || 
                            text.includes('Agree') || 
                            text.includes('Accept cookies')
                        )) {
                            console.log(`[AntiBot] Clicking consent button: "${text.trim()}"`);
                            await button.click();
                            clicked = true;
                            await activePage.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
                            break;
                        }
                    }
                    if (!clicked) {
                        const selectors = [
                            'button[aria-label="Accept all"]',
                            'button[aria-label="I agree"]',
                            '#L2AGLb',
                            'form[action*="consent"] button'
                        ];
                        for (const selector of selectors) {
                            try {
                                const btn = await activePage.$(selector);
                                if (btn) {
                                    await btn.click();
                                    await activePage.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
                                    clicked = true;
                                    break;
                                }
                            } catch (e) {}
                        }
                    }
                    // Re-acquire page reference after navigating away from consent
                    const pages = await browser.pages();
                    activePage = pages[pages.length - 1] || activePage;
                    title = await activePage.title().catch(() => '');
                } catch (e) {
                    console.log(`[AntiBot] Error handling consent screen: ${e.message}`);
                }
            }

            if (title.includes("Just a moment") || title.includes("Cloudflare")) {
                console.log(`[AntiBot] Cloudflare detected on ${activePage.url()}. Waiting 5s...`);
                await sleep(5000);
            }

            if (response && response.status() === 429) {
                throw new Error("HTTP_429");
            }

            let html = "";
            try {
                html = await activePage.content();
            } catch (err) {
                console.log(`[AntiBot] Error reading content: ${err.message}. Retrying re-acquire page.`);
                const pages = await browser.pages();
                activePage = pages[pages.length - 1] || activePage;
                html = await activePage.content();
            }
            return html;

        } catch (error) {
            console.error(`[AntiBot] Puppeteer error on ${url}:`, error.message);
            throw error;
        } finally {
            if (browser) await browser.close();
        }
    } finally {
        releaseBrowserSlot();
    }
};

module.exports = {
    fetchStaticHtml,
    fetchApiJson,
    fetchDynamicHtml,
    sleep
};
