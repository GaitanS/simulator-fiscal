'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
    Wallet,
    Building2,
    PiggyBank,
    HeartPulse,
    ShieldCheck,
    Briefcase
} from 'lucide-react'; // Assuming Lucide icons are available (standard in shadcn/ui)

// If Lucide is not installed, we can use simple SVG icons or text. 
// Assuming installed based on likely Shadcn usage. If fails, I will revert to SVGs.

export function SalaryExplanations() {
    return (
        <div className="space-y-12">
            {/* Main Concepts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Salariu Brut */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                    <CardContent className="p-6 pt-8 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Salariu Brut</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Baza de calcul</p>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            Suma trecută în contractul de muncă. Include salariul net plus taxele angajatului către stat (CAS, CASS, Impozit).
                        </p>
                    </CardContent>
                </Card>

                {/* Salariu Net */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300 ring-2 ring-green-500/20 dark:ring-green-500/10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600" />
                    <CardContent className="p-6 pt-8 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Salariu Net</h3>
                            <p className="text-sm text-green-600 dark:text-green-400 font-medium">Banii "în mână"</p>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            Suma efectivă pe care o primești pe card sau în mână după ce s-au plătit toate taxele și contribuțiile obligatorii.
                        </p>
                    </CardContent>
                </Card>

                {/* Salariu Complet */}
                <Card className="border-0 shadow-lg bg-white dark:bg-slate-900 relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-purple-600" />
                    <CardContent className="p-6 pt-8 space-y-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Cost Total</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Salariu Complet</p>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                            Efortul financiar total al firmei. Include salariul brut plus Contribuția Asiguratorie pentru Muncă (CAM) plătită de angajator.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Taxes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Unde se duc banii tăi?</h3>
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="mt-1 text-red-500">
                                <PiggyBank className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">CAS - Pensii (25%)</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Contribuția la pensie. Îți asigură venitul la bătrânețe. Este cea mai mare parte din taxele reținute.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="mt-1 text-red-500">
                                <HeartPulse className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">CASS - Sănătate (10%)</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Asigurarea de sănătate. Îți oferă acces la servicii medicale în sistemul public de stat.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                            <div className="mt-1 text-red-500">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white">Impozit pe Venit (10%)</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                    Impozitul datorat statului. Se aplică sumei rămase după scăderea CAS, CASS și Deducerii Personale.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white flex flex-col justify-center">
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                    <div className="absolute bottom-0 left-0 p-32 bg-green-500/10 rounded-full blur-3xl -ml-16 -mb-16" />

                    <h3 className="text-2xl font-bold mb-4 relative z-10">Știați că?</h3>
                    <ul className="space-y-4 text-slate-300 relative z-10">
                        <li className="flex gap-3">
                            <span className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                            <span>
                                În 2026, <strong className="text-white">Deducerea Personală</strong> se aplică degresiv până la un venit brut de aproximativ 6.100 RON.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <span className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                            <span>
                                <strong className="text-white">CAM (2.25%)</strong> este singura taxă plătită "extra" de angajator, nefiind inclusă în salariul brut.
                            </span>
                        </li>
                        <li className="flex gap-3">
                            <span className="h-6 w-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                            <span>
                                42.75% din costul total al angajatorului ajunge la Stat, iar restul de 57.25% la Angajat (pentru un salariu mediu).
                            </span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Information Guide Section */}
            <div className="space-y-8">
                <div className="text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        Ghid Informativ
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Tot ce trebuie să știi despre calculul salariilor
                    </p>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* BNR Exchange Rate */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-800/30">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Curs Valutar BNR</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Cursul euro este preluat <strong>zilnic</strong> de la Banca Națională a României (BNR) pentru a asigura precizia maximă a calculelor.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meal Tickets */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/30">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Tichete de Masă</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Valoarea tichetelor este impozitată (impozit pe venit) și se scade din salariul angajatului. Sunt luate în considerare și la calcularea deducerii personale.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Calculator Features */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Despre Calculator</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Calculatorul de salarii este o aplicație ce vine în ajutorul persoanelor care doresc să facă rapid un calcul de salarii: brut la net, net la brut sau oricare combinație. Este actualizat și respectă ultimele norme în vigoare ale codului fiscal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Rounding Disclaimer */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-900/20 dark:to-pink-900/20 border border-rose-200/50 dark:border-rose-800/30">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Rotunjiri Fiscale</h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    Conform codului fiscal, valorile contribuțiilor se rotunjesc la leu. Pot apărea diferențe de câțiva lei între valoarea introdusă și rezultat, calculatorul afișând cea mai apropiată valoare matematică posibilă.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Definitions Box */}
                <div className="p-6 md:p-8 rounded-2xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Definiții Rapide</h3>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <span className="font-semibold text-blue-600 dark:text-blue-400 w-24 flex-shrink-0">Brut:</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">Suma veniturilor realizate de salariat la locul de muncă (Net + Taxe Angajat)</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="font-semibold text-green-600 dark:text-green-400 w-24 flex-shrink-0">Net:</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">Diferența dintre salariul brut și toate taxele plătite de angajat</span>
                        </div>
                        <div className="flex gap-3">
                            <span className="font-semibold text-purple-600 dark:text-purple-400 w-24 flex-shrink-0">Complet:</span>
                            <span className="text-sm text-slate-600 dark:text-slate-300">Costul total pentru o firmă pentru plata salariului (Taxe Angajator + Brut)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
