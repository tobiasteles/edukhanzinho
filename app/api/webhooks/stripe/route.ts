import db from "@/db/drizzle";
import { userSubscription } from "@/db/schema";
import { stripe } from "@/lib/stripe";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type {Stripe} from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature");

  if (!signature) {
    return new NextResponse("Assinatura ausente", { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(`Webhook error: ${message}`, {
      status: 400,
    });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.subscription || !session.metadata?.userId) {
      return new NextResponse("Dados da sessão inválidos", { status: 400 });
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string
    );
    const item = subscription.items.data[0];
    const values = {
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: subscription.customer as string,
      stripePriceId: item.price.id,
      stripeCurrentPeriodEnd: new Date(item.current_period_end * 1000),
    };

    await db
      .insert(userSubscription)
      .values({ userId: session.metadata.userId, ...values })
      .onConflictDoUpdate({ target: userSubscription.userId, set: values });
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;
    const sub = invoice.parent?.subscription_details?.subscription;

    if (sub) {
      const subscription = await stripe.subscriptions.retrieve(
        typeof sub === "string" ? sub : sub.id
      );
      const item = subscription.items.data[0];

      await db
        .update(userSubscription)
        .set({
          stripePriceId: item.price.id,
          stripeCurrentPeriodEnd: new Date(item.current_period_end * 1000),
        })
        .where(eq(userSubscription.stripeSubscriptionId, subscription.id));
    }
  }

  return new NextResponse("Webhook received", { status: 200 });
}
