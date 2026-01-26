import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Foundation Risk Registry | Forensic Soil Analysis",
  description: "Official 2026 Geological Database for residential foundation risk. Check your property against USDA soil maps and plasticity indices.",
  icons: { icon: '/logo.png' }
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
    "url": "https://foundation-app-self.vercel.app",
    "logo": "https://foundation-app-self.vercel.app/logo.png",
    "sameAs": [
      "https://www.nspe.org",
      "https://www.usda.gov"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-800-555-0199",
      "contactType": "customer service",
      "areaServed": "US"
    }
  };

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
        {children}
        <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-12 px-6 text-center text-sm">
          <p className="mb-4">
            Engineering oversight provided by licensed Texas P.E.s. <br className="hidden sm:block" />
            Credentials available upon request during the Forensic Analysis phase.
          </p>
          <p>&copy; {new Date().getFullYear()} The Foundation Risk Registry. All Soil Data sourced from USDA/SSURGO.</p>
        </footer>
      </body>
    </html>
  );
}
