/**
 * Calculează taxele pentru PFA (Sistem Real)
 * Direct calculation: Gross (Facturat) -> Net
 */
import { TAX_RATES } from '../config/taxConfig';
import type { CalculationResult } from '../dal/types';

export function calculatePFA(
    grossIncome: number,
    isPensioner: boolean = false,
    isHandicapped: boolean = false
): CalculationResult {
    const { CAS, CASS, INCOME_TAX, CAS_CAP_LOW, CAS_CAP_HIGH, CASS_CAPS } = TAX_RATES.PFA;
    const { MINIMUM_WAGE } = TAX_RATES.CONSTANTS;

    // Venit anual estimat (gross * 12 pentru plafoane anuale)
    // Dar simulatorul e lunar. Vom raporta plafoanele la luna pentru simplificare,
    // sau consideram gross ca anual / 12.
    // Conventie: Inputul e lunar. Plafoanele se calculeaza anual si se impart la 12.

    const annualGross = grossIncome * 12;
    const minWageAnnual = MINIMUM_WAGE * 12;

    // --- CAS (Pensie) ---
    // Se plateste daca venitul >= 12 salarii
    // Baza de calcul: 
    // - intre 12 si 24 salarii: la nivelul a 12 salarii (min) sau ales de contrib (ne vom limita la minim obligatoriu)
    // - peste 24 salarii: la nivelul a 24 salarii

    let casBase = 0;
    if (!isPensioner) { // Pensioners are exempt from CAS
        if (annualGross >= CAS_CAP_HIGH * MINIMUM_WAGE) {
            casBase = CAS_CAP_HIGH * MINIMUM_WAGE;
        } else if (annualGross >= CAS_CAP_LOW * MINIMUM_WAGE) {
            casBase = CAS_CAP_LOW * MINIMUM_WAGE;
        }
    }

    const annualCas = casBase * CAS;
    const monthlyCas = annualCas / 12;
    const casCapped = casBase > 0;

    // --- CASS (Sanatate) ---
    // Plafoane: 6, 12, 24, 60 salarii
    // 10% din venitul net fiscal (brut - cheltuieli), dar nu mai putin de 6 salarii si nu mai mult de 60
    // Simplificare: consideram brut = venit net fiscal (fara cheltuieli deductibile in simulator simplu)

    let cassBase = annualGross;

    // Plafonare minima (6 salarii)
    if (cassBase < CASS_CAPS[0] * MINIMUM_WAGE) {
        // Daca e sub 6 salarii, se plateste la 6 salarii
        cassBase = CASS_CAPS[0] * MINIMUM_WAGE;
    }

    // Plafonare maxima (60 salarii)
    if (cassBase > CASS_CAPS[3] * MINIMUM_WAGE) {
        cassBase = CASS_CAPS[3] * MINIMUM_WAGE;
    }

    const annualCass = cassBase * CASS;
    const monthlyCass = annualCass / 12;
    const cassCapped = annualGross > (CASS_CAPS[3] * MINIMUM_WAGE);

    // --- Impozit pe Venit ---
    // (Brut - CAS - CASS) * 10%
    // Atentie: CAS-ul deductibil este cel efectiv platit.
    // CASS-ul este deductibil limitat sau integral? In sistem real, CASS este deductibil.

    const taxableBase = Math.max(0, grossIncome - monthlyCas - monthlyCass);
    const incomeTax = isHandicapped ? 0 : (taxableBase * INCOME_TAX);

    const totalTaxes = monthlyCas + monthlyCass + incomeTax;
    const net = grossIncome - totalTaxes;

    return Object.freeze({
        gross: grossIncome,
        net: Math.round(net * 100) / 100,
        totalTaxes: Math.round(totalTaxes * 100) / 100,
        breakdown: Object.freeze({
            cas: Math.round(monthlyCas * 100) / 100,
            cass: Math.round(monthlyCass * 100) / 100,
            incomeTax: Math.round(incomeTax * 100) / 100,
            casCapped,
            cassCapped
        }),
        scenario: 'PFA'
    });
}
