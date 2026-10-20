// 公開用サイトの共通スクリプト（トップ・助っ人のLP）。
//
// 【要記入】App Storeで公開したら、APP_STORE_URLにアプリのページのURLを入れる
// （例: https://apps.apple.com/jp/app/id0000000000）。空のうちは「近日配信」と表示する。
// Google Playは準備中（Android版はiOS版の後にリリースする方針）。
const APP_STORE_URL = '';
const GOOGLE_PLAY_URL = '';

// assets/フォルダのURL（ページの階層によらずバッジ画像を参照するため、このスクリプト自身の場所から求める）。
const ASSETS_BASE = new URL('.', document.currentScript.src);

// ストアの公式バッジ（Appleのマーケティングリソース・Google Playのバッジ。改変せずに使う）。
// 各社のガイドラインどおり、ストアのアプリのページへリンクできる（URLが設定済みの）ときだけ表示する。
const STORE_BADGES = {
  ios: { src: 'badges/app_store_ja.svg', alt: 'App Storeからダウンロード', className: 'store-badge apple' },
  android: { src: 'badges/google_play_ja.png', alt: 'Google Play で手に入れよう', className: 'store-badge google' },
};

function setupStoreButtons() {
  document.querySelectorAll('[data-store]').forEach((el) => {
    const isIos = el.dataset.store === 'ios';
    const url = isIos ? APP_STORE_URL : GOOGLE_PLAY_URL;
    if (url) {
      const badge = STORE_BADGES[isIos ? 'ios' : 'android'];
      el.href = url;
      el.removeAttribute('aria-disabled');
      el.className = 'store-badge-link';
      el.replaceChildren(
        Object.assign(document.createElement('img'), {
          src: new URL(badge.src, ASSETS_BASE).href,
          alt: badge.alt,
          className: badge.className,
        }),
      );
    } else {
      el.removeAttribute('href');
      el.setAttribute('aria-disabled', 'true');
      el.textContent = isIos ? 'App Store（近日配信）' : 'Google Play（準備中）';
    }
  });
}

// 助っ人コード（helper_system.md §3.3の短縮形式。Base64URL）から、名前とレベルを読み取る。
// チェックサムが合わない・形式が違う場合はnullを返す。
function decodeHelperCode(code) {
  try {
    const base64 = code.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const bytes = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
    if (bytes.length < 2) return null;
    const body = bytes.slice(0, bytes.length - 1);
    const sum = body.reduce((a, b) => a + b, 0) % 256;
    if (sum !== bytes[bytes.length - 1]) return null;
    let i = 0;
    if (body[i++] !== 2) return null; // 形式のバージョン
    i += 1; // クラスID
    const level = body[i++];
    i += 16; // 8パラメータ
    i += 1 + body[i] * 3; // スキル
    i += 1 + body[i] * 3; // 装備
    const nameLength = body[i++];
    const name = new TextDecoder().decode(body.slice(i, i + nameLength));
    if (i + nameLength !== body.length) return null;
    return { name, level };
  } catch (_) {
    return null;
  }
}

function setupHelperPage() {
  const root = document.getElementById('helper');
  if (!root) return;
  const code = decodeURIComponent(location.hash.replace(/^#/, '')).trim();
  const info = code ? decodeHelperCode(code) : null;
  document.getElementById('helper-found').hidden = !info;
  document.getElementById('helper-missing').hidden = !!info;
  if (!info) return;
  document.getElementById('helper-name').textContent = `${info.name}（Lv.${info.level}）`;
  document.getElementById('helper-code').textContent = code;
  document.getElementById('open-app').href = `apexof8://helper?code=${encodeURIComponent(code)}`;
  const copy = document.getElementById('copy-code');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code);
      copy.textContent = 'コピーしました';
    } catch (_) {
      copy.textContent = 'コピーできませんでした（コードを長押しして選択してください）';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupStoreButtons();
  setupHelperPage();
});
