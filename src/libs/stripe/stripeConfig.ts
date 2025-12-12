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
        tokens: 5,
        price: 20,
        currency: 'thb',
        stripePriceId: process.env.STRIPE_PRICE_ID_TOKENS_10,
    },
    // {
    //     id: 'tokens_25',
    //     tokens: 25,
    //     price: 10,
    //     currency: 'usd',
    //     popular: true, // Most popular package
    //     stripePriceId: process.env.STRIPE_PRICE_ID_TOKENS_25,
    // },
    // {
    //     id: 'tokens_60',
    //     tokens: 60,
    //     price: 20,
    //     currency: 'usd',
    //     originalPrice: 25,
    //     discount: 20, // 20% discount
    //     stripePriceId: process.env.STRIPE_PRICE_ID_TOKENS_60,
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
    apiVersion: '2024-11-20.acacia' as const,
    maxNetworkRetries: 3,
    timeout: 30000, // 30 seconds
};
