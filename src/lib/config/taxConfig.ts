import { TaxRates } from '../dal/types';

// Base rates that don't change by year
const BASE_RATES = {
    CIM: Object.freeze({
        CAS: 0.25,
        CASS: 0.10,
        INCOME_TAX: 0.10,
        PERSONAL_DEDUCTION: 660,
        CAM: 0.0225,
        DEDUCTION_YOUTH_RATE: 0.15,
        DEDUCTION_PER_CHILD: 100
    }),
    PFA: Object.freeze({
        CAS: 0.25,
        CAS_CAP_LOW: 12,
        CAS_CAP_HIGH: 24,
        CASS: 0.10,
        CASS_CAPS: Object.freeze([6, 12, 24, 72]),
        INCOME_TAX: 0.10
    }),
    SRL_BASE: Object.freeze({
        MICRO_TAX_LOW: 0.01,
        MICRO_TAX_HIGH: 0.01,
        REVENUE_THRESHOLD: 5000000, // Effectively infinite or just set high to avoid confusion, but taxes are equal anyway
        CASS_ON_DIVIDENDS: 0.10,
        CASS_CAP_DIVIDEND: 24
    })
};

// Year-specific rates
const YEAR_RATES = {
    2025: {
        DIVIDEND_TAX: 0.10,  // 10% for 2025
        PFA_INCOME_TAX: 0.10,
        MINIMUM_WAGE: 4050
    },
    2026: {
        DIVIDEND_TAX: 0.16,  // 16% for 2026
        PFA_INCOME_TAX: 0.16,
        MINIMUM_WAGE: 4050
    }
} as const;

export type FiscalYear = 2025 | 2026;

/**
 * Get tax rates for a specific fiscal year
 */
export function getTaxRatesForYear(year: FiscalYear): TaxRates {
    const yearRates = YEAR_RATES[year];

    return Object.freeze({
        CIM: BASE_RATES.CIM,
        PFA: Object.freeze({
            ...BASE_RATES.PFA,
            INCOME_TAX: yearRates.PFA_INCOME_TAX
        }),
        SRL: Object.freeze({
            ...BASE_RATES.SRL_BASE,
            DIVIDEND_TAX: yearRates.DIVIDEND_TAX
        }),
        CONSTANTS: Object.freeze({
            MINIMUM_WAGE: yearRates.MINIMUM_WAGE,
            MINIMUM_WAGE_JULY_2026: 4325,
            EUR_RON_RATE: 5.0
        })
    });
}

// Default export for backward compatibility (uses 2025 rates)
const TAX_RATES: TaxRates = getTaxRatesForYear(2025);

export { TAX_RATES };

