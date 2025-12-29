'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { fiscalDAL } from '@/lib/dal';

export function Header() {
    const pathname = usePathname();
    const [rate, setRate] = useState<number>(0);

    useEffect(() => {
        // Poll for rate changes from the singleton logic
        // BNRFetcher in layout deals with the actual fetching
        const interval = setInterval(() => {
            const currentRate = fiscalDAL.getExchangeRate();
            if (currentRate !== rate) {
                setRate(currentRate);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [rate]);

    const isActive = (path: string) => pathname === path;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <Link href="/" className="flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white">
                        <span className="bg-blue-600 text-white p-1 rounded-lg">SF</span>
                        <span>Simulator Fiscal</span>
                    </Link>

                    <nav className="flex items-center gap-1">
                        <Link
                            href="/"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/')
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            Comparator PFA / SRL
                        </Link>
                        <Link
                            href="/calculator-salariu"
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive('/calculator-salariu')
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }`}
                        >
                            Calculator Salariu
                        </Link>
                    </nav>

                    {/* BNR Badge */}
                    <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                            Curs BNR:
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {rate > 0 ? `1 EUR = ${rate.toFixed(4)} RON` : 'Se încarcă...'}
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
