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
        <div className="flex flex-col items-center w-full">
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
                            innerRadius="60%"
                            outerRadius="90%"
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
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
                    <div className="text-center">
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Net</p>
                        <p className="text-2xl font-black text-green-600 dark:text-green-500 tracking-tight">
                            {netPercentage}%
                        </p>
                    </div>
                </div>
            </div>

            {/* Custom HTML Legend */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
                {data.map((item) => {
                    const pct = ((item.value / result.gross) * 100).toFixed(1);
                    return (
                        <div key={item.name} className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {item.name}: <span className="text-slate-900 dark:text-white font-bold">{fiscalDAL.formatCurrency(item.value, currency)}</span>
                                <span className="text-slate-400 ml-1">({pct}%)</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Named export for dynamic import
export default ResultsChart;
