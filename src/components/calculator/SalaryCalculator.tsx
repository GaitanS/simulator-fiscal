'use client';

import { useState, useMemo, useCallback, useId } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import dynamic from 'next/dynamic';
import { fiscalDAL } from '@/lib/dal';
import { TAX_RATES } from '@/lib/config/taxConfig';
import { InputField } from './InputField';
import { CurrencyToggle } from './CurrencyToggle';
import type { Currency, CIMCalculationResult } from '@/lib/dal/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Lazy load chart
const ResultsChart = dynamic(() => import('./ResultsChart').then(mod => ({ default: mod.ResultsChart })), {
    loading: () => <div className="h-64 md:h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />,
    ssr: false
});

export function SalaryCalculator() {
    const inputId = useId();

    // State
    const [inputValue, setInputValue] = useState<string>('5000');
    const [grossIncome, setGrossIncome] = useState<number>(5000);
    const [currency, setCurrency] = useState<Currency>('RON');
    const [fiscalPeriod, setFiscalPeriod] = useState<'JAN' | 'JUL'>('JAN');

    // Debounce
    const debouncedSetIncome = useDebouncedCallback((value: number) => {
        if (value >= 0 && value <= 10000000) {
            setGrossIncome(value);
        }
    }, 150);

    const handleInputChange = useCallback((value: string) => {
        setInputValue(value);
        const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue)) {
            debouncedSetIncome(numericValue);
        }
    }, [debouncedSetIncome]);

    const handleCurrencyChange = useCallback((newCurrency: Currency) => {
        const convertedValue = fiscalDAL.convertCurrency(grossIncome, currency, newCurrency);
        setGrossIncome(convertedValue);
        setInputValue(Math.round(convertedValue).toString());
        setCurrency(newCurrency);
    }, [grossIncome, currency]);

    // Calculation
    const result = useMemo<CIMCalculationResult | null>(() => {
        try {
            if (grossIncome <= 0) return null;
            const minWageOverride = fiscalPeriod === 'JUL' ? TAX_RATES.CONSTANTS.MINIMUM_WAGE_JULY_2026 : undefined;
            return fiscalDAL.calculateCIM(grossIncome, currency, minWageOverride);
        } catch (error) {
            return null;
        }
    }, [grossIncome, currency]);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Calculator Salariu 2026
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Simulare detaliată pentru Contract Individual de Muncă (CIM)
                </p>

                {/* Fiscal Period Toggle */}
                <div className="flex justify-center mt-4 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg inline-flex">
                    <button
                        onClick={() => setFiscalPeriod('JAN')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${fiscalPeriod === 'JAN'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        Ian - Iun 2026 (4.050 lei)
                    </button>
                    <button
                        onClick={() => setFiscalPeriod('JUL')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${fiscalPeriod === 'JUL'
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                            }`}
                    >
                        Iul - Dec 2026 (4.325 lei)
                    </button>
                </div>
            </div>

            <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-6 md:p-8 space-y-8">
                    {/* Input Section */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="w-full max-w-sm space-y-4">
                            <label htmlFor={inputId} className="block text-sm font-medium text-center text-slate-700 dark:text-slate-300">
                                Salariu Brut Lunar
                            </label>
                            <InputField
                                id={inputId}
                                value={inputValue}
                                onChange={handleInputChange}
                                currency={currency}
                            />
                            <CurrencyToggle value={currency} onChange={handleCurrencyChange} />
                        </div>
                    </div>

                    {/* Results Section */}
                    {result && (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-4">
                                {/* Breakdown List */}
                                <div className="space-y-6">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                                        Fluturaș de Salariu
                                    </h3>

                                    <dl className="space-y-4">
                                        <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                            <dt>Salariu Brut</dt>
                                            <dd className="font-semibold text-slate-900 dark:text-white">
                                                {fiscalDAL.formatCurrency(result.gross, currency)}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between items-center text-red-500/80">
                                            <dt>CAS (Pensie) 25%</dt>
                                            <dd className="font-medium">
                                                -{fiscalDAL.formatCurrency(result.breakdown.cas, currency)}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between items-center text-red-500/80">
                                            <dt>CASS (Sănătate) 10%</dt>
                                            <dd className="font-medium">
                                                -{fiscalDAL.formatCurrency(result.breakdown.cass, currency)}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between items-center text-red-500/80">
                                            <dt>Impozit pe venit 10%</dt>
                                            <dd className="font-medium">
                                                -{fiscalDAL.formatCurrency(result.breakdown.incomeTax, currency)}
                                            </dd>
                                        </div>

                                        {result.breakdown.personalDeduction > 0 && (
                                            <div className="flex justify-between items-center text-green-600 text-sm">
                                                <dt>Deducere Personală (Scutire)</dt>
                                                <dd>
                                                    {fiscalDAL.formatCurrency(result.breakdown.personalDeduction, currency)}
                                                </dd>
                                            </div>
                                        )}

                                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                            <dt className="text-xl font-bold text-slate-900 dark:text-white">Salariu Net</dt>
                                            <dd className="text-2xl font-bold text-green-600 dark:text-green-500">
                                                {fiscalDAL.formatCurrency(result.net, currency)}
                                            </dd>
                                        </div>

                                        <p className="text-xs text-center text-slate-400 mt-2">
                                            Aceasta este suma pe care o primești &quot;în mână&quot;.
                                        </p>

                                        {result.breakdown.cam > 0 && (
                                            <>
                                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                                    <h4 className="text-sm font-semibold text-slate-500 mb-3">Costuri Angajator</h4>
                                                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 text-sm">
                                                        <dt>CAM (2.25%)</dt>
                                                        <dd className="font-medium text-slate-900 dark:text-white">
                                                            {fiscalDAL.formatCurrency(result.breakdown.cam, currency)}
                                                        </dd>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center text-slate-500 text-sm font-semibold pt-2">
                                                    <dt>Salariu Complet</dt>
                                                    <dd className="text-slate-900 dark:text-white">
                                                        {fiscalDAL.formatCurrency(result.breakdown.completeSalary, currency)}
                                                    </dd>
                                                </div>
                                            </>
                                        )}
                                    </dl>
                                </div>

                                {/* Chart */}
                                <div className="h-64 lg:h-auto min-h-[300px]">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 text-center">
                                        Distribuția Banilor
                                    </h3>
                                    <ResultsChart result={result} currency={currency} />
                                </div>
                            </div>

                            {/* Percentage Bar & Summary Footer */}
                            {result.breakdown.completeSalary > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                    <p className="text-sm text-center text-slate-600 dark:text-slate-400">
                                        Pentru a plăti un salariu net de <strong className="text-slate-900 dark:text-white">{fiscalDAL.formatCurrency(result.net, currency)}</strong>,
                                        angajatorul cheltuie <strong className="text-slate-900 dark:text-white">{fiscalDAL.formatCurrency(result.breakdown.completeSalary, currency)}</strong>
                                    </p>

                                    <div className="h-6 w-full rounded-full overflow-hidden flex text-xs font-bold text-white shadow-inner">
                                        <div
                                            className="bg-green-600 flex items-center justify-center transition-all duration-500"
                                            style={{ width: `${(result.net / result.breakdown.completeSalary * 100).toFixed(2)}%` }}
                                        >
                                            {(result.net / result.breakdown.completeSalary * 100).toFixed(2)}% Angajat
                                        </div>
                                        <div
                                            className="bg-red-600 flex items-center justify-center transition-all duration-500"
                                            style={{ width: `${(100 - (result.net / result.breakdown.completeSalary * 100)).toFixed(2)}%` }}
                                        >
                                            {(100 - (result.net / result.breakdown.completeSalary * 100)).toFixed(2)}% Stat
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
