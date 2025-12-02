'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
    duration: number // seconds
    onComplete?: () => void
    autoStart?: boolean
}

/**
 * Countdown Timer Component
 * Shows countdown in MM:SS format
 */
export function CountdownTimer({
    duration,
    onComplete,
    autoStart = true,
}: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration)
    const [isActive, setIsActive] = useState(autoStart)

    useEffect(() => {
        if (!isActive || timeLeft <= 0) {
            if (timeLeft === 0 && onComplete) {
                onComplete()
            }
            return
        }

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    setIsActive(false)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isActive, timeLeft, onComplete])

    const reset = () => {
        setTimeLeft(duration)
        setIsActive(true)
    }

    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
                {timeLeft > 0 ? (
                    <>
                        Resend code in{' '}
                        <span className="font-semibold text-emerald-600">
                            {minutes}:{seconds.toString().padStart(2, '0')}
                        </span>
                    </>
                ) : (
                    <span className="text-gray-500">You can resend the code now</span>
                )}
            </span>
        </div>
    )
}

// Export reset function type for parent components
export type CountdownTimerHandle = {
    reset: () => void
}
