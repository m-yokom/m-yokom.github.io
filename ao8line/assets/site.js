// 公式サイトの共通スクリプト（ストアのボタン）。
//
// APP_STORE_URL は App Store Connect で登録した Apple ID（6835279551）のページ。
// 空にすると「近日配信」の表示に戻る。2026-11-19 配信開始（リリース）に合わせて記入。
const APP_STORE_URL = 'https://apps.apple.com/jp/app/id6835279551';

// Apex of 8（連携先）の App Store のページ
const AO8_APP_STORE_URL = 'https://apps.apple.com/jp/app/id6827018106';

const ASSETS_BASE = new URL('.', document.currentScript.src);

function setupStoreButtons() {
  document.querySelectorAll('[data-store="ios"]').forEach((el) => {
    if (APP_STORE_URL) {
      el.href = APP_STORE_URL;
      el.removeAttribute('aria-disabled');
      el.className = 'store-badge-link';
      el.replaceChildren(
        Object.assign(document.createElement('img'), {
          // Apple のマーケティングリソースの公式バッジ（改変しない）
          src: new URL('badges/app_store_ja.svg', ASSETS_BASE).href,
          alt: 'App Storeからダウンロード',
          className: 'store-badge',
        }),
      );
    } else {
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      el.textContent = 'App Store（近日配信）';
    }
  });
  document.querySelectorAll('[data-store="ao8"]').forEach((el) => { el.href = AO8_APP_STORE_URL; });
}

document.addEventListener('DOMContentLoaded', setupStoreButtons);
