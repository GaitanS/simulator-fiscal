'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQItem {
    question: string;
    answer: string;
}

const FAQ_DATA: FAQItem[] = [
    {
        question: "Ce taxe se rețin din salariul brut?",
        answer: "Din salariul brut se rețin trei contribuții obligatorii: CAS (25%) pentru pensie, CASS (10%) pentru sănătate și Impozit pe Venit (10%) care se aplică după deducerea CAS, CASS și Deducerii Personale."
    },
    {
        question: "Ce este Deducerea Personală?",
        answer: "Deducerea Personală este o sumă scutită de impozit, acordată salariaților cu venituri brute de până la ~6.150 RON. Pentru salariul minim pe economie, deducerea maximă este de 660 RON."
    },
    {
        question: "Cât este salariul minim pe economie în 2026?",
        answer: "Ianuarie - Iunie 2026: 4.050 RON brut (~2.574 RON net). Iulie - Decembrie 2026: 4.325 RON brut (~2.720 RON net)."
    },
    {
        question: "Ce este CAM și cine îl plătește?",
        answer: "CAM (Contribuția Asiguratorie pentru Muncă) de 2,25% este plătită de angajator, separat de salariul brut. Aceasta nu se deduce din venitul angajatului."
    },
    {
        question: "De ce diferă netul meu cu câțiva lei față de calcul?",
        answer: "Conform Codului Fiscal, toate contribuțiile se rotunjesc la leu. Această rotunjire poate genera diferențe minore de 1-5 lei între calculele teoretice și cele practice."
    },
    {
        question: "Tichetele de masă sunt impozitate?",
        answer: "Da, valoarea tichetelor de masă este supusă impozitului pe venit (10%). În plus, ele sunt luate în calcul la stabilirea Deducerii Personale."
    },
    {
        question: "Care este cursul valutar folosit în calcule?",
        answer: "Cursul EUR/RON este preluat zilnic de la Banca Națională a României (BNR) pentru precizie maximă."
    },
    {
        question: "Ce înseamnă \"Salariu Complet\"?",
        answer: "Salariul Complet reprezintă costul total pentru angajator = Salariu Brut + CAM (2,25%). Aceasta este suma reală pe care firma o cheltuie pentru angajat."
    },
    {
        question: "Pot beneficia de scutiri fiscale?",
        answer: "Da, există facilități pentru: Pensionari (scutire CAS), Persoane cu handicap (scutire impozit pe venit), IT & Cercetare (scutire impozit pe venit în anumite condiții)."
    },
    {
        question: "Calculele sunt oficiale?",
        answer: "Calculatorul este orientativ și respectă legislația fiscală în vigoare. Pentru situații complexe sau documente oficiale, recomandăm consultarea unui expert contabil."
    }
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-slate-200 dark:border-slate-700 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full py-5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors px-1 rounded-lg"
            >
                <span className="font-semibold text-slate-900 dark:text-white pr-4">
                    {item.question}
                </span>
                <span className={`flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed px-1">
                    {item.answer}
                </p>
            </div>
        </div>
    );
}

export function SalaryFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <Card className="border-0 shadow-xl overflow-hidden bg-white dark:bg-slate-900">
            <CardHeader className="text-center pb-2 pt-8">
                <div className="inline-flex items-center justify-center gap-2 mx-auto mb-4 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Întrebări Frecvente</span>
                </div>
                <CardTitle className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                    Întrebări despre Taxe și Salarii
                </CardTitle>
                <p className="text-slate-500 dark:text-slate-400 mt-2">
                    Răspunsuri la cele mai frecvente întrebări ale utilizatorilor
                </p>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
                <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {FAQ_DATA.map((item, index) => (
                        <FAQAccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                        />
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30 text-center">
                    <p className="text-slate-700 dark:text-slate-300 mb-2">
                        Nu ai găsit răspuns la întrebarea ta?
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Recomandăm consultarea unui expert contabil pentru situații complexe sau documente oficiale.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
