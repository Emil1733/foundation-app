"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Services", href: "/locations" },
    { name: "Locations", href: "/locations" },
    { name: "Resources", href: "/learn" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-8 left-0 z-[100] w-full border-b transition-all duration-300 ${
        isScrolled
          ? "border-slate-700/70 bg-slate-950/95 shadow-[0_12px_35px_rgba(2,6,23,0.28)] backdrop-blur-xl"
          : "border-slate-800 bg-slate-950"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8 md:px-12">
        <BrandLogo />

        <div className="hidden lg:flex items-center gap-8">
          <div className="flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href + "/"));
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-7 text-[13px] font-semibold tracking-[0.01em] transition-colors ${
                    isActive ? "text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {link.name}
                  {isActive && <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-500" />}
                </Link>
              );
            })}
          </div>

          <Link
            href="/book-analysis"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-[13px] font-bold text-white shadow-[0_8px_24px_rgba(37,99,235,0.22)] transition hover:bg-blue-500 hover:shadow-[0_10px_30px_rgba(37,99,235,0.32)]"
          >
            Request Evaluation
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <button
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900 text-white transition hover:border-slate-600"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950 shadow-2xl">
          <div className="mx-auto flex max-w-7xl flex-col px-6 py-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="border-b border-slate-800 py-4 text-base font-semibold text-slate-200 transition hover:text-white"
              >
                {link.name}
              </Link>
            ))}
            <Link
              href="/book-analysis"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-4 font-bold text-white"
            >
              Request Foundation Evaluation
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
