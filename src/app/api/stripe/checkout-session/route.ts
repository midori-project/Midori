import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma/prisma';
import { getOrCreateStripeCustomer, createCheckoutSession } from '@/libs/stripe/stripeService';
import { getTokenPackage, STRIPE_URLS } from '@/libs/stripe/stripeConfig';
import { updateUserStripeCustomerId } from '@/libs/stripe/webhookHelpers';

/**
 * POST /api/stripe/checkout-session
 * Create a Stripe Checkout Session for token purchase
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { packageId, userId } = body;

        if (!packageId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields: packageId, userId' },
                { status: 400 }
            );
        }

        // Get token package
        const tokenPackage = getTokenPackage(packageId);
        if (!tokenPackage) {
            return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
        }

        if (!tokenPackage.stripePriceId) {
            return NextResponse.json(
                { error: 'Stripe price ID not configured for this package' },
                { status: 500 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                stripeCustomerId: true,
            },
        });

        if (!user || !user.email) {
            return NextResponse.json({ error: 'User not found or missing email' }, { status: 404 });
        }

        // Get or create Stripe customer
        const stripeCustomerId = await getOrCreateStripeCustomer({
            userId: user.id,
            email: user.email,
            name: user.displayName || undefined,
            stripeCustomerId: user.stripeCustomerId,
        });

        // Update user with Stripe customer ID if new
        if (stripeCustomerId !== user.stripeCustomerId) {
            await updateUserStripeCustomerId({
                userId: user.id,
                stripeCustomerId,
            });
        }

        // Create Checkout Session
        const session = await createCheckoutSession({
            customerId: stripeCustomerId,
            priceId: tokenPackage.stripePriceId,
            quantity: 1,
            successUrl: `${STRIPE_URLS.success}?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: STRIPE_URLS.cancel,
            metadata: {
                userId: user.id,
                packageId: tokenPackage.id,
                tokensAmount: tokenPackage.tokens.toString(),
            },
        });

        return NextResponse.json({
            sessionId: session.id,
            url: session.url,
        });
    } catch (error: any) {
        console.error('❌ [CHECKOUT ERROR] Failed to create checkout session:', {
            error: error.message,
            type: error.type,
            code: error.code,
            statusCode: error.statusCode,
            stack: error.stack,
        });

        return NextResponse.json(
            {
                error: 'Failed to create checkout session',
                details: error.message || 'Unknown error',
            },
            { status: 500 }
        );
    }
}
