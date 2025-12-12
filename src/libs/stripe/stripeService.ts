import Stripe from 'stripe';
import { STRIPE_CONFIG } from './stripeConfig';

let stripeInstance: Stripe | null = null;

/**
 * Get Stripe client instance (singleton with lazy initialization)
 */
function getStripeClient(): Stripe {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
        }

        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: STRIPE_CONFIG.apiVersion,
            maxNetworkRetries: STRIPE_CONFIG.maxNetworkRetries,
            timeout: STRIPE_CONFIG.timeout,
            typescript: true,
        });
    }

    return stripeInstance;
}

/**
 * Stripe client getter
 */
export const stripe = new Proxy({} as Stripe, {
    get: (_, prop) => {
        const client = getStripeClient();
        return (client as any)[prop];
    },
});

/**
 * Create or retrieve Stripe customer
 */
export async function getOrCreateStripeCustomer(params: {
    userId: string;
    email: string;
    name?: string;
    stripeCustomerId?: string | null;
}): Promise<string> {
    const { userId, email, name, stripeCustomerId } = params;

    // If customer already exists, try to retrieve it
    if (stripeCustomerId) {
        try {
            const customer = await stripe.customers.retrieve(stripeCustomerId);
            if (!customer.deleted) {
                console.log('✅ [STRIPE] Using existing customer:', {
                    customerId: stripeCustomerId,
                    email: customer.email,
                });
                return stripeCustomerId;
            }
        } catch (error: any) {
            // Customer doesn't exist (e.g., switched Stripe accounts)
            console.warn('⚠️ [STRIPE] Customer not found, creating new one:', {
                oldCustomerId: stripeCustomerId,
                userId,
                email,
                errorCode: error?.code,
            });
            // Continue to create new customer
        }
    }

    // Create new customer
    console.log('✨ [STRIPE] Creating new customer:', {
        userId,
        email,
        name,
    });

    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            userId,
        },
    });

    console.log('✅ [STRIPE] Customer created:', {
        customerId: customer.id,
        email: customer.email,
    });

    return customer.id;
}

/**
 * Create Checkout Session for one-time payment
 */
export async function createCheckoutSession(params: {
    customerId: string;
    priceId: string;
    quantity?: number;
    successUrl: string;
    cancelUrl: string;
    metadata?: Record<string, string>;
}): Promise<Stripe.Checkout.Session> {
    const { customerId, priceId, quantity = 1, successUrl, cancelUrl, metadata } = params;

    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'payment', // One-time payment
        payment_method_types: ['card'],
        line_items: [
            {
                price: priceId,
                quantity,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        // Allow promotion codes
        allow_promotion_codes: true,
        // Billing address collection
        billing_address_collection: 'auto',
    });

    return session;
}

/**
 * Retrieve Checkout Session
 */
export async function retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    return await stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['line_items', 'customer'],
    });
}

/**
 * Retrieve Payment Intent
 */
export async function retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
    payload: string | Buffer,
    signature: string,
    webhookSecret: string
): Stripe.Event {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * List customer's payment history
 */
export async function listCustomerPayments(customerId: string, limit = 10): Promise<Stripe.Charge[]> {
    const charges = await stripe.charges.list({
        customer: customerId,
        limit,
    });

    return charges.data;
}
