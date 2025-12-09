'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [sessionData, setSessionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        if (sessionId) {
            // Optionally fetch session details from your API
            // For now, we'll just show a success message
            setLoading(false);
        } else {
            // No session ID, redirect to home
            router.push('/');
        }
    }, [searchParams, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full">
                {/* Success Animation */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                        <svg
                            className="w-10 h-10 text-green-500"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Payment Successful!
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your tokens have been added to your account
                    </p>
                </div>

                {/* Success Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Status</span>
                            <span className="text-green-500 font-semibold">Completed</span>
                        </div>

                        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                            <span className="text-gray-600 dark:text-gray-400">Tokens Added</span>
                            <span className="text-gray-900 dark:text-white font-semibold">
                                Check your balance
                            </span>
                        </div>

                        <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4 mt-4">
                            <div className="flex items-start gap-3">
                                <svg
                                    className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <div className="text-sm text-blue-700 dark:text-blue-300">
                                    <p className="font-medium mb-1">What's next?</p>
                                    <p>
                                        Your tokens are now available in your wallet. You can use them to create
                                        projects, generate content, and more!
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/app"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/payment"
                        className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                    >
                        Buy More Tokens
                    </Link>
                </div>

                {/* Receipt Info */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    A receipt has been sent to your email address
                </p>
            </div>
        </div>
    );
}
