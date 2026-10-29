// 公開用サイトの共通スクリプト（トップ・助っ人のLP・プレゼントのLP）。
//
// 【要記入】App Storeで公開したら、APP_STORE_URLにアプリのページのURLを入れる
// （https://apps.apple.com/jp/app/id6827018106 。App Store Connectで2026-10-26に登録したApple ID。
// 公開前に入れるとリンク先が見つからないため、公開日に入れる）。空のうちは「近日配信」と表示する。
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

// プレゼントのLP（presents.md §2.2）。プレゼントIDは英大文字と数字の10文字（0・O・1・Iは使わない）。
// 中身はアプリ側にだけあるため、ここでは形式だけを確かめる。
function setupGiftPage() {
  const root = document.getElementById('gift');
  if (!root) return;
  const id = decodeURIComponent(location.hash.replace(/^#/, '')).trim().toUpperCase();
  const valid = /^[A-HJ-NP-Z2-9]{10}$/.test(id);
  document.getElementById('gift-found').hidden = !valid;
  document.getElementById('gift-missing').hidden = valid;
  if (!valid) return;
  document.getElementById('gift-code').textContent = id;
  document.getElementById('open-gift-app').href = `apexof8://gift?id=${id}`;
  const copy = document.getElementById('copy-gift-code');
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(id);
      copy.textContent = 'コピーしました';
    } catch (_) {
      copy.textContent = 'コピーできませんでした（コードを長押しして選択してください）';
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupStoreButtons();
  setupHelperPage();
  setupGiftPage();
});
