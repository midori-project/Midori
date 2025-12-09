import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/libs/prisma/prisma';

/**
 * GET /api/tokens/balance
 * Get user's token balance
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        // Get user's standard wallet
        const wallet = await prisma.tokenWallet.findFirst({
            where: {
                userId,
                walletType: 'STANDARD',
                isActive: true,
            },
        });

        if (!wallet) {
            // Return default balance if wallet doesn't exist
            return NextResponse.json({
                balance: 0,
                walletType: 'STANDARD',
                lastReset: null,
            });
        }

        return NextResponse.json({
            balance: Number(wallet.balanceTokens),
            walletType: wallet.walletType,
            lastReset: wallet.lastTokenReset,
        });
    } catch (error) {
        console.error('Error fetching token balance:', error);
        return NextResponse.json({ error: 'Failed to fetch token balance' }, { status: 500 });
    }
}
