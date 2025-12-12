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
        console.error('STRIPE_WEBHOOK_SECRET is not configured');
        return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    let event: Stripe.Event;

    try {
        // Verify webhook signature
        event = constructWebhookEvent(body, signature, webhookSecret);
    } catch (error) {
        console.error('Webhook signature verification failed:', error);
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('🔔 [WEBHOOK] Received event:', {
        type: event.type,
        id: event.id,
        created: new Date(event.created * 1000).toISOString(),
    });

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as Stripe.Checkout.Session;

                console.log('🛒 [CHECKOUT] Session completed:', {
                    sessionId: session.id,
                    paymentStatus: session.payment_status,
                    mode: session.mode,
                    amountTotal: session.amount_total,
                    currency: session.currency,
                    customerEmail: session.customer_email,
                    metadata: session.metadata,
                });

                if (session.payment_status === 'paid' && session.mode === 'payment') {
                    const userId = session.metadata?.userId;
                    const paymentIntentId = session.payment_intent as string;

                    if (!userId) {
                        console.error('❌ [ERROR] Missing userId in session metadata:', {
                            sessionId: session.id,
                            metadata: session.metadata,
                        });
                        break;
                    }

                    await handleSuccessfulPayment({
                        userId,
                        stripeSessionId: session.id,
                        stripePaymentIntentId: paymentIntentId,
                        amountTotal: session.amount_total || 0,
                        currency: session.currency || 'usd',
                    });
                } else {
                    console.log('ℹ️ [INFO] Session not paid or not payment mode:', {
                        sessionId: session.id,
                        paymentStatus: session.payment_status,
                        mode: session.mode,
                    });
                }
                break;
            }

            case 'payment_intent.succeeded': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;
                console.log('💳 [PAYMENT] Payment intent succeeded:', {
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    status: paymentIntent.status,
                    metadata: paymentIntent.metadata,
                });
                // Already handled in checkout.session.completed
                break;
            }

            case 'payment_intent.payment_failed': {
                const paymentIntent = event.data.object as Stripe.PaymentIntent;

                console.error('❌ [PAYMENT FAILED]', {
                    paymentIntentId: paymentIntent.id,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                    lastPaymentError: paymentIntent.last_payment_error,
                    metadata: paymentIntent.metadata,
                });

                await handleFailedPayment({
                    stripeSessionId: paymentIntent.metadata?.sessionId || '',
                    stripePaymentIntentId: paymentIntent.id,
                });
                break;
            }

            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                const paymentIntentId = charge.payment_intent as string;

                console.log('🔄 [REFUND] Charge refunded:', {
                    chargeId: charge.id,
                    paymentIntentId,
                    amountRefunded: charge.amount_refunded,
                    amount: charge.amount,
                    currency: charge.currency,
                });

                if (paymentIntentId) {
                    await handleRefund({
                        stripePaymentIntentId: paymentIntentId,
                        refundAmount: charge.amount_refunded,
                    });
                } else {
                    console.warn('⚠️ [WARNING] No payment intent ID for refund:', {
                        chargeId: charge.id,
                    });
                }
                break;
            }

            default:
                console.log('ℹ️ [UNHANDLED] Event type not handled:', {
                    type: event.type,
                    eventId: event.id,
                });
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
