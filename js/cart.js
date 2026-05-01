/**
 * Yalem Event Rentals — Shopping Cart Manager
 * 
 * Cart state lives in localStorage so it persists across page navigation.
 * Requires js/products.js to be loaded first.
 */

const Cart = {
  STORAGE_KEY: "yalem_cart",

  /**
   * Get the full cart object: { productId: quantity, ... }
   */
  get() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || "{}");
    } catch (e) {
      console.error("Cart: failed to parse cart data", e);
      return {};
    }
  },

  /**
   * Save the cart object to localStorage
   */
  _save(cart) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  },

  /**
   * Add qty units of a product (default 1). Creates entry if not present.
   */
  add(productId, qty) {
    if (typeof qty === "undefined") qty = 1;
    if (!PRODUCTS[productId]) {
      console.warn("Cart.add: unknown product", productId);
      return;
    }
    var cart = this.get();
    cart[productId] = (cart[productId] || 0) + qty;
    if (cart[productId] <= 0) delete cart[productId];
    this._save(cart);
  },

  /**
   * Set exact quantity for a product. Removes if qty <= 0.
   */
  update(productId, qty) {
    var cart = this.get();
    if (qty <= 0) {
      delete cart[productId];
    } else {
      cart[productId] = qty;
    }
    this._save(cart);
  },

  /**
   * Remove a product entirely from the cart.
   */
  remove(productId) {
    var cart = this.get();
    delete cart[productId];
    this._save(cart);
  },

  /**
   * Clear the entire cart.
   */
  clear() {
    localStorage.removeItem(this.STORAGE_KEY);
  },

  /**
   * Total number of items in the cart (sum of all quantities).
   */
  count() {
    var cart = this.get();
    var total = 0;
    var keys = Object.keys(cart);
    for (var i = 0; i < keys.length; i++) {
      total += cart[keys[i]];
    }
    return total;
  },

  /**
   * Total price in cents.
   */
  totalCents() {
    var cart = this.get();
    var total = 0;
    var keys = Object.keys(cart);
    for (var i = 0; i < keys.length; i++) {
      var id = keys[i];
      var p = PRODUCTS[id];
      if (p) {
        total += p.unitAmount * cart[id];
      }
    }
    return total;
  },

  /**
   * Convert cart to Stripe-compatible line items array.
   * Each item: { id, name, unitAmount, currency, quantity, image }
   */
  toLineItems() {
    var cart = this.get();
    var items = [];
    var keys = Object.keys(cart);
    for (var i = 0; i < keys.length; i++) {
      var id = keys[i];
      var p = PRODUCTS[id];
      if (!p) continue;
      items.push({
        id: p.id,
        name: p.name,
        unitAmount: p.unitAmount,
        currency: p.currency,
        quantity: cart[id],
        image: window.location.origin + "/" + p.image
      });
    }
    return items;
  }
};

/**
 * Update the cart badge count displayed in the nav.
 * Looks for an element with id="cart-badge".
 */
function updateCartBadge() {
  var badge = document.getElementById("cart-badge");
  if (!badge) return;
  var count = Cart.count();
  badge.textContent = count;
  badge.style.display = count > 0 ? "inline-flex" : "none";
}

/**
 * Show a brief toast notification at the bottom of the screen.
 */
function showCartToast(message) {
  // Remove existing toast if present
  var existing = document.getElementById("cart-toast");
  if (existing) existing.remove();

  var toast = document.createElement("div");
  toast.id = "cart-toast";
  toast.className = "cart-toast";
  toast.innerHTML = '<i class="fas fa-check-circle"></i> ' + message;
  document.body.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(function () {
    toast.classList.add("show");
  });

  // Auto-remove after 2.5s
  setTimeout(function () {
    toast.classList.remove("show");
    setTimeout(function () {
      toast.remove();
    }, 300);
  }, 2500);
}
