/**
 * Yalem Event Rentals — Canonical Product & Price Registry
 * 
 * SINGLE SOURCE OF TRUTH for all prices.
 * Both the checkout page and the Stripe session read from this file.
 * unitAmount is always in CENTS (Stripe's required format).
 */

const PRODUCTS = {
  // ── Chairs ──
  "chiavari-gold": {
    id: "chiavari-gold",
    name: "Chiavari Chair – Gold",
    unitAmount: 1200,       // $12.00
    currency: "usd",
    image: "img/chairs/chairs.png",
    category: "chairs"
  },
  "chiavari-silver": {
    id: "chiavari-silver",
    name: "Chiavari Chair – Silver",
    unitAmount: 1200,       // $12.00
    currency: "usd",
    image: "img/chairs/chair2.png",
    category: "chairs"
  },
  "ghost-chair": {
    id: "ghost-chair",
    name: "Ghost / Clear Chair",
    unitAmount: 1800,       // $18.00
    currency: "usd",
    image: "img/chairs/chairs.png",
    category: "chairs"
  },
  "cross-back": {
    id: "cross-back",
    name: "Cross-Back Wooden Chair",
    unitAmount: 1500,       // $15.00
    currency: "usd",
    image: "img/chairs/chair2.png",
    category: "chairs"
  },
  "folding-white": {
    id: "folding-white",
    name: "Luxury Folding Chair – White",
    unitAmount: 800,        // $8.00
    currency: "usd",
    image: "img/chairs/chairs.png",
    category: "chairs"
  },
  "folding-black": {
    id: "folding-black",
    name: "Luxury Folding Chair – Black",
    unitAmount: 800,        // $8.00
    currency: "usd",
    image: "img/chairs/chair2.png",
    category: "chairs"
  },

  // ── Tables ──
  "round-table": {
    id: "round-table",
    name: "Round Table",
    unitAmount: 1000,       // $10.00
    currency: "usd",
    image: "img/table/circletable.jpg",
    category: "tables"
  },

  // ── Tents ──
  "tent-10x20": {
    id: "tent-10x20",
    name: "10×20 Tent (24hr)",
    unitAmount: 10000,      // $100.00
    currency: "usd",
    image: "img/tents/10*20tent.jpg",
    category: "tents"
  },
  "tent-10x30": {
    id: "tent-10x30",
    name: "10×30 Tent (24hr)",
    unitAmount: 15000,      // $150.00
    currency: "usd",
    image: "img/tents/10X30 tent.png",
    category: "tents"
  },
  "tent-20x40": {
    id: "tent-20x40",
    name: "20×40 Large Tent (24hr)",
    unitAmount: 35000,      // $350.00
    currency: "usd",
    image: "img/tents/20*40tent.jpg",
    category: "tents"
  },

  // ── Backdrops & Decorations ──
  "arc-set": {
    id: "arc-set",
    name: "Two-Piece Arc Set",
    unitAmount: 3000,       // $30.00
    currency: "usd",
    image: "img/backdrops/decor_one.png",
    category: "backdrops"
  },
  "arc-set-balloons": {
    id: "arc-set-balloons",
    name: "Arc Set with Custom Balloons",
    unitAmount: 20000,      // $200.00
    currency: "usd",
    image: "img/backdrops/backdrop1.jpg",
    category: "backdrops"
  }
};

/**
 * Helper: format cents to display price string
 * @param {number} cents - Price in cents
 * @returns {string} Formatted price, e.g. "$12.00"
 */
function formatPrice(cents) {
  return "$" + (cents / 100).toFixed(2);
}
