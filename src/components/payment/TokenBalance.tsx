'use client';

import { useEffect, useState } from 'react';

interface TokenBalanceProps {
    userId: string;
    onBuyMore?: () => void;
}

interface WalletData {
    balance: number;
    walletType: string;
    lastReset?: string;
}

export default function TokenBalance({ userId, onBuyMore }: TokenBalanceProps) {
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBalance();
    }, [userId]);

    const fetchBalance = async () => {
        try {
            // This endpoint should be created to fetch wallet balance
            // For now, we'll use a placeholder
            const response = await fetch(`/api/tokens/balance?userId=${userId}`);
            if (response.ok) {
                const data = await response.json();
                setWallet(data);
            }
        } catch (error) {
            console.error('Failed to fetch token balance:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4"></div>
                    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-sm opacity-90 mb-1">Your Token Balance</div>
                    <div className="text-4xl font-bold">
                        {wallet?.balance?.toFixed(0) || '0'}
                        <span className="text-xl ml-2 opacity-75">tokens</span>
                    </div>
                    {wallet?.lastReset && (
                        <div className="text-xs opacity-75 mt-2">
                            Last reset: {new Date(wallet.lastReset).toLocaleDateString()}
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2">
                    <button
                        onClick={onBuyMore}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                    >
                        Buy More
                    </button>
                    <button
                        onClick={fetchBalance}
                        className="bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors text-sm"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Low Balance Warning */}
            {wallet && wallet.balance < 5 && (
                <div className="mt-4 bg-yellow-500/20 backdrop-blur-sm border border-yellow-300/30 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <svg
                            className="w-5 h-5 text-yellow-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                        <span className="text-sm font-medium">Low balance! Consider buying more tokens.</span>
                    </div>
                </div>
            )}
        </div>
    );
}
