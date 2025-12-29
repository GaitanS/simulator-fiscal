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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info } from 'lucide-react';
// Removing ProvisionsHelper and ReinvestedProfitHelper as they will be inlined

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
        deductibleProvisions: 0,
        // Helper-specific fields
        provisionBaseAmount: '',
        provisionType: '270_DAYS' as '270_DAYS' | 'BANKRUPTCY',
        investmentAmount: '',
        investmentCategories: ['TECH_EQUIPMENT'] as string[]
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

        // Update helper display values if they exist
        setOptions(prev => ({
            ...prev,
            provisionBaseAmount: prev.provisionBaseAmount ?
                (newPeriod === 'ANNUAL' ?
                    Math.round(parseFloat(prev.provisionBaseAmount) * 12).toString() :
                    Math.round(parseFloat(prev.provisionBaseAmount) / 12).toString()) : '',
            investmentAmount: prev.investmentAmount ?
                (newPeriod === 'ANNUAL' ?
                    Math.round(parseFloat(prev.investmentAmount) * 12).toString() :
                    Math.round(parseFloat(prev.investmentAmount) / 12).toString()) : ''
        }));
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
    // No longer using handleOptionChange for these as they are handled inline with more complex logic

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
                    Estimare {period === 'ANNUAL' ? 'anuală' : 'lunară'} bazată pe venitul și cheltuielile tale
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
                        <AccordionTrigger className="text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white text-center flex justify-center w-full">
                            Opțiuni Avansate & Scutiri
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="space-y-6 pt-2 pb-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                        <Checkbox
                                            id="pensioner"
                                            checked={options.isPensioner}
                                            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, isPensioner: checked as boolean }))}
                                        />
                                        <Label htmlFor="pensioner" className="text-sm font-medium leading-none cursor-pointer dark:text-slate-300">
                                            Sunt pensionar (Scutire CAS PFA)
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                        <Checkbox
                                            id="handicapped"
                                            checked={options.isHandicapped}
                                            onCheckedChange={(checked) => setOptions(prev => ({ ...prev, isHandicapped: checked as boolean }))}
                                        />
                                        <Label htmlFor="handicapped" className="text-sm font-medium leading-none cursor-pointer dark:text-slate-300">
                                            Persoană cu handicap (Scutire Impozit)
                                        </Label>
                                    </div>
                                </div>

                                <div className="h-px bg-slate-200 dark:bg-slate-700" />

                                {/* SRL Profit Optimization */}
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                                        Optimizare SRL Profit 16%
                                    </h4>

                                    {/* Inline Provisions Helper */}
                                    <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <Label className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                Provizioane (Clienți neîncasați)
                                            </Label>
                                            <Info className="w-3.5 h-3.5 text-slate-400" />
                                        </div>

                                        <div className="space-y-3">
                                            <div className="grid gap-2 text-left">
                                                <Label htmlFor="provision_base" className="text-[10px] text-slate-500 font-semibold uppercase">Suma Neîncasată (RON)</Label>
                                                <InputField
                                                    id="provision_base"
                                                    value={options.provisionBaseAmount}
                                                    onChange={(val) => {
                                                        const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                                                        const monthlyBase = period === 'ANNUAL' ? num / 12 : num;
                                                        const deductibleMonthly = options.provisionType === '270_DAYS' ? monthlyBase * 0.30 : monthlyBase;
                                                        setOptions(prev => ({
                                                            ...prev,
                                                            provisionBaseAmount: val,
                                                            deductibleProvisions: deductibleMonthly
                                                        }));
                                                    }}
                                                    placeholder="Poți deduce creanțele neîncasați"
                                                />
                                            </div>

                                            <div className="grid gap-2 text-left">
                                                <Label className="text-[10px] text-slate-500 font-semibold uppercase">Motivul Neîncasării</Label>
                                                <RadioGroup
                                                    value={options.provisionType}
                                                    onValueChange={(val) => {
                                                        const num = parseFloat(options.provisionBaseAmount.replace(/[^0-9.]/g, '')) || 0;
                                                        const monthlyBase = period === 'ANNUAL' ? num / 12 : num;
                                                        const deductibleMonthly = (val as any) === '270_DAYS' ? monthlyBase * 0.30 : monthlyBase;
                                                        setOptions(prev => ({
                                                            ...prev,
                                                            provisionType: val as any,
                                                            deductibleProvisions: deductibleMonthly
                                                        }));
                                                    }}
                                                    className="flex flex-col space-y-2 pt-1"
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="270_DAYS" id="opt_270" />
                                                        <Label htmlFor="opt_270" className="text-xs font-normal text-slate-600 dark:text-slate-400 cursor-pointer">Peste 270 zile (30% deducere)</Label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="BANKRUPTCY" id="opt_bank" />
                                                        <Label htmlFor="opt_bank" className="text-xs font-normal text-slate-600 dark:text-slate-400 cursor-pointer">Faliment (100% deducere)</Label>
                                                    </div>
                                                </RadioGroup>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Inline Reinvested Profit Helper */}
                                    <div className="space-y-4 p-4 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Label className="text-sm font-bold text-slate-900 dark:text-white">
                                                Profit Reinvestit (Active)
                                            </Label>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="grid gap-2 text-left">
                                                <Label className="text-[10px] text-slate-500 font-semibold uppercase">Categorii Eligibile</Label>
                                                <div className="grid grid-cols-1 gap-1.5">
                                                    {[
                                                        { id: 'TECH', label: 'Echipamente Tehnologice' },
                                                        { id: 'SOFT', label: 'Programe & Software' },
                                                        { id: 'COMP', label: 'Calculatoare & Periferice' }
                                                    ].map((cat) => (
                                                        <div key={cat.id} className="flex items-center space-x-2 p-1.5 rounded bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                                                            <Checkbox
                                                                id={`cat_${cat.id}`}
                                                                checked={options.investmentCategories.includes(cat.id)}
                                                                onCheckedChange={(checked) => {
                                                                    setOptions(prev => ({
                                                                        ...prev,
                                                                        investmentCategories: checked
                                                                            ? [...prev.investmentCategories, cat.id]
                                                                            : prev.investmentCategories.filter(c => c !== cat.id)
                                                                    }));
                                                                }}
                                                            />
                                                            <Label htmlFor={`cat_${cat.id}`} className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer flex-1">{cat.label}</Label>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid gap-2 text-left">
                                                <Label htmlFor="invest_amount" className="text-[10px] text-slate-500 font-semibold uppercase">Sumă Investită (RON)</Label>
                                                <InputField
                                                    id="invest_amount"
                                                    value={options.investmentAmount}
                                                    onChange={(val) => {
                                                        const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                                                        const monthlyValue = period === 'ANNUAL' ? num / 12 : num;
                                                        setOptions(prev => ({
                                                            ...prev,
                                                            investmentAmount: val,
                                                            reinvestedProfit: monthlyValue
                                                        }));
                                                    }}
                                                    placeholder="Investiții în active noi"
                                                />
                                            </div>
                                        </div>
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
