'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Input } from '@/components/ui/input';

interface OTPInputProps {
    length?: number;
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

export function OTPInput({ length = 6, value, onChange, disabled = false }: OTPInputProps) {
    const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (index: number, digit: string) => {
        if (disabled) return;

        // Only allow digits
        if (digit && !/^\d$/.test(digit)) return;

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        onChange(newOtp.join(''));

        // Auto-focus next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // Focus previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            }
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
            onChange(newOtp.join(''));
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        if (disabled) return;

        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
        const newOtp = pasteData.split('');

        // Fill remaining with empty strings
        while (newOtp.length < length) {
            newOtp.push('');
        }

        setOtp(newOtp);
        onChange(newOtp.join(''));

        // Focus last filled input
        const lastFilledIndex = Math.min(pasteData.length, length - 1);
        inputRefs.current[lastFilledIndex]?.focus();
    };

    return (
        <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
                <Input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={disabled}
                    className="w-12 h-14 text-center text-2xl font-bold"
                />
            ))}
        </div>
    );
}
