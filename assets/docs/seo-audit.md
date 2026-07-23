# MK Bags World — SEO Audit & Implementation Guide

Last updated: 2026-07-23  
Site: [https://mkbagsworld.com](https://mkbagsworld.com)

This document wraps up the SEO work applied to the project and lists what you must configure before / after going live so Google can index the site.

---

## 1. What was implemented

### Critical fixes
| Item | Status | Where |
|------|--------|--------|
| Google Analytics 4 loader | Done (placeholder ID) | `assets/js/analytics.js` included in all HTML `<head>` |
| Google Search Console meta hook | Done (empty until you paste token) | `assets/js/analytics.js` → `GSC_CONTENT` |
| Structured data (JSON-LD) | Done | `assets/js/seo.js` |
| Real 404 page (no soft-404) | Done | `404.html` + `.htaccess` `ErrorDocument 404 /404.html` |
| OG / Twitter share image (JPG) | Done | Uses `assets/images/hero/hero-bg.jpg` sitewide |
| Single H1 on homepage | Done | Only first hero slide uses `<h1>`; others use `<p class="hero-title">` |

### Important fixes
| Item | Status | Where |
|------|--------|--------|
| Twitter cards on all pages | Done | products, about, contact, privacy, terms, return, 404 |
| FAQ schema | Done | Homepage via `seo.js` (`FAQPage`) |
| Product / ItemList schema | Done | Home + products via `seo.js` |
| Breadcrumbs (UI + schema) | Done | `.seo-breadcrumb` on inner pages + `BreadcrumbList` JSON-LD |
| Duplicate URL fix | Done | `.htaccess` 301: `/about` → `/about.html`, `/index.html` → `/` |
| Longer legal meta descriptions | Done | privacy / terms / return |
| Products TikTok link | Fixed | Real TikTok URL |
| Products WhatsApp number | Fixed | `wa.me/923356000819` |

### Schemas injected by `seo.js`
- **Organization** (+ `sameAs` social profiles) — all pages  
- **WebSite** (+ SearchAction → products) — all pages  
- **Store / LocalBusiness** — home + contact  
- **FAQPage** — home  
- **ItemList** of **Product** offers — home (trending) + products  
- **BreadcrumbList** — all inner pages  

---

## 2. Files added / updated for SEO

| File | Role |
|------|------|
| `assets/js/analytics.js` | GA4 + Search Console verification |
| `assets/js/seo.js` | JSON-LD structured data |
| `404.html` | Custom not-found page (`noindex`) |
| `.htaccess` | HTTPS, www→non-www, `.html` canonicalization, real 404 |
| `robots.txt` | Crawl rules + sitemap |
| `sitemap.xml` | All indexable URLs |
| `seo-audit.md` | This checklist |

---

## 3. Google Analytics — where and how

**File:** `assets/js/analytics.js`  
**Included from:** every page `<head>` (after favicon/manifest).

1. Open [Google Analytics](https://analytics.google.com/) → Admin → Data streams → Web → copy **Measurement ID** (`G-XXXXXXXX`).
2. Edit `assets/js/analytics.js`:

```js
var GA_ID = "G-XXXXXXXX"; // your real ID
```

3. Until you replace `G-XXXXXXXXXX`, analytics **does not load** (safe placeholder).

Optional: the same IDs are also stored in `assets/data/site-config.js` for reference:
- `googleAnalyticsId`
- `googleSiteVerification`

---

## 4. Google Search Console — indexing checklist

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add property: `https://mkbagsworld.com`
3. Verify ownership:
   - **HTML tag method:** paste the `content="..."` value into `GSC_CONTENT` in `assets/js/analytics.js`, **or**
   - Upload the HTML verification file to the site root, **or**
   - Verify via DNS TXT record
4. Submit sitemap: `https://mkbagsworld.com/sitemap.xml`
5. Use **URL Inspection** on homepage + products, then **Request indexing**
6. Confirm `robots.txt` is reachable: `https://mkbagsworld.com/robots.txt`

---

## 5. Go-live checklist (must do)

- [ ] Point domain DNS to hosting (A / CNAME)
- [ ] Confirm HTTPS certificate is active
- [ ] Replace `GA_ID` in `analytics.js`
- [ ] Add Search Console verification
- [ ] Submit `sitemap.xml` in Search Console
- [ ] Confirm `.htaccess` works on Apache host (or convert rules for Nginx)
- [ ] Test: `https://mkbagsworld.com/about` 301 → `.../about.html`
- [ ] Test: unknown URL shows `404.html` (not homepage)
- [ ] Test social share preview (Facebook Debugger / Twitter Card Validator) with JPG OG image
- [ ] Confirm WhatsApp number and social links are correct
- [ ] Prefer a dedicated 1200×630 JPG later as `assets/images/og-cover.jpg` for cleaner share cards

---

## 6. Page SEO status (after implementation)

| Page | Title / Desc | Canonical | Twitter | Breadcrumbs | Schema |
|------|--------------|-----------|---------|-------------|--------|
| Home | OK | `/` | OK | — | Org, WebSite, Store, FAQ, ItemList |
| Products | OK | OK | OK | UI + schema | Org, WebSite, ItemList, Breadcrumb |
| About | OK | OK | OK | UI + schema | Org, WebSite, Breadcrumb |
| Contact | OK | OK | OK | UI + schema | Org, WebSite, Store, Breadcrumb |
| Privacy | Expanded | OK | OK | UI + schema | Org, WebSite, Breadcrumb |
| Terms | Expanded | OK | OK | UI + schema | Org, WebSite, Breadcrumb |
| Return | Expanded | OK | OK | UI + schema | Org, WebSite, Breadcrumb |
| 404 | OK | OK | OK | schema | `noindex` |

---

## 7. Technical SEO rules (`.htaccess`)

- Force **HTTPS**
- Force **non-www**
- `/index.html` → `/`
- Extensionless paths **301** to `.html` (matches canonical tags)
- Gzip + browser caching
- Security headers
- Custom **404**

> If your host is **Nginx** or shared hosting without `.htaccess`, ask support to mirror these redirects.

---

## 8. Remaining optional improvements (nice-to-have)

- Create a true branded `og-cover.jpg` (1200×630) instead of hero photo
- Dedicated product detail pages with per-product URLs + Product schema
- Compress / convert product images to WebP for Core Web Vitals
- Monitor Core Web Vitals in Search Console after launch

### Completed nice-to-haves (2026-07-23)
- `<main id="main-content">` landmark on all pages
- PNG favicons + `apple-touch-icon.png` + updated `site.webmanifest`
- Hero slides use real `<img class="hero-media">` with alt + LCP preload on first slide
- Category cards deep-link to filtered products (`?category=...`)

---

## 9. Quick validation tools

After deploy, run:

1. [Google Rich Results Test](https://search.google.com/test/rich-results) — FAQ + Product list  
2. [Schema Markup Validator](https://validator.schema.org/)  
3. [PageSpeed Insights](https://pagespeed.web.dev/)  
4. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)  
5. Mobile-friendly test in Search Console  

---

## 10. Brand & domain notes

- Public brand: **MK Bags World**
- Canonical host used in code: `https://mkbagsworld.com`
- If the live domain differs, update: all canonical/OG URLs, `sitemap.xml`, `robots.txt`, `seo.js` (`SEO_SITE_URL`), and this file.

---

**Owner action required before analytics/indexing work:** set real `GA_ID` and Search Console verification, then submit the sitemap.
