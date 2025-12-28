import { TaxRates } from '../dal/types';

const TAX_RATES: TaxRates = Object.freeze({
    CIM: Object.freeze({
        CAS: 0.25,
        CASS: 0.10,
        INCOME_TAX: 0.10,
        PERSONAL_DEDUCTION: 660, // Basic deduction, dynamic logic to be added
        CAM: 0.0225
    }),
    PFA: Object.freeze({
        CAS: 0.25,
        CAS_CAP_LOW: 12,
        CAS_CAP_HIGH: 24,
        CASS: 0.10,
        CASS_CAPS: Object.freeze([6, 12, 24, 60]),
        INCOME_TAX: 0.10
    }),
    SRL: Object.freeze({
        MICRO_TAX_LOW: 0.01,
        MICRO_TAX_HIGH: 0.03,
        REVENUE_THRESHOLD: 60000,
        DIVIDEND_TAX: 0.08,
        CASS_ON_DIVIDENDS: 0.10,
        CASS_CAP_DIVIDEND: 24
    }),
    CONSTANTS: Object.freeze({
        MINIMUM_WAGE: 4050,
        MINIMUM_WAGE_JULY_2026: 4325,
        EUR_RON_RATE: 5.0
    })
});

export { TAX_RATES };
