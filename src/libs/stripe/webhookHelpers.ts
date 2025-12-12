import { prisma } from '@/libs/prisma/prisma';
import { getTokenPackageByAmount } from './stripeConfig';

/**
 * Add tokens to user's wallet
 */
export async function addTokensToWallet(params: {
    userId: string;
    tokens: number;
    description: string;
    metadata?: Record<string, any>;
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

    if (!wallet) {
        // Create wallet if doesn't exist
        wallet = await prisma.tokenWallet.create({
            data: {
                userId,
                walletType: 'STANDARD',
                balanceTokens: 0,
                isActive: true,
            },
        });
    }

    // Update wallet balance
    const previousBalance = wallet.balanceTokens;
    const updatedWallet = await prisma.tokenWallet.update({
        where: { id: wallet.id },
        data: {
            balanceTokens: {
                increment: tokens,
            },
        },
    });

    console.log('💰 [WALLET UPDATE]', {
        userId,
        walletId: wallet.id,
        previousBalance,
        tokensAdded: tokens,
        newBalance: updatedWallet.balanceTokens,
        timestamp: new Date().toISOString(),
    });

    // Create transaction record
    const transaction = await prisma.tokenTransaction.create({
        data: {
            userId,
            walletId: wallet.id,
            amount: tokens,
            type: 'TOKEN_PURCHASE',
            description,
            metadata,
        },
    });

    console.log('📝 [TRANSACTION CREATED]', {
        transactionId: transaction.id,
        userId,
        amount: tokens,
        type: 'TOKEN_PURCHASE',
        description,
        timestamp: new Date().toISOString(),
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
    metadata?: Record<string, any>;
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
}): Promise<void> {
    const { userId, stripeSessionId, stripePaymentIntentId, amountTotal, currency } = params;

    console.log('🎉 [PAYMENT SUCCESS] Processing payment...', {
        userId,
        stripeSessionId,
        stripePaymentIntentId,
        amountTotal,
        currency,
        timestamp: new Date().toISOString(),
    });

    // Check if already processed
    const existing = await prisma.tokenPurchase.findUnique({
        where: { stripeSessionId },
    });

    if (existing && existing.status === 'completed') {
        console.log('⚠️ [DUPLICATE] Payment already processed:', {
            stripeSessionId,
            existingStatus: existing.status,
            tokensAmount: existing.tokensAmount,
        });
        return;
    }

    // Calculate tokens from amount (amount is in cents for USD, smallest unit for other currencies)
    const amountInMainUnit = currency.toLowerCase() === 'thb' ? amountTotal / 100 : amountTotal / 100;
    let tokensAmount = 0;

    // Match amount to package (support both USD and THB)
    if (amountInMainUnit === 5 || amountInMainUnit === 20) tokensAmount = 10; // $5 or ฿20
    else if (amountInMainUnit === 10 || amountInMainUnit === 40) tokensAmount = 25; // $10 or ฿40
    else if (amountInMainUnit === 20 || amountInMainUnit === 70) tokensAmount = 60; // $20 or ฿70

    console.log('💎 [TOKENS CALCULATION]', {
        amountTotal,
        currency,
        amountInMainUnit,
        tokensAmount,
    });

    if (tokensAmount === 0) {
        console.error('❌ [ERROR] Unknown payment amount:', {
            amountTotal,
            currency,
            amountInMainUnit,
            supportedAmounts: currency.toLowerCase() === 'thb' ? '฿20, ฿40, ฿70' : '$5, $10, $20',
        });
        return;
    }

    // Create or update purchase record
    if (existing) {
        console.log('🔄 [UPDATE] Updating existing purchase record...', {
            stripeSessionId,
            previousStatus: existing.status,
        });
        await updateTokenPurchaseStatus({
            stripeSessionId,
            status: 'completed',
            stripePaymentIntentId,
        });
    } else {
        console.log('✨ [CREATE] Creating new purchase record...', {
            stripeSessionId,
            tokensAmount,
        });
        await createTokenPurchaseRecord({
            userId,
            stripeSessionId,
            stripePaymentIntentId,
            amount: amountInMainUnit,
            currency,
            tokensAmount,
            status: 'completed',
        });
    }

    // Add tokens to wallet
    console.log('🎁 [ADDING TOKENS] Adding tokens to wallet...');
    await addTokensToWallet({
        userId,
        tokens: tokensAmount,
        description: `Purchased ${tokensAmount} tokens`,
        metadata: {
            stripeSessionId,
            stripePaymentIntentId,
            packageAmount: amountInMainUnit,
            currency,
        },
    });

    console.log('✅ [SUCCESS] Payment processing completed!', {
        userId,
        tokensAmount,
        stripeSessionId,
        stripePaymentIntentId,
        amount: amountInMainUnit,
        currency,
        timestamp: new Date().toISOString(),
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

    console.log(`Payment failed: ${stripeSessionId}`);
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
        console.error(`Purchase not found for payment intent: ${stripePaymentIntentId}`);
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

    if (wallet && wallet.balanceTokens >= purchase.tokensAmount) {
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

        console.log(`Refunded ${purchase.tokensAmount} tokens from user ${purchase.userId}`);
    } else {
        console.warn(`User ${purchase.userId} doesn't have enough tokens for refund`);
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
