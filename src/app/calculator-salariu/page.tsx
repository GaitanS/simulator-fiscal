import { SalaryCalculator } from '@/components/calculator/SalaryCalculator';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Calculator Salariu 2026 | Simulare CIM Brut - Net',
    description: 'Calculează salariul net din brut pentru 2026. Vezi exact cât plătești la stat pentru pensie (CAS), sănătate (CASS) și impozit pe venit.',
    alternates: {
        canonical: '/calculator-salariu'
    }
};

export default function SalaryCalculatorPage() {
    return (
        <main className="min-h-screen pt-24 pb-12 bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4">
                <SalaryCalculator />
            </div>
        </main>
    );
}
