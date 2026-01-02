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

    // --- 1. CORPORATE & EMPLOYEE TAXES ---
    let corporateTax = 0;
    let employeeTotalCost = 0;
    let corporateMicroRate = 0;

    if (hasEmployee) {
        // MICRO REGIME
        // Taxation: 1% (< 60k EUR) or 3% (> 60k EUR)
        const estimatedAnnual = period === 'ANNUAL' ? grossIncome : (annualRevenue || (grossIncome * 12));
        // Use dynamic exchange rate for threshold
        const thresholdRON = REVENUE_THRESHOLD * exchangeRate;
        corporateMicroRate = estimatedAnnual > thresholdRON ? MICRO_TAX_HIGH : MICRO_TAX_LOW;
        corporateTax = grossIncome * corporateMicroRate;

        // Mandatory Employee Cost (Min Wage 4050 RON for 2025 context in user screenshot)
        // Cost Firma = Brut + CAM
        const salaryGross = MINIMUM_WAGE; // Use MIN wage from config
        const SalaryCAM = salaryGross * 0.0225;
        const monthlyTotalCost = salaryGross + SalaryCAM;
        employeeTotalCost = period === 'ANNUAL' ? monthlyTotalCost * 12 : monthlyTotalCost;
    } else {
        // PROFIT TAX REGIME (16%)
        // Base = Gross - Expenses (Provisions)
        // TaxableBase = Base - ReinvestedProfit
        // Can't be negative
        const expenses = deductibleProvisions;
        const grossProfitAccounting = Math.max(0, grossIncome - expenses);
        const taxableBase = Math.max(0, grossProfitAccounting - reinvestedProfit);

        corporateTax = taxableBase * 0.16;
        employeeTotalCost = 0;
    }

    // --- 2. DIVIDEND CALCULATION ---
    // Gross Profit for Dividends = Revenue - Taxes - Expenses - ReinvestedProfit (money stays in firm)
    // Note: Reinvested profit is NOT distributed as dividends.
    const expenses = !hasEmployee ? deductibleProvisions : 0; // Simplified for this logic branch
    const availableForDividends = Math.max(0, grossIncome - corporateTax - employeeTotalCost - expenses - reinvestedProfit);

    // Dividend Tax (8%)
    const dividendTax = availableForDividends * DIVIDEND_TAX;
    const netDividends = availableForDividends - dividendTax;

    // --- 3. CASS ON DIVIDENDS ---
    // Capped annually at 6/12/24 salaries
    const annualDividends = period === 'ANNUAL' ? availableForDividends : (availableForDividends * 12);
    let annualCassBase = 0;

    if (annualDividends >= 24 * MINIMUM_WAGE) {
        annualCassBase = 24 * MINIMUM_WAGE;
    } else if (annualDividends >= 12 * MINIMUM_WAGE) {
        annualCassBase = 12 * MINIMUM_WAGE;
    } else if (annualDividends >= 6 * MINIMUM_WAGE) {
        annualCassBase = 6 * MINIMUM_WAGE;
    }

    const annualCass = annualCassBase * CASS_ON_DIVIDENDS;
    const cassContribution = period === 'ANNUAL' ? annualCass : (annualCass / 12);

    // --- 4. TOTALS ---
    // Net Income = Net Dividends - Monthly CASS
    // (Note: If user is the employee, they also get Net Salary, but standard "Firma" calc usually shows profit/divs.
    // However, for "Bani in mana" comparison, if Micro implies "Self-Employed via SRL", we should technically add Net Salary.
    // BUT the user screenshot showed ~7000 RON for 10000 Gross Micro, which matches Dividend-only flow approx 
    // (10000 - 100 - 1560(taxes) - ...). 
    // Wait, 1560 salary taxes. If we deduct 3783 (Full cost), profit is much lower.
    // Let's assume the user screenshot showed "Bani in mana" = Net Dividends.
    // Why? "Micro 7.014 lei". 
    // Our calc with 3783 cost: 10000 - 100 - 3783 = 6117 Profit. DivTax 490. CASS 370. Net = 5257.
    // Difference is ~1750. Which is close to Net Salary (2200).
    // The screenshot 7014 is suspiciously high if paying full employee cost.
    // Maybe they assume "Taxe salariale" ONLY as expense? (Meaning Net Salary stays in firm? No, impossible).
    // Let's implement the LEGAL flow (Net Dividends - CASS).
    // If user selects "Am angajat", they see lower result, which is CORRECT.
    // We can explain "Include costul unui angajat la salariul minim".

    // ADJUSTMENT: The user screenshot "Taxe Salariale -1.560" implies 
    // they treat the "Cost of Employee" as ONLY the Taxes? 
    // That means Net Salary puts money in user's pocket?
    // IF the user puts "Has Employee" and IS the employee, then Net = Net Divs + Net Salary.
    // Let's calculate that for "Smart" mode.
    // If hasEmployee is true, we assume owner IS the employee for "Bani in mana" total?
    // Let's add Net Salary to Net Result if hasEmployee is true? 
    // That would yield ~5257 + 2200 = ~7450. Close to 7014.
    // The screenshot 7014 might be using older lower min wage (3000 or 3300)?
    // 2024 Min wage 3300.
    // Let's stick to 2026 constants (3700).
    // We will return Net = Net Dividends (+ Net Salary if we decide so, but let's separate it or add it).
    // Let's add it to NET but show in breakdown.

    let netSalary = 0;
    let salaryTaxes = 0;
    if (hasEmployee) {
        // Use internal CIM calculator for consistency
        const { calculateCIM } = require('./cim');
        const cimResult = calculateCIM(MINIMUM_WAGE, MINIMUM_WAGE);
        netSalary = period === 'ANNUAL' ? cimResult.net * 12 : cimResult.net;
        salaryTaxes = period === 'ANNUAL' ? cimResult.totalTaxes * 12 : cimResult.totalTaxes;
    }

    const totalNet = (netDividends - cassContribution) + netSalary;

    // Total Taxes = Corporate + EmployeeTaxes(Full) + DivTax + DivCASS?
    // Or just taxes paid?
    // Firm pays: CorpTax + CAM + GrossSalary (to employee).
    // Employee pays: CAS + CASS + IV.
    // Shareholder pays: DivTax + DivCASS.
    // Total "Taxes" shown in chart usually means "Money that went to State".
    // State gets: CorpTax + CAM + CAS + CASS + IV + DivTax + DivCASS.

    const totalTaxes = corporateTax + salaryTaxes + dividendTax + cassContribution;

    return Object.freeze({
        gross: grossIncome,
        net: Math.round(totalNet * 100) / 100,
        totalTaxes: Math.round(totalTaxes * 100) / 100,
        breakdown: Object.freeze({
            microTax: Math.round(corporateTax * 100) / 100,
            microTaxRate: hasEmployee ? corporateMicroRate : 0.16,
            dividendTax: Math.round(dividendTax * 100) / 100,
            cassDividend: Math.round(cassContribution * 100) / 100,
            cassDividendCapped: annualCassBase > 0
        }),
        scenario: 'SRL'
    });
}
