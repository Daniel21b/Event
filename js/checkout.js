/**
 * Yalem Event Rentals — Checkout Page Logic
 *
 * Renders the cart contents with deposit breakdown, handles quantity changes,
 * and submits to the Vercel serverless function for Stripe session creation.
 *
 * Deposit model: 50% non-refundable booking deposit + 10% damage waiver
 * charged at checkout. Balance due ~14 days before event.
 *
 * Requires: js/products.js, js/cart.js
 */

var DEPOSIT_RATE = 0.50;
var DAMAGE_WAIVER_RATE = 0.10;

document.addEventListener("DOMContentLoaded", function () {
  renderOrderSummary();
  updateCartBadge();
  updatePayButtonState();

  var form = document.getElementById("checkout-details-form");
  if (form) {
    form.addEventListener("submit", handleCheckout);
    // Re-evaluate pay button whenever required fields change
    var inputs = form.querySelectorAll("input[required]");
    for (var i = 0; i < inputs.length; i++) {
      inputs[i].addEventListener("input", updatePayButtonState);
    }
  }

  // Set min date to today
  var dateInput = document.getElementById("event-date");
  if (dateInput) {
    var today = new Date();
    var yyyy = today.getFullYear();
    var mm = String(today.getMonth() + 1).padStart(2, "0");
    var dd = String(today.getDate()).padStart(2, "0");
    dateInput.setAttribute("min", yyyy + "-" + mm + "-" + dd);
  }
});

/**
 * Render all cart line items into the order summary.
 */
function renderOrderSummary() {
  var cart = Cart.get();
  var keys = Object.keys(cart);
  var container = document.getElementById("line-items-container");
  var totalRow = document.getElementById("order-total-row");
  var totalDisplay = document.getElementById("order-total-display");

  if (!container) return;

  // Empty cart state
  if (keys.length === 0) {
    container.innerHTML =
      '<div class="empty-cart">' +
      '<div class="empty-cart-icon"><i class="fas fa-shopping-cart"></i></div>' +
      "<h3>Your cart is empty</h3>" +
      "<p>Browse our rental collections and add items to your order.</p>" +
      '<a href="index.html#services" class="btn btn-primary">Browse Rentals</a>' +
      "</div>";
    if (totalRow) totalRow.style.display = "none";
    updatePayButtonState();
    return;
  }

  var html = "";
  var grandTotal = 0;

  for (var i = 0; i < keys.length; i++) {
    var id = keys[i];
    var qty = cart[id];
    var product = PRODUCTS[id];
    if (!product) continue;

    var subtotal = product.unitAmount * qty;
    grandTotal += subtotal;

    html +=
      '<div class="line-item" data-product-id="' + id + '">' +
      '<img class="line-item-img" src="' + product.image + '" alt="' + product.name + '">' +
      '<div class="line-item-info">' +
      '<span class="line-item-name">' + product.name + "</span>" +
      '<span class="line-item-unit-price">' + formatPrice(product.unitAmount) + " each</span>" +
      "</div>" +
      '<div class="qty-control">' +
      '<button type="button" class="qty-btn qty-minus" data-id="' + id + '" aria-label="Decrease quantity">−</button>' +
      '<input type="number" class="qty-value qty-input" data-id="' + id + '" value="' + qty + '" min="1" step="1" aria-label="Quantity for ' + product.name + '">' +
      '<button type="button" class="qty-btn qty-plus" data-id="' + id + '" aria-label="Increase quantity">+</button>' +
      "</div>" +
      '<span class="line-item-subtotal">' + formatPrice(subtotal) + "</span>" +
      '<button type="button" class="btn-remove" data-id="' + id + '" aria-label="Remove ' + product.name + '">✕</button>' +
      "</div>";
  }

  container.innerHTML = html;

  // Deposit breakdown
  var depositAmount = Math.round(grandTotal * DEPOSIT_RATE);
  var damageWaiver = Math.round(grandTotal * DAMAGE_WAIVER_RATE);
  var todayTotal = depositAmount + damageWaiver;
  var balanceDue = grandTotal - depositAmount;

  var breakdownEl = document.getElementById("deposit-breakdown");
  if (breakdownEl) {
    breakdownEl.style.display = "block";
    document.getElementById("breakdown-subtotal").textContent = formatPrice(grandTotal);
    document.getElementById("breakdown-deposit").textContent = formatPrice(depositAmount);
    document.getElementById("breakdown-waiver").textContent = formatPrice(damageWaiver);
    document.getElementById("breakdown-today").textContent = formatPrice(todayTotal);
    document.getElementById("breakdown-balance").textContent = formatPrice(balanceDue);
  }

  if (totalRow) totalRow.style.display = "none"; // replaced by breakdown

  // Attach event listeners
  attachCartHandlers();
  updatePayButtonState();
}

/**
 * Attach click handlers for qty +/- and remove buttons.
 */
function attachCartHandlers() {
  // Minus buttons
  var minusBtns = document.querySelectorAll(".qty-minus");
  for (var i = 0; i < minusBtns.length; i++) {
    minusBtns[i].addEventListener("click", function () {
      var id = this.getAttribute("data-id");
      var cart = Cart.get();
      var newQty = (cart[id] || 1) - 1;
      if (newQty <= 0) {
        Cart.remove(id);
      } else {
        Cart.update(id, newQty);
      }
      renderOrderSummary();
      updateCartBadge();
    });
  }

  // Plus buttons
  var plusBtns = document.querySelectorAll(".qty-plus");
  for (var i = 0; i < plusBtns.length; i++) {
    plusBtns[i].addEventListener("click", function () {
      var id = this.getAttribute("data-id");
      Cart.add(id, 1);
      renderOrderSummary();
      updateCartBadge();
    });
  }

  // Remove buttons
  var removeBtns = document.querySelectorAll(".btn-remove");
  for (var i = 0; i < removeBtns.length; i++) {
    removeBtns[i].addEventListener("click", function () {
      var id = this.getAttribute("data-id");
      Cart.remove(id);
      renderOrderSummary();
      updateCartBadge();
      showCartToast("Item removed from order");
    });
  }

  var qtyInputs = document.querySelectorAll(".qty-input");
  for (var i = 0; i < qtyInputs.length; i++) {
    qtyInputs[i].addEventListener("change", function () {
      var id = this.getAttribute("data-id");
      var qty = parseInt(this.value, 10);
      if (!qty || qty < 1) qty = 1;
      Cart.update(id, qty);
      renderOrderSummary();
      updateCartBadge();
    });
  }
}

/**
 * Enable/disable the pay button based on cart and form state.
 */
function updatePayButtonState() {
  var payBtn = document.getElementById("pay-btn");
  if (!payBtn) return;

  var cartEmpty = Cart.count() === 0;
  var name = document.getElementById("customer-name");
  var email = document.getElementById("customer-email");
  var date = document.getElementById("event-date");

  var formValid =
    name && name.value.trim() !== "" &&
    email && email.value.trim() !== "" &&
    date && date.value !== "";

  payBtn.disabled = cartEmpty || !formValid;
}

/**
 * Handle the checkout form submission.
 * POSTs to the Vercel function and redirects to Stripe.
 */
async function handleCheckout(e) {
  e.preventDefault();

  // Validate
  if (!validateCheckoutForm()) return;

  var payBtn = document.getElementById("pay-btn");
  payBtn.disabled = true;
  payBtn.classList.add("loading");

  var payload = {
    lineItems: Cart.toLineItems(),
    customerEmail: document.getElementById("customer-email").value.trim(),
    customerName: document.getElementById("customer-name").value.trim(),
    eventDate: document.getElementById("event-date").value,
    deliveryAddress: (document.getElementById("delivery-address").value || "").trim()
  };

  try {
    var res = await fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    var data = await res.json();

    if (data.url) {
      window.location.href = data.url; // Redirect to Stripe-hosted checkout
    } else {
      throw new Error(data.error || "Failed to create checkout session");
    }
  } catch (err) {
    console.error("Checkout error:", err);
    alert(
      "Something went wrong while processing your order. Please try again.\n\n" +
      "If the problem persists, contact us at Yalemeventrentals@gmail.com"
    );
    payBtn.disabled = false;
    payBtn.classList.remove("loading");
  }
}

/**
 * Validate required checkout form fields.
 * Returns true if valid.
 */
function validateCheckoutForm() {
  var valid = true;

  // Clear previous errors
  var errors = document.querySelectorAll(".checkout-form .error-message");
  for (var i = 0; i < errors.length; i++) {
    errors[i].textContent = "";
  }

  // Name
  var name = document.getElementById("customer-name");
  if (!name.value.trim()) {
    showFieldError(name, "Please enter your full name");
    valid = false;
  }

  // Email
  var email = document.getElementById("customer-email");
  if (!email.value.trim()) {
    showFieldError(email, "Please enter your email address");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    showFieldError(email, "Please enter a valid email address");
    valid = false;
  }

  // Event date
  var date = document.getElementById("event-date");
  if (!date.value) {
    showFieldError(date, "Please select your event date");
    valid = false;
  }

  // Cart
  if (Cart.count() === 0) {
    alert("Your cart is empty. Please add items before checking out.");
    valid = false;
  }

  return valid;
}

/**
 * Show an error message below a form field.
 */
function showFieldError(input, message) {
  var group = input.closest(".form-group");
  if (!group) return;
  var errEl = group.querySelector(".error-message");
  if (errEl) {
    errEl.textContent = message;
  }
  input.classList.add("error");
  input.addEventListener(
    "input",
    function handler() {
      input.classList.remove("error");
      if (errEl) errEl.textContent = "";
      input.removeEventListener("input", handler);
    }
  );
}
