'use client';

/**
 * RESULTS CHART COMPONENT
 * 
 * Donut chart showing net income vs taxes distribution.
 * 
 * @accessibility
 * - Chart has aria-label describing the data
 * - Color is not the only indicator (legend with values)
 * 
 * @performance
 * - Component is dynamically imported in Calculator
 * - Uses ResponsiveContainer for proper sizing
 */

import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { fiscalDAL } from '@/lib/dal';
import type { CalculationResult, Currency } from '@/lib/dal/types';

interface ResultsChartProps {
    result: CalculationResult;
    currency: Currency;
}

const COLORS = {
    net: '#22c55e',
    taxes: '#ef4444'
} as const;

export function ResultsChart({ result, currency }: ResultsChartProps) {
    // Memoize chart data
    const data = useMemo(() => [
        { name: 'Venit Net', value: result.net, color: COLORS.net },
        { name: 'Taxe', value: result.totalTaxes, color: COLORS.taxes }
    ], [result.net, result.totalTaxes]);

    const netPercentage = useMemo(() =>
        ((result.net / result.gross) * 100).toFixed(1),
        [result.net, result.gross]
    );

    return (
        <div
            className="w-full h-64 md:h-80 relative"
            role="img"
            aria-label={`Grafic: ${netPercentage}% venit net, restul taxe`}
        >
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius="45%"
                        outerRadius="70%"
                        paddingAngle={2}
                        dataKey="value"
                        animationBegin={0}
                        animationDuration={600}
                        animationEasing="ease-out"
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                                stroke={entry.color}
                                strokeWidth={2}
                            />
                        ))}
                    </Pie>

                    <Tooltip
                        formatter={(value: any) => fiscalDAL.formatCurrency(Number(value) || 0, currency)}
                        contentStyle={{
                            backgroundColor: 'rgba(15, 23, 42, 0.95)',
                            border: 'none',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                            padding: '8px 12px',
                            fontSize: '14px'
                        }}
                        itemStyle={{ color: 'white' }}
                        labelStyle={{ color: 'white', marginBottom: '4px' }}
                    />

                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => {
                            const item = data.find(d => d.name === value);
                            if (!item) return value;
                            const pct = ((item.value / result.gross) * 100).toFixed(1);
                            return (
                                <span className="text-xs md:text-sm text-slate-600 dark:text-slate-300">
                                    {value}: {fiscalDAL.formatCurrency(item.value, currency)} ({pct}%)
                                </span>
                            );
                        }}
                    />
                </PieChart>
            </ResponsiveContainer>

            {/* Center Label */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                <div className="text-center -mt-6 md:-mt-8">
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Net</p>
                    <p className="text-xl md:text-2xl font-bold text-green-600 dark:text-green-400">
                        {netPercentage}%
                    </p>
                </div>
            </div>
        </div>
    );
}

// Named export for dynamic import
export default ResultsChart;
