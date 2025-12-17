import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { constructWebhookEvent } from '@/libs/stripe/stripeService';
import {
    handleSuccessfulPayment,
    handleFailedPayment,
    handleRefund,
} from '@/libs/stripe/webhookHelpers';
import Stripe from 'stripe';

/**
 * POST /api/stripe/webhook
 * Handle Stripe webhook events
 */
export async function POST(request: NextRequest) {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = constructWebhookEvent(body, signature, webhookSecret);
    } catch (error) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                if (session.payment_status === 'paid' && session.mode === 'payment') {
                    const userId = session.metadata?.userId;
                    const paymentIntentId = session.payment_intent as string;

                    if (!userId) {
                        break;
                    }

                    await handleSuccessfulPayment({
                        userId,
                        stripeSessionId: session.id,
                        stripePaymentIntentId: paymentIntentId,
                        amountTotal: session.amount_total || 0,
                        currency: session.currency || 'usd',
                        tokensAmount: Number(session.metadata?.tokensAmount) || 0,
                        packageId: session.metadata?.packageId,
                    });
                }
                break;
            }

            case 'payment_intent.succeeded': {
                // Already handled in checkout.session.completed
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                // Find session by payment intent
                // Note: This is a simplified approach. In production, you might want to store
                // the mapping between payment_intent and session in your database
                await handleFailedPayment({
                    stripeSessionId: paymentIntent.metadata?.sessionId || '',
                    stripePaymentIntentId: paymentIntent.id,
                });
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                const paymentIntentId = charge.payment_intent as string;

                if (paymentIntentId) {
                    await handleRefund({
                        stripePaymentIntentId: paymentIntentId,
                        refundAmount: charge.amount_refunded,
                    });
                }
                break;
            }

            default:
                // Unhandled event type
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
