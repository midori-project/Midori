'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import TokenPackages from '@/components/payment/TokenPackages';
import TokenBalance from '@/components/payment/TokenBalance';

export default function PaymentPage() {
    const { user, isLoading } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const handlePurchaseStart = () => {
        setError(null);
    };

    const handlePurchaseError = (errorMessage: string) => {
        setError(errorMessage);
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Show login prompt if not authenticated
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Please Login
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        You need to be logged in to purchase tokens
                    </p>
                    <a
                        href="/login?redirect=/payment"
                        className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Go to Login
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Buy Tokens
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Purchase tokens to create projects, generate content, and unlock premium features.
                        Choose the package that fits your needs.
                    </p>
                </div>

                {/* Token Balance */}
                <div className="mb-12">
                    <TokenBalance userId={user.id} />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 max-w-5xl mx-auto">
                        <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
                            <div className="flex items-center gap-3">
                                <svg
                                    className="w-5 h-5 text-red-500 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div>
                                    <p className="font-medium text-red-800 dark:text-red-200">Error</p>
                                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Token Packages */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Choose Your Package
                    </h2>
                    <TokenPackages
                        userId={user.id}
                        onPurchaseStart={handlePurchaseStart}
                        onPurchaseError={handlePurchaseError}
                    />
                </div>

                {/* Features */}
                <div className="max-w-4xl mx-auto">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-6">
                        What You Get
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-6 h-6 text-blue-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 10V3L4 14h7v7l9-11h-7z"
                                    />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Instant Access
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Tokens are added to your account immediately after purchase
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-6 h-6 text-green-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                    />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Secure Payment
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Powered by Stripe, the most trusted payment platform
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg
                                    className="w-6 h-6 text-purple-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                                No Expiration
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Your tokens never expire. Use them whenever you want
                            </p>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto mt-16">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Frequently Asked Questions
                    </h3>
                    <div className="space-y-4">
                        <details className="bg-white dark:bg-gray-800 rounded-lg p-6">
                            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                                How do I use my tokens?
                            </summary>
                            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                                Tokens are used automatically when you create projects, generate content, or use
                                premium features. Each action will deduct the appropriate number of tokens from
                                your balance.
                            </p>
                        </details>

                        <details className="bg-white dark:bg-gray-800 rounded-lg p-6">
                            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                                Can I get a refund?
                            </summary>
                            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                                We offer refunds within 7 days of purchase if you haven't used any tokens. Please
                                contact our support team for assistance.
                            </p>
                        </details>

                        <details className="bg-white dark:bg-gray-800 rounded-lg p-6">
                            <summary className="font-semibold text-gray-900 dark:text-white cursor-pointer">
                                What payment methods do you accept?
                            </summary>
                            <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">
                                We accept all major credit cards (Visa, Mastercard, American Express) through our
                                secure Stripe payment gateway.
                            </p>
                        </details>
                    </div>
                </div>
            </div>
        </div>
    );
}
