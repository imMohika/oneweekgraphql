import { stripe } from "@/lib/stripe";
import { NextApiRequest, NextApiResponse } from "next";
import getRawBody from "raw-body";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

const Webhook = async (req: NextApiRequest, res: NextApiResponse) => {
  // Convert request to rawbody for stripe
  const payload = await getRawBody(req);

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    throw new Error("Missing stripe signature");
  }

  let event;

  try {
    // Verify webhook came from stripe
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (error) {
    console.error({
      message: "An error occurred during webhook verification",
      error,
    });

    if (error instanceof Error) {
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }
  }

  if (event?.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    console.log({
      message: "An order has been received",
      id: session.id,
      customer: session.customer,
      metadata: session.metadata,
      expiresAt: session.expires_at,
    });
  }

  res.status(200).end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default Webhook;
