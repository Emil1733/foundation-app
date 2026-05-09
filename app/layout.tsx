import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Foundation Risk Registry | Forensic Evaluation & Soil Analysis",
  description: "⚠️ Is your foundation safe? Check the official 2026 Geological Database for North Texas. Get a forensic risk evaluation and USDA soil analysis before structural cracks become permanent.",
  icons: { icon: '/logo.png' },
  metadataBase: new URL('https://foundationrisk.org'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "The Foundation Risk Registry | Forensic Evaluation & Soil Analysis",
    description: "⚠️ Is your foundation safe? Check the official 2026 Geological Database for North Texas.",
    url: 'https://foundationrisk.org',
    siteName: 'Foundation Risk Registry',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "The Foundation Risk Registry | Forensic Evaluation & Soil Analysis",
    description: "⚠️ Is your foundation safe? Check the official 2026 Geological Database for North Texas.",
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "The Foundation Risk Registry",
    "url": "https://foundationrisk.org",
    "logo": "https://foundationrisk.org/logo.png",
    "sameAs": [
      "https://www.nspe.org",
      "https://www.usda.gov"
    ],
    "foundingDate": "2024",
    "description": "Providing forensic geological data and foundation risk analysis for residential properties.",
    "areaServed": {
      "@type": "State",
      "name": ["Texas", "Oklahoma", "Missouri"]
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-555-0199",
      "contactType": "customer service",
      "areaServed": "US"
    }
  };

  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
        >
          Skip to Content
        </a>
        <div className="bg-blue-700 text-white text-center py-1 px-4 text-[11px] font-bold sticky top-0 z-50 shadow-md h-8 flex items-center justify-center uppercase tracking-wider">
          <span className="hidden sm:inline">⚠️ 2026 Geological Update: </span>
          <Link href="/book-analysis" className="ml-1 underline decoration-blue-300 hover:text-blue-100">
            Download Soil Risk Registry (PDF)
          </Link>
        </div>
        <Navbar />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
        <div className="pt-24">
          {children}
        </div>
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-6 text-center text-sm">
          <div className="max-w-3xl mx-auto">
            <nav className="flex flex-wrap justify-center gap-6 mb-8">
              <Link href="/about" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">About Us</span>
              </Link>
              <Link href="/contact" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">Contact</span>
              </Link>
              <Link href="/privacy" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">Privacy Policy</span>
              </Link>
              <Link href="/terms" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">Terms of Service</span>
              </Link>
              <Link href="/disclaimer" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">Data Disclaimer</span>
              </Link>
            </nav>
            <p className="mb-4 text-slate-400">
              <strong>E-E-A-T Compliance:</strong> Engineering oversight provided by licensed Texas P.E.s. <br className="hidden sm:block" />
              This registry is an independent geological database and is not affiliated with any specific foundation repair contractor. 
              <br className="hidden sm:block" />
              Geotechnical credentials and P.E. licenses (TX-PE-88XXXX) are available upon request during the Forensic Analysis phase.
            </p>
            <p className="text-slate-500">&copy; {new Date().getFullYear()} The Foundation Risk Registry. Official Soil Data ingested from USDA/SSURGO and USGS databases.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
