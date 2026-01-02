/**
 * 🔐 DATA ACCESS LAYER - PUBLIC INTERFACE
 * 
 * This is the ONLY entry point for accessing fiscal data.
 * All calculations and data access MUST go through this layer.
 * 
 * Implements Singleton pattern to ensure single point of access.
 * 
 * @module lib/dal
 */

import { TAX_RATES, getTaxRatesForYear, type FiscalYear } from '../config/taxConfig';
import {
    CalculationInputSchema,
    ComparisonInputSchema,
    FreelanceInputSchema,
    safeValidateCalculationInput,
    safeValidateComparisonInput
} from './validators';
import { calculateCIM } from '../calculations/cim';
import { calculatePFA } from '../calculations/pfa';
import { calculateSRL } from '../calculations/srl';
import {
    convertCurrency,
    transformResultCurrency,
    findOptimalScenario,
    toDonutChartData,
    formatCurrency,
    formatPercent,
    generateSEOText
} from './transformers';
import type {
    CalculationResult,
    CIMCalculationResult,
    PFACalculationResult,
    SRLCalculationResult,
    ComparisonResult,
    FreelanceComparisonResult,
    ScenarioType,
    Currency,
    TaxRates,
    ChartDataPoint
} from './types';

// =============================================================================
// DAL ERROR TYPES
// =============================================================================

export class DALError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly details?: unknown
    ) {
        super(message);
        this.name = 'DALError';
    }
}

export class ValidationError extends DALError {
    constructor(message: string, details?: unknown) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class CalculationError extends DALError {
    constructor(message: string, details?: unknown) {
        super(message, 'CALCULATION_ERROR', details);
        this.name = 'CalculationError';
    }
}

// =============================================================================
// FISCAL DATA ACCESS LAYER - SINGLETON
// =============================================================================

/**
 * Secure Data Access Layer for fiscal calculations
 * 
 * @example
 * ```typescript
 * import { fiscalDAL } from '@/lib/dal';
 * 
 * // Get tax rates (read-only)
 * const rates = fiscalDAL.getTaxRates();
 * 
 * // Calculate for a specific scenario
 * const result = fiscalDAL.calculate({
 *   netIncome: 10000,
 *   currency: 'RON',
 *   scenario: 'CIM'
 * });
 * 
 * // Compare all scenarios
 * const comparison = fiscalDAL.compareAll(10000, 'RON');
 * ```
 */
class FiscalDataAccessLayer {
    private static instance: FiscalDataAccessLayer | null = null;

    private exchangeRate: number = TAX_RATES.CONSTANTS.EUR_RON_RATE;

    // Private constructor prevents direct instantiation
    private constructor() {
        // Removed Object.freeze to allow updating exchangeRate
    }

    /**
     * Get the singleton instance
     */
    public static getInstance(): FiscalDataAccessLayer {
        if (!FiscalDataAccessLayer.instance) {
            FiscalDataAccessLayer.instance = new FiscalDataAccessLayer();
        }
        return FiscalDataAccessLayer.instance;
    }

    // ===========================================================================
    // READ-ONLY DATA ACCESS
    // ===========================================================================

    /**
     * Get tax rates (read-only)
     * @returns Immutable tax rates object
     */
    public getTaxRates(): Readonly<TaxRates> {
        return TAX_RATES;
    }

    /**
     * Get minimum wage
     */
    public getMinimumWage(): number {
        return TAX_RATES.CONSTANTS.MINIMUM_WAGE;
    }

    /**
     * Get EUR/RON exchange rate
     */
    public getExchangeRate(): number {
        return this.exchangeRate;
    }

    /**
     * Update exchange rate (e.g. from BNR Live API)
     */
    public updateExchangeRate(rate: number): void {
        if (rate > 0) {
            this.exchangeRate = rate;
        }
    }

    // ===========================================================================
    // VALIDATED CALCULATIONS
    // ===========================================================================

    /**
     * Calculate taxes for a specific scenario
     * @throws ValidationError if input is invalid
     * @throws CalculationError if calculation fails
     */
    public calculate(input: unknown): CalculationResult {
        // Validate input
        const validation = safeValidateCalculationInput(input);
        if (!validation.success) {
            throw new ValidationError(
                'Input invalid pentru calcul',
                validation.error.issues
            );
        }

        const {
            grossIncome,
            currency,
            scenario,
            annualRevenue,
            hasEmployee,
            isPensioner,
            isHandicapped
        } = validation.data;

        // Convert to RON if needed
        const grossIncomeRON = currency === 'EUR'
            ? convertCurrency(grossIncome, 'EUR', 'RON', this.exchangeRate)
            : grossIncome;

        try {
            let result: CalculationResult;

            switch (scenario) {
                case 'CIM':
                    result = calculateCIM(grossIncomeRON);
                    break;
                case 'PFA':
                    result = calculatePFA(
                        grossIncomeRON,
                        isPensioner,
                        isHandicapped
                    );
                    break;
                case 'SRL':
                    result = calculateSRL(
                        grossIncomeRON,
                        annualRevenue,
                        hasEmployee,
                        this.exchangeRate
                    );
                    break;
                default:
                    throw new CalculationError(`Scenariu necunoscut: ${scenario}`);
            }

            // Convert back if original currency was EUR
            if (currency === 'EUR') {
                return transformResultCurrency(result, 'EUR', 'RON', this.exchangeRate);
            }

            return result;
        } catch (error) {
            if (error instanceof DALError) throw error;
            throw new CalculationError(
                'Eroare la calculul taxelor',
                error
            );
        }
    }

    /**
     * Calculate a specific scenario (type-safe version)
     */
    public calculateCIM(
        grossIncome: number,
        currency: Currency = 'RON',
        minWageOverride?: number,
        options?: {
            dependentsCount?: number;
            isUnder26?: boolean;
            childrenInSchoolCount?: number;
        },
        period: 'MONTHLY' | 'ANNUAL' = 'ANNUAL'
    ): CIMCalculationResult {
        const grossIncomeRON = currency === 'EUR'
            ? convertCurrency(grossIncome, 'EUR', 'RON', this.exchangeRate)
            : grossIncome;

        // If annual, calculate on monthly and multiply?
        // Actually Article 77 is monthly based.
        const monthlyGross = period === 'ANNUAL' ? grossIncomeRON / 12 : grossIncomeRON;

        const monthlyResult = calculateCIM(monthlyGross, minWageOverride, options);

        if (period === 'ANNUAL') {
            const annualResult = {
                ...monthlyResult,
                gross: monthlyResult.gross * 12,
                net: monthlyResult.net * 12,
                totalTaxes: monthlyResult.totalTaxes * 12,
                breakdown: {
                    ...monthlyResult.breakdown,
                    cas: monthlyResult.breakdown.cas * 12,
                    cass: monthlyResult.breakdown.cass * 12,
                    incomeTax: monthlyResult.breakdown.incomeTax * 12,
                    personalDeduction: monthlyResult.breakdown.personalDeduction * 12,
                    baseDeduction: monthlyResult.breakdown.baseDeduction * 12,
                    supplementaryDeduction: monthlyResult.breakdown.supplementaryDeduction * 12,
                    cam: monthlyResult.breakdown.cam * 12,
                    completeSalary: monthlyResult.breakdown.completeSalary * 12
                }
            };

            if (currency === 'EUR') {
                return transformResultCurrency(annualResult, 'EUR', 'RON', this.exchangeRate) as CIMCalculationResult;
            }
            return annualResult as CIMCalculationResult;
        }

        if (currency === 'EUR') {
            return transformResultCurrency(monthlyResult, 'EUR', 'RON', this.exchangeRate) as CIMCalculationResult;
        }

        return monthlyResult;
    }

    public calculatePFA(
        grossIncome: number,
        currency: Currency = 'RON',
        isPensioner: boolean = false,
        isHandicapped: boolean = false,
        period: 'MONTHLY' | 'ANNUAL' = 'ANNUAL'
    ): PFACalculationResult {
        const grossIncomeRON = currency === 'EUR'
            ? convertCurrency(grossIncome, 'EUR', 'RON', this.exchangeRate)
            : grossIncome;

        const result = calculatePFA(grossIncomeRON, isPensioner, isHandicapped, period);

        if (currency === 'EUR') {
            return transformResultCurrency(result, 'EUR', 'RON', this.exchangeRate) as PFACalculationResult;
        }

        return result as PFACalculationResult;
    }

    public calculateSRL(
        grossIncome: number,
        currency: Currency = 'RON',
        annualRevenue?: number,
        hasEmployee: boolean = true,
        reinvestedProfit: number = 0,
        deductibleProvisions: number = 0,
        fiscalYear: FiscalYear = 2025,
        period: 'MONTHLY' | 'ANNUAL' = 'ANNUAL'
    ): SRLCalculationResult {
        const grossIncomeRON = currency === 'EUR'
            ? convertCurrency(grossIncome, 'EUR', 'RON', this.exchangeRate)
            : grossIncome;

        // Convert options to RON if needed? 
        // Logic assumes options are in same currency as income?
        // Usually inputs are aligned. If user selects EUR, prompts should be EUR.
        // Let's assume options are in the SAME currency as grossIncome.
        // So we need to convert them too if they are passed.

        let reinvestedProfitRON = reinvestedProfit;
        let deductibleProvisionsRON = deductibleProvisions;

        if (currency === 'EUR') {
            reinvestedProfitRON = convertCurrency(reinvestedProfit, 'EUR', 'RON', this.exchangeRate);
            deductibleProvisionsRON = convertCurrency(deductibleProvisions, 'EUR', 'RON', this.exchangeRate);
        }

        const result = calculateSRL(
            grossIncomeRON,
            annualRevenue,
            hasEmployee,
            this.exchangeRate,
            reinvestedProfitRON,
            deductibleProvisionsRON,
            fiscalYear,
            period
        );

        if (currency === 'EUR') {
            return transformResultCurrency(result, 'EUR', 'RON', this.exchangeRate) as SRLCalculationResult;
        }

        return result as SRLCalculationResult;
    }

    // ===========================================================================
    // COMPARISON
    // ===========================================================================

    /**
     * Compare all scenarios
     */
    public compareAll(
        grossIncome: number,
        currency: Currency = 'RON',
        options?: {
            hasEmployee?: boolean;
            isPensioner?: boolean;
            isHandicapped?: boolean;
        }
    ): ComparisonResult {
        // Validate with partial schema for comparison
        const validation = safeValidateComparisonInput({ grossIncome, currency });
        if (!validation.success) {
            throw new ValidationError(
                'Input invalid pentru comparație',
                validation.error.issues
            );
        }

        const cim = this.calculateCIM(grossIncome, currency);
        const pfa = this.calculatePFA(
            grossIncome,
            currency,
            options?.isPensioner,
            options?.isHandicapped
        );
        const srl = this.calculateSRL(
            grossIncome,
            currency,
            undefined,
            options?.hasEmployee
        );

        const { optimal, savings } = findOptimalScenario(cim, pfa, srl);

        return Object.freeze({
            CIM: cim,
            PFA: pfa,
            SRL: srl,
            optimal,
            savings
        });
    }

    /**
     * Compare Freelance scenarios (PFA vs Micro vs Profit)
     */
    public compareFreelance(
        grossIncome: number,
        currency: Currency = 'RON',
        options?: {
            isPensioner?: boolean;
            isHandicapped?: boolean;
            reinvestedProfit?: number;
            deductibleProvisions?: number;
            fiscalYear?: FiscalYear;
            isUnder26?: boolean;
            dependentsCount?: number;
            childrenInSchoolCount?: number;
            period?: 'MONTHLY' | 'ANNUAL';
        }
    ): FreelanceComparisonResult {
        // Validate with Freelance schema
        const validationResult = FreelanceInputSchema.safeParse({
            grossIncome,
            currency,
            options
        });

        if (!validationResult.success) {
            throw new ValidationError(
                'Input invalid pentru comparație freelance',
                validationResult.error.issues
            );
        }

        const fiscalYear = options?.fiscalYear ?? 2025;
        const period = options?.period ?? 'ANNUAL';

        // Calculate PFA (Standard or with exemptions)
        const pfa = this.calculatePFA(
            grossIncome,
            currency,
            options?.isPensioner,
            options?.isHandicapped,
            period
        );

        // Calculate SRL Micro (Assume has employee = true)
        const micro = this.calculateSRL(
            grossIncome,
            currency,
            undefined,
            true, // Enforce Micro logic
            0,
            0,
            fiscalYear,
            period
        );

        // Calculate SRL Profit (Assume has employee = false)
        const profit = this.calculateSRL(
            grossIncome,
            currency,
            undefined,
            false, // Enforce Profit logic
            options?.reinvestedProfit ?? 0,
            options?.deductibleProvisions ?? 0,
            fiscalYear,
            period
        );

        // Find optimal among these 3
        const costs = [
            { scenario: 'PFA' as const, cost: pfa.gross - pfa.net }, // Use taxes as cost metric? No, comparison is usually "Net Gain" or "Taxes Paid"? 
            // Wait, calculateSRL returns same GROSS, but different NET. 
            // Optimal means HIGHEST NET. 
            // findOptimalScenario uses "cost" as GROSS? No, usually in reverse.
            // Let's implement local optimal logic here based on Max Net.
        ];

        // Actually, if input is GROSS (Facturat), then Optimal is Highest Net.
        // If input is NET (Desire), then Optimal is Lowest Gross (Cost).
        // Our calculators take GROSS input now (Gross-to-Net).
        // So we want MAX NET.

        const scenarios = [
            { id: 'PFA' as const, net: pfa.net },
            { id: 'Micro' as const, net: micro.net },
            { id: 'Profit' as const, net: profit.net }
        ];

        scenarios.sort((a, b) => b.net - a.net); // Descending Net

        const optimal = scenarios[0].id;
        const worstNet = scenarios[scenarios.length - 1].net;
        const bestNet = scenarios[0].net;
        const savings = Math.round((bestNet - worstNet) * 100) / 100;

        return Object.freeze({
            PFA: pfa,
            Micro: micro,
            Profit: profit,
            optimal,
            savings
        });
    }

    // ===========================================================================
    // CHART DATA GENERATION
    // ===========================================================================

    /**
     * Generate donut chart data for a calculation result
     */
    public getDonutChartData(result: CalculationResult): ChartDataPoint[] {
        return toDonutChartData(result);
    }

    // ===========================================================================
    // FORMATTING
    // ===========================================================================

    /**
     * Format currency value for display
     */
    public formatCurrency(amount: number, currency: Currency): string {
        return formatCurrency(amount, currency);
    }

    /**
     * Format percentage for display
     */
    public formatPercent(value: number): string {
        return formatPercent(value);
    }

    /**
     * Convert between currencies
     */
    public convertCurrency(amount: number, from: Currency, to: Currency): number {
        return convertCurrency(amount, from, to, this.exchangeRate);
    }

    // ===========================================================================
    // SEO
    // ===========================================================================

    /**
     * Generate SEO text for comparison results
     */
    public generateSEOText(
        comparison: ComparisonResult,
        grossIncome: number,
        currency: Currency
    ): string {
        return generateSEOText(comparison, grossIncome, currency);
    }
}

// =============================================================================
// EXPORTS
// =============================================================================

/**
 * Singleton instance of the Fiscal Data Access Layer
 */
export const fiscalDAL = FiscalDataAccessLayer.getInstance();

// Re-export types for convenience
export * from './types';
export * from './validators';
export { convertCurrency, formatCurrency, formatPercent } from './transformers';
