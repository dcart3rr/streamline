// supabase/functions/stripe-webhook/index.ts
// Deploy with: supabase functions deploy stripe-webhook
// Set secrets:
//   supabase secrets set STRIPE_SECRET_KEY=sk_live_xxx
//   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxx
//
// In Stripe Dashboard → Webhooks → Add endpoint:
//   URL: https://teixvcgtuqtclvvyfqat.supabase.co/functions/v1/stripe-webhook
//   Events to listen for:
//     customer.subscription.created
//     customer.subscription.updated
//     customer.subscription.deleted
//     invoice.payment_succeeded
//     invoice.payment_failed
//     payment_method.attached

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@13.3.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Map Stripe price IDs to your plans
// Replace with your actual Stripe Price IDs from your dashboard
const PRICE_TO_PLAN: Record<string, string> = {
  "price_starter_monthly": "Starter",   // Replace with real Starter price ID
  "price_growth_monthly":  "Growth",    // Replace with real Growth price ID
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) return new Response("No signature", { status: 400 });

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!
    );
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log("Stripe event:", event.type);

  try {
    switch (event.type) {

      // ── Subscription created or updated ──────────────────────────────────
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price.id;
        const plan = PRICE_TO_PLAN[priceId] || "Starter";

        // Map Stripe status → your billing status
        const statusMap: Record<string, string> = {
          active: "active",
          trialing: "trial",
          past_due: "past_due",
          canceled: "cancelled",
          unpaid: "past_due",
          incomplete: "past_due",
        };
        const billingStatus = sub.cancel_at_period_end
          ? "cancel_pending"
          : (statusMap[sub.status] || "active");

        // Find contractor by stripe_customer_id
        const { data: business } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (business) {
          // Update plan on businesses table
          await supabase.from("businesses").update({ plan }).eq("id", business.id);

          // Upsert billing record
          await supabase.from("billing").upsert({
            business_id: business.id,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            status: billingStatus,
            plan,
            cancel_requested: sub.cancel_at_period_end,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            updated_at: new Date().toISOString(),
          });

          console.log(`Updated billing for ${business.id}: ${billingStatus}`);
        }
        break;
      }

      // ── Subscription deleted (fully cancelled) ────────────────────────────
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = sub.customer as string;

        const { data: business } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (business) {
          await supabase.from("billing").update({
            status: "cancelled",
            updated_at: new Date().toISOString(),
          }).eq("business_id", business.id);

          // Optionally deactivate the contractor
          // await supabase.from("businesses").update({ active: false }).eq("id", business.id);
          console.log(`Subscription cancelled for ${business.id}`);
        }
        break;
      }

      // ── Payment succeeded ─────────────────────────────────────────────────
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const pm = invoice.payment_intent
          ? await stripe.paymentIntents.retrieve(invoice.payment_intent as string)
          : null;

        const { data: business } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (business) {
          const updateData: Record<string, unknown> = {
            status: "active",
            last_payment_date: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Store card details if available
          if (pm?.payment_method) {
            const paymentMethod = await stripe.paymentMethods.retrieve(
              pm.payment_method as string
            );
            if (paymentMethod.card) {
              updateData.card_last4 = paymentMethod.card.last4;
              updateData.card_brand = paymentMethod.card.brand;
              updateData.card_exp_month = paymentMethod.card.exp_month;
              updateData.card_exp_year = paymentMethod.card.exp_year;
            }
          }

          await supabase.from("billing").upsert({
            business_id: business.id,
            ...updateData,
          });
          console.log(`Payment succeeded for ${business.id}`);
        }
        break;
      }

      // ── Payment failed ────────────────────────────────────────────────────
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const { data: business } = await supabase
          .from("businesses")
          .select("id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (business) {
          await supabase.from("billing").update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          }).eq("business_id", business.id);
          console.log(`Payment failed for ${business.id}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }
  } catch (err) {
    console.error("Error processing event:", err);
    return new Response(`Processing error: ${err.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
