import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Phase 2 — Collect remaining balance before the event.
 *
 * Called from an admin panel or manual trigger ~14 days before the event.
 * Charges the saved payment method from the original checkout session.
 *
 * POST body:
 *   - sessionId: the original Checkout Session ID from Phase 1
 *
 * Flow:
 *   1. Retrieve the original session → get customer + payment method + metadata
 *   2. Create a new PaymentIntent for the balance amount
 *   3. Confirm it immediately (off-session)
 */
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: "sessionId is required" });
    }

    // 1. Retrieve the original checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["payment_intent.payment_method"]
    });

    if (!session || !session.metadata) {
      return res.status(404).json({ error: "Session not found" });
    }

    const balanceDue = parseInt(session.metadata.balanceDue, 10);
    if (!balanceDue || balanceDue <= 0) {
      return res.status(400).json({ error: "No balance due on this session" });
    }

    const customerId = session.customer;
    const paymentMethodId =
      session.payment_intent?.payment_method?.id ||
      session.payment_intent?.payment_method;

    if (!customerId || !paymentMethodId) {
      return res.status(400).json({
        error:
          "No saved payment method found. Customer will need to pay via a new payment link."
      });
    }

    // 2. Create and confirm the balance payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: balanceDue,
      currency: "usd",
      customer: customerId,
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
      description: `Balance due — ${session.metadata.customerName} event on ${session.metadata.eventDate}`,
      metadata: {
        originalSessionId: sessionId,
        type: "balance_collection",
        customerName: session.metadata.customerName || "",
        eventDate: session.metadata.eventDate || "",
        source: "yalem-admin"
      }
    });

    res.status(200).json({
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amountCharged: balanceDue
    });
  } catch (err) {
    console.error("Balance collection failed:", err);

    // Handle card-declined or authentication-required errors
    if (err.type === "StripeCardError") {
      return res.status(402).json({
        error: "Card was declined. Please contact the customer for a new payment method.",
        code: err.code
      });
    }

    res.status(500).json({
      error: "Failed to collect balance. Please try again."
    });
  }
}
