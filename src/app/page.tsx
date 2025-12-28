import { FreelanceComparison } from "@/components/calculator/FreelanceComparison";

/**
 * HOME PAGE
 * 
 * Main landing page with fiscal calculator.
 * Dark mode only.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
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
          <header className="text-center mb-10 md:mb-14">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-blue-900/30 text-blue-300 text-xs md:text-sm font-medium mb-4 md:mb-6">
              <BoltIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
              Calcule în timp real
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-4 md:mb-5 tracking-tight leading-tight">
              Calculator Taxe{" "}
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                România 2026
              </span>
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Compară instant costurile între{" "}
              <strong className="text-slate-200">CIM</strong>,{" "}
              <strong className="text-slate-200">PFA</strong> și{" "}
              <strong className="text-slate-200">SRL</strong>.
              Află care variantă este cea mai eficientă pentru situația ta.
            </p>
          </header>

          {/* Calculator Section */}
          <section id="calculator" aria-label="Calculator Fiscal" className="scroll-mt-20">
            <FreelanceComparison />
          </section>

          {/* Info Cards */}
          <section id="info" className="mt-16 md:mt-20 max-w-5xl mx-auto" aria-labelledby="info-heading">
            <h2 id="info-heading" className="text-xl md:text-2xl font-bold text-white mb-6 md:mb-8 text-center">
              Tipuri de Impozitare
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <InfoCard
                icon={<BuildingIcon />}
                iconBg="bg-blue-900/30"
                iconColor="text-blue-400"
                title="CIM – Angajat"
                description="Contract Individual de Muncă. Include CAS (25%), CASS (10%) și impozit pe venit (10%) cu deducere personală aplicabilă."
              />

              <InfoCard
                icon={<UserIcon />}
                iconBg="bg-emerald-900/30"
                iconColor="text-emerald-400"
                title="PFA – Freelancer"
                description="Persoană Fizică Autorizată în sistem real. Contribuții plafonate la multiplii salariului minim pe economie."
              />

              <InfoCard
                icon={<BuildingOfficeIcon />}
                iconBg="bg-purple-900/30"
                iconColor="text-purple-400"
                title="SRL – Microîntreprindere"
                description="Impozit pe cifra de afaceri (1-3%) plus impozit pe dividende (8%) și CASS pe dividende (10% plafonat)."
              />
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16 md:mt-20 py-8 md:py-10 bg-slate-900/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs md:text-sm text-slate-400">
            © 2025 Simulator Fiscal România.
            Calculele sunt orientative și nu constituie consultanță fiscală.
          </p>
          <p className="text-[10px] md:text-xs text-slate-500 mt-2 md:mt-3">
            Salariu minim brut 2025: 3.700 RON · Curs valutar: 1 EUR = 5,00 RON
          </p>
        </div>
      </footer>
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
