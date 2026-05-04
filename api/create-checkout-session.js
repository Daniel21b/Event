import Stripe from "stripe";
import fs from "fs";
import path from "path";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const DEPOSIT_RATE = 0.50;       // 50% non-refundable booking deposit
const DAMAGE_WAIVER_RATE = 0.10; // 10% damage waiver

// Load canonical products catalog to enforce pricing
const productsPath = path.join(process.cwd(), "js", "products.js");
let PRODUCTS = {};
try {
  const productsCode = fs.readFileSync(productsPath, "utf8");
  // Extract just the PRODUCTS object definition
  const evalCode = productsCode + "; return PRODUCTS;";
  PRODUCTS = new Function(evalCode)();
} catch (err) {
  console.error("Failed to load canonical product catalog:", err);
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const {
      lineItems,
      customerEmail,
      eventDate,
      customerName,
      deliveryAddress
    } = req.body;

    // Validate cart
    if (!lineItems || lineItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Validate required fields
    if (!customerEmail || !customerName) {
      return res.status(400).json({ error: "Name and email are required" });
    }

    // Server-side Price Validation!
    // Never trust client-provided unitAmounts. Always look up from PRODUCTS.
    let orderTotal = 0;
    const validatedLineItems = [];

    for (const item of lineItems) {
      const canonicalProduct = PRODUCTS[item.id];
      if (!canonicalProduct) {
        return res.status(400).json({ error: `Invalid product in cart: ${item.id}` });
      }

      const unitAmount = canonicalProduct.unitAmount;
      const quantity = parseInt(item.quantity, 10);

      if (!quantity || quantity < 1) {
        return res.status(400).json({ error: `Invalid quantity for product: ${item.id}` });
      }
      
      orderTotal += unitAmount * quantity;
      
      validatedLineItems.push({
        id: canonicalProduct.id,
        name: canonicalProduct.name,
        quantity: quantity,
        unitAmount: unitAmount
      });
    }

    const depositAmount = Math.round(orderTotal * DEPOSIT_RATE);
    const damageWaiver = Math.round(orderTotal * DAMAGE_WAIVER_RATE);
    const todayTotal = depositAmount + damageWaiver;
    const balanceDue = orderTotal - depositAmount;

    // Build a human-readable summary of the rental items for metadata
    const itemsSummary = validatedLineItems
      .map((item) => `${item.name} ×${item.quantity}`)
      .join(", ");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: customerEmail,

      // Save payment method so we can charge the balance later (Phase 2)
      payment_intent_data: {
        setup_future_usage: "off_session"
      },

      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: todayTotal,
            product_data: {
              name: "Booking Payment Due Today",
              description: `Includes 50% non-refundable booking deposit and 10% damage waiver. Items: ${itemsSummary}`
            }
          },
          quantity: 1
        }
      ],

      metadata: {
        customerName: customerName || "",
        eventDate: eventDate || "",
        deliveryAddress: deliveryAddress || "",
        orderTotal: String(orderTotal),
        depositAmount: String(depositAmount),
        damageWaiver: String(damageWaiver),
        todayTotal: String(todayTotal),
        balanceDue: String(balanceDue),
        itemsSummary,
        source: "yalem-website"
      },

      success_url: `https://yalemeventrentals.com/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://yalemeventrentals.com/checkout.html`
    });

    // Return deposit breakdown alongside the redirect URL
    res.status(200).json({
      url: session.url,
      deposit: {
        orderTotal,
        depositAmount,
        damageWaiver,
        balanceDue,
        todayTotal
      }
    });
  } catch (err) {
    console.error("Stripe session creation failed:", err);
    res.status(500).json({
      error: "Failed to create checkout session. Please try again."
    });
  }
}
