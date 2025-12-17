import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma/prisma';

/**
 * GET /api/stripe/payment-history
 * Get user's payment history
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        // Get user's token purchases
        const purchases = await prisma.tokenPurchase.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 50, // Limit to last 50 purchases
        });

        // Get user's token transactions
        const transactions = await prisma.tokenTransaction.findMany({
            where: {
                userId,
                type: 'TOKEN_PURCHASE',
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json({
            purchases,
            transactions,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 });
    }
}
