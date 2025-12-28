'use client';

import { useState, useMemo } from 'react';

// Romanian Public Holidays (fixed dates)
const FIXED_HOLIDAYS_RO = [
    { month: 1, day: 1 },   // Anul Nou
    { month: 1, day: 2 },   // Anul Nou (zi 2)
    { month: 1, day: 24 },  // Unirea Principatelor
    { month: 5, day: 1 },   // Ziua Muncii
    { month: 6, day: 1 },   // Ziua Copilului
    { month: 8, day: 15 },  // Adormirea Maicii Domnului
    { month: 11, day: 30 }, // Sfântul Andrei
    { month: 12, day: 1 },  // Ziua Națională
    { month: 12, day: 25 }, // Crăciun
    { month: 12, day: 26 }, // Crăciun (zi 2)
];

// Calculate Easter Sunday (Orthodox) using the Meeus algorithm
function getOrthodoxEaster(year: number): Date {
    const a = year % 4;
    const b = year % 7;
    const c = year % 19;
    const d = (19 * c + 15) % 30;
    const e = (2 * a + 4 * b - d + 34) % 7;
    const month = Math.floor((d + e + 114) / 31);
    const day = ((d + e + 114) % 31) + 1;

    // Convert from Julian to Gregorian calendar (add 13 days for 1900-2099)
    const julianDate = new Date(year, month - 1, day);
    julianDate.setDate(julianDate.getDate() + 13);

    return julianDate;
}

// Get all holidays for a specific year
function getHolidays(year: number): Set<string> {
    const holidays = new Set<string>();

    // Add fixed holidays
    FIXED_HOLIDAYS_RO.forEach(h => {
        holidays.add(`${year}-${h.month}-${h.day}`);
    });

    // Calculate Easter-related holidays
    const easter = getOrthodoxEaster(year);

    // Good Friday (2 days before Easter)
    const goodFriday = new Date(easter);
    goodFriday.setDate(easter.getDate() - 2);
    holidays.add(`${year}-${goodFriday.getMonth() + 1}-${goodFriday.getDate()}`);

    // Easter Sunday
    holidays.add(`${year}-${easter.getMonth() + 1}-${easter.getDate()}`);

    // Easter Monday (1 day after)
    const easterMonday = new Date(easter);
    easterMonday.setDate(easter.getDate() + 1);
    holidays.add(`${year}-${easterMonday.getMonth() + 1}-${easterMonday.getDate()}`);

    // Rusalii / Pentecost (50 days after Easter)
    const pentecost = new Date(easter);
    pentecost.setDate(easter.getDate() + 49);
    holidays.add(`${year}-${pentecost.getMonth() + 1}-${pentecost.getDate()}`);

    const pentecostMonday = new Date(pentecost);
    pentecostMonday.setDate(pentecost.getDate() + 1);
    holidays.add(`${year}-${pentecostMonday.getMonth() + 1}-${pentecostMonday.getDate()}`);

    return holidays;
}

// Calculate working days for a specific month
function calculateWorkingDays(year: number, month: number, holidays: Set<string>): number {
    const daysInMonth = new Date(year, month, 0).getDate();
    let workingDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        const dateKey = `${year}-${month}-${day}`;

        // Skip weekends (0 = Sunday, 6 = Saturday) and holidays
        if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.has(dateKey)) {
            workingDays++;
        }
    }

    return workingDays;
}

const MONTH_NAMES = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
];

interface MonthData {
    month: string;
    days: number;
    workingDays: number;
}

function generateYearData(year: number): MonthData[] {
    const holidays = getHolidays(year);

    return MONTH_NAMES.map((name, index) => {
        const monthNum = index + 1;
        const daysInMonth = new Date(year, monthNum, 0).getDate();
        const workingDays = calculateWorkingDays(year, monthNum, holidays);

        return {
            month: name,
            days: daysInMonth,
            workingDays
        };
    });
}

export function WorkingDaysCalendar({ variant = 'light' }: { variant?: 'light' | 'dark' }) {
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // Auto-generate data for selected year
    const yearData = useMemo(() => generateYearData(selectedYear), [selectedYear]);

    const totalDays = yearData.reduce((sum, m) => sum + m.days, 0);
    const totalWorkingDays = yearData.reduce((sum, m) => sum + m.workingDays, 0);
    const totalHours8 = yearData.reduce((sum, m) => sum + m.workingDays * 8, 0);
    const totalHours4 = yearData.reduce((sum, m) => sum + m.workingDays * 4, 0);
    const avgWorkingDays = Math.round(totalWorkingDays / 12);
    const avgHours8 = Math.round(totalHours8 / 12);
    const freeDays = totalDays - totalWorkingDays;

    const isDark = variant === 'dark';

    return (
        <div className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            {/* Header with Year Selector */}
            <div className={`flex items-center justify-between px-4 py-3 ${isDark ? 'bg-slate-700/50' : 'bg-emerald-50'}`}>
                <button
                    onClick={() => setSelectedYear(prev => prev - 1)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-emerald-100 text-emerald-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-emerald-800'}`}>
                    Zile Lucrătoare {selectedYear}
                </h3>
                <button
                    onClick={() => setSelectedYear(prev => prev + 1)}
                    className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-600 text-slate-300' : 'hover:bg-emerald-100 text-emerald-700'}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className={isDark ? 'bg-slate-700/30' : 'bg-emerald-100/50'}>
                            <th className={`px-4 py-3 text-left font-semibold ${isDark ? 'text-slate-300' : 'text-emerald-800'}`}>Luna</th>
                            <th className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-slate-300' : 'text-emerald-800'}`}>Zile</th>
                            <th className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Lucrătoare</th>
                            <th className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-slate-300' : 'text-emerald-800'}`}>8h/zi</th>
                            <th className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-slate-300' : 'text-emerald-800'}`}>4h/zi</th>
                        </tr>
                    </thead>
                    <tbody className={`divide-y ${isDark ? 'divide-slate-700/50' : 'divide-emerald-100'}`}>
                        {yearData.map((month) => (
                            <tr key={month.month} className={isDark ? 'hover:bg-slate-700/30' : 'hover:bg-emerald-50/50'}>
                                <td className={`px-4 py-2.5 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                                    <span className="inline-flex items-center gap-2 font-medium">
                                        <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-emerald-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {month.month}
                                    </span>
                                </td>
                                <td className={`px-4 py-2.5 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{month.days}</td>
                                <td className={`px-4 py-2.5 text-center font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{month.workingDays}</td>
                                <td className={`px-4 py-2.5 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{month.workingDays * 8}</td>
                                <td className={`px-4 py-2.5 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{month.workingDays * 4}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className={isDark ? 'bg-slate-700/30' : 'bg-emerald-50'}>
                        <tr className={`border-t-2 ${isDark ? 'border-slate-600' : 'border-emerald-200'}`}>
                            <td className={`px-4 py-3 font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>Total</td>
                            <td className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{totalDays}</td>
                            <td className={`px-4 py-3 text-center font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>{totalWorkingDays}</td>
                            <td className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{totalHours8}</td>
                            <td className={`px-4 py-3 text-center font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{totalHours4}</td>
                        </tr>
                        <tr>
                            <td className={`px-4 py-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Medie</td>
                            <td className={`px-4 py-2 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</td>
                            <td className={`px-4 py-2 text-center font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{avgWorkingDays}</td>
                            <td className={`px-4 py-2 text-center ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{avgHours8}</td>
                            <td className={`px-4 py-2 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>—</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Footer Summary */}
            <div className={`px-4 py-3 text-center text-sm ${isDark ? 'bg-slate-700/30 text-slate-400' : 'bg-slate-50 text-slate-600'}`}>
                Din {totalDays} de zile sunt:
            </div>
            <div className="flex">
                <div className="flex-1 py-3 text-center font-bold text-white bg-emerald-500">
                    {totalWorkingDays} Lucrătoare
                </div>
                <div className="flex-1 py-3 text-center font-bold text-white bg-red-500">
                    {freeDays} Libere
                </div>
            </div>
        </div>
    );
}
