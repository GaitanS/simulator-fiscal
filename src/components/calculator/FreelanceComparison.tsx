'use client';

import { useState, useMemo, useCallback, useId } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { fiscalDAL } from '@/lib/dal';
import { InputField } from './InputField';
import { CurrencyToggle } from './CurrencyToggle';
import type { Currency, FreelanceComparisonResult } from '@/lib/dal/types';
import { Card, CardContent } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function FreelanceComparison() {
    // Generate unique IDs
    const inputId = useId();

    // State
    const [inputValue, setInputValue] = useState<string>('10000');
    const [grossIncome, setGrossIncome] = useState<number>(10000);
    const [currency, setCurrency] = useState<Currency>('RON');

    // Smart Options
    const [options, setOptions] = useState({
        isPensioner: false,
        isHandicapped: false
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
        setInputValue(Math.round(convertedValue).toString());
        setCurrency(newCurrency);
    }, [grossIncome, currency]);

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
                    Câți bani îți rămân în mână?
                </h2>
                <p className="text-slate-500 dark:text-slate-400 -mt-4">
                    Estimare lunară bazată pe venitul și cheltuielile tale
                </p>

                <div className="w-full max-w-sm space-y-4 pt-4">
                    <InputField
                        id={inputId}
                        value={inputValue}
                        onChange={handleInputChange}
                        currency={currency}
                        placeholder="Venit Facturat"
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
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* Comparison Cards */}
            {comparison && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {/* PFA Card */}
                    <ComparisonCard
                        title="PFA"
                        subtitle="(Sistem Real)"
                        net={comparison.PFA.net}
                        gross={comparison.PFA.gross}
                        breakdown={[
                            { label: 'Venit Net', value: comparison.PFA.gross, isPositive: true },
                            { label: 'CASS (sănătate)', value: -comparison.PFA.breakdown.cass },
                            { label: 'CAS (pensie)', value: -comparison.PFA.breakdown.cas },
                            { label: 'Impozit pe venit', value: -comparison.PFA.breakdown.incomeTax },
                        ]}
                        currency={currency}
                        isOptimal={comparison.optimal === 'PFA'}
                    />

                    {/* Micro Card */}
                    <ComparisonCard
                        title="Micro"
                        subtitle="(SRL 1%)"
                        net={comparison.Micro.net}
                        gross={comparison.Micro.gross}
                        breakdown={[
                            { label: 'Venit Net', value: comparison.Micro.gross, isPositive: true },
                            { label: 'Impozit pe venit', value: -comparison.Micro.breakdown.microTax },
                            { label: 'Impozit dividende', value: -comparison.Micro.breakdown.dividendTax },
                            { label: 'CASS (sănătate)', value: -comparison.Micro.breakdown.cassDividend },
                        ]}
                        currency={currency}
                        isOptimal={comparison.optimal === 'Micro'}
                    />

                    {/* Profit Card */}
                    <ComparisonCard
                        title="SRL"
                        subtitle="(Profit 16%)"
                        net={comparison.Profit.net}
                        gross={comparison.Profit.gross}
                        breakdown={[
                            { label: 'Venit Net', value: comparison.Profit.gross, isPositive: true },
                            { label: 'Impozit pe profit', value: -comparison.Profit.breakdown.microTax },
                            { label: 'Impozit dividende', value: -comparison.Profit.breakdown.dividendTax },
                            { label: 'CASS (Sănătate)', value: -comparison.Profit.breakdown.cassDividend },
                        ]}
                        currency={currency}
                        isOptimal={comparison.optimal === 'Profit'}
                    />
                </div>
            )}
        </div>
    );
}

// --- Subcomponent: Comparison Card ---

interface ComparisonCardProps {
    title: string;
    subtitle?: string;
    net: number;
    gross: number;
    breakdown: { label: string; value: number; isPositive?: boolean }[];
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
