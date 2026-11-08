/* Owner-approved fixed catalogue values. No fetching, speed tests or conversions. */
(function (root) {
  'use strict';
  function html(snapshot, lang) {
    if (!snapshot || !['downloadMbps', 'uploadMbps'].every(key => typeof snapshot[key] === 'number' && Number.isFinite(snapshot[key]) && snapshot[key] >= 0) || (snapshot.updatedAt != null && !/^\d{4}-\d\d-\d\d \d\d:\d\d$/.test(snapshot.updatedAt))) return '';
    const metric = (direction, value, arrow, label) => `<div class="network-snapshot-metric network-snapshot-${direction}"><dt><span class="network-snapshot-arrow" aria-hidden="true">${arrow}</span>${label}</dt><dd><strong>${value.toFixed(2)}</strong><span>Mbps</span></dd></div>`;
    return `<dl class="network-snapshot-grid">${metric('download', snapshot.downloadMbps, '↓', lang === 'ko' ? '다운로드' : 'Download')}${metric('upload', snapshot.uploadMbps, '↑', lang === 'ko' ? '업로드' : 'Upload')}</dl>${snapshot.updatedAt ? `<p class="network-snapshot-updated">Last Updated: <time>${snapshot.updatedAt}</time></p>` : ""}`;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = {html};
  else root.NetworkSnapshot = {html};
})(typeof window === 'undefined' ? globalThis : window);
