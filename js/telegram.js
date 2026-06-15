// ---------------------------------------------------------------------
// Telegram Mini App integratsiyasi (mavjud bo'lmasa, sukunatda ishlaydi)
// ---------------------------------------------------------------------

const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

function initTelegram() {
  if (!tg) return;
  try {
    tg.ready();
    tg.expand();
    applyTelegramTheme();
    tg.onEvent('themeChanged', applyTelegramTheme);
  } catch {
    // Telegram muhitidan tashqarida ishga tushgan
  }
}

function applyTelegramTheme() {
  if (!tg || !tg.themeParams) return;
  const p = tg.themeParams;
  const root = document.documentElement.style;
  const map = {
    bg_color: '--tg-bg',
    text_color: '--tg-text',
    hint_color: '--tg-hint',
    button_color: '--tg-button',
    button_text_color: '--tg-button-text',
    secondary_bg_color: '--tg-secondary-bg',
  };
  Object.entries(map).forEach(([key, cssVar]) => {
    if (p[key]) root.setProperty(cssVar, p[key]);
  });
}

function hapticTap() {
  if (tg && tg.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('light');
  }
}
