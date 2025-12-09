'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function PaymentCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-md w-full">
                {/* Cancel Icon */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                        <svg
                            className="w-10 h-10 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Payment Cancelled
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your payment was not completed
                    </p>
                </div>

                {/* Info Card */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-4">
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
                                <p className="font-medium mb-1">What happened?</p>
                                <p>
                                    You cancelled the payment process or closed the payment page. No charges were made
                                    to your account.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>No charges were made</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>Your account is safe</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span>You can try again anytime</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/payment"
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-center"
                    >
                        Try Again
                    </Link>
                    <button
                        onClick={() => router.back()}
                        className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                    >
                        Go Back
                    </button>
                    <Link
                        href="/app"
                        className="w-full text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white py-2 transition-colors"
                    >
                        Return to Dashboard
                    </Link>
                </div>

                {/* Help Text */}
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                    Need help? Contact our support team
                </p>
            </div>
        </div>
    );
}
