/**
 * 🔐 DATA ACCESS LAYER - Type Definitions
 * 
 * Strict TypeScript types for all fiscal data.
 * All types are readonly to ensure immutability.
 * 
 * @module lib/dal/types
 */

// =============================================================================
// TAX RATE TYPES
// =============================================================================

/**
 * CIM (Contract Individual de Muncă) tax rates
 */
export interface CIMRates {
  /** CAS - Contribuție Asigurări Sociale: 25% */
  readonly CAS: number;
  /** CASS - Contribuție Asigurări Sociale de Sănătate: 10% */
  readonly CASS: number;
  /** Impozit pe venit: 10% */
  readonly INCOME_TAX: number;
  /** Deducere personală în RON (maximă/bază) */
  readonly PERSONAL_DEDUCTION: number;
  /** CAM - Contribuție Asiguratorie pentru Muncă: 2.25% */
  readonly CAM: number;
  /** Deducere tineri sub 26 (15% din salariu minim) */
  readonly DEDUCTION_YOUTH_RATE: number;
  /** Deducere per copil (100 RON) */
  readonly DEDUCTION_PER_CHILD: number;
}

/**
 * PFA (Persoană Fizică Autorizată) tax rates
 */
export interface PFARates {
  /** CAS: 25% */
  readonly CAS: number;
  /** Plafon CAS inferior (multiplicator salariu minim) */
  readonly CAS_CAP_LOW: number;
  /** Plafon CAS superior (multiplicator salariu minim) */
  readonly CAS_CAP_HIGH: number;
  /** CASS: 10% */
  readonly CASS: number;
  /** Plafoane CASS (multiplicatori salariu minim) */
  readonly CASS_CAPS: readonly number[];
  /** Impozit pe venit: 10% */
  readonly INCOME_TAX: number;
}

/**
 * SRL Microîntreprindere tax rates
 */
export interface SRLRates {
  /** Impozit micro sub prag: 1% */
  readonly MICRO_TAX_LOW: number;
  /** Impozit micro peste prag: 3% */
  readonly MICRO_TAX_HIGH: number;
  /** Prag cifră de afaceri în EUR */
  readonly REVENUE_THRESHOLD: number;
  /** Impozit dividende: 8% */
  readonly DIVIDEND_TAX: number;
  /** CASS pe dividende: 10% */
  readonly CASS_ON_DIVIDENDS: number;
  /** Plafon CASS dividende (multiplicator salariu minim) */
  readonly CASS_CAP_DIVIDEND: number;
}

/**
 * Constante fiscale generale
 */
export interface FiscalConstants {
  /** Salariul minim brut în RON (2026) */
  readonly MINIMUM_WAGE: number;
  /** Salariul minim brut iulie 2026 */
  readonly MINIMUM_WAGE_JULY_2026: number;
  /** Curs valutar EUR/RON fix */
  readonly EUR_RON_RATE: number;
}

/**
 * Container principal pentru toate ratele fiscale
 */
export interface TaxRates {
  readonly CIM: Readonly<CIMRates>;
  readonly PFA: Readonly<PFARates>;
  readonly SRL: Readonly<SRLRates>;
  readonly CONSTANTS: Readonly<FiscalConstants>;
}

// =============================================================================
// CALCULATION RESULT TYPES
// =============================================================================

/**
 * Defalcare taxe CIM
 */
export interface CIMBreakdown {
  readonly cas: number;
  readonly cass: number;
  readonly incomeTax: number;
  readonly personalDeduction: number;
  /** Costuri Angajator */
  readonly cam: number;
  readonly baseDeduction: number;
  readonly supplementaryDeduction: number;
  readonly completeSalary: number;
}

/**
 * Defalcare taxe PFA
 */
export interface PFABreakdown {
  readonly venituri?: number;
  readonly cheltuieli?: number;
  readonly netIncome?: number;
  readonly cas: number;
  readonly casCapped: boolean;
  readonly cass: number;
  readonly cassCapped: boolean;
  readonly incomeTax: number;
}

/**
 * Defalcare taxe SRL
 */
export interface SRLBreakdown {
  readonly venituri?: number;
  readonly cheltuieli?: number;
  readonly salarii?: number;
  readonly platiSalarii?: number;
  readonly microTax: number;
  readonly microTaxRate?: number;
  readonly profitTax?: number;
  readonly dividendTax: number;
  readonly dividendeBrut?: number;
  readonly dividendeNet?: number;
  readonly cassDividend?: number;
  readonly cass?: number; // Alias for cassDividend
  readonly cassDividendCapped?: boolean;
  readonly employeeCost?: number;
}

/**
 * Union type pentru toate breakdown-urile
 */
export type TaxBreakdown = CIMBreakdown | PFABreakdown | SRLBreakdown;

/**
 * Rezultat calcul fiscal
 */
export interface CalculationResult {
  /** Salariu/Venit brut necesar */
  readonly gross: number;
  /** Salariu/Venit net rezultat */
  readonly net: number;
  /** Salariu net lunar (opțional) */
  readonly netMonthly?: number;
  /** Total taxe plătite */
  readonly totalTaxes: number;
  /** Defalcare detaliată taxe */
  readonly breakdown: TaxBreakdown;
  /** Tipul scenariului */
  readonly scenario: ScenarioType;
}

/**
 * Rezultat calcul CIM specific
 */
export interface CIMCalculationResult extends CalculationResult {
  readonly scenario: 'CIM';
  readonly breakdown: CIMBreakdown;
}

/**
 * Rezultat calcul PFA specific
 */
export interface PFACalculationResult extends CalculationResult {
  readonly scenario: 'PFA';
  readonly breakdown: PFABreakdown;
}

/**
 * Rezultat calcul SRL specific
 */
export interface SRLCalculationResult extends CalculationResult {
  readonly scenario: 'SRL';
  readonly breakdown: SRLBreakdown;
}

// =============================================================================
// ENUM TYPES
// =============================================================================

/**
 * Tipuri de scenarii fiscale
 */
export type ScenarioType = 'CIM' | 'PFA' | 'SRL';

/**
 * Monede suportate
 */
export type Currency = 'RON' | 'EUR';

// =============================================================================
// INPUT TYPES
// =============================================================================

/**
 * Input pentru calcul fiscal
 */
export interface CalculationInput {
  /** Venitul brut/facturat (baza de calcul) */
  grossIncome: number;
  /** Moneda */
  currency: Currency;
  /** Scenariul fiscal */
  scenario: ScenarioType;
  /** Anul fiscal (2025 sau 2026) */
  fiscalYear?: 2025 | 2026;
  /** Cifra de afaceri anuală (pentru SRL) */
  annualRevenue?: number;
  /** SRL: Are angajat? (Micro vs Profit) */
  hasEmployee?: boolean;
  /** PFA: Este pensionar? (Scutire CAS) */
  isPensioner?: boolean;
  /** PFA: Este persoană cu handicap? (Scutire Impozit) */
  /** PFA: Este persoană cu handicap? (Scutire Impozit) */
  isHandicapped?: boolean;
  /** SRL: Profit Reinvestit (scutit de impozit profit) */
  reinvestedProfit?: number;
  /** SRL: Provizioane deductibile (scade baza impozabilă) */
  deductibleProvisions?: number;
  /** CIM: Persons in care */
  dependentsCount?: 0 | 1 | 2 | 3 | 4;
  /** CIM: If under 26 */
  isUnder26?: boolean;
  /** CIM: Children in school */
  childrenInSchoolCount?: number;
}

/**
 * Input pentru conversie valutară
 */
export interface CurrencyConversionInput {
  /** Suma de convertit */
  amount: number;
  /** Moneda sursă */
  from: Currency;
  /** Moneda destinație */
  to: Currency;
}

// =============================================================================
// COMPARISON TYPES
// =============================================================================

/**
 * Rezultat comparație între toate scenariile
 */
export interface ComparisonResult {
  readonly CIM: CIMCalculationResult;
  readonly PFA: PFACalculationResult;
  readonly SRL: SRLCalculationResult;
  /** Scenariul cel mai eficient (cost minim) */
  readonly optimal: ScenarioType;
  /** Economii față de cel mai scump scenariu */
  readonly savings: number;
}

/**
 * Rezultat comparație Freelance (PFA vs Micro vs Profit)
 */
export interface FreelanceComparisonResult {
  readonly PFA: PFACalculationResult;
  readonly Micro: SRLCalculationResult;
  readonly Profit: SRLCalculationResult;
  readonly optimal: 'PFA' | 'Micro' | 'Profit';
  readonly savings: number;
}

/**
 * Date pentru graficul donut
 */
export interface ChartDataPoint {
  readonly name: string;
  readonly value: number;
  readonly fill: string;
}
