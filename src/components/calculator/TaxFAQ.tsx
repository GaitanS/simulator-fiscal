'use client';

import { useState } from 'react';

interface FAQItem {
    question: string;
    answer: string;
}

const TAX_FAQ_DATA: FAQItem[] = [
    {
        question: "Care este diferența între CIM, PFA și SRL?",
        answer: "CIM (Contract Individual de Muncă) este pentru angajați, cu taxe reținute la sursă. PFA (Persoană Fizică Autorizată) este pentru freelanceri, cu contribuții plafonate. SRL Microîntreprindere plătește impozit pe cifra de afaceri (1-3%) plus taxe pe dividende."
    },
    {
        question: "Ce formă fiscală este cea mai avantajoasă?",
        answer: "Depinde de venitul tău. Pentru venituri mici/medii, PFA sau Micro pot fi mai eficiente. Pentru venituri mari, SRL poate optimiza taxele. Folosește calculatorul pentru a compara exact situația ta."
    },
    {
        question: "Ce taxe plătește un PFA?",
        answer: "PFA plătește CAS (25%) plafonat la 24 salarii minime, CASS (10%) plafonat la 60 salarii minime, și Impozit pe Venit (10%) aplicat la venitul net."
    },
    {
        question: "Ce este impozitul Micro pentru SRL?",
        answer: "SRL Microîntreprindere plătește 1% din cifra de afaceri dacă are angajat și venituri sub 60.000 EUR, sau 3% dacă nu are angajat sau depășește pragul."
    },
    {
        question: "Cum se calculează dividendele la SRL?",
        answer: "Din profitul net rămas după impozitul Micro/Profit, se plătește 8% impozit pe dividende și 10% CASS (plafonat la 24 salarii minime). Suma rămasă ajunge la asociat."
    },
    {
        question: "Ce este CAM și cine îl plătește?",
        answer: "CAM (Contribuția Asiguratorie pentru Muncă) de 2,25% este plătită exclusiv de angajator pentru angajații CIM. Nu se aplică PFA sau SRL."
    },
    {
        question: "Ce scutiri fiscale există pentru IT?",
        answer: "Angajații din IT cu studii superioare beneficiază de scutire de impozit pe venit (10%). Se aplică doar pentru CIM în firme cu obiect de activitate specific IT."
    },
    {
        question: "Cursul valutar de unde este preluat?",
        answer: "Cursul EUR/RON este preluat zilnic de la Banca Națională a României (BNR) pentru a asigura precizia maximă a calculelor."
    },
    {
        question: "Calculele sunt oficiale?",
        answer: "Calculatorul oferă rezultate orientative bazate pe legislația fiscală în vigoare. Pentru situații complexe, recomandăm consultarea unui expert contabil."
    },
    {
        question: "Care este salariul minim în 2026?",
        answer: "Ianuarie - Iunie 2026: 4.050 RON brut. Din Iulie 2026: 4.325 RON brut. Netul variază în funcție de deduceri și facilități."
    }
];

function FAQAccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div className="border-b border-slate-700/50 last:border-b-0">
            <button
                onClick={onToggle}
                className="w-full py-4 md:py-5 flex items-center justify-between text-left hover:bg-slate-800/30 transition-colors px-2 rounded-lg"
            >
                <span className="font-semibold text-white pr-4 text-sm md:text-base">
                    {item.question}
                </span>
                <span className={`flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-4' : 'max-h-0'}`}>
                <p className="text-sm text-slate-400 leading-relaxed px-2">
                    {item.answer}
                </p>
            </div>
        </div>
    );
}

export function TaxFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="mt-16 md:mt-20 max-w-6xl mx-auto">
            <div className="text-center mb-8 md:mb-10">
                <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-blue-900/30 text-blue-300 text-xs md:text-sm font-medium mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Întrebări Frecvente
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    Întrebări despre Taxe România
                </h2>
                <p className="text-slate-400 text-sm md:text-base">
                    Răspunsuri rapide la cele mai frecvente întrebări despre CIM, PFA și SRL
                </p>
            </div>

            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 md:p-6">
                <div className="divide-y divide-slate-700/50">
                    {TAX_FAQ_DATA.map((item, index) => (
                        <FAQAccordionItem
                            key={index}
                            item={item}
                            isOpen={openIndex === index}
                            onToggle={() => handleToggle(index)}
                        />
                    ))}
                </div>
            </div>

            <div className="mt-6 text-center">
                <p className="text-xs md:text-sm text-slate-500">
                    Nu ai găsit răspuns? Recomandăm consultarea unui expert contabil pentru situații complexe.
                </p>
            </div>
        </section>
    );
}
