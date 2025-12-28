'use client';

/**
 * COMPARISON VIEW COMPONENT
 * 
 * Displays side-by-side comparison of all fiscal scenarios.
 * 
 * @accessibility
 * - Semantic section with heading
 * - Optimal badge readable by screen readers
 * - Color is not the only indicator of state
 */

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fiscalDAL } from '@/lib/dal';
import type { ComparisonResult, Currency, ScenarioType } from '@/lib/dal/types';

// Configuration
const SCENARIOS: readonly ScenarioType[] = ['CIM', 'PFA', 'SRL'] as const;

const SCENARIO_META: Record<ScenarioType, {
    name: string;
    fullName: string;
    headerClass: string;
    iconBgClass: string;
}> = {
    CIM: {
        name: 'CIM',
        fullName: 'Contract Individual de Muncă',
        headerClass: 'bg-gradient-to-br from-blue-500 to-blue-600',
        iconBgClass: 'bg-blue-100 dark:bg-blue-900/30'
    },
    PFA: {
        name: 'PFA',
        fullName: 'Persoană Fizică Autorizată',
        headerClass: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        iconBgClass: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    SRL: {
        name: 'SRL',
        fullName: 'Microîntreprindere',
        headerClass: 'bg-gradient-to-br from-purple-500 to-purple-600',
        iconBgClass: 'bg-purple-100 dark:bg-purple-900/30'
    }
};

interface ComparisonViewProps {
    comparison: ComparisonResult;
    currency: Currency;
}

export function ComparisonView({ comparison, currency }: ComparisonViewProps) {
    return (
        <section aria-labelledby="comparison-heading">
            <h2
                id="comparison-heading"
                className="text-lg md:text-xl font-bold text-slate-800 dark:text-white text-center mb-4 md:mb-6"
            >
                Comparație Scenarii
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
                {SCENARIOS.map((scenario) => (
                    <ScenarioCard
                        key={scenario}
                        scenario={scenario}
                        comparison={comparison}
                        currency={currency}
                    />
                ))}
            </div>
        </section>
    );
}

interface ScenarioCardProps {
    scenario: ScenarioType;
    comparison: ComparisonResult;
    currency: Currency;
}

function ScenarioCard({ scenario, comparison, currency }: ScenarioCardProps) {
    const meta = SCENARIO_META[scenario];
    const result = comparison[scenario];
    const isOptimal = comparison.optimal === scenario;

    // Memoize formatted values
    const formattedValues = useMemo(() => ({
        gross: fiscalDAL.formatCurrency(result.gross, currency),
        net: fiscalDAL.formatCurrency(result.net, currency),
        taxes: fiscalDAL.formatCurrency(result.totalTaxes, currency),
        rate: ((result.totalTaxes / result.gross) * 100).toFixed(1),
        savings: comparison.savings > 0 ? fiscalDAL.formatCurrency(comparison.savings, currency) : null
    }), [result, currency, comparison.savings]);

    return (
        <Card
            className={`relative overflow-hidden transition-shadow duration-300 hover:shadow-lg border-slate-200 dark:border-slate-700/50 ${isOptimal ? 'ring-2 ring-green-500 shadow-lg shadow-green-500/10' : ''
                }`}
        >
            {/* Optimal Badge */}
            {isOptimal && (
                <div className="absolute top-3 right-3 z-10">
                    <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                        <CheckIcon className="w-3.5 h-3.5" />
                        <span>OPTIM</span>
                    </span>
                </div>
            )}

            {/* Header */}
            <CardHeader className={`${meta.headerClass} text-white py-4 md:py-5`}>
                <CardTitle className="text-lg md:text-xl font-bold">
                    {meta.name}
                </CardTitle>
                <p className="text-xs md:text-sm text-white/80 mt-0.5">{meta.fullName}</p>
            </CardHeader>

            <CardContent className="pt-5 md:pt-6 space-y-4">
                {/* Main Value */}
                <div className="text-center">
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">
                        Cost Total Brut
                    </p>
                    <p className={`text-2xl md:text-3xl font-bold ${isOptimal ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-white'
                        }`}>
                        {formattedValues.gross}
                    </p>
                </div>

                <hr className="border-slate-200 dark:border-slate-700" />

                {/* Details */}
                <dl className="space-y-2 md:space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <dt className="text-slate-500 dark:text-slate-400">Venit Net</dt>
                        <dd className="font-semibold text-green-600 dark:text-green-400">
                            {formattedValues.net}
                        </dd>
                    </div>

                    <div className="flex justify-between items-center">
                        <dt className="text-slate-500 dark:text-slate-400">Total Taxe</dt>
                        <dd className="font-semibold text-red-500 dark:text-red-400">
                            {formattedValues.taxes}
                        </dd>
                    </div>

                    <div className="flex justify-between items-center">
                        <dt className="text-slate-500 dark:text-slate-400">Rata Taxare</dt>
                        <dd className="font-medium text-slate-700 dark:text-slate-300">
                            {formattedValues.rate}%
                        </dd>
                    </div>
                </dl>

                {/* Savings Badge */}
                {isOptimal && formattedValues.savings && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-900/30">
                        <p className="text-xs md:text-sm text-green-700 dark:text-green-400 text-center font-medium">
                            Economisești <strong>{formattedValues.savings}</strong> lunar
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden="true"
        >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}
