---
name: clientsmine_scraper
description: Guidelines and architecture of the ClientsMine parallel streaming scraper pipeline, including direct parsers, date filters, and SSE streaming.
---

# ClientsMine Scraper Architecture & Maintenance Guide

This skill provides future AI agents with the exact structure, design patterns, and operational rules of the ClientsMine backend scraping pipeline. **Read this file before making any modifications to the scraper, optimizer, or streaming controllers.**

---

## 1. Core Architecture (Parallel SSE Stream)

ClientsMine uses a **Server-Sent Events (SSE)** pipeline to stream leads to the React frontend in real time, site-by-site, rather than waiting for all scrapers to finish.

```
[User Query] 
     │
     ▼
[Intent Parser] (Gemini) ──► Extraction parameters
     │
     ▼
[Site Selector] ──► Array of target sites
     │
     ▼
[Parallel Orchestration] (Promise.allSettled)
     ├──► LinkedIn Scrape ──► Cheerio Parse ──► Optimize ──► SSE Push (Immediate)
     ├──► RemoteOK Scrape ──► JSON Parse ──► Optimize ──► SSE Push (Immediate)
     └──► WWR Scrape      ──► LLM Parse    ──► Optimize ──► SSE Push (Immediate)
```

- **File**: [streamingOrchestrator.js](file:///c:/Users/Hp/OneDrive/clientsmine.com/backend/Implementations/streamingOrchestrator.js)
- **Rule**: All scraping targets must run in parallel using `Promise.allSettled`. Never run scrapers sequentially (`for...of` loops). Each site must execute its own scrape, parse, optimization, and push steps independently.

---

## 2. Scraping & Parsing Strategy (Hybrid Model)

To maximize speed and minimize API costs, we use a hybrid parsing model:

| Source | Access Method | Parser Type | Average Speed |
| :--- | :--- | :--- | :--- |
| **HackerNews** | Public Algolia API | **Direct JS Parse** (No LLM) | ~200–500ms |
| **LinkedIn** | Public Guest Job API | **Direct Cheerio Parse** (No LLM) | ~1–2s |
| **RemoteOK** | Public JSON API / HTML | **Direct JS Parse** (No LLM) | ~1s |
| **WeWorkRemotely** | Static HTML | **Cheerio Pre-extract + LLM** | ~3–5s |

### Rule: Direct Parsers Over LLMs
For structured sources (APIs or HTML with consistent CSS classes like LinkedIn), **always** write direct JS/Cheerio parsers inside [dataCollector.js](file:///c:/Users/Hp/OneDrive/clientsmine.com/backend/Implementations/nodes/dataCollector.js). Only use the LLM (Gemini) as a fallback for unstructured text or sites with highly dynamic layouts.

---

## 3. Date Filtering Constraints
We enforce strict time-based constraints on all extracted job listings inside the optimizer.

- **Hard Threshold**: **2 Months (61 Days)**. Any lead older than 2 months must be discarded.
- **Preferred Timeframe**: **1 Month**.
- **Implementation**: The date parser in [dataOptimizer.js](file:///c:/Users/Hp/OneDrive/clientsmine.com/backend/Optimization/dataOptimizer.js) parses relative strings (e.g. `"2 weeks ago"`, `"1 month ago"`) and absolute ISO dates. If a date is unparseable or `'NA'`, it is kept to avoid false negatives.

---

## 4. Lead Tiering & Sorting (Email First)

Leads are categorized into three quality tiers inside [dataOptimizer.js](file:///c:/Users/Hp/OneDrive/clientsmine.com/backend/Optimization/dataOptimizer.js):

1. **Tier 1 (Highest)**: Leads containing a valid email address.
2. **Tier 2 (Medium)**: Leads containing a phone number or company website, but no email.
3. **Tier 3 (Low)**: Leads containing only the job posting URL.

### Sorting Rule
Before saving to the database or streaming to the client, **always sort the leads by tier ascending** (`tier: 1` first). This ensures that the user sees contactable leads at the top of the table.

---

## 5. Maintenance Checklist for Future Agents

When adding a new job board or modifying an existing one:
1. **Update Site Selector**: Add the target URL mapping in [siteSelector.js](file:///c:/Users/Hp/OneDrive/clientsmine.com/backend/Implementations/nodes/siteSelector.js).
2. **Implement Parser**: In [dataCollector.js](file:///c:/Users/Hp/OneDrive/clientsmine.com/backend/Implementations/nodes/dataCollector.js), write a fast Cheerio/JS parser if the source is structured. If using the LLM, pre-extract the job cards using Cheerio to minimize the token payload.
3. **Validate Output**: Ensure the extracted object matches the database schema in [scrapedLead.js](file:///c:/Users/Hp/OneDrive/clientsmine.com/backend/models/scrapedLead.js) (including `city` and `country` fields).
4. **Safety Check**: Ensure all network calls in your new parser use the rate-limiting and anti-bot protections defined in [antiBotScraper.js](file:///c:/Users/Hp/OneDrive/clientsmine.com/backend/utils/antiBotScraper.js).
