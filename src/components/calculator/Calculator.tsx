'use client';

/**
 * CALCULATOR COMPONENT
 * 
 * Main orchestrator for fiscal calculations.
 * 
 * @accessibility
 * - All inputs have proper labels and ARIA attributes
 * - Focus states are visible and consistent
 * - Keyboard navigation supported
 * - Screen reader announcements for calculation updates
 * 
 * @performance
 * - Debounced input handling (150ms)
 * - Memoized calculation results
 * - Dynamic imports for chart component
 */

import { useState, useMemo, useCallback, useId, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import dynamic from 'next/dynamic';
import { fiscalDAL } from '@/lib/dal';
import type { Currency, ScenarioType, ComparisonResult } from '@/lib/dal/types';

// Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { InputField } from './InputField';
import { CurrencyToggle } from './CurrencyToggle';
import { ComparisonView } from './ComparisonView';
import { ScenarioDetails } from './ScenarioDetails';

// Lazy load chart for better initial load
const ResultsChart = dynamic(() => import('./ResultsChart').then(mod => ({ default: mod.ResultsChart })), {
    loading: () => <ChartSkeleton />,
    ssr: false
});

// Types
interface CalculatorProps {
    /** Initial net income value */
    initialValue?: number;
    /** Initial currency */
    initialCurrency?: Currency;
    /** Callback when calculation changes */
    onCalculationChange?: (result: ComparisonResult) => void;
}

/**
 * Main Calculator Component
 */
export function Calculator({
    initialValue = 10000,
    initialCurrency = 'RON',
    onCalculationChange
}: CalculatorProps) {
    // Generate unique IDs for accessibility
    const inputId = useId();
    const resultsId = useId();

    // BNR State
    const [bnrRate, setBnrRate] = useState<number | null>(null);
    const [bnrDate, setBnrDate] = useState<string | null>(null);

    // Initial fetch of BNR rate
    useEffect(() => {
        const fetchRate = async () => {
            try {
                const res = await fetch('/api/bnr');
                if (res.ok) {
                    const data = await res.json();
                    if (data.rate) {
                        setBnrRate(data.rate);
                        setBnrDate(data.date);
                        fiscalDAL.updateExchangeRate(data.rate);

                        // Force update if needed, though DAL calculation is synchronous 
                        // and depends on render cycle. But wait, local state update (setBnrRate) 
                        // will trigger re-render of component.
                        // However, we need to ensure calculations use valid rate
                        // We might need to trigger a recalc if currency is EUR.
                    }
                }
            } catch (err) {
                console.error('Failed to fetch BNR rate', err);
            }
        };
        fetchRate();
    }, []);

    // State
    const [inputValue, setInputValue] = useState<string>(initialValue.toString());
    const [grossIncome, setGrossIncome] = useState<number>(initialValue);
    const [currency, setCurrency] = useState<Currency>(initialCurrency);
    const [activeTab, setActiveTab] = useState<ScenarioType>('CIM');

    // Smart Options State
    const [options, setOptions] = useState({
        hasEmployee: true,
        isPensioner: false,
        isHandicapped: false
    });

    // Debounced calculation update
    const debouncedSetIncome = useDebouncedCallback((value: number) => {
        if (value >= 0 && value <= 10000000) {
            setGrossIncome(value);
        }
    }, 150);

    // Input change handler
    const handleInputChange = useCallback((value: string) => {
        setInputValue(value);
        const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue)) {
            debouncedSetIncome(numericValue);
        }
    }, [debouncedSetIncome]);

    // Currency change handler
    const handleCurrencyChange = useCallback((newCurrency: Currency) => {
        const convertedValue = fiscalDAL.convertCurrency(grossIncome, currency, newCurrency);
        setGrossIncome(convertedValue);
        setInputValue(Math.round(convertedValue).toString());
        setCurrency(newCurrency);
    }, [grossIncome, currency]);

    // Memoized calculation
    const comparison = useMemo<ComparisonResult | null>(() => {
        try {
            if (grossIncome <= 0) return null;
            const result = fiscalDAL.compareAll(grossIncome, currency, options);
            onCalculationChange?.(result);
            return result;
        } catch (error) {
            console.error('Calculation error:', error);
            return null;
        }
    }, [grossIncome, currency, options, onCalculationChange]);

    // Current scenario result
    const currentResult = comparison?.[activeTab] ?? null;

    return (
        <div
            className="calculator w-full max-w-6xl mx-auto space-y-6 md:space-y-8"
            role="application"
            aria-label="Calculator fiscal pentru România 2026"
        >
            {/* Input Section */}
            <Card className="border-0 shadow-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
                <CardHeader className="text-center pb-4">
                    <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                        Calculează-ți Taxele
                    </CardTitle>
                    <CardDescription className="text-slate-400 text-sm md:text-base">
                        Introdu venitul BRUT / FACTURAT lunar pentru a afla cât îți rămâne
                    </CardDescription>
                </CardHeader>

                <CardContent className="pb-8">
                    <div className="flex flex-col items-center gap-4 md:gap-6">
                        {/* Input Field */}
                        <div className="w-full max-w-sm">
                            <Label
                                htmlFor={inputId}
                                className="sr-only"
                            >
                                Venit brut / facturat în {currency}
                            </Label>
                            <InputField
                                id={inputId}
                                value={inputValue}
                                onChange={handleInputChange}
                                currency={currency}
                                aria-describedby={resultsId}
                            />
                        </div>

                        {/* Currency Toggle */}
                        <CurrencyToggle
                            value={currency}
                            onChange={handleCurrencyChange}
                            aria-label="Selectează moneda"
                        />

                        {/* BNR Badge */}
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-medium text-slate-300">
                                Curs BNR {bnrDate ? `(${new Date(bnrDate).toLocaleDateString('ro-RO')})` : ''}:
                                <span className="text-white ml-1 font-bold">
                                    {bnrRate ? bnrRate.toFixed(4) : fiscalDAL.getExchangeRate().toFixed(4)} RON
                                </span>
                            </span>
                        </div>

                        {/* Advanced Options Accordion */}
                        <div className="w-full max-w-sm pt-2">
                            <details className="group rounded-xl bg-slate-800/20 border border-slate-700/30 overflow-hidden open:pb-3">
                                <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none text-slate-300 hover:text-white transition-colors text-sm font-medium focus:outline-none">
                                    <span>Opțiuni Avansate & Scutiri</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <div className="px-4 pt-1 space-y-3">
                                    {/* PFA Options */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">PFA (Sistem Real)</p>
                                        <label className="flex items-start gap-3 cursor-pointer group/label">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0"
                                                    checked={options.isPensioner}
                                                    onChange={e => setOptions(prev => ({ ...prev, isPensioner: e.target.checked }))}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-300 group-hover/label:text-white transition-colors">Sunt pensionar</span>
                                                <span className="text-xs text-slate-500">Scutire de la plata CAS (Pensie)</span>
                                            </div>
                                        </label>

                                        <label className="flex items-start gap-3 cursor-pointer group/label">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0"
                                                    checked={options.isHandicapped}
                                                    onChange={e => setOptions(prev => ({ ...prev, isHandicapped: e.target.checked }))}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-300 group-hover/label:text-white transition-colors">Persoană cu handicap</span>
                                                <span className="text-xs text-slate-500">Scutire de Impozit pe Venit</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="h-px bg-slate-700/50 my-2" />

                                    {/* SRL Options */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">SRL (Micro)</p>
                                        <label className="flex items-start gap-3 cursor-pointer group/label">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer h-4 w-4 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-500/20 focus:ring-offset-0"
                                                    checked={options.hasEmployee}
                                                    onChange={e => setOptions(prev => ({ ...prev, hasEmployee: e.target.checked }))}
                                                />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm text-slate-300 group-hover/label:text-white transition-colors">Am minim un angajat</span>
                                                <span className="text-xs text-slate-500">Condiție pentru regimul Micro (1% vs 16% Profit)</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </details>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Results Section */}
            <div id={resultsId} aria-live="polite" aria-atomic="true">
                {comparison ? (
                    <>
                        {/* Scenario Tabs */}
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) => setActiveTab(v as ScenarioType)}
                            className="w-full"
                        >
                            <TabsList
                                className="grid w-full grid-cols-3 h-12 md:h-14 bg-slate-100 dark:bg-slate-800/50 rounded-xl p-1"
                                aria-label="Tipuri de impozitare"
                            >
                                <TabsTrigger
                                    value="CIM"
                                    className="text-sm md:text-base font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 data-[state=active]:shadow-sm transition-all"
                                >
                                    CIM
                                </TabsTrigger>
                                <TabsTrigger
                                    value="PFA"
                                    className="text-sm md:text-base font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 data-[state=active]:shadow-sm transition-all"
                                >
                                    PFA
                                </TabsTrigger>
                                <TabsTrigger
                                    value="SRL"
                                    className="text-sm md:text-base font-semibold rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:text-purple-600 dark:data-[state=active]:text-purple-400 data-[state=active]:shadow-sm transition-all"
                                >
                                    SRL
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="CIM" className="mt-4 md:mt-6 focus:outline-none">
                                <ScenarioDetails
                                    result={comparison.CIM}
                                    currency={currency}
                                    isOptimal={comparison.optimal === 'CIM'}
                                />
                            </TabsContent>

                            <TabsContent value="PFA" className="mt-4 md:mt-6 focus:outline-none">
                                <ScenarioDetails
                                    result={comparison.PFA}
                                    currency={currency}
                                    isOptimal={comparison.optimal === 'PFA'}
                                />
                            </TabsContent>

                            <TabsContent value="SRL" className="mt-4 md:mt-6 focus:outline-none">
                                <ScenarioDetails
                                    result={comparison.SRL}
                                    currency={currency}
                                    isOptimal={comparison.optimal === 'SRL'}
                                />
                            </TabsContent>
                        </Tabs>

                        {/* Comparison Cards */}
                        <section className="mt-6 md:mt-8" aria-labelledby="comparison-heading">
                            <ComparisonView
                                comparison={comparison}
                                currency={currency}
                            />
                        </section>

                        {/* Chart */}
                        {currentResult && (
                            <Card className="mt-6 md:mt-8 overflow-hidden border-slate-200 dark:border-slate-700/50">
                                <CardHeader className="border-b border-slate-100 dark:border-slate-800 py-4">
                                    <CardTitle className="text-base md:text-lg font-semibold text-slate-800 dark:text-white">
                                        Distribuția Venitului
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-4 md:pt-6 pb-4">
                                    <ResultsChart
                                        result={currentResult}
                                        currency={currency}
                                    />
                                </CardContent>
                            </Card>
                        )}
                    </>
                ) : (
                    <EmptyState />
                )}
            </div>
        </div>
    );
}

/**
 * Empty state when no calculation
 */
function EmptyState() {
    return (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
            <p>Introdu o valoare pentru a vedea calculul</p>
        </div>
    );
}

/**
 * Chart loading skeleton
 */
function ChartSkeleton() {
    return (
        <div className="h-64 md:h-80 flex items-center justify-center">
            <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-32 h-32 rounded-full bg-slate-200 dark:bg-slate-700" />
                <div className="w-48 h-4 rounded bg-slate-200 dark:bg-slate-700" />
            </div>
        </div>
    );
}

// Default export for dynamic import
export default Calculator;
