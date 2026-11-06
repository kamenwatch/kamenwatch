// seo-build.mjs — KamenWatch build step. Netlify runs it before every deploy.
//
// Using the same content you edit in /admin, it:
//  1. Writes products, FAQ, care tips, build steps, hero text and the shop's address
//     straight into index.html, so Google and AI crawlers can read them without
//     running JavaScript. app.js still renders everything in the browser as before.
//  2. Fixes the <head>: title, meta description, social tags, canonical link, Store
//     schema (address, phone, opening hours), and loads Google Fonts without blocking.
//  3. Updates the shop heading in app.js (EN/ID/KM) and the Order label for Telegram.
//  4. Creates robots.txt, sitemap.xml and llms.txt when the repo doesn't have its own.
// If anything goes wrong it logs the problem and leaves that part untouched,
// so a deploy never fails because of this script.

import { readFile, writeFile, access } from "node:fs/promises";

/* ---------- settings you can edit ---------- */
const SITE = "https://kamenwatch.com";
const CITY = "Sihanoukville";      // the shop's city: title, schema, footer, llms.txt
const REGION = "Preah Sihanouk";    // province, used in the schema
const TITLE = "Seiko Mods, G-Shock & Watches in Sihanoukville | KamenWatch";
const DESCRIPTION = "Custom Seiko mods built by hand and pressure-tested, plus original G-Shock and everyday watches. Visit our Sihanoukville shop or order on Telegram.";
const GA4_ID = "";    // Google Analytics 4 ID, e.g. "G-ABC123XYZ". Empty = off.
const GSC_TOKEN = ""; // Google Search Console "HTML tag" token. Empty = off.
const SHOP_TITLE = {
  en: "Seiko mods, original G-Shock and watches for every day.",
  id: "Seiko mod, G-Shock original, dan jam untuk sehari-hari.",
  km: "Seiko mod, G-Shock ពិតប្រាកដ និងនាឡិកាសម្រាប់ពាក់រាល់ថ្ងៃ។",
};
/* ------------------------------------------- */

const OLD_SHOP_TITLE = {
  en: "Built, photographed, and numbered one at a time.",
  id: "Dirakit, difoto, dan dinomori satu per satu.",
  km: "ផ្គុំ ថត និងដាក់លេខ ម្តងមួយ។",
};
const BUY_LABELS = [
  ["Order on WhatsApp", "Order on Telegram"],
  ["Pesan via WhatsApp", "Pesan via Telegram"],
  ["បញ្ជាទិញតាម WhatsApp", "បញ្ជាទិញតាម Telegram"],
];

const CITY_RE = /sihanoukville|preah sihanouk|kampong som/i;
const log = (...a) => console.log("[seo-build]", ...a);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const reEsc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function readText(p) { try { return await readFile(p, "utf8"); } catch { return null; } }
async function readJSON(p) {
  const t = await readText(p);
  if (t == null) { log(`${p} not found`); return null; }
  try { return JSON.parse(t); } catch (e) { log(`${p} is not valid JSON (${e.message})`); return null; }
}
async function exists(p) { try { await access(p); return true; } catch { return false; } }

/* ---------- small HTML helpers (regex on known ids; skip quietly if not found) ---------- */
const elementRe = (id) => new RegExp(`(<([a-zA-Z][\\w-]*)\\b[^>]*?\\sid=["']${reEsc(id)}["'][^>]*>)([\\s\\S]*?)(</\\2\\s*>)`);

function setInner(html, id, inner, onlyIfEmpty = false) {
  const re = elementRe(id);
  const m = html.match(re);
  if (!m) { log(`#${id} not found, skipped`); return html; }
  if (onlyIfEmpty && m[3].trim() !== "") { log(`#${id} already has content, skipped`); return html; }
  return html.replace(re, (_all, open, _tag, _old, close) => open + inner + close);
}
function insertAfter(html, id, snippet) {
  const m = html.match(elementRe(id));
  if (!m) { log(`#${id} not found, nothing inserted after it`); return html; }
  const end = m.index + m[0].length;
  return html.slice(0, end) + snippet + html.slice(end);
}
function setMeta(html, attr, key, value, insertIfMissing = false) {
  const re = new RegExp(`<meta\\b[^>]*\\b${attr}=["']${reEsc(key)}["'][^>]*>`, "i");
  const tag = `<meta ${attr}="${esc(key)}" content="${esc(value)}">`;
  if (re.test(html)) return html.replace(re, () => tag);
  return insertIfMissing ? html.replace(/<\/head>/i, () => `${tag}\n</head>`) : html;
}

/* ---------- data helpers ---------- */
function parseHours(str) {
  const m = String(str || "").match(/(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s*[–—-]\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?[^0-9]*(\d{1,2})[:.](\d{2})\s*[–—-]\s*(\d{1,2})[:.](\d{2})/i);
  if (!m) return undefined;
  const keys = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
  const names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const a = keys.indexOf(m[1].toLowerCase()), b = keys.indexOf(m[2].toLowerCase());
  const days = [];
  for (let i = a; ; i = (i + 1) % 7) { days.push(names[i]); if (i === b) break; }
  const hm = (h, mm) => `${String(h).padStart(2, "0")}:${mm}`;
  return [{ "@type": "OpeningHoursSpecification", dayOfWeek: days, opens: hm(m[3], m[4]), closes: hm(m[5], m[6]) }];
}
const realUrl = (u) => /^https?:\/\/[^/\s]+\/[^\s#?]+/.test(String(u || ""));

async function main() {
  const html0 = await readText("index.html");
  if (html0 == null) { log("index.html not found, nothing to do"); return; }
  const S = (await readJSON("content/settings.json")) || {};
  const PJ = await readJSON("content/products.json");
  const P = Array.isArray(PJ?.products) ? PJ.products : [];
  let html = html0;

  const contact = S.contact || {};
  const visit = S.visit || {};
  const tg = String(contact.telegram || "").replace(/^@|^https?:\/\/t\.me\//i, "").trim();
  const wa = String(contact.whatsapp || visit.whatsapp || "").replace(/\D/g, "");
  const primary = contact.primary || (tg ? "telegram" : wa ? "whatsapp" : "");
  const orderHref = primary === "telegram" && tg ? `https://t.me/${tg}` : wa ? `https://wa.me/${wa}` : tg ? `https://t.me/${tg}` : "#visit";
  const buyLabel = primary === "telegram" ? "Order on Telegram" : primary === "whatsapp" ? "Order on WhatsApp" : "Order";
  const address = String(visit.address || "").trim();
  const addressOk = address && !/add your workshop address/i.test(address);
  const addressLine = address.replace(/\s*\n\s*/g, ", ");
  const phone = wa ? `+${wa}` : "";
  const cur = S.currency || "$";

  /* ----- head ----- */
  const titleRe = /<title\b[^>]*>[\s\S]*?<\/title>/i;
  html = titleRe.test(html) ? html.replace(titleRe, () => `<title>${esc(TITLE)}</title>`) : html.replace(/<head\b[^>]*>/i, (h) => `${h}\n<title>${esc(TITLE)}</title>`);
  html = setMeta(html, "name", "description", DESCRIPTION, true);
  html = setMeta(html, "property", "og:title", TITLE);
  html = setMeta(html, "property", "og:description", DESCRIPTION);
  html = setMeta(html, "name", "twitter:title", TITLE);
  html = setMeta(html, "name", "twitter:description", DESCRIPTION);
  if (!/<link\b[^>]*rel=["']canonical["']/i.test(html)) html = html.replace(/<\/head>/i, () => `<link rel="canonical" href="${SITE}/">\n</head>`);
  if (GSC_TOKEN) html = setMeta(html, "name", "google-site-verification", GSC_TOKEN, true);

  // Google Fonts: load without blocking the first paint
  if (!/rel=["']preload["'][^>]*fonts\.googleapis\.com/i.test(html)) {
    html = html.replace(/<link\b[^>]*href=["'](https:\/\/fonts\.googleapis\.com\/css2?[^"']*)["'][^>]*>/gi, (tag, href) =>
      /rel=["']stylesheet["']/i.test(tag)
        ? `<link rel="preload" as="style" href="${href}" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" href="${href}"></noscript>`
        : tag);
  }
  if (/fonts\.googleapis\.com/i.test(html) && !/rel=["']preconnect["'][^>]*fonts\.gstatic\.com/i.test(html)) {
    html = html.replace(/<\/head>/i, () => `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n</head>`);
  }

  // Store schema (replaces the old one)
  const social = (S.social || []).map((s) => s && s.url).filter(realUrl);
  const ld = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${SITE}/#store`,
    name: "KamenWatch",
    url: `${SITE}/`,
    description: DESCRIPTION,
    image: (await exists("images/og-cover.jpg")) ? `${SITE}/images/og-cover.jpg` : undefined,
    logo: (await exists("images/uploads/logo.png")) ? `${SITE}/images/uploads/logo.png` : undefined,
    priceRange: "$$",
    currenciesAccepted: "USD",
    knowsLanguage: ["en", "id", "km"],
    areaServed: { "@type": "City", name: CITY },
    address: { "@type": "PostalAddress", streetAddress: addressOk ? addressLine : undefined, addressLocality: CITY, addressRegion: REGION, addressCountry: "KH" },
    telephone: phone || undefined,
    email: visit.email || contact.email || undefined,
    hasMap: realUrl(visit.maps_link) ? visit.maps_link : undefined,
    openingHoursSpecification: parseHours(visit.hours),
    sameAs: [...social, tg ? `https://t.me/${tg}` : null].filter(Boolean),
  };
  const ldTag = `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, "\\u003c")}</script>`;
  const ldRe = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/i;
  html = ldRe.test(html) ? html.replace(ldRe, () => ldTag) : html.replace(/<\/head>/i, () => `${ldTag}\n</head>`);

  if (GA4_ID && !html.includes("googletagmanager.com/gtag/js")) {
    html = html.replace(/<\/head>/i, () =>
      `<script async src="https://www.googletagmanager.com/gtag/js?id=${esc(GA4_ID)}"></script>\n` +
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","${esc(GA4_ID)}");</script>\n</head>`);
  }

  /* ----- body: pre-render what app.js draws in the browser ----- */
  const hero = S.hero || {};
  if (hero.eyebrow) html = setInner(html, "heroEyebrow", esc(hero.eyebrow));
  if (hero.title_en) html = setInner(html, "heroTitle", esc(hero.title_en));
  if (hero.sub_en) html = setInner(html, "heroSub", esc(hero.sub_en));
  if (hero.cta) html = setInner(html, "heroCta", esc(hero.cta));
  if (Array.isArray(S.spec) && S.spec.length) html = setInner(html, "heroSpec", S.spec.map((s) => `<div><dt>${esc(s.k)}</dt><dd>${esc(s.v)}</dd></div>`).join(""), true);
  if (Array.isArray(S.strip) && S.strip.length) html = setInner(html, "strip", S.strip.map((s) => `<div><b>${esc(s.t)}</b><span>${esc(s.d)}</span></div>`).join(""), true);

  html = html.split(`>${OLD_SHOP_TITLE.en}<`).join(`>${esc(SHOP_TITLE.en)}<`);
  if (P.length) {
    const cats = [...new Set(P.map((p) => p.category).filter(Boolean))];
    html = setInner(html, "tabs", [`<button role="tab" data-cat="__all" class="is-on" aria-selected="true">All</button>`, ...cats.map((c) => `<button role="tab" data-cat="${esc(c)}" aria-selected="false">${esc(c)}</button>`)].join(""), true);
    html = setInner(html, "grid", P.map((p) => {
      const out = p.stock === "out";
      const tag = out ? `<span class="card__tag card__tag--out">Sold out</span>` : p.badge ? `<span class="card__tag">${esc(p.badge)}</span>` : "";
      const img = p.image ? `<img src="${esc(p.image)}" alt="${esc(p.alt_en || p.name)}" width="1200" height="1200" loading="lazy" decoding="async">` : "";
      const price = p.price ? `${esc(cur)}${esc(p.price)}` : "";
      const buy = out ? "" : `<a class="card__buy" href="${esc(orderHref)}" target="_blank" rel="noopener">${buyLabel}</a>`;
      return `<article class="card rv${out ? " card--out" : ""}">${tag}<div class="card__img">${img}</div>` +
        `<p class="card__ref">${esc(p.ref || "")}${p.category ? " · " + esc(p.category) : ""}</p><h3 class="card__name">${esc(p.name)}</h3>` +
        `<p class="card__desc">${esc(p.desc_en || p.desc_id || "")}</p><div class="card__foot"><span class="card__price">${price}</span>${buy}</div></article>`;
    }).join("\n"), true);
  }

  if (S.quote?.text) html = setInner(html, "quoteText", esc(S.quote.text));
  if (S.quote?.by) html = setInner(html, "quoteBy", esc(S.quote.by));
  if (Array.isArray(S.anatomy) && S.anatomy.length) html = setInner(html, "anat", S.anatomy.map((a) => `<li><b>${esc(a.t)}</b><span>${esc(a.d)}</span></li>`).join(""), true);
  if (Array.isArray(S.care) && S.care.length) html = setInner(html, "careList", S.care.map((c) => `<article><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p></article>`).join(""), true);
  if (Array.isArray(S.faq) && S.faq.length) html = setInner(html, "faqList", S.faq.map((f) => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join(""), true);

  if (visit.title) html = setInner(html, "visitTitle", esc(visit.title));
  if (addressOk) html = setInner(html, "visitAddr", esc(addressLine));
  if (visit.hours) html = setInner(html, "visitHours", esc(visit.hours));
  if (phone && !html.includes('id="visitPhone"')) html = insertAfter(html, "visitHours", `\n<p class="mono" id="visitPhone">Tel / WhatsApp: <a href="tel:${phone}">${phone}</a></p>`);
  if (S.news_title) html = setInner(html, "newsTitle", esc(S.news_title));
  if (S.footer_blurb) html = setInner(html, "footBlurb", esc(S.footer_blurb));
  if ((addressOk || phone) && !html.includes('id="footNap"')) {
    const nap = ["KamenWatch", addressOk ? `${addressLine}${CITY_RE.test(addressLine) ? "" : `, ${CITY}`}` : `${CITY}, Cambodia`, phone ? `Tel ${phone}` : ""].filter(Boolean).join(" · ");
    html = insertAfter(html, "footBlurb", `\n<p class="mono" id="footNap">${esc(nap)}</p>`);
  }
  if (Array.isArray(S.social) && S.social.length) {
    const links = S.social.filter((s) => s && realUrl(s.url)).map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join("");
    if (links) html = setInner(html, "footSocial", `<h3>Follow</h3>${links}`);
  }

  if (html !== html0) { await writeFile("index.html", html); log("index.html updated"); }

  /* ----- app.js: shop heading in three languages, Order label ----- */
  let js = await readText("assets/app.js");
  if (js != null) {
    const before = js;
    for (const l of ["en", "id", "km"]) js = js.split(`shop_title:"${OLD_SHOP_TITLE[l]}"`).join(`shop_title:"${SHOP_TITLE[l]}"`);
    if (primary === "telegram") for (const [a, b] of BUY_LABELS) js = js.split(`buy:"${a}"`).join(`buy:"${b}"`);
    if (js !== before) { await writeFile("assets/app.js", js); log("assets/app.js updated"); }
  }

  /* ----- robots.txt, sitemap.xml, llms.txt ----- */
  if (!(await exists("robots.txt"))) {
    await writeFile("robots.txt", `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${SITE}/sitemap.xml\n`);
    log("robots.txt created");
  }
  if (!(await exists("sitemap.xml"))) {
    const today = new Date().toISOString().slice(0, 10);
    await writeFile("sitemap.xml", `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`);
    log("sitemap.xml created");
  }
  if (!(await exists("llms.txt"))) {
    const L = [];
    L.push("# KamenWatch", "");
    L.push(`> Watch shop and Seiko mod workshop in ${CITY}, Cambodia. Custom Seiko mods built by hand and pressure-tested, plus original Casio G-Shock and everyday watches from Poedagar and SKMEI. Service in English, Bahasa Indonesia and Khmer.`, "");
    L.push(`- Website: ${SITE}/`);
    if (addressOk) L.push(`- Address: ${addressLine}${CITY_RE.test(addressLine) ? "" : `, ${CITY}, Cambodia`}`);
    if (visit.hours) L.push(`- Opening hours: ${visit.hours}`);
    if (phone) L.push(`- Phone / WhatsApp: ${phone}`);
    if (tg) L.push(`- Telegram: https://t.me/${tg}`);
    L.push(`- Labels: "Seiko Mod" means a custom build with aftermarket parts, not a factory Seiko. "Original Casio" means a genuine G-Shock. Other watches are sold under their own brand names.`);
    L.push("- Not affiliated with Seiko Watch Corporation or Casio Computer Co., Ltd.", "");
    if (P.length) {
      L.push("## Watches", "");
      for (const p of P) {
        const bits = [p.ref, p.category, p.badge].filter(Boolean).join(", ");
        const price = p.price ? ` Price: ${cur}${p.price}.` : " Price on request.";
        L.push(`- ${p.name}${bits ? ` (${bits})` : ""}: ${p.desc_en || ""}${p.stock === "out" ? " Sold out." : price}`);
      }
      L.push("");
    }
    if (Array.isArray(S.faq) && S.faq.length) {
      L.push("## FAQ", "");
      for (const f of S.faq) L.push(`- ${f.q} ${f.a}`);
      L.push("");
    }
    L.push("## Pages", "", `- [Shop](${SITE}/#shop)`, `- [FAQ](${SITE}/#faq)`, `- [Visit the workshop](${SITE}/#visit)`, "");
    await writeFile("llms.txt", L.join("\n"));
    log("llms.txt created");
  }
  log("done");
}

main().catch((e) => { log("stopped early, site left as it was:", e && e.message); });
