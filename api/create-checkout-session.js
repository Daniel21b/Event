import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const DEPOSIT_RATE = 0.50;       // 50% non-refundable booking deposit
const DAMAGE_WAIVER_RATE = 0.10; // 10% damage waiver

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
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

    // Calculate order total from line items (cents)
    const orderTotal = lineItems.reduce(
      (sum, item) => sum + item.unitAmount * item.quantity,
      0
    );

    const depositAmount = Math.round(orderTotal * DEPOSIT_RATE);
    const damageWaiver = Math.round(orderTotal * DAMAGE_WAIVER_RATE);
    const balanceDue = orderTotal - depositAmount;

    // Build a human-readable summary of the rental items for metadata
    const itemsSummary = lineItems
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
            unit_amount: depositAmount,
            product_data: {
              name: "Booking Deposit (50% — non-refundable)",
              description: itemsSummary
            }
          },
          quantity: 1
        },
        {
          price_data: {
            currency: "usd",
            unit_amount: damageWaiver,
            product_data: {
              name: "Damage Waiver (non-refundable)"
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
        todayTotal: depositAmount + damageWaiver
      }
    });
  } catch (err) {
    console.error("Stripe session creation failed:", err);
    res.status(500).json({
      error: "Failed to create checkout session. Please try again."
    });
  }
}
