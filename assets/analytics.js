/* ============================================================
   Ellion Bare Metal - 방문자 통계 (Google Analytics 4)
   - 데이터 소스: GA4 속성 elliongpu.com (속성 ID 556804121, 측정 ID G-0S428L9EKF)
   - 개인정보(이메일, 이름, 메시지 등 폼 입력값)는 절대 전송하지 않습니다.
   - app.js 는 수정하지 않고, 이벤트 위임으로만 동작합니다.
   - 측정 ID 는 servers.js 의 ELGRIM_CONFIG.analyticsId 로 덮어쓸 수 있습니다.
   ============================================================ */
(function () {
  "use strict";
  var CFG = window.ELGRIM_CONFIG || {};
  var ID = CFG.analyticsId || "G-0S428L9EKF";
  if (!ID) return;

  // Do Not Track 을 켠 브라우저는 수집하지 않음
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;

  // gtag 로더
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
  document.head.appendChild(s);

  function pref(key, def) { try { return localStorage.getItem(key) || def; } catch (e) { return def; } }

  gtag("js", new Date());
  gtag("config", ID, {
    anonymize_ip: true,
    user_properties: {
      site_lang: document.documentElement.lang || "ko",
    },
  });

  function ev(name, params) { try { gtag("event", name, params || {}); } catch (e) {} }

  // 서버 카드의 [사용 요청 / 예약] 버튼 클릭
  document.addEventListener("click", function (e) {
    var open = e.target.closest && e.target.closest("[data-open]");
    if (open) {
      ev("open_request_form", {
        form_type: open.getAttribute("data-open") || "request",
        server_id: open.getAttribute("data-server") || "",
      });
      return;
    }
    var lang = e.target.closest && e.target.closest("#langSeg [data-lang]");
    if (lang) {
      ev("language_change", { language: lang.getAttribute("data-lang") });
      return;
    }
    var flt = e.target.closest && e.target.closest("#statusSeg button[data-filter]");
    if (flt) {
      ev("filter_status", { filter: flt.getAttribute("data-filter") });
      return;
    }
    var nav = e.target.closest && e.target.closest("#nav a");
    if (nav) ev("nav_click", { target: nav.getAttribute("href") || "" });
  }, true);

  // 통화 변경
  document.addEventListener("change", function (e) {
    if (e.target && e.target.id === "currencySel") ev("currency_change", { currency: e.target.value });
    if (e.target && e.target.id === "sortSel") ev("sort_change", { sort: e.target.value });
  }, true);

  // 신청 폼 제출 (검증 통과 시에만 submit 이벤트가 발생) - 입력값은 보내지 않음
  document.addEventListener("submit", function (e) {
    if (!e.target || e.target.id !== "reqForm") return;
    var title = document.getElementById("modalServer");
    ev("generate_lead", {
      form_type: (document.getElementById("submitBtn") || {}).className || "",
      server_name: title ? (title.textContent || "").slice(0, 80) : "",
      currency: pref("elgrim.currency", ""),
    });
  }, true);
})();
