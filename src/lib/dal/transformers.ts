/**
 * 🔄 DATA TRANSFORMERS
 * 
 * Pure functions for data transformation.
 * All transformers are stateless and have no side effects.
 * 
 * @module lib/dal/transformers
 */

import { TAX_RATES } from '../config/taxConfig';
import type {
    Currency,
    CalculationResult,
    ChartDataPoint,
    CIMBreakdown,
    CIMCalculationResult,
    PFACalculationResult,
    SRLCalculationResult,
    ComparisonResult,
    ScenarioType
} from './types';

// =============================================================================
// CURRENCY TRANSFORMERS
// =============================================================================

/**
 * Convertește o sumă din RON în EUR
 * @param amount - Suma în RON
 * @returns Suma în EUR
 */
export function ronToEur(amount: number, customRate?: number): number {
    const rate = customRate ?? TAX_RATES.CONSTANTS.EUR_RON_RATE;
    return Math.round((amount / rate) * 100) / 100;
}

/**
 * Convertește o sumă din EUR în RON
 * @param amount - Suma în EUR
 * @returns Suma în RON
 */
export function eurToRon(amount: number, customRate?: number): number {
    const rate = customRate ?? TAX_RATES.CONSTANTS.EUR_RON_RATE;
    return Math.round((amount * rate) * 100) / 100;
}

/**
 * Convertește o sumă între monede
 * @param amount - Suma de convertit
 * @param from - Moneda sursă
 * @param to - Moneda destinație
 * @returns Suma convertită
 */
export function convertCurrency(
    amount: number,
    from: Currency,
    to: Currency,
    customRate?: number
): number {
    if (from === to) return amount;
    if (from === 'RON' && to === 'EUR') return ronToEur(amount, customRate);
    if (from === 'EUR' && to === 'RON') return eurToRon(amount, customRate);
    return amount;
}

// =============================================================================
// RESULT TRANSFORMERS
// =============================================================================

/**
 * Convertește un rezultat de calcul în altă monedă
 */
export function transformResultCurrency(
    result: CalculationResult,
    targetCurrency: Currency,
    sourceCurrency: Currency,
    customRate?: number
): CalculationResult {
    if (sourceCurrency === targetCurrency) return result;

    const convert = (val: number) => convertCurrency(val, sourceCurrency, targetCurrency, customRate);

    return Object.freeze({
        ...result,
        gross: convert(result.gross),
        net: convert(result.net),
        totalTaxes: convert(result.totalTaxes),
        breakdown: transformBreakdownCurrency(result.breakdown, targetCurrency, sourceCurrency, customRate)
    });
}

/**
 * Convertește breakdown-ul în altă monedă
 */
export function transformBreakdownCurrency(
    breakdown: CalculationResult['breakdown'],
    targetCurrency: Currency,
    sourceCurrency: Currency,
    customRate?: number
): CalculationResult['breakdown'] {
    if (sourceCurrency === targetCurrency) return breakdown;

    const convert = (val: number) => convertCurrency(val, sourceCurrency, targetCurrency, customRate);

    // Handle each breakdown type
    if ('personalDeduction' in breakdown) {
        // CIM breakdown
        const cimBreakdown = breakdown as CIMBreakdown;
        return Object.freeze({
            cas: convert(cimBreakdown.cas),
            cass: convert(cimBreakdown.cass),
            incomeTax: convert(cimBreakdown.incomeTax),
            personalDeduction: convert(cimBreakdown.personalDeduction),
            baseDeduction: convert(cimBreakdown.baseDeduction),
            supplementaryDeduction: convert(cimBreakdown.supplementaryDeduction),
            cam: convert(cimBreakdown.cam),
            completeSalary: convert(cimBreakdown.completeSalary)
        });
    } else if ('casCapped' in breakdown) {
        // PFA breakdown
        return Object.freeze({
            cas: convert(breakdown.cas),
            casCapped: breakdown.casCapped,
            cass: convert(breakdown.cass),
            cassCapped: breakdown.cassCapped,
            incomeTax: convert(breakdown.incomeTax)
        });
    } else {
        // SRL breakdown
        return Object.freeze({
            microTax: convert(breakdown.microTax),
            microTaxRate: breakdown.microTaxRate,
            dividendTax: convert(breakdown.dividendTax),
            cassDividend: convert(breakdown.cassDividend),
            cassDividendCapped: breakdown.cassDividendCapped
        });
    }
}

// =============================================================================
// CHART DATA TRANSFORMERS
// =============================================================================

/**
 * Transformă rezultatul calculului în date pentru graficul donut
 */
export function toDonutChartData(result: CalculationResult): ChartDataPoint[] {
    return [
        {
            name: 'Venit Net',
            value: result.net,
            fill: '#22c55e' // green-500
        },
        {
            name: 'Taxe',
            value: result.totalTaxes,
            fill: '#ef4444' // red-500
        }
    ];
}

/**
 * Transformă rezultatele comparației în date pentru graficul de comparație
 */
export function toComparisonChartData(comparison: ComparisonResult): ChartDataPoint[] {
    return [
        {
            name: 'CIM',
            value: comparison.CIM.gross,
            fill: comparison.optimal === 'CIM' ? '#22c55e' : '#64748b'
        },
        {
            name: 'PFA',
            value: comparison.PFA.gross,
            fill: comparison.optimal === 'PFA' ? '#22c55e' : '#64748b'
        },
        {
            name: 'SRL',
            value: comparison.SRL.gross,
            fill: comparison.optimal === 'SRL' ? '#22c55e' : '#64748b'
        }
    ];
}

// =============================================================================
// FORMATTING TRANSFORMERS
// =============================================================================

/**
 * Formatează o sumă pentru afișare
 */
export function formatCurrency(amount: number, currency: Currency): string {
    const formatter = new Intl.NumberFormat('ro-RO', {
        style: 'currency',
        currency: currency === 'RON' ? 'RON' : 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
    return formatter.format(amount);
}

/**
 * Formatează un procent pentru afișare
 */
export function formatPercent(value: number): string {
    return `${(value * 100).toFixed(1)}%`;
}

/**
 * Formatează diferența față de cel mai scump scenariu
 */
export function formatSavings(amount: number, currency: Currency): string {
    if (amount <= 0) return 'Cea mai eficientă opțiune';
    return `Economisești ${formatCurrency(amount, currency)}`;
}

// =============================================================================
// COMPARISON TRANSFORMERS
// =============================================================================

/**
 * Determină scenariul optimal din rezultatele comparației
 */
export function findOptimalScenario(
    cim: CIMCalculationResult,
    pfa: PFACalculationResult,
    srl: SRLCalculationResult
): { optimal: ScenarioType; savings: number } {
    const costs = [
        { scenario: 'CIM' as const, cost: cim.gross },
        { scenario: 'PFA' as const, cost: pfa.gross },
        { scenario: 'SRL' as const, cost: srl.gross }
    ];

    // Sortează crescător după cost
    costs.sort((a, b) => a.cost - b.cost);

    const optimal = costs[0].scenario;
    const mostExpensive = costs[costs.length - 1].cost;
    const savings = Math.round((mostExpensive - costs[0].cost) * 100) / 100;

    return { optimal, savings };
}

// =============================================================================
// SEO TEXT GENERATORS
// =============================================================================

/**
 * Generează text SEO pentru rezultatele calculului
 */
export function generateSEOText(
    comparison: ComparisonResult,
    grossIncome: number,
    currency: Currency
): string {
    const gross = formatCurrency(grossIncome, currency);
    const netCIM = formatCurrency(comparison.CIM.net, currency);
    const netPFA = formatCurrency(comparison.PFA.net, currency);
    const netSRL = formatCurrency(comparison.SRL.net, currency);
    const savings = formatCurrency(comparison.savings, currency);

    const optimalName = {
        CIM: 'Contract Individual de Muncă (CIM)',
        PFA: 'Persoană Fizică Autorizată (PFA)',
        SRL: 'SRL Microîntreprindere'
    };

    return `Pentru un venit BRUT de ${gross}, venitul NET (bani în mână) este:
• CIM (Angajat): ${netCIM}${comparison.optimal === 'CIM' ? ' ✅ CEA MAI EFICIENTĂ' : ''}
• PFA (Sistem Real): ${netPFA}${comparison.optimal === 'PFA' ? ' ✅ CEA MAI EFICIENTĂ' : ''}
• SRL (Microîntreprindere): ${netSRL}${comparison.optimal === 'SRL' ? ' ✅ CEA MAI EFICIENTĂ' : ''}

Varianta ${optimalName[comparison.optimal]} economisește ${savings} lunar.`;
}
