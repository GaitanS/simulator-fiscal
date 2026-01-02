'use client';

import { useState, useMemo, useCallback, useId } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { fiscalDAL } from '@/lib/dal';
import { InputField } from './InputField';
import { CurrencyToggle } from './CurrencyToggle';
import type { Currency, FreelanceComparisonResult } from '@/lib/dal/types';
import { TAX_RATES, getTaxRatesForYear, type FiscalYear } from '@/lib/config/taxConfig';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Info, Calculator, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
// Removing ProvisionsHelper and ReinvestedProfitHelper as they will be inlined

export function FreelanceComparison() {
    // Generate unique IDs
    const inputId = useId();

    // State
    const [inputValue, setInputValue] = useState<string>('100000');
    const [grossIncome, setGrossIncome] = useState<number>(100000);
    const [currency, setCurrency] = useState<Currency>('RON');

    // Smart Options
    const [period, setPeriod] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
    const [fiscalYear, setFiscalYear] = useState<FiscalYear>(2025);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [isOptimizationOpen, setIsOptimizationOpen] = useState(false);
    const [options, setOptions] = useState({
        isPensioner: false,
        isHandicapped: false,
        isUnder26: false,
        dependentsCount: 0 as 0 | 1 | 2 | 3 | 4,
        childrenInSchoolCount: 0,
        reinvestedProfit: 0,
        deductibleProvisions: 0,
        expenses: 0, // Annual expenses for Profit regime
        expensesInput: '', // Display value for expenses
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

    // Handlers
    // Removing duplicate handleInputChange

    const handleCurrencyChange = useCallback((newCurrency: Currency) => {
        const convertedValue = fiscalDAL.convertCurrency(grossIncome, currency, newCurrency);
        setGrossIncome(convertedValue);
        setInputValue(Math.round(convertedValue).toString());
        setCurrency(newCurrency);
    }, [grossIncome, currency]);

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
        // Allow formatting chars but keep underlying value clean
        // Just set what user types
        setInputValue(value);

        // Parse for calculation
        // Allow dots/commas as decimal separators if needed, or just strip non-numeric
        // Standardize: remove all non-digits, treat as integer for RON usually? 
        // Or float? 
        const cleanVal = value.replace(/[^0-9.]/g, '');
        const numericValue = parseFloat(cleanVal);

        if (!isNaN(numericValue)) {
            debouncedSetIncome(numericValue);
        } else if (value === '') {
            debouncedSetIncome(0);
        }
    }, [debouncedSetIncome]);

    // Handlers for Advanced Options (Numeric)
    // No longer using handleOptionChange for these as they are handled inline with more complex logic

    // Calculation Result
    const comparison = useMemo<FreelanceComparisonResult | null>(() => {
        try {
            if (grossIncome <= 0) return null;
            return fiscalDAL.compareFreelance(grossIncome, currency, {
                ...options,
                fiscalYear,
                period: 'ANNUAL' // Always annual now
            });
        } catch (error) {
            console.error(error);
            return null;
        }
    }, [grossIncome, currency, options, fiscalYear]);

    return (
        <div className="w-full max-w-7xl mx-auto space-y-12 px-4 md:px-8 pb-32">

            {/* Hero Section - Professional & Focused */}
            <div className="flex flex-col items-center gap-4 text-center max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    Câți bani îți rămân în mână {period === 'ANNUAL' ? 'anual' : 'lunar'}?
                </h2>
                <p className="text-slate-400 text-lg md:text-xl font-medium">
                    Simulator fiscal avansat pentru PFA și SRL. Configurați-vă profilul pentru o estimare precisă.
                </p>
            </div>

            {/* Main Configuration Dashboard - Centered Row 1 */}
            <div className="max-w-2xl mx-auto w-full space-y-8">
                <Card className="border-0 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 shadow-2xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600/20 to-transparent border-b border-white/5 px-6 py-4">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-widest">
                            <Calculator className="w-4 h-4 text-blue-400" />
                            Configurare Venit
                        </h4>
                    </div>
                    <CardContent className="p-8 space-y-8">
                        {/* Input Area */}
                        {/* Input Area - Symmetric & Centered */}
                        <div className="flex flex-col items-center gap-6">
                            <div className="flex flex-col md:flex-row gap-4 w-full items-end">
                                <div className="flex-1 w-full space-y-2">
                                    <Label
                                        htmlFor="income-input"
                                        className="select-none text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                                        Venituri Totale (Anual)
                                    </Label>
                                    <div className="relative group">
                                        <InputField
                                            key="income-input-main"
                                            id="income-input"
                                            value={inputValue}
                                            onChange={onInputChange}
                                            currency={currency}
                                            variant="main"
                                            placeholder="Ex: 120.000"
                                        />
                                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-10 group-focus-within:opacity-25 transition duration-500 pointer-events-none" />
                                    </div>
                                </div>

                                <div className="w-full md:w-auto space-y-2">
                                    <Label className="select-none text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                        Moneda
                                    </Label>
                                    <div className="h-14 md:h-16 min-w-[140px]">
                                        <CurrencyToggle value={currency} onChange={handleCurrencyChange} className="w-full h-full" />
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-500 italic -mt-2">
                                Introdu venitul tău brut total pe an. Toate calculele sunt estimate pe baza acestui total anual.
                            </p>
                        </div>

                        {/* Fiscal Year Toggle - Full Width & Symmetric */}
                        <div className="space-y-3">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">An Fiscal</Label>
                            <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10 w-full relative">
                                <button
                                    onClick={() => setFiscalYear(2025)}
                                    className={cn(
                                        "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 relative z-10",
                                        fiscalYear === 2025 ? "text-white" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    2025 (10%)
                                </button>
                                <button
                                    onClick={() => setFiscalYear(2026)}
                                    className={cn(
                                        "flex-1 px-4 py-3 rounded-lg font-bold text-sm transition-all duration-300 relative z-10",
                                        fiscalYear === 2026 ? "text-white" : "text-slate-400 hover:text-white"
                                    )}
                                >
                                    2026 (16%)
                                </button>
                                {/* Sliding Background */}
                                <div
                                    className={cn(
                                        "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20 transition-all duration-300 ease-out",
                                        fiscalYear === 2025 ? "left-1" : "left-[calc(50%+4px)]" // +4px for spacing
                                    )}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 italic text-center">
                                Impozit dividende: {fiscalYear === 2025 ? '10%' : '16%'} | Salariu minim: {fiscalYear === 2025 ? '4.050' : '4.050'} RON
                            </p>
                        </div>

                        {/* Expenses Field for Profit Calculation - Symmetric */}
                        <div className="space-y-2 pt-2">
                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                                Cheltuieli Anuale (pentru SRL Profit)
                            </Label>
                            <div className="relative">
                                <InputField
                                    id="expenses-input"
                                    value={options.expensesInput}
                                    onChange={(val) => {
                                        const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                                        setOptions(prev => ({
                                            ...prev,
                                            expensesInput: val,
                                            expenses: num,
                                            deductibleProvisions: num // Use expenses for profit calc
                                        }));
                                    }}
                                    currency={currency}
                                    variant="compact"
                                    placeholder="Ex: 60.000"
                                    className="bg-slate-900/50 border-white/10 focus:border-blue-500/50"
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 italic pl-1">
                                La SRL Profit: Impozit 16% se aplică pe Profit (Venituri - Cheltuieli)
                            </p>
                        </div>

                        {/* Advanced Settings Toggle */}
                        <div className="pt-4 border-t border-white/5">
                            <button
                                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                className="flex items-center justify-between w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 group-hover:bg-blue-600/20 transition-colors">
                                        <Info className="w-4 h-4" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block text-xs font-bold text-white uppercase tracking-wider">Date Avansate de Calcul</span>
                                        <span className="block text-[10px] text-slate-500 uppercase font-medium">Scutiri personale & Profil fiscal</span>
                                    </div>
                                </div>
                                {isAdvancedOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </button>

                            {isAdvancedOpen && (
                                <div className="mt-4 p-6 rounded-xl bg-white/5 border border-white/5 space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-slate-500" />
                                            Scutiri Personale
                                        </Label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {[
                                                { id: 'pensioner', label: 'Sunt Pensionar', key: 'isPensioner' },
                                                { id: 'handicap', label: 'Persoană cu Handicap', key: 'isHandicapped' }
                                            ].map((opt) => (
                                                <div
                                                    key={opt.id}
                                                    onClick={() => setOptions(prev => ({ ...prev, [opt.key]: !prev[opt.key as keyof typeof prev] }))}
                                                    className={cn(
                                                        "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group",
                                                        options[opt.key as keyof typeof options]
                                                            ? "bg-blue-600/10 border-blue-500/50"
                                                            : "bg-slate-900/50 border-white/5 hover:border-white/10"
                                                    )}
                                                >
                                                    <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">{opt.label}</span>
                                                    <Checkbox
                                                        checked={!!options[opt.key as keyof typeof options]}
                                                        onCheckedChange={() => { }} // Handled by div
                                                        className="border-white/20"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CIM Specific Deductions */}
                                    <div className="space-y-4 pt-4 border-t border-white/5">
                                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-slate-500" />
                                            Deduceri Specifice CIM (Contract Muncă)
                                        </Label>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Persoane în întreținere</Label>
                                                <select
                                                    value={options.dependentsCount}
                                                    onChange={(e) => setOptions(prev => ({ ...prev, dependentsCount: parseInt(e.target.value) as any }))}
                                                    className="w-full h-11 px-4 rounded-xl bg-slate-900/50 border border-white/5 text-sm font-medium text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                                >
                                                    <option value={0}>Fără persoane</option>
                                                    <option value={1}>1 persoană</option>
                                                    <option value={2}>2 persoane</option>
                                                    <option value={3}>3 persoane</option>
                                                    <option value={4}>4 sau mai multe</option>
                                                </select>
                                            </div>

                                            <div
                                                onClick={() => setOptions(prev => ({ ...prev, isUnder26: !prev.isUnder26 }))}
                                                className={cn(
                                                    "flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group mt-auto h-11",
                                                    options.isUnder26
                                                        ? "bg-blue-600/10 border-blue-500/50"
                                                        : "bg-slate-900/50 border-white/5 hover:border-white/10"
                                                )}
                                            >
                                                <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">Vârsta sub 26 ani</span>
                                                <Checkbox
                                                    checked={options.isUnder26}
                                                    onCheckedChange={() => { }}
                                                    className="border-white/20"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Copii la școală (100 RON / copil)</Label>
                                            <div className="flex bg-slate-900/50 rounded-xl border border-white/5 h-11 overflow-hidden">
                                                <button
                                                    onClick={() => setOptions(prev => ({ ...prev, childrenInSchoolCount: Math.max(0, prev.childrenInSchoolCount - 1) }))}
                                                    className="px-6 hover:bg-white/10 border-r border-white/5 text-slate-400 hover:text-white transition-colors"
                                                >-</button>
                                                <div className="flex-1 flex items-center justify-center text-sm font-bold text-white tracking-widest">{options.childrenInSchoolCount}</div>
                                                <button
                                                    onClick={() => setOptions(prev => ({ ...prev, childrenInSchoolCount: prev.childrenInSchoolCount + 1 }))}
                                                    className="px-6 hover:bg-white/10 border-l border-white/5 text-slate-400 hover:text-white transition-colors"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 2: Optimization Grid - Constrained Width to match aesthetic */}
            <div className="max-w-4xl mx-auto w-full space-y-4">
                <button
                    onClick={() => setIsOptimizationOpen(!isOptimizationOpen)}
                    className="flex items-center justify-between w-full p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-all group"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-600/10 text-blue-400 group-hover:bg-blue-600/20 transition-colors">
                            <Calculator className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                            <span className="block text-sm font-bold text-white uppercase tracking-wider">Optimizări Fiscale (SRL)</span>
                            <span className="block text-[10px] text-slate-500 uppercase font-medium">Provizioane & Profit Reinvestit</span>
                        </div>
                    </div>
                    {isOptimizationOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isOptimizationOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Provisions Section */}
                        <Card className="border-0 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 shadow-xl overflow-hidden h-full">
                            <div className="bg-gradient-to-r from-blue-600/20 to-transparent border-b border-white/5 px-6 py-4">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                                    <Calculator className="w-4 h-4 text-blue-400" />
                                    Provizioane
                                </h4>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="prov_base" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valoare Creanță ({currency})</Label>
                                        <InputField
                                            id="prov_base"
                                            value={options.provisionBaseAmount}
                                            onChange={(val) => {
                                                const num = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
                                                const monthlyBase = period === 'ANNUAL' ? num / 12 : num;
                                                const multiplier = options.provisionType === 'BANKRUPTCY' ? 1 : 0.3;
                                                setOptions(prev => ({
                                                    ...prev,
                                                    provisionBaseAmount: val,
                                                    deductibleProvisions: monthlyBase * multiplier
                                                }));
                                            }}
                                            currency={currency}
                                            variant="compact"
                                            placeholder="Suma..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tip Deducere</Label>
                                        <RadioGroup
                                            className="grid grid-cols-1 gap-2"
                                            value={options.provisionType}
                                            onValueChange={(val: '270_DAYS' | 'BANKRUPTCY') => {
                                                const num = parseFloat(options.provisionBaseAmount.replace(/[^0-9.]/g, '')) || 0;
                                                const monthlyBase = period === 'ANNUAL' ? num / 12 : num;
                                                const multiplier = val === 'BANKRUPTCY' ? 1 : 0.3;
                                                setOptions(prev => ({
                                                    ...prev,
                                                    provisionType: val,
                                                    deductibleProvisions: monthlyBase * multiplier
                                                }));
                                            }}
                                        >
                                            <div
                                                className={cn(
                                                    "flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer",
                                                    options.provisionType === '270_DAYS' ? "bg-blue-600/10 border-blue-500/50" : "bg-white/5 border-white/5 hover:border-white/10"
                                                )}
                                                onClick={() => {
                                                    const val = '270_DAYS';
                                                    const num = parseFloat(options.provisionBaseAmount.replace(/[^0-9.]/g, '')) || 0;
                                                    const monthlyBase = period === 'ANNUAL' ? num / 12 : num;
                                                    setOptions(prev => ({ ...prev, provisionType: val, deductibleProvisions: monthlyBase * 0.3 }));
                                                }}>
                                                <RadioGroupItem value="270_DAYS" id="opt_270" className="sr-only" />
                                                <Label htmlFor="opt_270" className="text-xs font-bold cursor-pointer flex-1 text-slate-300">Peste 270 zile (30%)</Label>
                                            </div>

                                            <div
                                                className={cn(
                                                    "flex items-center space-x-2 p-3 rounded-lg border transition-all cursor-pointer",
                                                    options.provisionType === 'BANKRUPTCY' ? "bg-blue-600/10 border-blue-500/50" : "bg-white/5 border-white/5 hover:border-white/10"
                                                )}
                                                onClick={() => {
                                                    const val = 'BANKRUPTCY';
                                                    const num = parseFloat(options.provisionBaseAmount.replace(/[^0-9.]/g, '')) || 0;
                                                    const monthlyBase = period === 'ANNUAL' ? num / 12 : num;
                                                    const deductibleMonthly = monthlyBase;
                                                    setOptions(prev => ({ ...prev, provisionType: val, deductibleProvisions: deductibleMonthly }));
                                                }}>
                                                <RadioGroupItem value="BANKRUPTCY" id="opt_bank" className="sr-only" />
                                                <Label htmlFor="opt_bank" className="text-xs font-bold cursor-pointer flex-1 text-slate-300">Faliment (100%)</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                </div>

                                {options.deductibleProvisions > 0 && (
                                    <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-center space-y-2">
                                        <h5 className="font-black text-blue-400 uppercase tracking-widest text-xs">Impact Fiscal {period === 'ANNUAL' ? 'Anual' : 'Lunar'}</h5>
                                        <p className="text-white font-bold text-sm">
                                            Ai economisit <span className="text-blue-400">{Math.round((options.deductibleProvisions * 0.16) * (period === 'ANNUAL' ? 12 : 1)).toLocaleString()} {currency}</span> la taxe.
                                        </p>
                                        <p className="text-slate-400 text-xs">
                                            Suma de <span className="text-white font-bold">{Math.round(options.deductibleProvisions * (period === 'ANNUAL' ? 12 : 1)).toLocaleString()} {currency}</span> rămâne în firmă pentru cheltuieli viitoare.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Art. 22 Reinvested Profit Section */}
                        <Card className="border-0 bg-slate-900/40 backdrop-blur-xl ring-1 ring-white/10 shadow-xl overflow-hidden h-full">
                            <div className="bg-gradient-to-r from-green-600/20 to-transparent border-b border-white/5 px-6 py-4">
                                <h4 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Profit Reinvestit (Art. 22 Cod Fiscal)
                                </h4>
                            </div>
                            <CardContent className="p-6 space-y-6">
                                <div className="space-y-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                                            Bifează categoriile de active achiziționate pentru a aplica scutirea de impozit (se pot selecta mai multe):
                                        </Label>
                                        <div className="grid grid-cols-1 gap-2">
                                            {[
                                                { id: '2.1', label: 'Mașini, utilaje și instalații de lucru (Subgrupa 2.1)' },
                                                { id: '2.2.9', label: 'Calculatoare electronice și echipamente periferice (Clasa 2.2.9)' },
                                                { id: '2.0', label: 'Programe informatice achiziționate sau produse (Grupa 2)' },
                                                { id: 'PROD', label: 'Active utilizate în producție, procesare sau retehnologizare' }
                                            ].map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                                                        options.investmentCategories.includes(cat.id) ? "bg-green-600/10 border-green-500/50" : "bg-white/5 border-white/5 hover:border-white/10"
                                                    )}
                                                    onClick={() => {
                                                        setOptions(prev => ({
                                                            ...prev,
                                                            investmentCategories: prev.investmentCategories.includes(cat.id)
                                                                ? prev.investmentCategories.filter(c => c !== cat.id)
                                                                : [...prev.investmentCategories, cat.id]
                                                        }));
                                                    }}
                                                >
                                                    <Label className="text-xs font-bold cursor-pointer text-slate-300 pointer-events-none">{cat.label}</Label>
                                                    <Checkbox
                                                        id={`cat_${cat.id}`}
                                                        checked={options.investmentCategories.includes(cat.id)}
                                                        className="border-white/20 w-4 h-4 ml-2"
                                                        onCheckedChange={() => { }} // Handled by div click
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="invest_amount" className="text-xs font-bold text-slate-400 uppercase tracking-wider">Valoare Investiție ({currency})</Label>
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
                                        <p className="text-[10px] text-slate-500 italic">
                                            * Scutirea se acordă în limita impozitului pe profit calculat cumulat.
                                        </p>
                                    </div>
                                </div>

                                {options.reinvestedProfit > 0 && options.investmentCategories.length > 0 && (
                                    <div className="mt-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center space-y-2">
                                        <h5 className="font-black text-green-400 uppercase tracking-widest text-xs">Impact Fiscal {period === 'ANNUAL' ? 'Anual' : 'Lunar'}</h5>
                                        <p className="text-white font-bold text-sm">
                                            Ai economisit <span className="text-green-400">{Math.round((options.reinvestedProfit * 0.16) * (period === 'ANNUAL' ? 12 : 1)).toLocaleString()} {currency}</span> la taxe.
                                        </p>
                                        <p className="text-slate-400 text-xs">
                                            Suma de <span className="text-white font-bold">{Math.round(options.reinvestedProfit * (period === 'ANNUAL' ? 12 : 1)).toLocaleString()} {currency}</span> rămâne în firmă ca active, crescând valoarea companiei.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Comparison Cards Section */}
            <div className="space-y-8 pt-8 border-t border-white/5">
                <div className="flex flex-col items-center gap-2 text-center">
                    <h3 className="text-2xl font-bold text-white uppercase tracking-widest">Rezultate Comparate</h3>
                    <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
                </div>

                {/* Comparison Cards */}
                {comparison && (() => {
                    const minWage = TAX_RATES.CONSTANTS.MINIMUM_WAGE;
                    const cass6 = 0.1 * 6 * minWage;
                    const cass12 = 0.1 * 12 * minWage;
                    const cass24 = 0.1 * 24 * minWage;
                    const divTaxLabel = fiscalYear === 2025 ? '10%' : '16%';

                    const getCassBadge = (annualCass: number) => {
                        const diff = 5; // Tolerance
                        if (Math.abs(annualCass - cass24) < diff) return 'Plafon 24 Salarii';
                        if (Math.abs(annualCass - cass12) < diff) return 'Plafon 12 Salarii';
                        if (Math.abs(annualCass - cass6) < diff) return 'Plafon 6 Salarii';
                        return undefined;
                    };

                    const pfaCassAnnual = comparison.PFA.breakdown.cass * 12;
                    const microCassAnnual = (comparison.Micro.breakdown.cassDividend ?? 0) * 12;
                    const profitCassAnnual = (comparison.Profit.breakdown.cassDividend ?? 0) * 12;

                    return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
                            {/* PFA Card */}
                            <ComparisonCard
                                title="PFA"
                                subtitle="(Sistem Real)"
                                net={comparison.PFA.net}
                                gross={comparison.PFA.gross}
                                breakdown={[
                                    { label: 'Venituri', value: comparison.PFA.breakdown.venituri ?? comparison.PFA.gross, isPositive: true },
                                    { label: 'Cheltuieli', value: -(comparison.PFA.breakdown.cheltuieli ?? 0) },
                                    {
                                        label: 'CAS (25%)',
                                        value: -comparison.PFA.breakdown.cas,
                                        badge: getCassBadge(pfaCassAnnual),
                                        explanation: 'Plafon 12 sau 24 salarii minime (4.050 lei).'
                                    },
                                    {
                                        label: 'CASS (10%)',
                                        value: -comparison.PFA.breakdown.cass,
                                        explanation: fiscalYear === 2026
                                            ? '10% din profit (sub noul plafon de 72 salarii).'
                                            : '10% din net (plafon 60 salarii).'
                                    },
                                    {
                                        label: 'Venit Impozabil',
                                        value: comparison.PFA.breakdown.netIncome ?? 0,
                                        isPositive: true,
                                        explanation: 'Venit - Cheltuieli - CAS - CASS.'
                                    },
                                    {
                                        label: `Impozit ${fiscalYear === 2026 ? '16%' : '10%'}`,
                                        value: -comparison.PFA.breakdown.incomeTax,
                                        explanation: fiscalYear === 2026
                                            ? 'Cota crește oficial de la 10% la 16%.'
                                            : '10% din Venitul Impozabil.'
                                    },
                                ]}
                                currency={currency}
                                period={period}
                                isOptimal={comparison.optimal === 'PFA'}
                            />

                            {/* Micro Card */}
                            <ComparisonCard
                                title="Micro"
                                subtitle="(SRL 1%)"
                                net={comparison.Micro.net}
                                gross={comparison.Micro.gross}
                                breakdown={[
                                    { label: 'Venituri', value: comparison.Micro.breakdown.venituri ?? comparison.Micro.gross, isPositive: true },
                                    { label: 'Cheltuieli', value: -(comparison.Micro.breakdown.cheltuieli ?? 0) },
                                    {
                                        label: 'Salarii (Cost Total)',
                                        value: -(comparison.Micro.breakdown.salarii ?? 0),
                                        explanation: 'Include CAM 2.25%. Cost deductibil.'
                                    },
                                    { label: 'Plati pt Salarii', value: -(comparison.Micro.breakdown.platiSalarii ?? 0) },
                                    {
                                        label: 'Impozit Micro (1%)',
                                        value: -comparison.Micro.breakdown.microTax,
                                        explanation: fiscalYear === 2026 ? 'Se menține cota de 1% (eliminându-se cea de 3%).' : '1% din Cifra de Afaceri.'
                                    },
                                    {
                                        label: 'Dividende (brut)',
                                        value: comparison.Micro.breakdown.dividendeBrut ?? 0,
                                        isPositive: true,
                                        explanation: 'Profit net distribuit.'
                                    },
                                    {
                                        label: `Imp Div (${divTaxLabel})`,
                                        value: -comparison.Micro.breakdown.dividendTax,
                                        explanation: fiscalYear === 2026
                                            ? 'Crește de la 10% la 16%.'
                                            : '10% impozit pe dividende.'
                                    },
                                    {
                                        label: 'CASS (10%)',
                                        value: -(comparison.Micro.breakdown.cassDividend ?? 0),
                                        badge: getCassBadge(microCassAnnual),
                                        explanation: 'Plafon 24 salarii minime.'
                                    },
                                ]}
                                currency={currency}
                                period={period}
                                isOptimal={comparison.optimal === 'Micro'}
                            />

                            {/* Profit Card */}
                            <ComparisonCard
                                title="SRL"
                                subtitle="(Profit 16%)"
                                net={comparison.Profit.net}
                                gross={comparison.Profit.gross}
                                breakdown={[
                                    { label: 'Venituri', value: comparison.Profit.breakdown.venituri ?? comparison.Profit.gross, isPositive: true },
                                    {
                                        label: 'Cheltuieli',
                                        value: -(comparison.Profit.breakdown.cheltuieli ?? 0),
                                        explanation: 'Cheltuieli deductibile (ex. chirie, echipamente).'
                                    },
                                    {
                                        label: 'Impozit 16%',
                                        value: -(comparison.Profit.breakdown.profitTax ?? 0),
                                        explanation: '16% din Venitul Impozabil.'
                                    },
                                    {
                                        label: 'Dividende (brut)',
                                        value: comparison.Profit.breakdown.dividendeBrut ?? 0,
                                        isPositive: true,
                                        explanation: 'Profit net distribuit.'
                                    },
                                    {
                                        label: `Imp Div (${divTaxLabel})`,
                                        value: -comparison.Profit.breakdown.dividendTax,
                                        explanation: fiscalYear === 2026
                                            ? 'Crește de la 10% la 16%.'
                                            : '10% impozit pe dividende.'
                                    },
                                    {
                                        label: 'CASS (10%)',
                                        value: -(comparison.Profit.breakdown.cassDividend ?? 0),
                                        badge: getCassBadge(profitCassAnnual),
                                        explanation: 'Plafon 24 salarii minime.'
                                    },
                                ]}
                                currency={currency}
                                period={period}
                                isOptimal={comparison.optimal === 'Profit'}
                            />
                        </div>
                    );
                })()}
            </div>
        </div >
    );
}

// --- Subcomponent: Comparison Card ---

interface ComparisonCardProps {
    title: string;
    subtitle?: string;
    net: number;
    gross: number;
    breakdown: { label: string; value: number; isPositive?: boolean; badge?: string; explanation?: string }[];
    currency: Currency;
    period: 'MONTHLY' | 'ANNUAL';
    isOptimal?: boolean;
}

function ComparisonCard({ title, subtitle, net, gross, breakdown, currency, period, isOptimal }: ComparisonCardProps) {
    const totalTaxes = gross - net;

    return (
        <div className={cn("relative h-full", isOptimal && "z-20")}>
            <Card className={cn(
                "overflow-hidden border-0 bg-slate-900/40 backdrop-blur-xl shadow-2xl transition-all duration-300 flex flex-col h-full relative",
                isOptimal ? "ring-2 ring-blue-500/50 scale-[1.02]" : "ring-1 ring-white/10 hover:ring-white/20"
            )}>
                {/* Top Highlight Line for Optimal */}
                {isOptimal && <div className="absolute top-0 inset-x-0 h-1 bg-blue-500" />}

                {/* Header */}
                <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-xl text-white tracking-tight uppercase">{title}</h4>
                                {subtitle && <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">{subtitle}</span>}
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bani în mână</p>
                        </div>
                        {isOptimal && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-black text-white tracking-tight">
                            {fiscalDAL.formatCurrency(net, currency)}
                        </span>
                    </div>
                </div>

                <CardContent className="p-0 flex-1 flex flex-col">
                    <div className="divide-y divide-white/5 flex-1 flex flex-col">
                        {/* Breakdown Items */}
                        <div className="px-6 py-4 space-y-3 flex-1">
                            {breakdown.map((item, idx) => (
                                <div key={idx} className="flex flex-col gap-1 text-sm group">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-slate-400 group-hover:text-slate-200 transition-colors uppercase tracking-tight">{item.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className={cn(
                                                "font-bold tracking-tight text-right tabular-nums",
                                                item.isPositive ? "text-blue-400" : "text-white"
                                            )}>
                                                {item.isPositive ? '+' : ''}{fiscalDAL.formatCurrency(item.value, currency)}
                                            </span>
                                            {item.badge && (
                                                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20 uppercase tracking-tighter whitespace-nowrap">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {item.explanation && (
                                        <p className="text-[10px] text-slate-500 italic pl-2 border-l-2 border-slate-700/50">
                                            {item.explanation}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Summary Footer */}
                        <div className="px-6 py-4 bg-white/5 space-y-3 mt-auto">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Taxe de plată</span>
                                <span className="text-sm font-black text-white">
                                    -{fiscalDAL.formatCurrency(totalTaxes, currency)}
                                </span>
                            </div>

                            <div className="h-px bg-white/10 w-full" />

                            <div className="flex justify-between items-center pt-1">
                                <span className="text-[11px] font-black text-white uppercase tracking-widest">Bani în mână</span>
                                <div className="text-right">
                                    <span className="text-2xl font-black text-white block leading-none">
                                        {fiscalDAL.formatCurrency(net, currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Outside Bottom Badge */}
            {isOptimal && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black px-4 py-1 rounded-full shadow-lg border border-blue-400 uppercase tracking-widest z-30">
                    Recomandat
                </div>
            )}
        </div>
    );
}
