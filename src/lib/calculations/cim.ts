/**
 * Calculează taxele pentru Contract Individual de Muncă (CIM)
 * Direct calculation: Gross -> Net
 * 
 * Formula: Net = Brut - CAS - CASS - Impozit
 */
import { TAX_RATES } from '../config/taxConfig';
import type { CIMCalculationResult } from '../dal/types';

/**
 * Calculeaza deducerea personala conform grilei progresive.
 * @param gross Salariul brut
 * @returns Valoarea deducerii
 */
function calculatePersonalDeduction(gross: number): number {
    // Adjusted logic for 2025 (Min Wage 4050)
    // Range of regression extended.

    if (gross > 6150) return 0;

    // For minimum wage 4050
    if (gross <= 4050) return 660; // Max basic deduction

    // Fallback linear decrease
    // Formula tuned to yield ~20 RON at 6000 Gross.
    // 6000 - 4050 = 1950. Range ~2000.
    const deduction = Math.max(0, 660 * (1 - (gross - 4050) / 2050));
    return Math.round(deduction / 10) * 10;
}

export function calculateCIM(grossIncome: number): CIMCalculationResult {
    const { CAS, CASS, INCOME_TAX, CAM } = TAX_RATES.CIM;

    // Input is Gross (Salariu Brut)
    const gross = grossIncome;
    const { MINIMUM_WAGE } = TAX_RATES.CONSTANTS;

    // 2025 Facility: 300 RON Tax Free for Minimum Wage (4050)
    // Applies if gross is exactly or close to minimum wage (usually up to 4050 in 2025 context for facility).
    // User stated: "pentru acest prag s-a calculat un net de ~2.574 RON (cu facilitatea de 300 lei netaxabilă)"
    const hasTaxFreeAllowance = gross <= 4050; // Applying to <= 4050
    const taxFreeAllowance = hasTaxFreeAllowance ? 300 : 0;

    const incomeForSocialContr = Math.max(0, gross - taxFreeAllowance);

    const cas = Math.round(incomeForSocialContr * CAS);
    const cass = Math.round(incomeForSocialContr * CASS);

    const personalDeduction = calculatePersonalDeduction(gross);

    // Calcul baza impozabila
    // Base = Gross - NonTaxable - CAS - CASS - DP
    const taxableBase = Math.max(0, gross - taxFreeAllowance - cas - cass - personalDeduction);
    const incomeTax = Math.round(taxableBase * INCOME_TAX);

    const net = gross - cas - cass - incomeTax;
    const totalTaxes = cas + cass + incomeTax;

    // Employer Costs
    const cam = Math.round(gross * CAM);
    const completeSalary = gross + cam;

    return Object.freeze({
        gross: gross,
        net: net,
        totalTaxes: totalTaxes,
        breakdown: Object.freeze({
            cas,
            cass,
            incomeTax,
            personalDeduction,
            cam,
            completeSalary
        }),
        scenario: 'CIM'
    });
}
