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
          <div className="max-w-5xl mx-auto">
            {/* SEO Internal Linking Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-left mb-10 border-b border-slate-800 pb-10">
              <div>
                <h4 className="text-white font-bold mb-4">Dallas Metro</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/services/foundation-repair/dallas-tx" className="hover:text-white transition">Dallas Foundation Repair</Link></li>
                  <li><Link href="/services/foundation-repair/fort-worth-tx" className="hover:text-white transition">Fort Worth</Link></li>
                  <li><Link href="/services/foundation-repair/frisco-tx" className="hover:text-white transition">Frisco</Link></li>
                  <li><Link href="/services/foundation-repair/plano-tx" className="hover:text-white transition">Plano</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Houston Metro</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/services/foundation-repair/houston-tx" className="hover:text-white transition">Houston Foundation Repair</Link></li>
                  <li><Link href="/services/foundation-repair/katy-tx" className="hover:text-white transition">Katy</Link></li>
                  <li><Link href="/services/foundation-repair/sugar-land-tx" className="hover:text-white transition">Sugar Land</Link></li>
                  <li><Link href="/services/foundation-repair/cypress-tx" className="hover:text-white transition">Cypress</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">Austin Metro</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/services/foundation-repair/austin-tx" className="hover:text-white transition">Austin Foundation Repair</Link></li>
                  <li><Link href="/services/foundation-repair/round-rock-tx" className="hover:text-white transition">Round Rock</Link></li>
                  <li><Link href="/services/foundation-repair/cedar-park-tx" className="hover:text-white transition">Cedar Park</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-4">DFW High-Risk</h4>
                <ul className="space-y-2 text-slate-400">
                  <li><Link href="/services/foundation-repair/carrollton-tx" className="hover:text-white transition">Carrollton</Link></li>
                  <li><Link href="/services/foundation-repair/lewisville-tx" className="hover:text-white transition">Lewisville</Link></li>
                  <li><Link href="/services/foundation-repair/denton-tx" className="hover:text-white transition">Denton</Link></li>
                  <li><Link href="/services/foundation-repair/roanoke-tx" className="hover:text-white transition">Roanoke</Link></li>
                  <li><Link href="/locations" className="hover:text-white transition text-blue-400 font-medium pt-2 block">View All Service Locations &rarr;</Link></li>
                </ul>
              </div>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 mb-8">
              <Link href="/about" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">About Us</span>
              </Link>
              <Link href="/contact" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">Contact</span>
              </Link>
              <Link href="/privacy" rel="nofollow" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">Privacy Policy</span>
              </Link>
              <Link href="/terms" rel="nofollow" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">Terms of Service</span>
              </Link>
              <Link href="/disclaimer" rel="nofollow" className="hover:text-white transition group">
                <span className="text-slate-400 group-hover:text-white">Data Disclaimer</span>
              </Link>
            </nav>
            <p className="mb-4 text-slate-400">
              <strong>E-E-A-T Compliance:</strong> Engineering oversight provided by licensed structural P.E.s. <br className="hidden sm:block" />
              This registry is an independent geological database and is not affiliated with any specific foundation repair contractor. 
              <br className="hidden sm:block" />
              Geotechnical credentials and P.E. licenses (e.g., TX-PE-88XXXX) are available upon request during the Forensic Analysis phase.
            </p>
            <div className="mb-8 pt-6 border-t border-slate-800">
              <p className="text-slate-300 font-bold mb-2">The Foundation Risk Registry National Headquarters</p>
              <p className="text-slate-500">
                1401 Lavaca St, Austin, TX 78701<br />
                Phone: <a href="tel:+1-800-555-0199" className="hover:text-blue-400 transition">+1-800-555-0199</a><br />
                <em>Serving all major U.S. metropolitan areas in high-risk soil zones.</em>
              </p>
            </div>
            <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} The Foundation Risk Registry. Official Soil Data ingested from USDA/SSURGO and USGS databases.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
