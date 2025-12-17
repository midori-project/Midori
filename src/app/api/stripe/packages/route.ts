import { NextResponse } from 'next/server';
import { TOKEN_PACKAGES } from '@/libs/stripe/stripeConfig';

/**
 * GET /api/stripe/packages
 * Get available token packages with price IDs
 */
export async function GET() {
    try {
        // Return packages with stripePriceId populated from server-side env vars
        const packages = TOKEN_PACKAGES.map(pkg => ({
            ...pkg,
            // Ensure stripePriceId is included (server-side can access all env vars)
            stripePriceId: pkg.stripePriceId || undefined,
        }));

        return NextResponse.json({ packages });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
    }
}
