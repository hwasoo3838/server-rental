/* ============================================================
   Ellion Bare Metal - 프론트엔드 로직 (백엔드 없음, GitHub Pages)
   - KO / EN, KRW / USD 토글 (localStorage + ?lang= ?cur= 쿼리)
   - 가격/상태는 Google Sheet(Apps Script GET ?action=servers) 에서 실시간 로드
   - 전송: (1) FormSubmit → 시트 config 의 notify_email / contact_email 로 메일  (2) Apps Script → logs 시트
   - 실패 시 mailto: 폴백 + localStorage 임시 보관
   ============================================================ */
(function () {
  "use strict";
  const CFG = window.ELGRIM_CONFIG || {};
  const CURRENT_OS = {
  "ellion-xeon-gold-6154-dual": {
    "name": "Ubuntu",
    "displayName": "Ubuntu",
    "version": "24.04.3 LTS",
    "kernel": null,
    "source": "Existing product Access specification",
    "verification": "LEGACY_SPEC_UNVERIFIED",
    "ipMappingStatus": "UNVERIFIED"
  },
  "elgrim-gfx-a4000": {
    "name": "Ubuntu Server",
    "displayName": "Ubuntu",
    "version": "20.04.6 LTS",
    "kernel": null,
    "source": "Owner-provided confirmed OS information",
    "verification": "OWNER_CONFIRMED",
    "ipMappingStatus": "OWNER_CONFIRMED"
  },
  "ellion-web-db-6140": {
    "name": "Ubuntu",
    "displayName": "Ubuntu",
    "version": "22.04.5 LTS",
    "kernel": "5.15.0-119-generic",
    "source": "Owner-provided confirmed OS information",
    "verification": "OWNER_CONFIRMED",
    "ipMappingStatus": "UNVERIFIED"
  }
};
  // Keep the existing public configuration blob unchanged; apply OS facts and Linux-only options here.
  window.SERVERS = (window.SERVERS || []).map(server => ({ ...server, os: (server.os || []).filter(os => !/windows/i.test(os)), currentOs: CURRENT_OS[server.id] }));
  const BASE = window.SERVERS;
  const I18N = window.I18N || {};
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const LS = { logs: "elgrim.pendingLogs", lang: "elgrim.lang", cur: "elgrim.currency", cache: "elgrim.serversCache" };
  const q = new URLSearchParams(location.search);

  /* ---------- 상태 ---------- */

let lang = q.get("lang") === "ko" ? "ko" : "en";
let currency = "USD";

  let filter = "all";
  let sort = "default";
  let live = null; // { servers, config, updatedAt }
  let catalogueState = "loading";
  let fetchedAt = 0;
  let priceExpiryTimer;
  const positivePrice = (value) => typeof value === "number" && Number.isFinite(value) && value > 0 ? value : null;
  const fresh = () => ["live", "cache"].includes(catalogueState) && Date.now() - fetchedAt >= 0 && Date.now() - fetchedAt < (CFG.cacheSeconds || 120) * 1000;
  let SERVERS = BASE.map((s) => ({ ...s }));

  const t = (k, vars) => {
    let s = (I18N[lang] && I18N[lang][k]) ?? (I18N.ko && I18N.ko[k]) ?? k;
    // {contact} 는 항상 현재 연락 메일(시트 contact_email)로 치환
    if (typeof s === "string") Object.entries({ contact: contactEmail(), ...vars }).forEach(([a, b]) => (s = s.split("{" + a + "}").join(b)));
    return s;
  };
  const L = (obj) => (obj && typeof obj === "object" ? obj[lang] || obj.ko || "" : obj || "");
  const replyWithin = () => (live && live.config && live.config["reply_within_" + lang]) || L(CFG.replyWithin) || "24h";
  const liveCfg = (k) => String((live && live.config && live.config[k]) ?? "").trim();
  // 연락 메일: 시트 config.contact_email > servers.js 기본값. 화면 표시, mailto, 메일 수신 모두 이 값을 따름
  const contactEmail = () => liveCfg("contact_email") || CFG.contactEmail;
  // 요청 메일 수신: config.notify_email 이 있으면 그 주소, 없으면 contact_email
  const notifyEmail = () => liveCfg("notify_email") || contactEmail();
  const fx = () => Number(live && live.config && live.config.fx_usd_krw) || CFG.fxUsdKrw || 1400;

  /* ---------- i18n 적용 ---------- */
  function applyI18n() {
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach((el) => (el.textContent = t(el.dataset.i18n)));
    $$("[data-i18n-html]").forEach((el) => (el.innerHTML = t(el.dataset.i18nHtml)));
    $$("[data-i18n-attr]").forEach((el) => {
      const [attr, key] = el.dataset.i18nAttr.split(":");
      el.setAttribute(attr, t(key));
    });
    $$("[data-mail]").forEach((a) => (a.href = "mailto:" + contactEmail()));
    $$("[data-mail-text]").forEach((el) => (el.textContent = contactEmail()));
    $$("[data-reply-within]").forEach((el) => (el.textContent = replyWithin()));
    $$("#langSeg button").forEach((b) => b.classList.toggle("on", b.dataset.lang === lang));
    // English-only site: currency selector removed
    $("#useTags").innerHTML = t("use.tags").map((x) => `<span>${x}</span>`).join("");
    $("#faqList").innerHTML = t("faq.items").map(([qq, a]) => `<details><summary>${qq}</summary><div class="ans">${a}</div></details>`).join("");
    $$("#faqList [data-reply-within]").forEach((el) => (el.textContent = replyWithin()));
    fillSelect($("#fPurpose"), t("form.purposes"));
    fillSelect($("#fDuration"), t("form.durations"));
    document.title = t("meta.title");
    renderPriceSource();
  }
  function fillSelect(sel, arr) {
    const v = sel.value;
    sel.innerHTML = arr.map((o) => `<option>${o}</option>`).join("");
    if (arr.includes(v)) sel.value = v;
  }

function setLang(l) {
  lang = l === "ko" ? "ko" : "en";
  localStorage.setItem(LS.lang, lang);
  applyI18n();
  render();
}

function setCurrency(c) {
  currency = "USD";
  localStorage.setItem(LS.cur, "USD");
  render();
}


  $("#year").textContent = new Date().getFullYear();

  /* ---------- 시트에서 가격/상태 로드 ---------- */
  function mergeLive(data, at = Date.now(), cached = false) {
    if (!data || data.ok !== true || !Array.isArray(data.servers) || data.servers.some(r => !r || typeof r.id !== "string") || new Set(data.servers.map(r => r.id)).size !== data.servers.length) throw new Error("Invalid catalogue response");
    live = data;
    fetchedAt = at;
    catalogueState = cached ? "cache" : "live";
    clearTimeout(priceExpiryTimer);
    priceExpiryTimer = setTimeout(() => { render(); }, Math.max(0, (CFG.cacheSeconds || 120) * 1000 - (Date.now() - at)) + 10);
    SERVERS = BASE.map(s => {
      const row = data.servers.find(r => r.id === s.id);
      if (!row) return { ...s, sheetListed: false };
      const merged = { ...s, sheetListed: true, status: ["available", "reserve", "soldout"].includes(row.status) ? row.status : "unknown",
        priceUsd: positivePrice(row.priceUsd), priceKrw: positivePrice(row.priceKrw) };
      ["priceNote", "eta"].forEach(key => {
        const value = row[key];
        if (value && (value.ko || value.en)) merged[key] = { ko: value.ko || s[key]?.ko || "", en: value.en || s[key]?.en || "" };
      });
      return merged;
    });
  }
  async function loadLive(force) {
    if (!CFG.logEndpoint) { catalogueState = "offline"; return; }
    try {
      const cache = JSON.parse(sessionStorage.getItem(LS.cache) || "null");
      if (!force && cache && Date.now() >= cache.at && Date.now() - cache.at < (CFG.cacheSeconds || 120) * 1000) { mergeLive(cache.data, cache.at, true); return; }
    } catch (_) {}
    try {
      const response = await fetch(CFG.logEndpoint + "?action=servers&_=" + Date.now(), { cache: "no-store", signal: AbortSignal.timeout(8000) });
      if (!response.ok) throw new Error("Catalogue unavailable");
      const data = await response.json();
      mergeLive(data);
      try { sessionStorage.setItem(LS.cache, JSON.stringify({ at: fetchedAt, data })); } catch (_) {}
    } catch (_) {
      live = null; fetchedAt = 0; catalogueState = "failed";
      SERVERS = BASE.map(s => ({ ...s }));
      try { sessionStorage.removeItem(LS.cache); } catch (_) {}
    }
  }
  function renderPriceSource() {
    const el = $("#priceSource");
    if (!el) return;
    el.textContent = live && fresh() ? t("price.live", { time: new Date(fetchedAt).toLocaleTimeString(lang === "ko" ? "ko-KR" : "en-US", { hour: "2-digit", minute: "2-digit" }) }) : t("price.fallback");
  }
  // Restore the established $185 Dual Xeon offer in cards, modal and payload.
  // RTX A4000's established $200 quote remains available in offline preview.
  // Base catalogue specifications and product records are never mutated.
  function quote(s) {
    if (s.id === "ellion-xeon-gold-6154-dual") return { amount: currency === "USD" ? 185 : 290000, approx: false };
    const base = BASE.find(item => item.id === s.id) || s;
    const usd = positivePrice(s.priceUsd) ?? positivePrice(base.priceUsd) ?? (s.id === "elgrim-gfx-a4000" ? 200 : null);
    const krw = positivePrice(s.priceKrw) ?? positivePrice(base.priceKrw);
    if (currency === "USD") return usd !== null ? { amount: usd, approx: false } : { amount: krw === null ? null : Math.round(krw / fx()), approx: krw !== null };
    return krw !== null ? { amount: krw, approx: false } : { amount: usd === null ? null : Math.round(usd * fx() / 1000) * 1000, approx: usd !== null };
  }
  function priceHtml(s) {
    const { amount, approx } = quote(s);
    const fixed = s.id === "ellion-xeon-gold-6154-dual";
    const priceNote = fixed ? (lang === "ko" ? "월 고정 임대료" : "Fixed monthly rate") : L(s.priceNote);
    if (amount === null) return '<div class="price">' + t("price.ask") + '</div><div class="price-note">' + priceNote + '</div>';
    const fmt = currency === "KRW" ? "₩" + amount.toLocaleString("ko-KR") : "$" + amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
    const note = fixed ? priceNote : [approx ? t("price.approx") : "", t("price.vat"), priceNote].filter(Boolean).join(" · ");
    return '<div class="price">' + fmt + '<small>' + t("price.mo") + '</small></div><div class="price-note">' + note + '</div>';
  }

  /* ---------- 서버 카드 ---------- */
  const grid = $("#plans-grid");
  const gpuCount = (s) => { const g = s.specs.find((x) => x.k === "GPU"); const m = g && (g.en || "").match(/×(\d+)/); return m ? +m[1] : 1; };
  const ctaClass = (s) => (s.status === "reserve" ? "btn btn-amber" : s.status === "soldout" ? "btn" : "btn btn-accent");
  const ctaType = (s) => (s.status === "reserve" ? "reserve" : "request");
  const ctaLabel = (s) => (s.status === "soldout" ? t("card.wait") : s.status === "reserve" ? t("card.reserve") : t("card.request"));

  function render() {
    let list = SERVERS.filter((s) => filter === "all" || s.status === filter);
    if (sort === "available") list = [...list].sort((a, b) => (a.status === "available" ? -1 : 1) - (b.status === "available" ? -1 : 1));
    if (sort === "gpu") list = [...list].sort((a, b) => gpuCount(b) - gpuCount(a));
    if (!list.length) { grid.innerHTML = `<div class="card empty">${t("empty")}</div>`; return; }
    grid.innerHTML = list.map((s) => `
      <article class="card plan" data-accent="${s.accent}" data-id="${s.id}">
        <div class="plan-top">
          <span class="badge cat">${s.catLabel}</span>
          <span class="status ${s.status}">${t("status." + (s.status === "unknown" ? "soldout" : s.status))}</span>
        </div>
        <div>
          <h3>${L(s.name)}</h3>
        </div>
        <p class="tagline">${L(s.tagline)}</p>
        <dl class="specs">${s.specs.map((x) => `<dt>${x.k}</dt><dd>${x[lang] || x.ko}</dd>`).join("")}</dl>

<div class="os-row">
  <div>${currentOsHtml(s)}</div>
  <span class="hint">
    ${lang === "ko"
      ? "현재 OS 유지 또는 Linux OS 변경 요청"
      : "Keep current OS or request a Linux OS change"}
  </span>
</div>


<div class="plan-foot plan-foot-premium">
  <div class="plan-price-area">
    <span class="plan-price-label">MONTHLY RENTAL</span>
    ${priceHtml(s)}
  </div>
  <button
    class="${ctaClass(s)} plan-request-btn"
    data-open="${ctaType(s)}"
    data-server="${s.id}">
    ${ctaLabel(s)}
  </button>
</div>

      </article>`).join("");
    renderPriceSource();
    if (current && modal.classList.contains("open")) {
      current.server = SERVERS.find(s => s.id === current.server.id) || current.server;
      const priceArea = $("#modalServer .modal-server-price");
      if (priceArea) priceArea.innerHTML = priceHtml(current.server);
    }
  }

  $("#statusSeg").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-filter]");
    if (!b) return;
    $$("#statusSeg button").forEach((x) => x.classList.toggle("on", x === b));
    filter = b.dataset.filter;
    render();
  });
  $("#sortSel").addEventListener("change", (e) => { sort = e.target.value; render(); });
  $("#refreshBtn").addEventListener("click", async () => { await loadLive(true); applyI18n(); render(); toast(t(fresh() ? "refreshed" : "price.fallback")); });

  /* ---------- 모바일 메뉴 ---------- */
  $("#menuBtn").addEventListener("click", () => $("#nav").classList.toggle("open"));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => $("#nav").classList.remove("open")));

  /* ---------- 모달 ---------- */
  const modal = $("#modal");
  const form = $("#reqForm");
  const done = $("#done");
  const errBox = $("#formErr");
  let current = null;
  const osChoices = { ubuntu: "Ubuntu Server", debian: "Debian", rocky: "Rocky Linux", alma: "AlmaLinux" };
  function currentOs(server) {
    // Explicit product OS facts only. Never infer installed OS from offered options.
    return server.currentOs || { name: null, displayName: null, version: null, kernel: null, source: null, verification: "UNVERIFIED", ipMappingStatus: "UNVERIFIED" };
  }
  function currentOsHtml(server) {
    const os = currentOs(server);
    const value = os.name && os.version ? (os.displayName || os.name) + " " + os.version : t("os.unknown");
    const evidence = os.verification === "OWNER_CONFIRMED" ? t("os.ownerConfirmed") : os.name ? t("os.legacyUnverified") : t("os.unknown");
    return '<div class="hint current-os">' + t("os.current") + ': ' + value + (os.kernel ? '<br/>Kernel: ' + os.kernel : '') + '</div><div class="hint os-evidence">' + evidence + '</div>';
  }
  function syncOsFields() {
    const choice = $("#fOs").value, change = choice !== "keep", other = choice === "other";
    for (const [field, input, show] of [["#osVersionField", "#fOsVersion", change], ["#otherLinuxField", "#fOsDistribution", other]]) {
      $(field).hidden = !show; $(field).style.display = show ? "" : "none";
      $(input).disabled = !show; $(input).required = show;
      if (!show) $(input).value = "";
    }
  }
  $("#fOs").addEventListener("change", syncOsFields);
  function osRequest() {
    const choice = $("#fOs").value;
    const change = choice !== "keep";
    const distribution = choice === "other" ? $("#fOsDistribution").value.trim() : "";
    const version = change ? $("#fOsVersion").value.trim() : "";
    const selected = choice === "keep" ? "Keep current OS" : choice === "other" ? distribution : osChoices[choice];
    const prohibited = /windows|win32|win64|microsoft|macos|mac os|darwin/i;
    if (!selected || (change && (!version || version.length > 80)) || (choice === "other" && (!distribution || distribution.length > 80)) || prohibited.test(selected + " " + version)) return null;
    return { osChoice: choice, os: selected, osVersion: version, osDistribution: distribution, osChangeRequested: change, osRequestMode: "REQUEST_ONLY" };
  }


  function openModal(type, serverId) {
    const server = SERVERS.find((s) => s.id === serverId) || SERVERS[0];
    current = { server, type };
    const isReserve = type === "reserve";
    $("#modalLabel").textContent = t(isReserve ? "modal.reserve.label" : "modal.request.label");
    $("#modalTitle").textContent = t(isReserve ? "modal.reserve.title" : "modal.request.title");
   
$("#modalServer").innerHTML = `
  <div><b>${L(server.name)}</b></div>
  <div class="modal-server-price">
    ${priceHtml(server)}
  </div>
  ${currentOsHtml(server)}
`;

    $("#fType").value = type;
    $("#fServerId").value = server.id;
    $("#fServerName").value = L(server.name);

    $("#fOs").value = "keep";
    $("#fOsVersion").value = "";
    $("#fOsDistribution").value = "";
    syncOsFields();
    $("#fUsername").value = "";

    // 희망 GPU 수는 멀티 GPU 노드(MI325X ×8 등) 예약일 때만 받음
    current.showGpu = isReserve && gpuCount(server) > 1;
    $("#gpuField").style.display = current.showGpu ? "grid" : "none";
    const sb = $("#submitBtn");
    sb.textContent = t(isReserve ? "form.submit.reserve" : "form.submit.request");
    sb.className = isReserve ? "btn btn-amber" : "btn btn-accent";
    errBox.style.display = "none";
    form.style.display = "grid";
    done.style.display = "none";
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(() => $("#fEmail").focus(), 50);
  }
  function closeModal() { modal.classList.remove("open"); document.body.style.overflow = ""; }
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); openModal(o.dataset.open, o.dataset.server); return; }
    if (e.target.closest("[data-close]") || e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => e.key === "Escape" && closeModal());

  /* ---------- 전송 ---------- */
  function buildPayload() {
    current.server = SERVERS.find(s => s.id === current.server.id) || current.server;
    const p = Object.fromEntries(new FormData(form).entries());
    const request = osRequest();
    const installed = currentOs(current.server);
    const requestSummary = request.osChangeRequested ? "OS change requested: " + request.os + "; version: " + request.osVersion : "Keep current OS; no OS change requested";
    return {
      ...p,
      ...request,
      currentOs: installed.name,
      currentOsVersion: installed.version,
      currentOsSource: installed.source,
      currentOsVerification: installed.verification,
      currentOsKernel: installed.kernel,
      currentOsIpMappingStatus: installed.ipMappingStatus,
      message: [p.message || "", "[Current OS] " + (installed.name ? installed.name + " " + installed.version : "Unverified") + "; source: " + (installed.source || "none") + "; verification: " + installed.verification, "[OS request] " + requestSummary + ". Request only; no automatic reinstall."].filter(Boolean).join("\n"),
     gpuCount: current.showGpu ? p.gpuCount : "",

     lang,
     currency,


monthlyPrice: quote(current.server).amount === null ? "Price confirmation required" : quote(current.server).amount.toLocaleString("en-US", { maximumFractionDigits: 0 }) + " " + currency + (quote(current.server).approx ? " (indicative conversion)" : ""),
regularPrice: "",
priceCondition: "Standard monthly rate",

vat: "Excluded",

      timestamp: new Date().toISOString(),
      page: location.href,
      referrer: document.referrer || "",
      userAgent: navigator.userAgent,
      language: navigator.language,
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      utm_source: q.get("utm_source") || "",
      utm_medium: q.get("utm_medium") || "",
      utm_campaign: q.get("utm_campaign") || "",
    };
  }
  const isR = (p) => p.type === "reserve";
  const mailSubject = (p) => `${t(isR(p) ? "mail.subject.reserve" : "mail.subject.request")} ${p.serverName} — ${p.email}`;
  const mailFields = (p) => ({
    Type: isR(p) ? "Reservation (upcoming)" : "Access request",
Server: `${p.serverName} (${p.serverId})`,
"Monthly Price": p.monthlyPrice,
"Regular Price": p.regularPrice,
"Price Condition": p.priceCondition,
"VAT": p.vat,
Email: p.email,
    Name: p.name || "-",
   
    "Linux OS": p.os,
    "OS Change Requested": p.osChangeRequested ? "Yes (request only)" : "No (keep current OS)",
    "Current OS": p.currentOs || "Unverified",
    "Current OS Version": p.currentOsVersion || "Unverified",
    "Current OS Kernel": p.currentOsKernel || "Unverified",
    "Current OS Source": p.currentOsSource || "Unverified",
    "Current OS Verification": p.currentOsVerification,
    "Product IP Mapping": p.currentOsIpMappingStatus,
    "OS Version": p.osVersion,
    "Preferred Login ID": p.username || "ELLION assigned",
    Purpose: p.purpose,

    Term: p.duration,
    GPUs: p.gpuCount || "-",
     "Monthly Budget (USD)": p.budget || "-",
    Message: p.message || "-",
    "Lang/Currency": `${p.lang} / ${p.currency}`,
    Time: p.timestamp,
    Page: p.page,
  });
  const mailBody = (p) => Object.entries(mailFields(p)).map(([k, v]) => `${k}: ${v}`).join("\n");

  // FormSubmit 주소의 {email} 을 현재 수신 메일로 치환 (시트 변경이 발송 대상에도 반영되도록)
  const mailUrl = () => (CFG.mailEndpoint || "").split("{email}").join(notifyEmail());
  async function sendMail(p) {
    const url = mailUrl();
    if (!url) return { ok: false, skipped: true };
    const body = { _subject: mailSubject(p), _replyto: p.email, _template: "table", _captcha: "false", ...mailFields(p) };
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok && String(j.success) !== "false", res: j };
  }
  async function sendLog(p) {
    if (!CFG.logEndpoint) { queueLocal(p); return { ok: false, skipped: true }; }
    try {
      await fetch(CFG.logEndpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ key: CFG.logKey || "", ...p }) });
      return { ok: true };
    } catch (e) { queueLocal(p); return { ok: false, error: String(e) }; }
  }
  function queueLocal(p) {
    try { const arr = JSON.parse(localStorage.getItem(LS.logs) || "[]"); arr.push(p); localStorage.setItem(LS.logs, JSON.stringify(arr.slice(-200))); } catch (_) {}
  }
  async function flushLocal() {
    if (!CFG.logEndpoint) return;
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem(LS.logs) || "[]"); } catch (_) {}
    if (!arr.length) return;
    localStorage.removeItem(LS.logs);
    for (const p of arr) await sendLog({ ...p, replayed: true });
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errBox.style.display = "none";
    
    if (!form.reportValidity()) return;

    if (!osRequest()) {
      errBox.textContent = t("os.error");
      errBox.style.display = "block";
      return;
    }

    const btn = $("#submitBtn");

    const label = btn.textContent;
    btn.disabled = true; btn.textContent = t("form.sending");
    const p = buildPayload();
    const [mail, log] = await Promise.all([sendMail(p).catch((err) => ({ ok: false, error: String(err) })), sendLog(p)]);
    btn.disabled = false; btn.textContent = label;

    if (!mail.ok && !log.ok) {
      const href = `mailto:${contactEmail()}?subject=${encodeURIComponent(mailSubject(p))}&body=${encodeURIComponent(mailBody(p))}`;
      errBox.innerHTML = t("form.fail", { href });
      errBox.style.display = "block";
      return;
    }
     
    // Google Ads: 서버 임대 신청 완료 전환
    if (typeof gtag === "function") {
      gtag("event", "conversion", {
        send_to: "AW-18530044178/n7sfCLfKxq8dEJKS6INF"
      });
    }

    const r = isR(p);
    $("#doneTitle").textContent = t(r ? "done.reserve.title" : "done.request.title");
    $("#doneMsg").innerHTML = r
      ? t("done.reserve.msg", { server: p.serverName, email: p.email }) + (mail.ok ? "" : t("done.reserve.logonly"))
: t("done.request.msg", { contact: contactEmail(), within: replyWithin(), email: p.email })
  + (lang === "ko"
    ? "<p style='margin-top:16px'><strong>결제 안내</strong><br>신청 승인 후 계좌이체 정보를 이메일로 안내해 드립니다. 이용료는 매월 선납이며, 입금 확인 후 서버가 제공됩니다.</p>"
    : "<p style='margin-top:16px'><strong>Payment Information</strong><br>Once your request is approved, we will email you a PayPal payment link. Monthly subscription options will be confirmed before payment.</p>");    form.style.display = "none";
    done.style.display = "block";
    form.reset();
    toast(t(r ? "toast.reserve" : "toast.request"));
  });

  /* ---------- 토스트 ---------- */
  let tt;
  function toast(msg) { const el = $("#toast"); el.textContent = msg; el.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2200); }

  /* ---------- 스크롤 스파이 ---------- */
  const secs = ["top", "plans", "how", "included", "faq"].map((id) => document.getElementById(id)).filter(Boolean);
  const links = $$("#nav a");
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id)); });
  }, { rootMargin: "-40% 0px -55% 0px" });
  secs.forEach((s) => io.observe(s));

  /* ---------- 시작 ---------- */
  applyI18n();
  render();
  loadLive(false).then(() => { applyI18n(); render(); flushLocal(); });
})();
