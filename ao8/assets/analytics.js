// 公開用サイトのアクセス解析（Google アナリティクス 4）。ao8/の全ページで読み込む。
//
// GA_MEASUREMENT_IDは、Google アナリティクスの「管理」→「データストリーム」で作ったウェブストリームの
// 測定ID（G-から始まる）。空のうちは何も送信しない（docs/guides/public_site.md「アクセス解析」）。
// 送信先・送信内容を変えたら、legal/privacy.html第4条の「公式サイトでのアクセス解析」も直す。
const GA_MEASUREMENT_ID = 'G-DEBLXQG3LN'; // ウェブストリーム「Apex of 8 公式サイト」（2026-11-14作成）

(() => {
  if (!GA_MEASUREMENT_ID) return;

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }

  // 助っ人コード・プレゼントコードはURLの#以降にあるため、送信するURLから#以降を除く。
  // 広告には使わないため、Googleシグナルと広告のパーソナライズは無効にする。
  gtag('js', new Date());
  gtag('set', {
    page_location: location.origin + location.pathname + location.search,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  gtag('config', GA_MEASUREMENT_ID);

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(tag);

  // ボタンの操作（site.jsがhrefを設定したものだけ）。
  // store_click: ストアへのボタン（store=ios/android）
  // open_app_click: 助っ人のLPの「アプリで開く」・プレゼントのLPの「アプリで受け取る」（kind=helper/gift）
  // copy_code: 助っ人コード・プレゼントコードのコピー（kind=helper/gift）
  document.addEventListener(
    'click',
    (event) => {
      const el = event.target.closest('a, button');
      if (!el) return;
      if (el.matches('[data-store]') && el.getAttribute('href')) {
        gtag('event', 'store_click', { store: el.dataset.store });
      } else if (el.id === 'open-app' || el.id === 'open-gift-app') {
        gtag('event', 'open_app_click', { kind: el.id === 'open-app' ? 'helper' : 'gift' });
      } else if (el.id === 'copy-code' || el.id === 'copy-gift-code') {
        gtag('event', 'copy_code', { kind: el.id === 'copy-code' ? 'helper' : 'gift' });
      }
    },
    true,
  );
})();
