'use client';

/**
 * CURRENCY TOGGLE COMPONENT
 * 
 * Toggle between RON and EUR currencies.
 * 
 * @accessibility
 * - Uses button group pattern
 * - Keyboard accessible
 * - Clear selected state
 */

import { type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { Currency } from '@/lib/dal/types';

interface CurrencyToggleProps {
    /** Currently selected currency */
    value: Currency;
    /** Change handler */
    onChange: (currency: Currency) => void;
    /** Additional class names */
    className?: string;
    /** ARIA label for the group */
    'aria-label'?: string;
}

export function CurrencyToggle({
    value,
    onChange,
    className,
    'aria-label': ariaLabel = 'Selectează moneda'
}: CurrencyToggleProps) {
    return (
        <div
            className={cn(
                "inline-flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10",
                className
            )}
            role="group"
            aria-label={ariaLabel}
        >
            <CurrencyButton
                currency="RON"
                isSelected={value === 'RON'}
                onClick={() => onChange('RON')}
            />
            <CurrencyButton
                currency="EUR"
                isSelected={value === 'EUR'}
                onClick={() => onChange('EUR')}
            />
        </div>
    );
}

interface CurrencyButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    currency: Currency;
    isSelected: boolean;
}

function CurrencyButton({ currency, isSelected, ...props }: CurrencyButtonProps) {
    return (
        <button
            type="button"
            className={cn(
                // Base styles
                "px-5 md:px-6 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base",
                // Transition
                "transition-all duration-200",
                // Focus
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                // States
                isSelected
                    ? "bg-white text-slate-900 shadow-md"
                    : "text-slate-400 hover:text-white hover:bg-white/10"
            )}
            aria-pressed={isSelected}
            {...props}
        >
            {currency}
        </button>
    );
}
