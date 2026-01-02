'use client';

import { useState, useMemo, useCallback, useId } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import dynamic from 'next/dynamic';
import { fiscalDAL } from '@/lib/dal';
import { TAX_RATES } from '@/lib/config/taxConfig';
import { InputField } from './InputField';
import { CurrencyToggle } from './CurrencyToggle';
import type { Currency, CIMCalculationResult } from '@/lib/dal/types';
import { Card, CardContent } from '@/components/ui/card';
import { Check, CheckCircle2, ChevronDown, ChevronUp, Info, User, Calculator } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Lazy load chart
const ResultsChart = dynamic(() => import('./ResultsChart').then(mod => ({ default: mod.ResultsChart })), {
    loading: () => <div className="h-64 md:h-80 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />,
    ssr: false
});

export function SalaryCalculator() {
    const inputId = useId();

    // State
    const [inputValue, setInputValue] = useState<string>('10000');
    const [grossIncome, setGrossIncome] = useState<number>(10000);
    const [currency, setCurrency] = useState<Currency>('RON');
    const [fiscalPeriod, setFiscalPeriod] = useState<'JAN' | 'JUL'>('JAN');

    // Deduction options
    const [options, setOptions] = useState({
        dependentsCount: 0 as 0 | 1 | 2 | 3 | 4,
        isUnder26: false,
        childrenInSchoolCount: 0
    });

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
            return fiscalDAL.calculateCIM(grossIncome, currency, minWageOverride, options, 'MONTHLY');
        } catch (error) {
            return null;
        }
    }, [grossIncome, currency, options, fiscalPeriod]);

    return (
        <div className="w-full max-w-5xl mx-auto space-y-8">
            {/* Header Section */}
            <div className="text-center space-y-4">
                <div className="space-y-2">
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                        Calculator Salariu <span className="text-blue-600">2026</span>
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl mx-auto">
                        Simulare detaliată pentru Contract Individual de Muncă (CIM)
                    </p>
                </div>

                {/* Fiscal Period Toggle - Centered & Pill Shaped */}
                <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-full relative">
                    <div className="flex relative z-10">
                        <button
                            onClick={() => setFiscalPeriod('JAN')}
                            className={cn(
                                "relative px-6 py-2 text-sm font-bold rounded-full transition-all duration-300",
                                fiscalPeriod === 'JAN'
                                    ? "text-blue-600 dark:text-white shadow-sm bg-white dark:bg-slate-700"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            )}
                        >
                            Ian - Iun ('26)
                        </button>
                        <button
                            onClick={() => setFiscalPeriod('JUL')}
                            className={cn(
                                "relative px-6 py-2 text-sm font-bold rounded-full transition-all duration-300",
                                fiscalPeriod === 'JUL'
                                    ? "text-blue-600 dark:text-white shadow-sm bg-white dark:bg-slate-700"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            )}
                        >
                            Iul - Dec ('26)
                        </button>
                    </div>
                </div>
                <p className="text-xs text-slate-400">
                    Salar minim: {fiscalPeriod === 'JAN' ? '4.050' : '4.325'} RON
                </p>
            </div>

            <Card className="border-0 shadow-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden ring-1 ring-slate-200 dark:ring-slate-800">
                <CardContent className="p-6 md:p-10 space-y-10">

                    {/* Primary Input Section */}
                    <div className="max-w-xl mx-auto space-y-6">
                        <div className="space-y-3">
                            <Label htmlFor={inputId} className="flex items-center justify-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider">
                                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                                Salariu Brut Lunar
                            </Label>

                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500" />
                                <div className="relative bg-white dark:bg-slate-950 rounded-xl p-1.5 shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                                    <InputField
                                        id={inputId}
                                        value={inputValue}
                                        onChange={handleInputChange}
                                        currency={currency}
                                        variant="main" // Fixed type error (was "large")
                                        className="text-center text-3xl md:text-4xl font-black py-4 border-0 shadow-none focus-visible:ring-0 bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <CurrencyToggle
                                value={currency}
                                onChange={handleCurrencyChange}
                                className="w-auto min-w-[200px]"
                            />
                        </div>
                    </div>

                    {/* Quick Options Grid - Unified Look */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 md:pt-8 border-t border-slate-200 dark:border-slate-800/60">
                        {/* Dependents Option */}
                        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/20 transition-colors group">
                            <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                                Persoane în întreținere
                            </Label>
                            <div className="relative mt-auto">
                                <select
                                    value={options.dependentsCount}
                                    onChange={(e) => setOptions(prev => ({ ...prev, dependentsCount: parseInt(e.target.value) as any }))}
                                    className="w-full h-11 px-3 appearance-none rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value={0}>Fără persoane</option>
                                    <option value={1}>1 persoană</option>
                                    <option value={2}>2 persoane</option>
                                    <option value={3}>3 persoane</option>
                                    <option value={4}>4+ persoane</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Age Option */}
                        <div
                            onClick={() => setOptions(prev => ({ ...prev, isUnder26: !prev.isUnder26 }))}
                            className={cn(
                                "flex flex-col gap-3 p-4 rounded-xl border transition-all cursor-pointer group select-none relative overflow-hidden",
                                options.isUnder26
                                    ? "bg-blue-600/10 border-blue-600/30"
                                    : "bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/20"
                            )}
                        >
                            <Label className={cn(
                                "text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer",
                                options.isUnder26 ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-blue-500"
                            )}>
                                Vârsta sub 26 ani
                            </Label>
                            <div className="flex items-center justify-between h-11 px-1 mt-auto">
                                <span className={cn(
                                    "text-sm font-medium transition-colors",
                                    options.isUnder26 ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"
                                )}>
                                    {options.isUnder26 ? "Beneficiază de deducere" : "Nu beneficiază"}
                                </span>
                                <div className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    options.isUnder26
                                        ? "bg-blue-600 border-blue-600 text-white"
                                        : "border-slate-300 dark:border-slate-600"
                                )}>
                                    {options.isUnder26 && <Check className="w-3.5 h-3.5" />}
                                </div>
                            </div>
                        </div>

                        {/* Children Option */}
                        <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 hover:border-blue-500/20 transition-colors group">
                            <div className="flex justify-between items-center">
                                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-blue-500 transition-colors">
                                    Copii la școală
                                </Label>
                                <span className="text-[9px] font-medium bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">
                                    100 RON/copil
                                </span>
                            </div>

                            <div className="flex bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 h-11 overflow-hidden mt-auto shadow-sm">
                                <button
                                    onClick={() => setOptions(prev => ({ ...prev, childrenInSchoolCount: Math.max(0, prev.childrenInSchoolCount - 1) }))}
                                    className="px-4 hover:bg-slate-100 dark:hover:bg-slate-800 border-r border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-colors"
                                >-</button>
                                <div className="flex-1 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white">
                                    {options.childrenInSchoolCount}
                                </div>
                                <button
                                    onClick={() => setOptions(prev => ({ ...prev, childrenInSchoolCount: prev.childrenInSchoolCount + 1 }))}
                                    className="px-4 hover:bg-slate-100 dark:hover:bg-slate-800 border-l border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 transition-colors"
                                >+</button>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    {result && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 pt-4 animate-in fade-in duration-500 slide-in-from-bottom-4">
                            {/* Breakdown List */}
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4 flex items-center gap-2">
                                    <Calculator className="w-5 h-5 text-blue-500" />
                                    Fluturaș de Salariu
                                </h3>

                                <dl className="space-y-4">
                                    <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/30 p-3 rounded-lg">
                                        <dt className="text-sm font-medium text-slate-500 dark:text-slate-400">Salariu Brut</dt>
                                        <dd className="font-bold text-slate-900 dark:text-white">
                                            {fiscalDAL.formatCurrency(result.gross, currency)}
                                        </dd>
                                    </div>

                                    <div className="space-y-3 px-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <dt className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                                CAS (Pensie) <span className="text-xs text-slate-400">25%</span>
                                            </dt>
                                            <dd className="font-medium text-red-500 dark:text-red-400">
                                                -{fiscalDAL.formatCurrency(result.breakdown.cas, currency)}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <dt className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                                CASS (Sănătate) <span className="text-xs text-slate-400">10%</span>
                                            </dt>
                                            <dd className="font-medium text-red-500 dark:text-red-400">
                                                -{fiscalDAL.formatCurrency(result.breakdown.cass, currency)}
                                            </dd>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <dt className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-400" />
                                                Impozit pe venit <span className="text-xs text-slate-400">10%</span>
                                            </dt>
                                            <dd className="font-medium text-red-500 dark:text-red-400">
                                                -{fiscalDAL.formatCurrency(result.breakdown.incomeTax, currency)}
                                            </dd>
                                        </div>
                                    </div>

                                    {result.breakdown.personalDeduction > 0 && (
                                        <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/10 p-3 rounded-lg border border-green-100 dark:border-green-900/20">
                                            <dt className="text-sm font-medium text-green-700 dark:text-green-400">Deducere Personală</dt>
                                            <dd className="font-semibold text-green-700 dark:text-green-400">
                                                {fiscalDAL.formatCurrency(result.breakdown.personalDeduction, currency)}
                                            </dd>
                                        </div>
                                    )}

                                    <div className="pt-6 relative">
                                        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent" />
                                        <div className="flex justify-between items-end">
                                            <dt className="text-lg font-bold text-slate-700 dark:text-slate-300">Salariu Net</dt>
                                            <dd className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600">
                                                {fiscalDAL.formatCurrency(result.net, currency)}
                                            </dd>
                                        </div>
                                        <p className="text-xs text-right text-slate-400 mt-1 font-medium">
                                            bani în mână / lunar
                                        </p>
                                    </div>

                                    {result.breakdown.cam > 0 && (
                                        <div className="mt-6 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700/50">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Pentru Angajator</h4>
                                            <div className="grid gap-2">
                                                <div className="flex justify-between text-sm text-slate-500">
                                                    <dt>CAM (2.25%)</dt>
                                                    <dd>{fiscalDAL.formatCurrency(result.breakdown.cam, currency)}</dd>
                                                </div>
                                                <div className="flex justify-between text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    <dt>Cost Total Salarial</dt>
                                                    <dd>{fiscalDAL.formatCurrency(result.breakdown.completeSalary, currency)}</dd>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </dl>
                            </div>

                            {/* Chart & Highlights */}
                            <div className="space-y-8">
                                <div className="bg-slate-50 dark:bg-slate-800/30 rounded-2xl p-6 border border-slate-100 dark:border-slate-800">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 text-center">
                                        Distribuția Banilor
                                    </h3>
                                    <div className="h-auto w-full">
                                        <ResultsChart result={result} currency={currency} />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Angajatul primește</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                {(result.net / result.breakdown.completeSalary * 100).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                                            <Calculator className="w-5 h-5 text-red-600 dark:text-red-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Statul încasează</p>
                                            <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                {(100 - (result.net / result.breakdown.completeSalary * 100)).toFixed(1)}%
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div >
    );
}
