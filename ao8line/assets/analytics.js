// アクセス解析（Google アナリティクス 4）。docs/analytics.md §6
// 測定 ID（G-XXXXXXXXXX）を入れると読み込む。空の間は何もしない。
// プライバシーポリシー「公式サイトについて」に、Google アナリティクスと Cookie の利用を記載している。
(function () {
  var GA_MEASUREMENT_ID = 'G-JZXX4024SX'; // GA4 のウェブストリーム「Ao8 Line LP」（プロパティ apex-of-8-line。2026-11-17）
  if (!GA_MEASUREMENT_ID) return;
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  // 広告の機能（Google シグナル・広告のパーソナライズ）は使わない
  window.gtag('config', GA_MEASUREMENT_ID, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });
})();
