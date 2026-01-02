import { FreelanceComparison } from "@/components/calculator/FreelanceComparison";
import { TaxFAQ } from "@/components/calculator/TaxFAQ";
import { WorkingDaysCalendar } from "@/components/calculator/WorkingDaysCalendar";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Simulator PFA vs SRL vs Micro 2026 | Calculator Taxe România',
  description: 'Cel mai avansat calculator de taxe pentru PFA, SRL și Microîntreprindere. Compară instant taxele, veniturile nete și alege cea mai eficientă formă de organizare pentru 2026.',
  keywords: 'calculator pfa 2026, simulator srl, taxe microintreprindere, impozit profit vs venit, calculator taxe romania, sistem real vs norma, salariu net pfa',
  openGraph: {
    title: 'Simulator Fiscal 2026 - PFA vs SRL vs MICRO',
    description: 'Află exact câți bani îți rămân în mână. Compară taxele pentru PFA, Micro și Profit.',
    images: ['/og-image.png'],
    type: 'website'
  },
  alternates: {
    canonical: 'https://simulator-fiscal.romania', // Placeholder, user can update
  }
};

/**
 * HOME PAGE
 * 
 * Main landing page with fiscal calculator.
 * Dark mode only.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      {/* Skip to main content link for accessibility */}
      <a
        href="#calculator"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
      >
        Salt la calculator
      </a>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12 lg:py-16">
        <article>
          {/* Hero Section */}
          <header className="relative text-center mb-10 md:mb-14 overflow-hidden">
            {/* Ambient Background Image */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] opacity-20 -z-10 pointer-events-none">
              <img
                src="/images/hero-bg.png"
                alt="Fiscal Dashboard Background"
                className="w-full h-full object-contain blur-2xl scale-110 opacity-60"
              />
            </div>

            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-blue-900/30 text-blue-300 text-xs md:text-sm font-medium mb-4 md:mb-6 border border-blue-500/20 backdrop-blur-sm">
              <BoltIcon className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400" />
              Calcule în timp real
            </div>

            {/* Title with 3D Icon */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 mb-8 md:mb-12">
              <div className="relative w-28 h-28 md:w-36 md:h-36 animate-float flex-shrink-0">
                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
                <img
                  src="/images/calc-icon-3d.png"
                  alt="Calculator Icon 3D"
                  className="relative w-full h-full object-contain drop-shadow-2xl mix-blend-screen"
                />
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight text-center md:text-left whitespace-nowrap">
                Calculator Taxe <span className="hidden md:inline">&nbsp;</span>
                <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent block md:inline">
                  România 2026
                </span>
              </h2>
            </div>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed relative z-10">
              Compară instant costurile între{" "}
              <strong className="text-slate-200">PFA</strong>,{" "}
              <strong className="text-slate-200">SRL</strong> și{" "}
              <strong className="text-slate-200">MICRO</strong>.
              Află care variantă este cea mai eficientă pentru situația ta.
            </p>
          </header>

          {/* Calculator Section */}
          <section id="calculator" aria-label="Calculator Fiscal" className="scroll-mt-20">
            <FreelanceComparison />
          </section>

          {/* Info Cards */}
          <section id="info" className="mt-16 md:mt-20 max-w-7xl mx-auto" aria-labelledby="info-heading">
            <h2 id="info-heading" className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 text-center">
              Tipuri de Impozitare
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <InfoCard
                icon={<UserIcon />}
                iconBg="bg-emerald-900/30"
                iconColor="text-emerald-400"
                title="PFA – Sistem Real"
                description="Contribuții CAS, plafonate la 12/24 si CASS 72 salarii minime"
              />

              <InfoCard
                icon={<BuildingOfficeIcon />}
                iconBg="bg-purple-900/30"
                iconColor="text-purple-400"
                title="Microîntreprindere"
                description="Impozit pe venit 1% + 8% impozit pe dividende. Necesită un angajat."
              />

              <InfoCard
                icon={<BuildingIcon />}
                iconBg="bg-blue-900/30"
                iconColor="text-blue-400"
                title="SRL – Profit 16%"
                description="Impozit de 16% pe profitul net + 8% dividende. Optim pentru cheltuieli mari."
              />
            </div>
          </section>

          {/* Working Days Calendar */}
          <section className="mt-16 md:mt-20 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12 items-center">
              <div className="lg:col-span-2 relative hidden lg:block">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
                <img
                  src="/images/working-days-illus.png"
                  alt="Fiscal Calendar Illustration"
                  className="relative w-full h-auto object-contain drop-shadow-2xl rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm p-2 mix-blend-screen"
                />
                <div className="mt-6 text-center">
                  <h3 className="text-xl font-bold text-white mb-2">Planifică Eficient</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Consultă calendarul oficial al zilelor lucrătoare și libere pentru a-ți optimiza concediile și proiectele.
                  </p>
                </div>
              </div>
              <div className="lg:col-span-3">
                <WorkingDaysCalendar variant="dark" />
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <TaxFAQ />
        </article>
      </main>
    </div>
  );
}

// --- Info Card Component ---

interface InfoCardProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
}

function InfoCard({ icon, iconBg, iconColor, title, description }: InfoCardProps) {
  return (
    <div className="group p-5 md:p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-shadow duration-300">
      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl ${iconBg} flex items-center justify-center mb-3 md:mb-4`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h3 className="font-semibold text-base md:text-lg text-white mb-1.5 md:mb-2">
        {title}
      </h3>
      <p className="text-xs md:text-sm text-slate-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// --- Icons ---

function CalculatorIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

function BoltIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function BuildingOfficeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}
