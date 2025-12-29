'use client';

import { useState, useMemo, useCallback, useId } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { fiscalDAL } from '@/lib/dal';
import { InputField } from './InputField';
import { CurrencyToggle } from './CurrencyToggle';
import type { Currency, FreelanceComparisonResult } from '@/lib/dal/types';
import { TAX_RATES } from '@/lib/config/taxConfig';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ProvisionsHelper } from './ProvisionsHelper';
import { ReinvestedProfitHelper } from './ReinvestedProfitHelper';

export function FreelanceComparison() {
    // Generate unique IDs
    const inputId = useId();

    // State
    const [inputValue, setInputValue] = useState<string>('10000');
    const [grossIncome, setGrossIncome] = useState<number>(10000);
    const [currency, setCurrency] = useState<Currency>('RON');

    // Smart Options
    const [period, setPeriod] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
    const [options, setOptions] = useState({
        isPensioner: false,
        isHandicapped: false,
        reinvestedProfit: 0,
        deductibleProvisions: 0
    });

    // Debounced calculation
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
        const displayValue = period === 'ANNUAL' ? convertedValue * 12 : convertedValue;
        setInputValue(Math.round(displayValue).toString());
        setCurrency(newCurrency);
    }, [grossIncome, currency, period]);

    const handlePeriodChange = useCallback((newPeriod: 'MONTHLY' | 'ANNUAL') => {
        setPeriod(newPeriod);
        const displayValue = newPeriod === 'ANNUAL' ? grossIncome * 12 : grossIncome;
        setInputValue(Math.round(displayValue).toString());
    }, [grossIncome]);

    // Update debounced setter to handle period
    const onInputChange = useCallback((value: string) => {
        setInputValue(value);
        const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (!isNaN(numericValue)) {
            const monthlyValue = period === 'ANNUAL' ? numericValue / 12 : numericValue;
            debouncedSetIncome(monthlyValue);
        }
    }, [debouncedSetIncome, period]);

    // Handlers for Advanced Options (Numeric)
    const handleOptionChange = useCallback((field: 'reinvestedProfit' | 'deductibleProvisions', value: string) => {
        const numericValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
        const monthlyValue = period === 'ANNUAL' ? numericValue / 12 : numericValue;
        setOptions(prev => ({ ...prev, [field]: monthlyValue }));
    }, [period]);

    // Calculation Result
    const comparison = useMemo<FreelanceComparisonResult | null>(() => {
        try {
            if (grossIncome <= 0) return null;
            return fiscalDAL.compareFreelance(grossIncome, currency, options);
        } catch (error) {
            console.error(error);
            return null;
        }
    }, [grossIncome, currency, options]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-12">

            {/* Input Section */}
            <div className="flex flex-col items-center gap-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                    Câți bani îți rămân în mână {period === 'ANNUAL' ? 'anual' : 'lunar'}?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 -mt-4">
                    Estimare lunară bazată pe venitul și cheltuielile tale
                </p>

                <div className="w-full max-w-sm space-y-4 pt-4">
                    {/* Period Toggle */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-lg flex relative">
                        <button
                            onClick={() => handlePeriodChange('MONTHLY')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all z-10 ${period === 'MONTHLY'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            Lunar
                        </button>
                        <button
                            onClick={() => handlePeriodChange('ANNUAL')}
                            className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all z-10 ${period === 'ANNUAL'
                                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                        >
                            Anual
                        </button>
                    </div>

                    <InputField
                        id={inputId}
                        value={inputValue}
                        onChange={onInputChange}
                        currency={currency}
                        placeholder={period === 'ANNUAL' ? 'Venit Facturat Anual' : 'Venit Facturat Lunar'}
                    />
                    <CurrencyToggle value={currency} onChange={handleCurrencyChange} />
                </div>

                {/* Smart Toggles Accordion */}
                <Accordion type="single" collapsible className="w-full max-w-sm">
                    <AccordionItem value="options" className="border-slate-200 dark:border-slate-800">
                        <AccordionTrigger className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
                            Opțiuni Avansate & Scutiri
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-4 pt-2 pb-4">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="pensioner"
                                        checked={options.isPensioner}
                                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, isPensioner: checked as boolean }))}
                                    />
                                    <Label htmlFor="pensioner" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300">
                                        Sunt pensionar (Scutire CAS PFA)
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="handicapped"
                                        checked={options.isHandicapped}
                                        onCheckedChange={(checked) => setOptions(prev => ({ ...prev, isHandicapped: checked as boolean }))}
                                    />
                                    <Label htmlFor="handicapped" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300">
                                        Persoană cu handicap (Scutire Impozit)
                                    </Label>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />

                                {/* SRL Profit Optimization */}
                                <div className="space-y-4">
                                    <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        Optimizare SRL Profit (16%)
                                    </h4>

                                    <div className="space-y-2">
                                        <Label htmlFor="provisions" className="text-sm font-medium dark:text-slate-300">
                                            Provizioane Deductibile {period === 'ANNUAL' ? '(Anual)' : '(Lunar)'} (RON)
                                        </Label>
                                        <InputField
                                            id="provisions"
                                            value={Math.round(options.deductibleProvisions * (period === 'ANNUAL' ? 12 : 1)).toString()}
                                            onChange={(val) => handleOptionChange('deductibleProvisions', val)}
                                            currency="RON"
                                            placeholder="0"
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-slate-400">Reduce baza impozabilă înainte de aplicarea cotei de 16%.</p>
                                            <ProvisionsHelper
                                                onCalculate={(val) => {
                                                    const adjusted = period === 'ANNUAL' ? val : val / 12;
                                                    handleOptionChange('deductibleProvisions', Math.round(adjusted).toString());
                                                }}
                                            />
                                        </div>
                                        {options.deductibleProvisions > 0 && (
                                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800">
                                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                                    <span className="font-semibold">Impact:</span> Ai economisit <span className="font-bold">{Math.round(options.deductibleProvisions * 0.16 * (period === 'ANNUAL' ? 12 : 1))} RON</span> la taxe.
                                                </p>
                                                <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">
                                                    Suma de {Math.round(options.deductibleProvisions * (period === 'ANNUAL' ? 12 : 1))} RON rămâne în firmă pentru cheltuieli viitoare.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="reinvested" className="text-sm font-medium dark:text-slate-300">
                                            Profit Reinvestit {period === 'ANNUAL' ? '(Anual)' : '(Lunar)'} (RON)
                                        </Label>
                                        <InputField
                                            id="reinvested"
                                            value={Math.round(options.reinvestedProfit * (period === 'ANNUAL' ? 12 : 1)).toString()}
                                            onChange={(val) => handleOptionChange('reinvestedProfit', val)}
                                            currency="RON"
                                            placeholder="0"
                                        />
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] text-slate-400">Scutire de impozit pentru partea reinvestită.</p>
                                            <ReinvestedProfitHelper
                                                onCalculate={(val) => {
                                                    const adjusted = period === 'ANNUAL' ? val : val / 12;
                                                    handleOptionChange('reinvestedProfit', Math.round(adjusted).toString());
                                                }}
                                            />
                                        </div>
                                        {options.reinvestedProfit > 0 && (
                                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-100 dark:border-green-800">
                                                <p className="text-xs text-green-700 dark:text-green-300">
                                                    <span className="font-semibold">Impact:</span> Ai economisit <span className="font-bold">{Math.round(options.reinvestedProfit * 0.16 * (period === 'ANNUAL' ? 12 : 1))} RON</span> la taxe.
                                                </p>
                                                <p className="text-[10px] text-green-600 dark:text-green-400 mt-1">
                                                    Suma de {Math.round(options.reinvestedProfit * (period === 'ANNUAL' ? 12 : 1))} RON rămâne în firmă ca active, crescând valoarea companiei.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Comparison Cards */}
            {/* Comparison Cards */}
            {comparison && (() => {
                const minWage = TAX_RATES.CONSTANTS.MINIMUM_WAGE;
                const cass6 = 0.1 * 6 * minWage;
                const cass12 = 0.1 * 12 * minWage;
                const cass24 = 0.1 * 24 * minWage;

                const getCassBadge = (annualCass: number) => {
                    const diff = 5; // Tolerance
                    if (Math.abs(annualCass - cass24) < diff) return 'Plafon 24 Salarii';
                    if (Math.abs(annualCass - cass12) < diff) return 'Plafon 12 Salarii';
                    if (Math.abs(annualCass - cass6) < diff) return 'Plafon 6 Salarii';
                    return undefined;
                };

                const pfaCassAnnual = comparison.PFA.breakdown.cass * 12;
                const microCassAnnual = comparison.Micro.breakdown.cassDividend * 12;
                const profitCassAnnual = comparison.Profit.breakdown.cassDividend * 12;

                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        {/* PFA Card */}
                        <ComparisonCard
                            title="PFA"
                            subtitle="(Sistem Real)"
                            net={period === 'ANNUAL' ? comparison.PFA.net * 12 : comparison.PFA.net}
                            gross={period === 'ANNUAL' ? comparison.PFA.gross * 12 : comparison.PFA.gross}
                            breakdown={[
                                { label: 'Venit Net', value: period === 'ANNUAL' ? comparison.PFA.gross * 12 : comparison.PFA.gross, isPositive: true },
                                { label: 'CASS (sănătate)', value: period === 'ANNUAL' ? -comparison.PFA.breakdown.cass * 12 : -comparison.PFA.breakdown.cass, badge: getCassBadge(pfaCassAnnual) },
                                { label: 'CAS (pensie)', value: period === 'ANNUAL' ? -comparison.PFA.breakdown.cas * 12 : -comparison.PFA.breakdown.cas },
                                { label: 'Impozit pe venit', value: period === 'ANNUAL' ? -comparison.PFA.breakdown.incomeTax * 12 : -comparison.PFA.breakdown.incomeTax },
                            ]}
                            currency={currency}
                            isOptimal={comparison.optimal === 'PFA'}
                        />

                        {/* Micro Card */}
                        <ComparisonCard
                            title="Micro"
                            subtitle="(SRL 1%)"
                            net={period === 'ANNUAL' ? comparison.Micro.net * 12 : comparison.Micro.net}
                            gross={period === 'ANNUAL' ? comparison.Micro.gross * 12 : comparison.Micro.gross}
                            breakdown={[
                                { label: 'Venit Net', value: period === 'ANNUAL' ? comparison.Micro.gross * 12 : comparison.Micro.gross, isPositive: true },
                                { label: 'Impozit pe venit', value: period === 'ANNUAL' ? -comparison.Micro.breakdown.microTax * 12 : -comparison.Micro.breakdown.microTax },
                                { label: 'Impozit dividende', value: period === 'ANNUAL' ? -comparison.Micro.breakdown.dividendTax * 12 : -comparison.Micro.breakdown.dividendTax },
                                { label: 'CASS (sănătate)', value: period === 'ANNUAL' ? -comparison.Micro.breakdown.cassDividend * 12 : -comparison.Micro.breakdown.cassDividend, badge: getCassBadge(microCassAnnual) },
                            ]}
                            currency={currency}
                            isOptimal={comparison.optimal === 'Micro'}
                        />

                        {/* Profit Card */}
                        <ComparisonCard
                            title="SRL"
                            subtitle="(Profit 16%)"
                            net={period === 'ANNUAL' ? comparison.Profit.net * 12 : comparison.Profit.net}
                            gross={period === 'ANNUAL' ? comparison.Profit.gross * 12 : comparison.Profit.gross}
                            breakdown={[
                                { label: 'Venit Net', value: period === 'ANNUAL' ? comparison.Profit.gross * 12 : comparison.Profit.gross, isPositive: true },
                                { label: 'Impozit pe profit', value: period === 'ANNUAL' ? -comparison.Profit.breakdown.microTax * 12 : -comparison.Profit.breakdown.microTax },
                                { label: 'Impozit dividende', value: period === 'ANNUAL' ? -comparison.Profit.breakdown.dividendTax * 12 : -comparison.Profit.breakdown.dividendTax },
                                { label: 'CASS (Sănătate)', value: period === 'ANNUAL' ? -comparison.Profit.breakdown.cassDividend * 12 : -comparison.Profit.breakdown.cassDividend, badge: getCassBadge(profitCassAnnual) },
                            ]}
                            currency={currency}
                            isOptimal={comparison.optimal === 'Profit'}
                        />
                    </div>
                );
            })()}
        </div>
    );
}

// --- Subcomponent: Comparison Card ---

interface ComparisonCardProps {
    title: string;
    subtitle?: string;
    net: number;
    gross: number;
    breakdown: { label: string; value: number; isPositive?: boolean; badge?: string }[];
    currency: Currency;
    isOptimal?: boolean;
}

function ComparisonCard({ title, subtitle, net, gross, breakdown, currency, isOptimal }: ComparisonCardProps) {
    const totalTaxes = gross - net;

    return (
        <Card className={`overflow-hidden border-0 shadow-lg ${isOptimal ? 'ring-2 ring-blue-500' : ''} min-w-[300px]`}>
            {/* Header */}
            <div className="bg-slate-900 text-white p-5">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-2">
                        <span className="font-bold text-lg text-slate-300">{title}</span>
                        {subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}
                    </div>
                    <span className="text-3xl font-bold mt-1">
                        {fiscalDAL.formatCurrency(net, currency)}
                    </span>
                </div>
            </div>

            <CardContent className="p-0 bg-white dark:bg-slate-950">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Breakdown Items */}
                    {breakdown.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-3 px-5 text-sm">
                            <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                            <span className={`font-semibold ${item.isPositive ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-slate-200'}`}>
                                {item.isPositive ? '+' : ''}{fiscalDAL.formatCurrency(item.value, currency)}
                            </span>
                            {item.badge && (
                                <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
                                    {item.badge}
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Spacer Line (Taxe de plata) */}
                    <div className="py-4 px-5">
                        <div className="flex justify-between items-center text-sm font-medium">
                            <span className="text-slate-500">Taxe de plată</span>
                            <span className="text-slate-900 dark:text-white">
                                {fiscalDAL.formatCurrency(totalTaxes, currency)}
                            </span>
                        </div>
                    </div>

                    {/* Bottom Total */}
                    <div className="py-4 px-5 bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-900 dark:text-white">Bani în mână</span>
                            <span className="font-bold text-lg text-slate-900 dark:text-white">
                                {fiscalDAL.formatCurrency(net, currency)}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
