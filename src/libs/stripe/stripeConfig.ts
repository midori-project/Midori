/**
 * Stripe Configuration
 * Token packages และ pricing configuration
 */

export interface TokenPackage {
    id: string;
    tokens: number;
    price: number;
    currency: string;
    originalPrice?: number; // สำหรับแสดง discount
    discount?: number; // เปอร์เซ็นต์ส่วนลด
    popular?: boolean; // แสดง badge "Most Popular"
    stripePriceId?: string; // จะได้จาก Stripe Dashboard
}

export const TOKEN_PACKAGES: TokenPackage[] = [
    {
        id: 'tokens_10',
        tokens: 10,
        price: 20,
        currency: 'thb',
        stripePriceId: 'price_1SdQPpFHkQzHurykzzWDbDUK', // 10 tokens for ฿20
    },
    // Add more packages as needed:
    // {
    //     id: 'tokens_25',
    //     tokens: 25,
    //     price: 40,
    //     currency: 'thb',
    //     popular: true,
    //     stripePriceId: 'price_xxxxxxxxxxxxx', // 25 tokens for ฿40
    // },
    // {
    //     id: 'tokens_60',
    //     tokens: 60,
    //     price: 70,
    //     currency: 'thb',
    //     originalPrice: 100,
    //     discount: 30, // 30% discount
    //     stripePriceId: 'price_xxxxxxxxxxxxx', // 60 tokens for ฿70
    // },
];

/**
 * Get token package by ID
 */
export function getTokenPackage(packageId: string): TokenPackage | undefined {
    return TOKEN_PACKAGES.find((pkg) => pkg.id === packageId);
}

/**
 * Get token package by tokens amount
 */
export function getTokenPackageByAmount(tokens: number): TokenPackage | undefined {
    return TOKEN_PACKAGES.find((pkg) => pkg.tokens === tokens);
}

/**
 * Success and Cancel URLs
 */
export const STRIPE_URLS = {
    success: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
    cancel: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/cancel`,
};

/**
 * Stripe configuration
 */
export const STRIPE_CONFIG = {
    apiVersion: '2025-11-17.clover' as const,
    maxNetworkRetries: 3,
    timeout: 30000, // 30 seconds
};
