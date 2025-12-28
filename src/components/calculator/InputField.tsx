'use client';

/**
 * INPUT FIELD COMPONENT
 * 
 * Reusable input field for monetary values.
 * 
 * @accessibility
 * - Proper input type and inputMode for mobile keyboards
 * - Large touch target (min 48px)
 * - Clear focus state
 * - Screen reader compatible
 */

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { Currency } from '@/lib/dal/types';

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    /** Current value */
    value: string;
    /** Change handler */
    onChange: (value: string) => void;
    /** Currency suffix */
    currency: Currency;
    /** Error message */
    error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
    ({ value, onChange, currency, error, className, id, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <input
                    ref={ref}
                    id={id}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={cn(
                        // Base styles
                        "w-full h-14 md:h-16 text-xl md:text-3xl font-bold text-center",
                        // Colors
                        "bg-white/5 border border-white/10 text-white placeholder:text-slate-500",
                        // Focus states
                        "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400",
                        // Border radius
                        "rounded-xl",
                        // Padding for currency suffix
                        "pr-16 md:pr-20",
                        // Transition
                        "transition-all duration-200",
                        // Error state
                        error && "border-red-500 focus:ring-red-500/50 focus:border-red-500",
                        className
                    )}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${id}-error` : undefined}
                    {...props}
                />

                {/* Currency suffix */}
                <span
                    className="absolute right-4 md:right-5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-base md:text-lg pointer-events-none"
                    aria-hidden="true"
                >
                    {currency}
                </span>

                {/* Error message */}
                {error && (
                    <p
                        id={`${id}-error`}
                        className="mt-2 text-sm text-red-400"
                        role="alert"
                    >
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

InputField.displayName = 'InputField';
