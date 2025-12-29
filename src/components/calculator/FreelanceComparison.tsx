'use client';

import { useState, useMemo, useCallback, useId } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { fiscalDAL } from '@/lib/dal';
import { InputField } from './InputField';
import { CurrencyToggle } from './CurrencyToggle';
import type { Currency, FreelanceComparisonResult } from '@/lib/dal/types';
import { TAX_RATES } from '@/lib/config/taxConfig';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Calculator, CheckCircle2 } from 'lucide-react';
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
        <div className="w-full max-w-7xl mx-auto space-y-12 px-4 md:px-8">

            {/* Hero Section - Professional & Focused */}
            <div className="flex flex-col items-center gap-4 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    Câți bani îți rămân în mână {period === 'ANNUAL' ? 'anual' : 'lunar'}?
                </h2>
                <p className="text-slate-400 text-lg md:text-xl font-medium">
                    Simulator fiscal avansat pentru PFA și SRL. Configurați-vă profilul pentru o estimare precisă.
                </p>
            </div>

            {/* Main Configuration Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Column: Primary Income Input (Lg: 4/12) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-0 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl">
                        <CardContent className="p-6 md:p-8 space-y-8">
                            <div className="space-y-4">
                                <Label className="text-xs font-bold uppercase tracking-widest text-blue-400 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                                    Venit Brut Estimat
                                </Label>

                                <div className="space-y-4">
                                    <InputField
                                        id={inputId}
                                        value={inputValue}
                                        onChange={onInputChange}
                                        currency={currency}
                                        variant="main"
                                        placeholder={period === 'ANNUAL' ? 'Total Anual' : 'Total Lunar'}
                                    />

                                    <div className="flex flex-col gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Perioada de Calcul</Label>
                                            <div className="bg-slate-800/50 p-1 rounded-lg flex">
                                                <button
                                                    onClick={() => handlePeriodChange('MONTHLY')}
                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${period === 'MONTHLY'
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'text-slate-400 hover:text-slate-200'}`}
                                                >
                                                    Lunar
                                                </button>
                                                <button
                                                    onClick={() => handlePeriodChange('ANNUAL')}
                                                    className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${period === 'ANNUAL'
                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                        : 'text-slate-400 hover:text-slate-200'}`}
                                                >
                                                    Anual
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-bold text-slate-500 uppercase">Moneda</Label>
                                            <CurrencyToggle value={currency} onChange={handleCurrencyChange} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Scutiri Card */}
                    <Card className="border-0 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 shadow-xl overflow-hidden">
                        <div className="bg-white/5 border-b border-white/5 px-6 py-3 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scutiri Personale</span>
                            <Info className="w-3.5 h-3.5 text-slate-500" />
                        </div>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group" onClick={() => setOptions(prev => ({ ...prev, isPensioner: !prev.isPensioner }))}>
                                <Label htmlFor="pensioner" className="text-sm font-semibold text-slate-300 pointer-events-none">
                                    Sunt Pensionar
                                </Label>
                                <Checkbox
                                    id="pensioner"
                                    checked={options.isPensioner}
                                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, isPensioner: checked as boolean }))}
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer group" onClick={() => setOptions(prev => ({ ...prev, isHandicapped: !prev.isHandicapped }))}>
                                <Label htmlFor="handicapped" className="text-sm font-semibold text-slate-300 pointer-events-none">
                                    Persoană cu Handicap
                                </Label>
                                <Checkbox
                                    id="handicapped"
                                    checked={options.isHandicapped}
                                    onCheckedChange={(checked) => setOptions(prev => ({ ...prev, isHandicapped: checked as boolean }))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Optimization & Advanced Settings (Lg: 8/12) */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Provisions Section */}
                        <Card className="border-0 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-600/20 to-transparent border-b border-white/5 px-6 py-4">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <Calculator className="w-4 h-4 text-blue-400" />
                                    Provizioane (Clienți Neîncasați)
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Optimizare SRL Profit 16%</p>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="provision_base" className="text-xs font-bold text-slate-300">Valoare Creanță ({currency})</Label>
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
                                            currency={currency}
                                            variant="compact"
                                            placeholder="Suma facturată și neîncasată"
                                        />
                                    </div>

                                    <div className="grid gap-3">
                                        <Label className="text-xs font-bold text-slate-300">Tip Deducere Fiscală</Label>
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
                                            className="grid grid-cols-1 gap-2"
                                        >
                                            <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${options.provisionType === '270_DAYS' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`} onClick={() => {
                                                const val = '270_DAYS';
                                                const num = parseFloat(options.provisionBaseAmount.replace(/[^0-9.]/g, '')) || 0;
                                                const monthlyBase = period === 'ANNUAL' ? num / 12 : num;
                                                const deductibleMonthly = monthlyBase * 0.30;
                                                setOptions(prev => ({ ...prev, provisionType: val, deductibleProvisions: deductibleMonthly }));
                                            }}>
                                                <RadioGroupItem value="270_DAYS" id="opt_270" className="sr-only" />
                                                <Label htmlFor="opt_270" className="text-xs font-bold cursor-pointer flex-1">Peste 270 zile (30%)</Label>
                                            </div>
                                            <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer ${options.provisionType === 'BANKRUPTCY' ? 'bg-blue-600/10 border-blue-500/50 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/10'}`} onClick={() => {
                                                const val = 'BANKRUPTCY';
                                                const num = parseFloat(options.provisionBaseAmount.replace(/[^0-9.]/g, '')) || 0;
                                                const monthlyBase = period === 'ANNUAL' ? num / 12 : num;
                                                const deductibleMonthly = monthlyBase;
                                                setOptions(prev => ({ ...prev, provisionType: val, deductibleProvisions: deductibleMonthly }));
                                            }}>
                                                <RadioGroupItem value="BANKRUPTCY" id="opt_bank" className="sr-only" />
                                                <Label htmlFor="opt_bank" className="text-xs font-bold cursor-pointer flex-1">Faliment Debitor (100%)</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                {options.deductibleProvisions > 0 && (
                                    <div className="p-4 rounded-xl bg-blue-600/10 border border-blue-500/20 flex flex-col gap-1 items-center text-center">
                                        <span className="text-[10px] font-bold text-blue-400 uppercase">Impact Fiscal Estimabil</span>
                                        <span className="text-xl font-black text-white">
                                            {Math.round(options.deductibleProvisions * (period === 'ANNUAL' ? 12 : 1)).toLocaleString()} {currency}
                                        </span>
                                        <span className="text-[10px] text-slate-500 italic">Această sumă reduce baza impozabilă (Profit 16%)</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Art. 22 Reinvested Profit Section */}
                        <Card className="border-0 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 shadow-xl overflow-hidden">
                            <div className="bg-gradient-to-r from-green-600/20 to-transparent border-b border-white/5 px-6 py-4">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Profit Reinvestit (Art. 22)
                                </h4>
                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">Active Eligibile & Scutiri</p>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold text-slate-300">Categorii de Active Achiziționate</Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: 'TECH', label: 'Echipamente Tehnologice' },
                                                { id: 'SOFT', label: 'Software & Licențe' },
                                                { id: 'COMP', label: 'Calculatoare & Periferice' }
                                            ].map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer ${options.investmentCategories.includes(cat.id) ? 'bg-green-600/10 border-green-500/50' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
                                                    onClick={() => {
                                                        setOptions(prev => ({
                                                            ...prev,
                                                            investmentCategories: prev.investmentCategories.includes(cat.id)
                                                                ? prev.investmentCategories.filter(c => c !== cat.id)
                                                                : [...prev.investmentCategories, cat.id]
                                                        }));
                                                    }}
                                                >
                                                    <Label className="text-xs font-bold cursor-pointer text-slate-300">{cat.label}</Label>
                                                    <Checkbox
                                                        id={`cat_${cat.id}`}
                                                        checked={options.investmentCategories.includes(cat.id)}
                                                        className="border-white/20"
                                                        onCheckedChange={() => { }} // Handled by div click
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="invest_amount" className="text-xs font-bold text-slate-300">Valoare Totală Investiție ({currency})</Label>
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
                                            currency={currency}
                                            variant="compact"
                                            placeholder="Ex: 5.000"
                                        />
                                    </div>
                                </div>

                                {options.reinvestedProfit > 0 && options.investmentCategories.length > 0 && (
                                    <div className="p-4 rounded-xl bg-green-600/10 border border-green-500/20 flex flex-col gap-1 items-center text-center">
                                        <span className="text-[10px] font-bold text-green-400 uppercase">Impact Fiscal Direct</span>
                                        <span className="text-xl font-black text-white">
                                            {Math.round(options.reinvestedProfit * (period === 'ANNUAL' ? 12 : 1)).toLocaleString()} {currency}
                                        </span>
                                        <span className="text-[10px] text-slate-500 italic">Suma scutită integral de la Impozit Profit</span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Comparison Cards Section */}
            <div className="space-y-8 pt-8 border-t border-white/5">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Rezultate Comparate</h3>
                    <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
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
                                period={period}
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
                                period={period}
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
                                period={period}
                                isOptimal={comparison.optimal === 'Profit'}
                            />
                        </div>
                    );
                })()}
            </div>
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
    period: 'MONTHLY' | 'ANNUAL';
    isOptimal?: boolean;
}

function ComparisonCard({ title, subtitle, net, gross, breakdown, currency, period, isOptimal }: ComparisonCardProps) {
    const totalTaxes = gross - net;

    return (
        <Card className={cn(
            "overflow-hidden border-0 bg-slate-900/40 backdrop-blur-xl ring-1 shadow-2xl transition-all duration-300",
            isOptimal ? "ring-blue-500 ring-2 scale-[1.02] z-10" : "ring-white/10 hover:ring-white/20"
        )}>
            {/* Optimal Badge */}
            {isOptimal && (
                <div className="bg-blue-600 text-[10px] font-black text-white uppercase tracking-widest py-1 px-3 text-center">
                    Recomandat
                </div>
            )}

            {/* Header */}
            <div className="p-6 md:p-8 space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h4 className="font-black text-xl text-white tracking-tight uppercase">{title}</h4>
                            {subtitle && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{subtitle}</span>}
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bani în mână</p>
                    </div>
                    {isOptimal && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                </div>

                <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-black text-white">
                        {fiscalDAL.formatCurrency(net, currency)}
                    </span>
                </div>
            </div>

            <CardContent className="p-0">
                <div className="divide-y divide-white/5">
                    {/* Breakdown Items */}
                    <div className="px-6 md:px-8 py-4 space-y-3">
                        {breakdown.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center group">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight">{item.label}</span>
                                    {item.badge && (
                                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20 uppercase tracking-tighter">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={cn(
                                    "text-sm font-bold tracking-tight",
                                    item.isPositive ? "text-blue-400" : "text-white"
                                )}>
                                    {item.isPositive ? '+' : ''}{fiscalDAL.formatCurrency(item.value, currency)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Summary Footer */}
                    <div className="px-6 md:px-8 py-6 bg-white/5 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Taxe</span>
                            <span className="text-sm font-black text-white">
                                -{fiscalDAL.formatCurrency(totalTaxes, currency)}
                            </span>
                        </div>

                        <div className="h-px bg-white/10 w-full" />

                        <div className="flex justify-between items-center">
                            <span className="text-sm font-black text-blue-400 uppercase tracking-widest">Venit Net</span>
                            <div className="text-right">
                                <span className="text-2xl font-black text-white block leading-none">
                                    {fiscalDAL.formatCurrency(net, currency)}
                                </span>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1 inline-block">
                                    {period === 'ANNUAL' ? 'Total Anual' : 'Total Lunar'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
