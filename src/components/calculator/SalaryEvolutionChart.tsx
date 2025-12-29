'use client';

import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fiscalDAL } from '@/lib/dal';

// Historical Data (Official Romanian Statistics - BRUT values)
// Values are in RON (Gross/Brut)
const EVOLUTION_DATA = [
    { year: '2007', minBrut: 390, avgBrut: 1270 },
    { year: '2008', minBrut: 540, avgBrut: 1550 },
    { year: '2009', minBrut: 600, avgBrut: 1693 },
    { year: '2010', minBrut: 600, avgBrut: 1836 },
    { year: '2011', minBrut: 670, avgBrut: 2022 },
    { year: '2012', minBrut: 700, avgBrut: 2117 },
    { year: '2013', minBrut: 800, avgBrut: 2223 },
    { year: '2014', minBrut: 900, avgBrut: 2298 },
    { year: '2015', minBrut: 1050, avgBrut: 2415 },
    { year: '2016', minBrut: 1250, avgBrut: 2681 },
    { year: '2017', minBrut: 1450, avgBrut: 3131 },
    { year: '2018', minBrut: 1900, avgBrut: 4162 },
    { year: '2019', minBrut: 2080, avgBrut: 5163 },
    { year: '2020', minBrut: 2230, avgBrut: 5429 },
    { year: '2021', minBrut: 2300, avgBrut: 5380 },
    { year: '2022', minBrut: 2550, avgBrut: 6095 },
    { year: '2023', minBrut: 3300, avgBrut: 6789 },
    { year: '2024', minBrut: 3700, avgBrut: 7567 },
    { year: '2025', minBrut: 4050, avgBrut: 8620 },
    { year: '2026', minBrut: 4325, avgBrut: 9200 }, // Projection (Jul 2026)
];

export function SalaryEvolutionChart() {
    return (
        <Card className="border-0 shadow-xl overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Evoluția Salariilor în România (2007 - 2026)
                </CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                    Comparație istorică între Salariul Minim și Mediu Brut pe Economie
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart
                            data={EVOLUTION_DATA}
                            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                            <defs>
                                <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                            <XAxis
                                dataKey="year"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickFormatter={(value) => `${value} Lei`}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                                }}
                                itemStyle={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}
                                labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px' }}
                                formatter={(value: any, name: any) => [`${value} RON`, name]}
                            />
                            <Legend
                                verticalAlign="top"
                                height={36}
                                formatter={(value) => <span className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-2">{value}</span>}
                            />

                            <Area
                                type="monotone"
                                dataKey="avgBrut"
                                name="Salariu Mediu Brut"
                                stroke="#3b82f6"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorAvg)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                            <Area
                                type="monotone"
                                dataKey="minBrut"
                                name="Salariu Minim Brut"
                                stroke="#ef4444"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorMin)"
                                activeDot={{ r: 6, strokeWidth: 0 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
                <div className="text-center mt-6 text-xs text-slate-400 dark:text-slate-500">
                    * Datele pentru 2025-2026 sunt estimative, bazate pe tendințele actuale și legislația în vigoare.
                </div>
            </CardContent>
        </Card>
    );
}
