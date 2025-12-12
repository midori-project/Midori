import { NextResponse } from 'next/server';

/**
 * GET /api/debug/env
 * Check if environment variables are set (for debugging only)
 * IMPORTANT: Remove this endpoint after debugging!
 */
export async function GET() {
    return NextResponse.json({
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        checks: {
            hasStripeSecret: !!process.env.STRIPE_SECRET_KEY,
            hasStripePublishable: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
            hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
            hasDatabase: !!process.env.DATABASE_URL,
            hasAppUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        },
        prefixes: {
            stripeSecret: process.env.STRIPE_SECRET_KEY?.substring(0, 8) || 'NOT_SET',
            stripePublishable: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.substring(0, 8) || 'NOT_SET',
            webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.substring(0, 8) || 'NOT_SET',
        },
        priceId: 'price_1SdQPpFHkQzHurykzzWDbDUK',
    });
}
