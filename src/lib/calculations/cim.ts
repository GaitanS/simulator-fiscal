/**
 * Calculează taxele pentru Contract Individual de Muncă (CIM)
 * Direct calculation: Gross -> Net
 * 
 * Formula: Net = Brut - CAS - CASS - Impozit
 */
import { TAX_RATES } from '../config/taxConfig';
import type { CIMCalculationResult } from '../dal/types';

/**
 * Calculeaza deducerea personala conform grilei progresive Art. 77 Cod Fiscal.
 * @param gross Salariul brut lunar
 * @param minWage Salariul minim brut pe tara
 * @param dependents Numarul de persoane în întreținere
 * @returns Valoarea deducerii personale de baza
 */
function calculateBasePersonalDeduction(gross: number, minWage: number, dependents: number = 0): number {
    const threshold = minWage + 2000;
    if (gross > threshold) return 0;

    // Start percentages for different dependent counts
    const basePercentages: Record<number, number> = {
        0: 0.20,
        1: 0.25,
        2: 0.30,
        3: 0.35,
        4: 0.45
    };

    // Calculate how many 50 RON steps above minimum wage
    const amountAboveMin = Math.max(0, gross - minWage);
    const steps = Math.floor(amountAboveMin / 50) + (amountAboveMin > 0 ? 1 : 0);

    // Each step decreases the percentage by 0.5%
    const reduction = (steps - 1) * 0.005;
    const startPercentage = basePercentages[Math.min(dependents, 4)] || 0.20;

    const finalPercentage = Math.max(0, startPercentage - reduction);

    return Math.round(minWage * finalPercentage);
}

/**
 * Calculeaza deducerea personala suplimentara.
 */
function calculateSupplementaryDeduction(
    gross: number,
    minWage: number,
    isUnder26: boolean,
    childrenInSchool: number,
    youthRate: number,
    perChildAmount: number
): number {
    let total = 0;

    // a) 15% out of min wage for youth < 26 with gross <= threshold
    if (isUnder26 && gross <= (minWage + 2000)) {
        total += Math.round(minWage * youthRate);
    }

    // b) 100 RON per child in school
    total += childrenInSchool * perChildAmount;

    return total;
}

export function calculateCIM(
    grossIncome: number,
    minWageOverride?: number,
    options?: {
        dependentsCount?: number;
        isUnder26?: boolean;
        childrenInSchoolCount?: number;
    }
): CIMCalculationResult {
    const { CAS, CASS, INCOME_TAX, CAM, DEDUCTION_YOUTH_RATE, DEDUCTION_PER_CHILD } = TAX_RATES.CIM;
    const MINIMUM_WAGE = minWageOverride || TAX_RATES.CONSTANTS.MINIMUM_WAGE;

    // Input is Gross (Salariu Brut)
    const gross = grossIncome;

    // 2025 Facility: 300 RON Tax Free for Minimum Wage (4050)
    const hasTaxFreeAllowance = gross <= MINIMUM_WAGE;
    const taxFreeAllowance = hasTaxFreeAllowance ? 300 : 0;

    const incomeForSocialContr = Math.max(0, gross - taxFreeAllowance);

    const cas = Math.round(incomeForSocialContr * CAS);
    const cass = Math.round(incomeForSocialContr * CASS);

    const baseDeduction = calculateBasePersonalDeduction(gross, MINIMUM_WAGE, options?.dependentsCount);
    const supplementaryDeduction = calculateSupplementaryDeduction(
        gross,
        MINIMUM_WAGE,
        options?.isUnder26 ?? false,
        options?.childrenInSchoolCount ?? 0,
        DEDUCTION_YOUTH_RATE,
        DEDUCTION_PER_CHILD
    );
    const totalPersonalDeduction = baseDeduction + supplementaryDeduction;

    // Calcul baza impozabila
    const taxableBase = Math.max(0, gross - taxFreeAllowance - cas - cass - totalPersonalDeduction);
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
            personalDeduction: totalPersonalDeduction,
            baseDeduction,
            supplementaryDeduction,
            cam,
            completeSalary
        }),
        scenario: 'CIM'
    });
}
