import { Prisma } from '@prisma/client';
import { prisma } from '@/libs/prisma/prisma';
// Note: All token/package mappings are derived from checkout session metadata

/**
 * Add tokens to user's wallet
 */
export async function addTokensToWallet(params: {
    userId: string;
    tokens: number;
    description: string;
    metadata?: Prisma.InputJsonValue;
}): Promise<void> {
    const { userId, tokens, description, metadata } = params;

    // Get or create user's standard wallet
    let wallet = await prisma.tokenWallet.findFirst({
        where: {
            userId,
            walletType: 'STANDARD',
            isActive: true,
        },
    });

    // Create wallet if doesn't exist
    wallet ??= await prisma.tokenWallet.create({
        data: {
            userId,
            walletType: 'STANDARD',
            balanceTokens: 0,
            isActive: true,
        },
    });

    if (!wallet) {
        throw new Error('Failed to create or retrieve wallet');
    }

    // Update wallet balance
    await prisma.tokenWallet.update({
        where: { id: wallet.id },
        data: {
            balanceTokens: {
                increment: tokens,
            },
        },
    });

    // Create transaction record
    await prisma.tokenTransaction.create({
        data: {
            userId,
            walletId: wallet.id,
            amount: tokens,
            type: 'TOKEN_PURCHASE',
            description,
            metadata,
        },
    });
}

/**
 * Create TokenPurchase record
 */
export async function createTokenPurchaseRecord(params: {
    userId: string;
    stripeSessionId: string;
    stripePaymentIntentId?: string;
    amount: number;
    currency: string;
    tokensAmount: number;
    status: 'pending' | 'completed' | 'failed';
    metadata?: Prisma.InputJsonValue;
}): Promise<void> {
    const {
        userId,
        stripeSessionId,
        stripePaymentIntentId,
        amount,
        currency,
        tokensAmount,
        status,
        metadata,
    } = params;

    await prisma.tokenPurchase.create({
        data: {
            id: stripeSessionId, // Use session ID as primary key
            userId,
            stripeSessionId,
            stripePaymentIntentId,
            amount,
            currency,
            tokensAmount,
            status,
            metadata,
            updatedAt: new Date(),
        },
    });
}

/**
 * Update TokenPurchase status
 */
export async function updateTokenPurchaseStatus(params: {
    stripeSessionId: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';
    stripePaymentIntentId?: string;
}): Promise<void> {
    const { stripeSessionId, status, stripePaymentIntentId } = params;

    await prisma.tokenPurchase.update({
        where: { stripeSessionId },
        data: {
            status,
            stripePaymentIntentId,
            updatedAt: new Date(),
        },
    });
}

/**
 * Handle successful payment
 */
export async function handleSuccessfulPayment(params: {
    userId: string;
    stripeSessionId: string;
    stripePaymentIntentId: string;
    amountTotal: number;
    currency: string;
    tokensAmount: number;
    packageId?: string;
}): Promise<void> {
    const { userId, stripeSessionId, stripePaymentIntentId, amountTotal, currency, tokensAmount, packageId } = params;

    // Check if already processed
    const existing = await prisma.tokenPurchase.findUnique({
        where: { stripeSessionId },
    });

    if (existing?.status === 'completed') {
        return;
    }

    // Use tokensAmount from metadata/config to avoid mismatches with currency/amount mapping
    if (!tokensAmount || Number.isNaN(tokensAmount) || tokensAmount <= 0) {
        return;
    }

    // Create or update purchase record
    if (existing) {
        await updateTokenPurchaseStatus({
            stripeSessionId,
            status: 'completed',
            stripePaymentIntentId,
        });
    } else {
        await createTokenPurchaseRecord({
            userId,
            stripeSessionId,
            stripePaymentIntentId,
            amount: amountTotal / 100,
            currency,
            tokensAmount,
            status: 'completed',
            metadata: {
                packageId,
            },
        });
    }

    // Add tokens to wallet
    await addTokensToWallet({
        userId,
        tokens: tokensAmount,
        description: `Purchased ${tokensAmount} tokens`,
        metadata: {
            stripeSessionId,
            stripePaymentIntentId,
            packageAmount: amountTotal / 100,
            packageId,
        },
    });
}

/**
 * Handle failed payment
 */
export async function handleFailedPayment(params: {
    stripeSessionId: string;
    stripePaymentIntentId?: string;
}): Promise<void> {
    const { stripeSessionId, stripePaymentIntentId } = params;

    await updateTokenPurchaseStatus({
        stripeSessionId,
        status: 'failed',
        stripePaymentIntentId,
    });
}

/**
 * Handle refund
 */
export async function handleRefund(params: {
    stripePaymentIntentId: string;
    refundAmount: number;
}): Promise<void> {
    const { stripePaymentIntentId, refundAmount } = params;

    // Find the purchase
    const purchase = await prisma.tokenPurchase.findFirst({
        where: { stripePaymentIntentId },
    });

    if (!purchase) {
        return;
    }

    // Update purchase status
    await prisma.tokenPurchase.update({
        where: { id: purchase.id },
        data: {
            status: 'refunded',
            updatedAt: new Date(),
        },
    });

    // Deduct tokens from wallet (if user still has them)
    const wallet = await prisma.tokenWallet.findFirst({
        where: {
            userId: purchase.userId,
            walletType: 'STANDARD',
            isActive: true,
        },
    });

    if (wallet && wallet.balanceTokens.toNumber() >= purchase.tokensAmount) {
        await prisma.tokenWallet.update({
            where: { id: wallet.id },
            data: {
                balanceTokens: {
                    decrement: purchase.tokensAmount,
                },
            },
        });

        // Create refund transaction
        await prisma.tokenTransaction.create({
            data: {
                userId: purchase.userId,
                walletId: wallet.id,
                amount: -purchase.tokensAmount,
                type: 'REFUND',
                description: `Refund for purchase ${purchase.id}`,
                metadata: {
                    stripePaymentIntentId,
                    refundAmount,
                },
            },
        });
    }
}

/**
 * Update user's Stripe customer ID
 */
export async function updateUserStripeCustomerId(params: {
    userId: string;
    stripeCustomerId: string;
}): Promise<void> {
    const { userId, stripeCustomerId } = params;

    await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId },
    });
}
