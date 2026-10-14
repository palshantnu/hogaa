// Meta Pixel helpers. Base code + initial PageView live in index.html.

export const trackPixel = (event, params) => {
  if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
  try {
    if (params) window.fbq('track', event, params);
    else window.fbq('track', event);
  } catch {
    // never let tracking break the app
  }
};

// ─── Purchase handoff across the PayU redirect ───────────────────────────────
const PENDING_PURCHASE_KEY = 'metaPixelPendingPurchase';

export const savePendingPurchase = (orderId, value, contentIds) => {
  try {
    sessionStorage.setItem(PENDING_PURCHASE_KEY, JSON.stringify({ orderId: String(orderId), value, contentIds }));
  } catch { /* storage unavailable */ }
};

export const trackPendingPurchase = (orderId) => {
  try {
    const pending = JSON.parse(sessionStorage.getItem(PENDING_PURCHASE_KEY) || 'null');
    if (!pending || pending.orderId !== String(orderId)) return;
    sessionStorage.removeItem(PENDING_PURCHASE_KEY); // fire once per order
    trackPixel('Purchase', {
      value: Number(pending.value) || 0,
      currency: 'INR',
      content_ids: pending.contentIds || [],
      content_type: 'product'
    });
  } catch { /* storage unavailable */ }
};
