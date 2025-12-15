'use client';

import { useState, useEffect } from 'react';
import type { TokenPackage } from '@/libs/stripe/stripeConfig';

interface TokenPackagesProps {
    userId: string;
    onPurchaseStart?: () => void;
    onPurchaseError?: (error: string) => void;
}

export default function TokenPackages({ userId, onPurchaseStart, onPurchaseError }: TokenPackagesProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const [packages, setPackages] = useState<TokenPackage[]>([]);

    useEffect(() => {
        setMounted(true);
        // Fetch packages from API to get server-side env vars
        fetch('/api/stripe/packages')
            .then(res => res.json())
            .then(data => setPackages(data.packages || []))
            .catch(err => console.error('Failed to fetch packages:', err));
    }, []);

    const handlePurchase = async (tokenPackage: TokenPackage) => {
        if (!tokenPackage.stripePriceId) {
            onPurchaseError?.('This package is not available yet');
            return;
        }

        setLoading(tokenPackage.id);
        onPurchaseStart?.();

        try {
            const response = await fetch('/api/stripe/checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    packageId: tokenPackage.id,
                    userId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    (errorData.error || 'Failed to create checkout session') +
                    (errorData.details ? `: ${errorData.details}` : '')
                );
            }

            const { url } = await response.json();

            if (url) {
                // Redirect to Stripe Checkout
                window.location.href = url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            onPurchaseError?.(error instanceof Error ? error.message : 'Purchase failed');
            setLoading(null);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg) => (
                <div
                    key={pkg.id}
                    className={`relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg ${pkg.popular
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                >
                    {/* Popular Badge */}
                    {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                Most Popular
                            </span>
                        </div>
                    )}

                    {/* Discount Badge */}
                    {pkg.discount && (
                        <div className="absolute -top-3 -right-3">
                            <span className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                Save {pkg.discount}%
                            </span>
                        </div>
                    )}

                    <div className="text-center">
                        {/* Tokens Amount */}
                        <div className="mb-4">
                            <div className="text-5xl font-bold text-gray-900 dark:text-white">
                                {pkg.tokens}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">tokens</div>
                        </div>

                        {/* Price */}
                        <div className="mb-6">
                            {pkg.originalPrice && (
                                <div className="text-sm text-gray-400 line-through mb-1">
                                    ${pkg.originalPrice}
                                </div>
                            )}
                            <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                ${pkg.price}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                ${(pkg.price / pkg.tokens).toFixed(2)} per token
                            </div>
                        </div>

                        {/* Buy Button */}
                        <button
                            onClick={() => handlePurchase(pkg)}
                            disabled={loading === pkg.id || (mounted && !pkg.stripePriceId)}
                            className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${pkg.popular
                                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading === pkg.id ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                'Buy Now'
                            )}
                        </button>

                        {mounted && !pkg.stripePriceId && (
                            <p className="text-xs text-red-500 mt-2">Not configured yet</p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
