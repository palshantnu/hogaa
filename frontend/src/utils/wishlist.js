// 🔥 GET WISHLIST
export const getWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
  } catch (err) {
    return [];
  }
};

// 🔥 ADD TO WISHLIST
export const addToWishlist = (product) => {
  let wishlist = getWishlist();

  const exists = wishlist.find((item) => item.id === product.id);

  if (!exists) {
    wishlist.push(product);
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }
};

// 🔥 REMOVE FROM WISHLIST
export const removeFromWishlist = (id) => {
  let wishlist = getWishlist().filter((item) => item.id !== id);
  localStorage.setItem("wishlist", JSON.stringify(wishlist));
};

// 🔥 CHECK IF IN WISHLIST (VERY USEFUL 🔥)
export const isInWishlist = (id) => {
  let wishlist = getWishlist();
  return wishlist.some((item) => item.id === id);
};

// 🔥 TOGGLE (ADD/REMOVE SAME BUTTON 🔥)
export const toggleWishlist = (product) => {
  let wishlist = getWishlist();

  const exists = wishlist.find((item) => item.id === product.id);

  if (exists) {
    wishlist = wishlist.filter((item) => item.id !== product.id);
  } else {
    wishlist.push(product);
  }

  localStorage.setItem("wishlist", JSON.stringify(wishlist));
};