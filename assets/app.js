/* KamenWatch storefront — reads /content/*.json written by the admin panel */

const T = {
  en:{nav_shop:"Shop",nav_build:"The Build",nav_care:"Care",nav_faq:"FAQ",nav_visit:"Visit",nav_cta:"Order",
      lume:"Lume view",shop_eyebrow:"THE COLLECTION",shop_title:"Built, photographed, and numbered one at a time.",
      build_eyebrow:"ASSEMBLY ORDER",build_title:"Seven parts, stacked in the only order that works.",
      build_sub:"Numbered because the sequence is real — skip a step and the crystal won't seat.",
      care_eyebrow:"AFTER IT ARRIVES",care_title:"Keeping a modded automatic alive.",
      faq_eyebrow:"QUESTIONS",faq_title:"Answered before you ask.",visit_eyebrow:"THE WORKSHOP",
      news_eyebrow:"DROP LIST",news_btn:"Join the list",news_fine:"One email per drop. Unsubscribe in a click.",
      buy:"Order on WhatsApp",sold:"Sold out",all:"All"},
  id:{nav_shop:"Produk",nav_build:"Proses",nav_care:"Perawatan",nav_faq:"FAQ",nav_visit:"Kunjungi",nav_cta:"Pesan",
      lume:"Mode lume",shop_eyebrow:"KOLEKSI",shop_title:"Dirakit, difoto, dan dinomori satu per satu.",
      build_eyebrow:"URUTAN RAKIT",build_title:"Tujuh bagian, disusun dalam satu-satunya urutan yang benar.",
      build_sub:"Dinomori karena urutannya nyata — lewat satu langkah, kacanya tidak akan duduk.",
      care_eyebrow:"SETELAH SAMPAI",care_title:"Merawat automatic hasil modif.",
      faq_eyebrow:"PERTANYAAN",faq_title:"Sudah kami jawab duluan.",visit_eyebrow:"BENGKEL",
      news_eyebrow:"DAFTAR RILIS",news_btn:"Gabung daftar",news_fine:"Satu email tiap rilis. Berhenti kapan saja.",
      buy:"Pesan via WhatsApp",sold:"Habis",all:"Semua"},
  km:{nav_shop:"ទំនិញ",nav_build:"ការផ្គុំ",nav_care:"ថែទាំ",nav_faq:"សំណួរ",nav_visit:"ទស្សនា",nav_cta:"បញ្ជាទិញ",
      lume:"របៀបពន្លឺ",shop_eyebrow:"បណ្តុំទំនិញ",shop_title:"ផ្គុំ ថត និងដាក់លេខ ម្តងមួយ។",
      build_eyebrow:"លំដាប់ផ្គុំ",build_title:"ប្រាំពីរផ្នែក តាមលំដាប់ត្រឹមត្រូវតែមួយ។",
      build_sub:"ដាក់លេខព្រោះលំដាប់ពិតប្រាកដ — រំលងមួយជំហាន កញ្ចក់នឹងមិនចូល។",
      care_eyebrow:"ក្រោយពេលទទួល",care_title:"ថែរក្សានាឡិកាកែច្នៃ។",
      faq_eyebrow:"សំណួរ",faq_title:"ឆ្លើយជូនជាមុន។",visit_eyebrow:"សិក្ខាសាលា",
      news_eyebrow:"បញ្ជីចេញថ្មី",news_btn:"ចូលរួមបញ្ជី",news_fine:"អ៊ីមែលមួយក្នុងមួយលើក។",
      buy:"បញ្ជាទិញតាម WhatsApp",sold:"អស់ស្តុក",all:"ទាំងអស់"}
};

/* Used only if /content/*.json can't be fetched (e.g. opened from disk). */
const FALLBACK_SETTINGS = {
  ticker:["Free worldwide shipping over $250","Every build pressure-tested to 10 ATM","1-year movement warranty"],
  hero:{eyebrow:"SEIKO MOD ATELIER · EST. 2024",
        title_en:"Nothing here left the factory this way.",
        title_id:"Tidak ada satu pun yang keluar pabrik seperti ini.",
        title_km:"គ្មានមួយណាចេញពីរោងចក្រក្នុងរូបរាងនេះទេ។",
        sub_en:"Every watch is stripped to the case, rebuilt by hand, and pressure-tested before it ships.",
        sub_id:"Setiap jam dibongkar sampai ke case, dirakit ulang dengan tangan, dan diuji tekanan sebelum dikirim.",
        sub_km:"នាឡិកានីមួយៗត្រូវបានរុះរើ ផ្គុំឡើងវិញដោយដៃ និងសាកល្បងសម្ពាធមុនពេលដឹកជញ្ជូន។",
        cta:"See the builds"},
  spec:[{k:"Movement",v:"NH35A"},{k:"Crystal",v:"Sapphire"},{k:"Water resist",v:"10 ATM"}],
  strip:[{t:"Pressure-tested",d:"Every case goes in the tester twice — after assembly and after the strap swap."},
         {t:"Hand-assembled",d:"One builder owns a watch from teardown to final regulation."},
         {t:"12-month warranty",d:"Movement and seals. We repair, we don't fob you off."},
         {t:"Ships worldwide",d:"Tracked and insured from the workshop, 2–7 working days."}],
  quote:{text:"A mod is only as good as the seal you can't see.",by:"— Workshop rule no. 1"},
  anatomy:[{t:"Case & caseback",d:"Sourced new, ultrasonically cleaned, gaskets replaced before anything goes in."},
           {t:"Movement",d:"NH35A automatic, hacking and hand-winding, regulated on a timegrapher to ±10 s/day."},
           {t:"Dial",d:"Your pick — sunburst, matte, or hand-painted with C3 or BGW9 lume."},
           {t:"Hands",d:"Pressed on with a fitting set, checked for clearance at every position."},
           {t:"Chapter ring",d:"Aligned to the dial track. Misalignment is the fastest way to spot a lazy mod."},
           {t:"Crystal & bezel",d:"Double-domed sapphire with blue AR, ceramic or steel insert seated with a press."},
           {t:"Strap & final test",d:"Fitted, then back into the pressure tester before it's boxed."}],
  care:[{t:"Wind it, then wear it",d:"An automatic that sits in a drawer stops. Thirty manual winds brings it back to life."},
        {t:"Rinse after salt water",d:"Fresh water, then dry with a soft cloth. Salt eats gaskets faster than anything."},
        {t:"Don't touch the crown wet",d:"10 ATM means swimming. It doesn't mean unscrewing the crown while the case is wet."},
        {t:"Reseal every two years",d:"Gaskets harden. Send it back and we'll swap them and retest, parts at cost."}],
  faq:[{q:"Is this a real Seiko?",a:"The movement and case are genuine Seiko parts. The dial, hands, bezel and crystal are aftermarket, fitted by us. That makes it a custom build, not a factory Seiko — and we never sell it as one."},
       {q:"Will it still be water resistant?",a:"Yes. Every build is pressure-tested to 10 ATM after assembly. If a test fails, the watch goes back on the bench, not into a box."},
       {q:"How long does a custom order take?",a:"Usually 7–14 days depending on parts. If something is backordered we tell you before you pay, not after."},
       {q:"What does the warranty cover?",a:"Twelve months on the movement and the seals. Accidental damage and normal wear on straps aren't covered."},
       {q:"Can you mod a watch I already own?",a:"Yes. Message us on WhatsApp with photos and what you want changed, and we'll quote parts and labour separately."}],
  visit:{title:"Come see a build on the bench.",address:"",hours:"Mon–Sat · 10:00–18:00",maps_embed:"",maps_link:""},
  contact:{primary:"telegram",telegram:"",whatsapp:"",messenger:"",email:"hello@kamenwatch.com"},
  news_title:"Builds sell out in hours. Get told first.",
  footer_blurb:"A small workshop building custom Seiko mods one at a time. No batches, no drop-shipping.",
  social:[{label:"Instagram",url:"#"},{label:"TikTok",url:"#"}],
  currency:"$"
};
const FALLBACK_PRODUCTS = {products:[
  {name:"Atoll 007",ref:"KW-001",category:"Diver",price:"289",badge:"New",stock:"in",image:"",
   desc_en:"SKX-style case, ceramic bezel, sunburst teal dial with BGW9 lume.",
   desc_id:"Case gaya SKX, bezel keramik, dial sunburst teal dengan lume BGW9.",desc_km:""},
  {name:"Nightshift",ref:"KW-002",category:"Diver",price:"265",badge:"",stock:"in",image:"",
   desc_en:"All-black PVD case, matte dial, sapphire with blue AR coating.",
   desc_id:"Case PVD hitam total, dial matte, sapphire dengan lapisan AR biru.",desc_km:""},
  {name:"Field 62",ref:"KW-003",category:"Field",price:"235",badge:"",stock:"in",image:"",
   desc_en:"36 mm SNK case, brushed steel, cream dial and gilt hands.",
   desc_id:"Case SNK 36 mm, baja brushed, dial krem dan jarum gilt.",desc_km:""},
  {name:"Reef GMT",ref:"KW-004",category:"GMT",price:"340",badge:"Sold out",stock:"out",image:"",
   desc_en:"NH34 true GMT, two-tone ceramic insert, jubilee bracelet.",
   desc_id:"NH34 true GMT, insert keramik dua warna, bracelet jubilee.",desc_km:""}
]};

let LANG = localStorage.getItem("kw_lang") || (navigator.language||"en").slice(0,2);
if (!T[LANG]) LANG = "en";
let S = FALLBACK_SETTINGS, P = FALLBACK_PRODUCTS.products, CAT = "__all";

/* Meta Pixel — no-ops safely if the pixel ID hasn't been filled in yet */
const track = (ev, params) => { try{ if(window.fbq) fbq("track", ev, params||{}); }catch(e){} };

/* Builds a chat link for whichever channel is set as primary in the admin panel */
function chatLink(msg){
  const c = S.contact || {};
  const txt = encodeURIComponent(msg||"");
  const order = [c.primary, "telegram", "whatsapp", "messenger"].filter(Boolean);
  for (const ch of new Set(order)){
    if (ch === "telegram" && c.telegram)
      return { url:`https://t.me/${c.telegram.replace(/^@/,"")}`, label:"Telegram" };
    if (ch === "whatsapp" && c.whatsapp)
      return { url:`https://wa.me/${c.whatsapp.replace(/\D/g,"")}${txt?`?text=${txt}`:""}`, label:"WhatsApp" };
    if (ch === "messenger" && c.messenger)
      return { url:`https://m.me/${c.messenger.replace(/^@/,"")}`, label:"Messenger" };
  }
  return { url:"#visit", label:"Contact" };
}

const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>[...r.querySelectorAll(s)];
const esc = s => String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const pick = (o,base) => o?.[base+"_"+LANG] || o?.[base+"_en"] || o?.[base] || "";

async function load(){
  try{
    const [a,b] = await Promise.all([
      fetch("/content/settings.json",{cache:"no-store"}).then(r=>r.json()),
      fetch("/content/products.json",{cache:"no-store"}).then(r=>r.json())
    ]);
    S = {...FALLBACK_SETTINGS, ...a};
    P = (b.products||[]);
  }catch(e){ console.warn("Using built-in sample content:", e.message); }
  renderAll();
}

function renderAll(){
  document.documentElement.lang = LANG;
  $$("[data-i18n]").forEach(el=>{ const k=el.dataset.i18n; if(T[LANG][k]) el.textContent=T[LANG][k]; });
  $$(".lang button").forEach(b=>b.classList.toggle("is-on", b.dataset.lang===LANG));

  // ticker
  const items = (S.ticker||[]).map(t=>`<span>${esc(t)}</span>`).join("");
  $("#tickerTrack").innerHTML = items + items;

  // hero
  $("#heroEyebrow").textContent = S.hero?.eyebrow || "";
  $("#heroTitle").textContent = pick(S.hero,"title");
  $("#heroSub").textContent = pick(S.hero,"sub");
  $("#heroCta").textContent = S.hero?.cta || "Shop";
  $("#heroSpec").innerHTML = (S.spec||[]).map(s=>`<div><dt>${esc(s.k)}</dt><dd>${esc(s.v)}</dd></div>`).join("");

  // strip
  $("#strip").innerHTML = (S.strip||[]).map(s=>`<div><b>${esc(s.t)}</b><span>${esc(s.d)}</span></div>`).join("");

  // quote
  $("#quoteText").textContent = S.quote?.text || "";
  $("#quoteBy").textContent = S.quote?.by || "";

  // anatomy / care / faq
  $("#anat").innerHTML = (S.anatomy||[]).map(a=>`<li><b>${esc(a.t)}</b><span>${esc(a.d)}</span></li>`).join("");
  $("#careList").innerHTML = (S.care||[]).map(c=>`<article><h3>${esc(c.t)}</h3><p>${esc(c.d)}</p></article>`).join("");
  $("#faqList").innerHTML = (S.faq||[]).map(f=>`<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("");

  // visit
  $("#visitTitle").textContent = S.visit?.title || "";
  $("#visitAddr").textContent = S.visit?.address || "";
  $("#visitHours").textContent = S.visit?.hours || "";
  // older settings.json kept the number under visit — carry it over
  S.contact = S.contact || {};
  if (!S.contact.whatsapp && S.visit?.whatsapp) S.contact.whatsapp = S.visit.whatsapp;

  const c = S.contact, btns = [];
  if (c.telegram) btns.push(`<a class="btn" data-ch="Telegram" href="https://t.me/${esc(c.telegram.replace(/^@/,""))}" target="_blank" rel="noopener">Chat on Telegram</a>`);
  if (c.whatsapp) btns.push(`<a class="btn ${c.telegram?"btn--ghost":""}" data-ch="WhatsApp" href="https://wa.me/${esc(c.whatsapp.replace(/\D/g,""))}" target="_blank" rel="noopener">WhatsApp us</a>`);
  if (c.messenger) btns.push(`<a class="btn btn--ghost" data-ch="Messenger" href="https://m.me/${esc(c.messenger.replace(/^@/,""))}" target="_blank" rel="noopener">Messenger</a>`);
  btns.push(`<a class="btn btn--ghost" href="${esc(S.visit?.maps_link||"#")}" target="_blank" rel="noopener">Open in Maps</a>`);
  $("#contactBtns").innerHTML = btns.join("");
  $$("#contactBtns a[data-ch]").forEach(a => a.addEventListener("click", () =>
    track("Contact", { content_name:"Workshop contact", channel:a.dataset.ch })));
  $("#mapWrap").innerHTML = S.visit?.maps_embed
    ? `<iframe src="${esc(S.visit.maps_embed)}" loading="lazy" title="Workshop location" referrerpolicy="no-referrer-when-downgrade"></iframe>`
    : `<p class="empty">Paste your Google Maps embed link in the admin panel to show the map here.</p>`;

  // newsletter + footer
  $("#newsTitle").textContent = S.news_title || "";
  $("#footBlurb").textContent = S.footer_blurb || "";
  $("#footSocial").innerHTML = "<h3>Follow</h3>" + (S.social||[]).map(s=>`<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join("");
  $("#footCopy").textContent = `© ${new Date().getFullYear()} KamenWatch`;

  renderTabs();
  renderGrid();
  reveal();
}

function renderTabs(){
  const cats = [...new Set(P.map(p=>p.category).filter(Boolean))];
  $("#tabs").innerHTML = [["__all",T[LANG].all],...cats.map(c=>[c,c])]
    .map(([v,l])=>`<button role="tab" data-cat="${esc(v)}" class="${v===CAT?"is-on":""}" aria-selected="${v===CAT}">${esc(l)}</button>`).join("");
  $$("#tabs button").forEach(b=>b.onclick=()=>{CAT=b.dataset.cat;renderTabs();renderGrid();reveal();});
}

function renderGrid(){
  const list = CAT==="__all" ? P : P.filter(p=>p.category===CAT);
  const cur = S.currency || "$";
  $("#gridEmpty").hidden = list.length>0;
  $("#grid").innerHTML = list.map(p=>{
    const out = p.stock === "out";
    const ch = chatLink(`Hi KamenWatch, I'd like to order ${p.name} (${p.ref||""}).`);
    const link = ch.url;
    const img = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`
      : `<svg class="card__ph" viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="52" r="30" fill="none" stroke="currentColor" stroke-width="3"/><rect x="42" y="10" width="16" height="14" fill="currentColor"/><rect x="42" y="80" width="16" height="14" fill="currentColor"/><path d="M50 34v18l12 7" stroke="currentColor" stroke-width="3" fill="none"/></svg>`;
    const badge = out ? `<span class="card__tag card__tag--out">${T[LANG].sold}</span>`
                      : (p.badge ? `<span class="card__tag">${esc(p.badge)}</span>` : "");
    return `<article class="card rv ${out?"card--out":""}">
      ${badge}
      <div class="card__img">${img}</div>
      <p class="card__ref">${esc(p.ref||"")} ${p.category?"· "+esc(p.category):""}</p>
      <h3 class="card__name">${esc(p.name)}</h3>
      <p class="card__desc">${esc(pick(p,"desc"))}</p>
      <div class="card__foot">
        <span class="card__price">${esc(cur)}${esc(p.price)}</span>
        ${out?"":`<a class="card__buy" href="${link}" target="_blank" rel="noopener"
            data-name="${esc(p.name)}" data-ref="${esc(p.ref||"")}" data-price="${esc(p.price)}">${T[LANG].buy}</a>`}
      </div></article>`;
  }).join("");

  $$("#grid .card__buy").forEach(a => a.addEventListener("click", () => {
    track("Contact", {
      content_name: a.dataset.name,
      content_ids: [a.dataset.ref],
      value: parseFloat(a.dataset.price) || 0,
      currency: "USD"
    });
  }));
}

/* reveal on scroll */
let io;
function reveal(){
  io = io || new IntersectionObserver(es=>es.forEach(e=>{ if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);} }),{threshold:.12});
  $$(".rv:not(.in)").forEach(el=>io.observe(el));
}

/* dial: NH35A beats 21,600 vph = 6 steps per second */
(function dial(){
  const ticks=$("#ticks"), marks=$("#markers");
  let t="",m="";
  for(let i=0;i<60;i++){
    const a=i*6, r1=i%5===0?104:110;
    t+=`<line class="tick" x1="160" y1="${160-118}" x2="160" y2="${160-r1}" transform="rotate(${a} 160 160)"/>`;
  }
  for(let i=0;i<12;i++){
    const a=i*30;
    m += i===0
      ? `<rect class="mark" x="152" y="46" width="16" height="20" rx="2" transform="rotate(0 160 160)"/>`
      : `<rect class="mark" x="155" y="48" width="10" height="16" rx="5" transform="rotate(${a} 160 160)"/>`;
  }
  ticks.innerHTML=t; marks.innerHTML=m;

  const h=$("#hourHand"), mi=$("#minHand"), s=$("#secHand");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function frame(){
    const d=new Date(), sec=d.getSeconds(), ms=d.getMilliseconds();
    const beat = Math.floor(ms/1000*6)/6;                 // 6 steps/sec
    const secA = (sec+beat)*6;
    const minA = (d.getMinutes()+sec/60)*6;
    const hrA  = ((d.getHours()%12)+d.getMinutes()/60)*30;
    h.setAttribute("transform",`rotate(${hrA} 160 160)`);
    mi.setAttribute("transform",`rotate(${minA} 160 160)`);
    s.setAttribute("transform",`rotate(${secA} 160 160)`);
    if(!reduce) requestAnimationFrame(frame);
  }
  frame();
})();

/* newsletter signup counts as a Lead */
const newsForm = $(".news__form");
if (newsForm) newsForm.addEventListener("submit", () => track("Lead", { content_name:"Drop list" }));

/* controls */
$("#lumeBtn").onclick = e => {
  const on = document.body.classList.toggle("lume");
  e.currentTarget.setAttribute("aria-pressed", on);
};
$$(".lang button").forEach(b=>b.onclick=()=>{ LANG=b.dataset.lang; localStorage.setItem("kw_lang",LANG); renderAll(); });
const burger=$("#burger"), drawer=$("#drawer");
burger.onclick=()=>{ const open=drawer.hidden; drawer.hidden=!open; burger.setAttribute("aria-expanded",open); };
$$("#drawer a").forEach(a=>a.onclick=()=>{drawer.hidden=true;burger.setAttribute("aria-expanded",false);});

load();
