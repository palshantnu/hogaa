// utils/cart.js
import { trackPixel } from './metaPixel';
const API = 'https://admin.hogaacosmetics.com';
const GUEST_CART_KEY = 'guest_cart';

const getStoredUser = () => {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

// ─── Guest cart helpers ───────────────────────────────────────────────────────
const getGuestCartItems = () => {
  try { return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]'); } catch { return []; }
};

const saveGuestCartItems = (items) => {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('cartUpdated'));
};

export const mergeGuestCartToServer = async (userId) => {
  const items = getGuestCartItems();
  if (!items.length) return;
  for (const item of items) {
    try {
      await fetch(`${API}/api/cart/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: item.product_id,
          variation_id: item.variation_id || null,
          quantity: item.quantity,
          user_id: userId
        })
      });
    } catch (e) {
      console.error('Merge cart error:', e);
    }
  }
  localStorage.removeItem(GUEST_CART_KEY);
  window.dispatchEvent(new Event('cartUpdated'));
};

// ─── Get cart ────────────────────────────────────────────────────────────────
export const getCart = async (user) => {
  const userId = user?.id || getStoredUser()?.id;

  if (!userId) {
    return getGuestCartItems().map(item => ({
      ...item,
      cartItemId: item.guest_id,
      id: item.product_id
    }));
  }

  try {
    const res = await fetch(`${API}/api/cart?user_id=${userId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success && data.cart?.items) {
      return data.cart.items.map(item => ({
        id: item.product_id,
        cartItemId: item.id,
        product_id: item.product_id,
        variation_id: item.variation_id,
        variation_name: item.variation_name,
        name: item.product?.name || 'Product',
        price: item.price,
        quantity: item.quantity,
        total: item.total,
        images: item.product?.images || [],
        stock: item.product?.stock || 0,
        compare_price: item.product?.compare_price || null,
        product: item.product,
        variation: item.variation
      }));
    }
    return [];
  } catch (e) {
    console.error('Get cart error:', e);
    return [];
  }
};

const trackAddToCart = (product, quantity) => {
  trackPixel('AddToCart', {
    content_ids: [String(product.id)],
    content_name: product.name,
    content_type: 'product',
    value: (parseFloat(product.price) || 0) * quantity,
    currency: 'INR'
  });
};

// ─── Add to cart ─────────────────────────────────────────────────────────────
export const addToCart = async (product, quantity = 1, user) => {
  const userId = user?.id || getStoredUser()?.id;

  if (!userId) {
    const items = getGuestCartItems();
    const key = `${product.id}_${product.variation_id || ''}`;
    const idx = items.findIndex(i => `${i.product_id}_${i.variation_id || ''}` === key);
    if (idx >= 0) {
      items[idx].quantity += quantity;
      items[idx].total = parseFloat(items[idx].price) * items[idx].quantity;
    } else {
      items.push({
        guest_id: `guest_${Date.now()}_${Math.random()}`,
        product_id: product.id,
        variation_id: product.variation_id || null,
        variation_name: product.variation_name || null,
        name: product.name,
        price: product.price,
        quantity,
        total: parseFloat(product.price) * quantity,
        images: product.images || [],
        cgst_rate: product.cgst_rate || 9,
        sgst_rate: product.sgst_rate || 9,
        igst_rate: product.igst_rate || 0,
        product: { images: product.images || [], compare_price: product.compare_price || null }
      });
    }
    saveGuestCartItems(items);
    trackAddToCart(product, quantity);
    return { success: true, message: 'Added to cart' };
  }

  try {
    const body = { product_id: product.id, quantity, user_id: userId };
    if (product.variation_id) body.variation_id = product.variation_id;

    const res = await fetch(`${API}/api/cart/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (data.success) {
      window.dispatchEvent(new Event('cartUpdated'));
      trackAddToCart(product, quantity);
    }
    return data.success
      ? { success: true, message: data.message || 'Added to cart' }
      : { success: false, message: data.message || 'Failed to add' };
  } catch (e) {
    return { success: false, message: 'Network error' };
  }
};

// ─── Update cart item ─────────────────────────────────────────────────────────
export const updateCartItem = async (cartItemId, quantity, userId) => {
  const id = userId || getStoredUser()?.id;

  if (!id) {
    const items = getGuestCartItems();
    const idx = items.findIndex(i => i.guest_id === cartItemId);
    if (idx >= 0) {
      items[idx].quantity = quantity;
      items[idx].total = parseFloat(items[idx].price) * quantity;
      saveGuestCartItems(items);
    }
    return { success: true, message: 'Updated' };
  }

  try {
    const res = await fetch(`${API}/api/cart/update/${cartItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, user_id: id })
    });
    const data = await res.json();
    if (data.success) window.dispatchEvent(new Event('cartUpdated'));
    return data.success ? { success: true } : { success: false, message: data.message };
  } catch (e) {
    return { success: false, message: 'Network error' };
  }
};

// ─── Remove from cart ─────────────────────────────────────────────────────────
export const removeFromCart = async (cartItemId, user) => {
  const userId = user?.id || getStoredUser()?.id;

  if (!userId) {
    const items = getGuestCartItems().filter(i => i.guest_id !== cartItemId);
    saveGuestCartItems(items);
    return { success: true, message: 'Removed' };
  }

  try {
    const res = await fetch(`${API}/api/cart/remove/${cartItemId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId })
    });
    const data = await res.json();
    if (data.success) window.dispatchEvent(new Event('cartUpdated'));
    return data.success ? { success: true } : { success: false, message: data.message };
  } catch (e) {
    return { success: false, message: 'Network error' };
  }
};

// ─── Get cart totals ──────────────────────────────────────────────────────────
export const getCartTotals = async () => {
  const user = getStoredUser();
  const userId = user?.id;

  if (!userId) {
    const items = getGuestCartItems();
    const subtotal = items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
    const cgst = items.reduce((s, i) => {
      const rate = (i.cgst_rate || 9) + (i.sgst_rate || 9) + (i.igst_rate || 0);
      const tax = rate > 0 ? (parseFloat(i.price) * i.quantity * rate) / (100 + rate) : 0;
      return s + tax * ((i.cgst_rate || 9) / rate || 0);
    }, 0);
    const sgst = cgst;
    const tax = items.reduce((s, i) => {
      const rate = (i.cgst_rate || 9) + (i.sgst_rate || 9) + (i.igst_rate || 0);
      return rate > 0 ? s + (parseFloat(i.price) * i.quantity * rate) / (100 + rate) : s;
    }, 0);
    return { subtotal, cgst, sgst, igst: 0, tax, shipping: 0, total: subtotal, item_count: items.reduce((s, i) => s + i.quantity, 0) };
  }

  try {
    const res = await fetch(`${API}/api/cart?user_id=${userId}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await res.json();
    if (data.success && data.cart) {
      return {
        subtotal: data.cart.subtotal,
        cgst: data.cart.totalCgst || 0,
        sgst: data.cart.totalSgst || 0,
        igst: data.cart.totalIgst || 0,
        tax: data.cart.tax || 0,
        shipping: data.cart.shipping || 0,
        total: data.cart.total,
        item_count: data.cart.item_count
      };
    }
    return null;
  } catch (e) {
    return null;
  }
};

// ─── Get cart count ───────────────────────────────────────────────────────────
export const getCartCount = async (user) => {
  const userId = user?.id || getStoredUser()?.id;
  if (!userId) {
    return getGuestCartItems().reduce((s, i) => s + i.quantity, 0);
  }
  try {
    const res = await fetch(`${API}/api/cart/count?user_id=${userId}`);
    const data = await res.json();
    return data.success ? data.count : 0;
  } catch { return 0; }
};

// ─── Shipping charge (same state vs other state) ──────────────────────────────
export const fetchShippingConfig = async () => {
  try {
    const res = await fetch(`${API}/api/settings/shipping-charge`);
    const data = await res.json();
    if (data.success && data.shipping) return data.shipping;
  } catch (e) {
    console.error('Fetch shipping config error:', e);
  }
  return { homeState: 'Maharashtra', sameStateCharge: 40, otherStateCharge: 70 };
};

export const calculateShippingCharge = (state, shippingConfig) => {
  if (!shippingConfig) return 0;
  const homeState = (shippingConfig.homeState || '').trim().toLowerCase();
  const customerState = (state || '').trim().toLowerCase();
  const isSameState = !!homeState && homeState === customerState;
  const charge = isSameState ? shippingConfig.sameStateCharge : shippingConfig.otherStateCharge;
  return parseFloat(charge) || 0;
};

// ─── Place order ──────────────────────────────────────────────────────────────
export const placeOrder = async (orderData, user) => {
  const userId = user?.id || getStoredUser()?.id;
  if (!userId) return { success: false, message: 'Please login first' };

  try {
    const res = await fetch(`${API}/api/orders/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...orderData, user_id: userId })
    });
    const data = await res.json();
    if (data.success) window.dispatchEvent(new Event('cartUpdated'));
    return data.success
      ? { success: true, message: data.message, order: data.order }
      : { success: false, message: data.message };
  } catch (e) {
    return { success: false, message: 'Network error' };
  }
};

// ─── Clear cart ───────────────────────────────────────────────────────────────
export const clearCart = async (user) => {
  const userId = user?.id || getStoredUser()?.id;
  if (!userId) {
    localStorage.removeItem(GUEST_CART_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
    return { success: true };
  }
  try {
    const res = await fetch(`${API}/api/cart/clear?user_id=${userId}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) window.dispatchEvent(new Event('cartUpdated'));
    return data;
  } catch (e) {
    return { success: false };
  }
};
