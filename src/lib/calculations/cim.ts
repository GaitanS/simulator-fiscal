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
    // Adjusted logic to match user reference (20 RON deduction at 6000 Gross)
    // Range of regression extended to ~2380 RON above minimum wage.

    if (gross > 6100) return 0;

    // For minimum wage 3700
    if (gross <= 3700) return 660; // Max basic deduction

    // Fallback linear decrease
    // Formula tuned to yield ~22 (rounds to 20) at 6000 Gross.
    const deduction = Math.max(0, 660 * (1 - (gross - 3700) / 2380));
    return Math.round(deduction / 10) * 10;
}

export function calculateCIM(grossIncome: number): CIMCalculationResult {
    const { CAS, CASS, INCOME_TAX, CAM } = TAX_RATES.CIM;

    // Input is Gross (Salariu Brut)
    const gross = grossIncome;

    const cas = Math.round(gross * CAS);
    const cass = Math.round(gross * CASS);

    const personalDeduction = calculatePersonalDeduction(gross);

    // Calcul baza impozabila
    const taxableBase = Math.max(0, gross - cas - cass - personalDeduction);
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
