/**
 * Calculează taxele pentru PFA (Sistem Real)
 * Direct calculation: Gross (Facturat) -> Net
 */
import { getTaxRatesForYear, type FiscalYear } from '../config/taxConfig';
import type { CalculationResult } from '../dal/types';

export function calculatePFA(
    grossIncome: number,
    period: 'MONTHLY' | 'ANNUAL' = 'ANNUAL',
    options?: { // Add options for expenses
        expenses?: number;
        isPensioner?: boolean;
    },
    fiscalYear: FiscalYear = 2025
): CalculationResult {
    const rates = getTaxRatesForYear(fiscalYear);
    const { CAS, CASS, INCOME_TAX, CAS_CAP_LOW, CAS_CAP_HIGH, CASS_CAPS } = rates.PFA;
    const { MINIMUM_WAGE } = rates.CONSTANTS; // 4050

    const revenue = period === 'ANNUAL' ? grossIncome : grossIncome * 12;
    const expenses = options?.expenses || 0; // Support expense passing
    const netIncome = Math.max(0, revenue - expenses); // Profit Real

    // --- CAS (Pensie) ---
    // Tiers: 12 or 24 salaries based on Net Income (Strict Legal)
    // 2026 Norms: 24 Sal = 97.200 RON. 12 Sal = 48.600 RON.
    let casBaseSummary = 0;
    if (!options?.isPensioner) {
        if (netIncome >= CAS_CAP_HIGH * MINIMUM_WAGE) {
            casBaseSummary = CAS_CAP_HIGH * MINIMUM_WAGE; // 24 salaries
        } else if (netIncome >= CAS_CAP_LOW * MINIMUM_WAGE) {
            casBaseSummary = CAS_CAP_LOW * MINIMUM_WAGE; // 12 salaries
        }
        // Below 12 salaries: Optional (0 for strict calculator)
    }
    const cas = casBaseSummary * CAS;

    // --- CASS (Sanatate) ---
    // 10% of Net Income (Profit Real), capped at 60 (2025) or 72 (2026) salaries.
    // User requested "Strict Legal" and confirmed 72 salaries cap for 2026.

    // Determine Max Cap based on year logic or config
    // Config CASS_CAPS is [6, 12, 24, 72]. 72 is the 2026 cap.
    // 2025 cap was 60.
    const maxCassCap = fiscalYear === 2026 ? 72 : 60;

    let cassBase = netIncome;
    if (cassBase > maxCassCap * MINIMUM_WAGE) {
        cassBase = maxCassCap * MINIMUM_WAGE;
    }

    // Floor of 6 salaries if income exists?
    // STRICT LEGAL: If Net Income > 0, Min Base is 6 salaries (unless exception).
    const minCassBase = 6 * MINIMUM_WAGE;
    if (netIncome > 0 && cassBase < minCassBase) {
        cassBase = minCassBase;
    }
    // Note: If netIncome is huge (100k), floor is irrelevant.

    const cass = cassBase * CASS;

    // --- INCOME TAX (10% or 16%) ---
    // Formula: (NetIncome - CAS - CASS) * Rate
    // Rate is dynamic based on fiscalYear (10% or 16%).
    const taxableIncome = Math.max(0, netIncome - cas - cass);
    const incomeTax = taxableIncome * INCOME_TAX;

    const totalTaxes = cas + cass + incomeTax;
    const net = netIncome - totalTaxes; // Net In Hand

    return {
        gross: revenue,
        net: period === 'ANNUAL' ? net : (net / 12),
        netMonthly: net / 12,
        totalTaxes: period === 'ANNUAL' ? totalTaxes : (totalTaxes / 12),
        breakdown: {
            venituri: revenue,
            cheltuieli: expenses,
            netIncome: netIncome,
            cas: cas,
            casCapped: cas > 0, // CAS is always at a tier (cap) if paid
            cass: cass,
            cassCapped: cassBase >= maxCassCap * MINIMUM_WAGE,
            incomeTax: incomeTax
        }
    };
}
