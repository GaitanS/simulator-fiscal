import { SalaryCalculator } from '@/components/calculator/SalaryCalculator';
import { SalaryEvolutionChart } from '@/components/calculator/SalaryEvolutionChart';
import { SalaryExplanations } from '@/components/calculator/SalaryExplanations';
import { SalaryFAQ } from '@/components/calculator/SalaryFAQ';
import { WorkingDaysCalendar } from '@/components/calculator/WorkingDaysCalendar';
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
            <div className="container mx-auto px-4 space-y-16">
                <SalaryCalculator />

                <section>
                    <SalaryEvolutionChart />
                </section>

                <section>
                    <SalaryExplanations />
                </section>

                <section>
                    <SalaryFAQ />
                </section>

                <section>
                    <WorkingDaysCalendar variant="dark" />
                </section>
            </div>
        </main>
    );
}
