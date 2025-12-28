/**
 * 🛡️ INPUT VALIDATORS
 * 
 * Zod schemas for strict input validation.
 * All inputs must pass validation before reaching the calculation engine.
 * 
 * @module lib/dal/validators
 */

import { z } from 'zod';

// =============================================================================
// BASE SCHEMAS
// =============================================================================

/**
 * Schema pentru valori monetare
 * - Trebuie să fie număr finit
 * - Trebuie să fie pozitiv sau zero
 * - Maximum 10 milioane (pentru a preveni overflow)
 */
const MonetaryValueSchema = z.number({
    required_error: 'Valoarea este obligatorie',
    invalid_type_error: 'Valoarea trebuie să fie un număr'
})
    .finite('Valoarea trebuie să fie un număr finit')
    .nonnegative('Valoarea trebuie să fie pozitivă sau zero')
    .max(10000000, 'Valoarea maximă este 10.000.000');

/**
 * Schema pentru monedă
 */
const CurrencySchema = z.enum(['RON', 'EUR'], {
    required_error: 'Moneda este obligatorie',
    invalid_type_error: 'Moneda trebuie să fie RON sau EUR'
});

/**
 * Schema pentru scenariu fiscal
 */
const ScenarioSchema = z.enum(['CIM', 'PFA', 'SRL'], {
    required_error: 'Scenariul este obligatoriu',
    invalid_type_error: 'Scenariul trebuie să fie CIM, PFA sau SRL'
});

// =============================================================================
// SMART OPTIONS SCHEMA
// =============================================================================

export const SmartOptionsSchema = z.object({
    isPensioner: z.boolean().optional(),
    isHandicapped: z.boolean().optional(),
    hasEmployee: z.boolean().optional()
});

// =============================================================================
// CALCULATION INPUT SCHEMA
// =============================================================================

/**
 * Schema completă pentru input-ul calculului fiscal
 */
export const CalculationInputSchema = z.object({
    /**
     * Venitul brut/facturat dorit
     */
    grossIncome: MonetaryValueSchema,

    /**
     * Moneda în care se face calculul
     */
    currency: CurrencySchema,

    /**
     * Scenariul fiscal (CIM, PFA sau SRL)
     */
    scenario: ScenarioSchema,

    /**
     * Cifra de afaceri anuală (opțional, necesar pentru SRL)
     * Folosită pentru a determina rata impozitului micro (1% vs 3%)
     */
    annualRevenue: MonetaryValueSchema.optional()
}).strict();

/**
 * Schema parțială pentru doar venitul net
 */
export const NetIncomeOnlySchema = CalculationInputSchema.pick({
    grossIncome: true
});

// =============================================================================
// CURRENCY CONVERSION SCHEMA
// =============================================================================

/**
 * Schema pentru conversie valutară
 */
export const CurrencyConversionSchema = z.object({
    /** Suma de convertit */
    amount: MonetaryValueSchema,
    /** Moneda sursă */
    from: CurrencySchema,
    /** Moneda destinație */
    to: CurrencySchema
}).strict();

// =============================================================================
// COMPARISON INPUT SCHEMA
// =============================================================================

/**
 * Schema pentru input-ul comparației
 */
export const ComparisonInputSchema = z.object({
    /** Venitul brut dorit */
    grossIncome: MonetaryValueSchema,
    /** Moneda */
    currency: CurrencySchema,
    /** Cifra de afaceri anuală pentru SRL */
    annualRevenue: MonetaryValueSchema.optional()
}).strict();

/**
 * Schema pentru input-ul comparației Freelance
 */
export const FreelanceInputSchema = z.object({
    grossIncome: MonetaryValueSchema,
    currency: CurrencySchema,
    options: SmartOptionsSchema.optional()
});

// =============================================================================
// TYPE EXPORTS (inferite din schemas)
// =============================================================================

export type ValidatedCalculationInput = z.infer<typeof CalculationInputSchema>;
export type ValidatedNetIncomeOnly = z.infer<typeof NetIncomeOnlySchema>;
export type ValidatedCurrencyConversion = z.infer<typeof CurrencyConversionSchema>;
export type ValidatedComparisonInput = z.infer<typeof ComparisonInputSchema>;
export type ValidatedFreelanceInput = z.infer<typeof FreelanceInputSchema>;

// =============================================================================
// VALIDATION FUNCTIONS
// =============================================================================

/**
 * Validează input-ul pentru calcul
 * @throws ZodError dacă validarea eșuează
 */
export function validateCalculationInput(input: unknown): ValidatedCalculationInput {
    return CalculationInputSchema.parse(input);
}

/**
 * Validează doar venitul net
 * @throws ZodError dacă validarea eșuează
 */
export function validateNetIncome(input: unknown): ValidatedNetIncomeOnly {
    return NetIncomeOnlySchema.parse(input);
}

/**
 * Validează input-ul pentru conversie valutară
 * @throws ZodError dacă validarea eșuează
 */
export function validateCurrencyConversion(input: unknown): ValidatedCurrencyConversion {
    return CurrencyConversionSchema.parse(input);
}

/**
 * Validează input-ul pentru comparație
 * @throws ZodError dacă validarea eșuează
 */
export function validateComparisonInput(input: unknown): ValidatedComparisonInput {
    return ComparisonInputSchema.parse(input);
}

// =============================================================================
// SAFE VALIDATION (cu return type Result)
// =============================================================================

export type ValidationResult<T> =
    | { success: true; data: T }
    | { success: false; error: z.ZodError };

/**
 * Validare sigură fără throw
 */
export function safeValidateCalculationInput(input: unknown): ValidationResult<ValidatedCalculationInput> {
    const result = CalculationInputSchema.safeParse(input);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
}

/**
 * Validare sigură pentru comparație
 */
export function safeValidateComparisonInput(input: unknown): ValidationResult<ValidatedComparisonInput> {
    const result = ComparisonInputSchema.safeParse(input);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
}
