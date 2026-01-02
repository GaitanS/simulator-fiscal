/**
 * Calculează taxele pentru SRL Microîntreprindere
 * Direct calculation: Gross (Facturat) -> Net
 * 
 * Flow:
 * 1. Facturat
 * 2. Scad Taxa Micro (1% sau 3%)
 * 3. Scad cost contabil/diverse (opțional, 0 aici)
 * 4. Ramane Profit Brut
 * 5. Scad Impozit Dividende (8%, 10% sau 16% în funcție de an)
 * 6. Scad CASS pe dividende (daca e cazul)
 */
import { getTaxRatesForYear, type FiscalYear } from '../config/taxConfig';
import type { CalculationResult } from '../dal/types';

export function calculateSRL(
    grossIncome: number,
    annualRevenue: number = 0,
    hasEmployee: boolean = true,
    exchangeRate: number = 5.0,
    reinvestedProfit: number = 0,
    deductibleProvisions: number = 0,
    fiscalYear: FiscalYear = 2025,
    period: 'MONTHLY' | 'ANNUAL' = 'ANNUAL'
): CalculationResult {
    const TAX_RATES = getTaxRatesForYear(fiscalYear);

    const {
        MICRO_TAX_LOW,
        MICRO_TAX_HIGH,
        REVENUE_THRESHOLD,
        DIVIDEND_TAX,
        CASS_ON_DIVIDENDS,
        CASS_CAP_DIVIDEND
    } = TAX_RATES.SRL;
    const { MINIMUM_WAGE } = TAX_RATES.CONSTANTS;

    // Revenue
    const revenue = period === 'ANNUAL' ? grossIncome : (annualRevenue || (grossIncome * 12));

    // Expenses (for Profit mode and Dividend Base)
    const expenses = deductibleProvisions;

    // --- 1. CORPORATE & EMPLOYEE TAXES ---
    let corporateTax = 0;
    let laborCost = 0; // Gross Salary (annual)
    let salaryTaxes = 0; // Taxes on Salary (annual)
    let netSalary = 0; // Net Salary (annual)

    if (hasEmployee) {
        // MICRO (1%)
        // Rule: 1% of Revenue
        corporateTax = revenue * 0.01;

        // Salary Costs (Constant 48.600 for both years as per user request)
        // This removes any 2026 split wage logic.
        laborCost = 48600; // 12 * 4050

        // Taxes based on user reference
        salaryTaxes = 20292;

        // Net Salary
        netSalary = 48600 - 20292; // 28308
    } else {
        // PROFIT (16%)
        // Venit Impozabil = Venituri - Cheltuieli
        const taxableIncome = Math.max(0, revenue - expenses);
        corporateTax = taxableIncome * 0.16;
        laborCost = 0;
        salaryTaxes = 0;
        netSalary = 0;
    }

    // --- 2. DIVIDENDS ---
    // Dividende Brut = Venituri - Cheltuieli - Salarii (Gross) - Taxes (Micro/Profit)
    // Excel Deduction: Revenue - Expenses - GrossSalary - MicroTax

    const dividendBase = Math.max(0, revenue - expenses - laborCost - corporateTax);

    // Tax Dividends (Dynamic based on year)
    const dividendTax = dividendBase * DIVIDEND_TAX;
    const netDividends = dividendBase - dividendTax;

    // --- 3. CASS ON DIVIDENDS ---
    // Capped at 6/12/24 salaries based on GROSS DIVIDEND (Distributed)
    // Strict Legal Norms 2026

    let cassBase = 0;
    if (dividendBase >= 24 * MINIMUM_WAGE) {
        cassBase = 24 * MINIMUM_WAGE;
    } else if (dividendBase >= 12 * MINIMUM_WAGE) {
        cassBase = 12 * MINIMUM_WAGE;
    } else if (dividendBase >= 6 * MINIMUM_WAGE) {
        cassBase = 6 * MINIMUM_WAGE;
    }

    const cass = cassBase * 0.10; // Annual CASS

    // --- 4. TOTALS ---
    const totalTaxes = corporateTax + salaryTaxes + dividendTax + cass;

    const net = (netDividends - cass) + netSalary;

    return {
        gross: revenue,
        net: period === 'ANNUAL' ? net : (net / 12),
        netMonthly: net / 12,
        totalTaxes: period === 'ANNUAL' ? totalTaxes : (totalTaxes / 12),
        breakdown: {
            venituri: revenue,
            cheltuieli: expenses,
            salarii: laborCost,
            platiSalarii: salaryTaxes,
            microTax: hasEmployee ? corporateTax : 0,
            profitTax: !hasEmployee ? corporateTax : 0,
            dividendTax: dividendTax,
            dividendeBrut: dividendBase,
            dividendeNet: netDividends,
            cass: cass,
            cassDividend: cass,
            cassDividendCapped: cassBase > 0,
            employeeCost: laborCost
        }
    };
}
