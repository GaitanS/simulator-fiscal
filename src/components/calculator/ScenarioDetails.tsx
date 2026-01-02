'use client';

/**
 * SCENARIO DETAILS COMPONENT
 * 
 * Shows detailed tax breakdown for a specific scenario.
 * 
 * @accessibility
 * - Semantic table structure with dl/dt/dd
 * - Status badges readable by screen readers
 */

import { useMemo, type ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fiscalDAL } from '@/lib/dal';
import type {
    CalculationResult,
    Currency,
    CIMBreakdown,
    PFABreakdown,
    SRLBreakdown
} from '@/lib/dal/types';

interface ScenarioDetailsProps {
    result: CalculationResult;
    currency: Currency;
    isOptimal: boolean;
}

export function ScenarioDetails({ result, currency, isOptimal }: ScenarioDetailsProps) {
    // Memoize formatted summary values
    const summary = useMemo(() => ({
        gross: fiscalDAL.formatCurrency(result.gross, currency),
        net: fiscalDAL.formatCurrency(result.net, currency),
        taxes: fiscalDAL.formatCurrency(result.totalTaxes, currency)
    }), [result, currency]);

    return (
        <Card className={`border-slate-200 dark:border-slate-700/50 ${isOptimal ? 'ring-2 ring-green-500' : ''}`}>
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base md:text-lg font-semibold text-slate-800 dark:text-white">
                        Defalcare Taxe – {result.scenario}
                    </CardTitle>
                    {isOptimal && <OptimalBadge />}
                </div>
            </CardHeader>

            <CardContent className="pt-5 md:pt-6 space-y-5 md:space-y-6">
                {/* Summary Grid */}
                <div className="grid grid-cols-3 gap-2 md:gap-4 p-4 md:p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <SummaryItem label="Cost Brut" value={summary.gross} variant="default" />
                    <SummaryItem label="Venit Net" value={summary.net} variant="success" />
                    <SummaryItem label="Total Taxe" value={summary.taxes} variant="danger" />
                </div>

                {/* Breakdown */}
                <div>
                    <h4 className="font-semibold text-xs md:text-sm text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-3">
                        Detalii Contribuții
                    </h4>

                    <BreakdownList>
                        {result.scenario === 'CIM' && (
                            <CIMBreakdownItems breakdown={result.breakdown as CIMBreakdown} currency={currency} />
                        )}
                        {result.scenario === 'PFA' && (
                            <PFABreakdownItems breakdown={result.breakdown as PFABreakdown} currency={currency} />
                        )}
                        {result.scenario === 'SRL' && (
                            <SRLBreakdownItems breakdown={result.breakdown as SRLBreakdown} currency={currency} />
                        )}
                    </BreakdownList>
                </div>
            </CardContent>
        </Card>
    );
}

// --- Sub-components ---

function OptimalBadge() {
    return (
        <span className="inline-flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            OPTIM
        </span>
    );
}

interface SummaryItemProps {
    label: string;
    value: string;
    variant: 'default' | 'success' | 'danger';
}

function SummaryItem({ label, value, variant }: SummaryItemProps) {
    const valueClass = {
        default: 'text-slate-800 dark:text-white',
        success: 'text-green-600 dark:text-green-400',
        danger: 'text-red-500 dark:text-red-400'
    }[variant];

    return (
        <div className="text-center">
            <dt className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide mb-1">
                {label}
            </dt>
            <dd className={`text-base md:text-xl font-bold ${valueClass}`}>
                {value}
            </dd>
        </div>
    );
}

function BreakdownList({ children }: { children: ReactNode }) {
    return (
        <dl className="space-y-2">
            {children}
        </dl>
    );
}

interface BreakdownRowProps {
    label: string;
    value: number;
    percentage: string;
    currency: Currency;
    note?: string;
    capped?: boolean;
    variant?: 'default' | 'info';
}

function BreakdownRow({ label, value, percentage, currency, note, capped, variant = 'default' }: BreakdownRowProps) {
    const baseClass = variant === 'info'
        ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30'
        : 'bg-slate-50 dark:bg-slate-800/50';

    const valueClass = variant === 'info'
        ? 'text-blue-700 dark:text-blue-300'
        : 'text-red-500 dark:text-red-400';

    return (
        <div className={`flex flex-wrap justify-between items-center gap-2 py-2.5 md:py-3 px-3 md:px-4 rounded-xl ${baseClass}`}>
            <dt className="flex items-center gap-2 flex-wrap">
                <span className="text-xs md:text-sm text-slate-700 dark:text-slate-300 font-medium">{label}</span>
                <span className="text-[10px] md:text-xs text-slate-400">({percentage})</span>
                {note && <span className="text-[10px] md:text-xs text-slate-400 italic">{note}</span>}
                {capped && (
                    <span className="text-[10px] md:text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                        PLAFONAT
                    </span>
                )}
            </dt>
            <dd className={`font-semibold text-sm md:text-base ${valueClass}`}>
                {variant === 'info' ? '-' : ''}{fiscalDAL.formatCurrency(value, currency)}
            </dd>
        </div>
    );
}

// --- Breakdown Item Components ---

function CIMBreakdownItems({ breakdown, currency }: { breakdown: CIMBreakdown; currency: Currency }) {
    return (
        <>
            <BreakdownRow label="CAS (Pensie)" value={breakdown.cas} percentage="25%" currency={currency} />
            <BreakdownRow label="CASS (Sănătate)" value={breakdown.cass} percentage="10%" currency={currency} />
            <BreakdownRow label="Impozit pe Venit" value={breakdown.incomeTax} percentage="10%" currency={currency} note="din baza impozabilă" />
            <BreakdownRow label="Deducere Personală" value={breakdown.personalDeduction} percentage="fix" currency="RON" variant="info" />
        </>
    );
}

function PFABreakdownItems({ breakdown, currency }: { breakdown: PFABreakdown; currency: Currency }) {
    return (
        <>
            <BreakdownRow label="CAS (Pensie)" value={breakdown.cas} percentage="25%" currency={currency} capped={breakdown.casCapped} />
            <BreakdownRow label="CASS (Sănătate)" value={breakdown.cass} percentage="10%" currency={currency} capped={breakdown.cassCapped} />
            <BreakdownRow label="Impozit pe Venit" value={breakdown.incomeTax} percentage="10%" currency={currency} />
        </>
    );
}

function SRLBreakdownItems({ breakdown, currency }: { breakdown: SRLBreakdown; currency: Currency }) {
    return (
        <>
            <BreakdownRow label="Impozit Micro" value={breakdown.microTax} percentage={`${((breakdown.microTaxRate ?? 0) * 100).toFixed(0)}%`} currency={currency} note="din CA" />
            <BreakdownRow label="Impozit Dividende" value={breakdown.dividendTax} percentage="16%" currency={currency} />
            <BreakdownRow label="CASS Dividende" value={breakdown.cassDividend ?? 0} percentage="10%" currency={currency} capped={breakdown.cassDividendCapped} />
        </>
    );
}
