import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BNRFetcher } from "@/components/layout/BNRFetcher";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Simulator Fiscal 2026 | Calculator Taxe CIM, PFA, SRL România",
  description: "Calculează instant taxele pentru CIM, PFA și SRL. Compară costurile și alege varianta cea mai eficientă pentru tine. Calculator fiscal gratuit România 2026.",
  keywords: "calculator taxe romania, salariu net brut, CIM PFA SRL, simulator fiscal, calcul impozit, contributii sociale, taxe 2026",
  authors: [{ name: "Gaitan Silviu" }],
  openGraph: {
    title: "Simulator Fiscal Avansat 2026",
    description: "Află exact cât plătești la stat. Compară CIM, PFA și SRL instant.",
    type: "website",
    locale: "ro_RO",
    siteName: "Simulator Fiscal România",
  },
  twitter: {
    card: "summary_large_image",
    title: "Simulator Fiscal 2026",
    description: "Calculator taxe România - CIM, PFA, SRL",
  },
  robots: {
    index: true,
    follow: true,
  },
};

// JSON-LD Schema
const schemaMarkup = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Simulator Fiscal Avansat 2026",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "Web Browser",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "RON"
  },
  "description": "Calculator fiscal pentru România - calculează taxele pentru CIM, PFA și SRL",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "150"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <BNRFetcher />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
