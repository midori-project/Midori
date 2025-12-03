'use client'

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react'

interface OTPInputProps {
    length?: number
    value: string
    onChange: (value: string) => void
    disabled?: boolean
    error?: boolean
}

/**
 * OTP Input Component
 * 6-digit OTP input with auto-focus and paste support
 */
export function OTPInput({
    length = 6,
    value,
    onChange,
    disabled = false,
    error = false,
}: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Sync with parent value
    useEffect(() => {
        if (value.length === 0) {
            setOtp(Array(length).fill(''))
        } else {
            setOtp(value.split('').concat(Array(length).fill('')).slice(0, length))
        }
    }, [value, length])

    const handleChange = (index: number, digit: string) => {
        if (disabled) return

        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return

        const newOtp = [...otp]
        newOtp[index] = digit

        setOtp(newOtp)
        onChange(newOtp.join(''))

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return

        // Backspace: clear current and move to previous
        if (e.key === 'Backspace') {
            e.preventDefault()
            const newOtp = [...otp]

            if (otp[index]) {
                // Clear current digit
                newOtp[index] = ''
                setOtp(newOtp)
                onChange(newOtp.join(''))
            } else if (index > 0) {
                // Move to previous and clear
                newOtp[index - 1] = ''
                setOtp(newOtp)
                onChange(newOtp.join(''))
                inputRefs.current[index - 1]?.focus()
            }
        }

        // Arrow keys navigation
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
        if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        if (disabled) return

        const pastedData = e.clipboardData.getData('text/plain')
        const digits = pastedData.replace(/\D/g, '').slice(0, length)

        if (digits.length > 0) {
            const newOtp = digits.split('').concat(Array(length).fill('')).slice(0, length)
            setOtp(newOtp)
            onChange(newOtp.join(''))

            // Focus last filled input
            const lastIndex = Math.min(digits.length, length - 1)
            inputRefs.current[lastIndex]?.focus()
        }
    }

    const handleFocus = (index: number) => {
        // Select all text on focus for easy replacement
        inputRefs.current[index]?.select()
    }

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => {
                        inputRefs.current[index] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    onFocus={() => handleFocus(index)}
                    disabled={disabled}
                    className={`
            w-12 h-14 text-center text-2xl font-semibold
            border-2 rounded-lg
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-emerald-500
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error
                            ? 'border-red-300 bg-red-50 text-red-900'
                            : digit
                                ? 'border-emerald-500 bg-emerald-50'
                                : 'border-gray-300 bg-white'
                        }
          `}
                    aria-label={`Digit ${index + 1}`}
                />
            ))}
        </div>
    )
}
