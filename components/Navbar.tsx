"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, MapPin, BookOpen, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Risk Directory", href: "/locations" },
    { name: "Education Hub", href: "/learn" },
    { name: "About", href: "/about" },
  ];

  return (
    <nav
      className={`fixed top-8 left-0 w-full z-[100] transition-all duration-500 ease-in-out ${
        isScrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-1.5 border-b border-slate-200/50"
          : "bg-white py-2 border-b border-slate-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-8 md:px-12 flex items-center justify-between">
        {/* LOGO: ARCHITECTURAL STYLE */}
        <Link href="/" className="flex items-center gap-4 group">
          <div className="relative flex items-center justify-center">
            <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500">
               <Shield className="w-5 h-5 text-blue-400 stroke-[2.5]" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
               <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-slate-900 tracking-[-0.03em] leading-none uppercase">
              FOUNDATION<span className="text-blue-600">RISK</span>
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.3em]">
                Registry 2026
              </span>
              <div className="h-[1px] w-3 bg-slate-200" />
              <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-600 uppercase tracking-widest">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                Live Data
              </span>
            </div>
          </div>
        </Link>

        {/* DESKTOP NAV: REFINED & SPACED */}
        <div className="hidden lg:flex items-center gap-10">
          <div className="flex items-center gap-8 border-r border-slate-100 pr-10">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                    isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <div className="absolute -bottom-2 left-0 w-full h-[2px] bg-blue-600 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
          
          <Link
            href="/book-analysis"
            className="group flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all duration-500 shadow-[0_10px_20px_rgba(15,23,42,0.15)] hover:shadow-[0_10px_25px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            Get Forensic Eval
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden relative z-[110] p-2 rounded-xl bg-slate-50 text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center"
          onClick={() => {
            console.log("Toggle mobile menu");
            setIsMobileMenuOpen(!isMobileMenuOpen);
          }}
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[80px] bg-white z-[105] animate-in fade-in slide-in-from-right-4 duration-500 border-t border-slate-100 overflow-y-auto">
           <div className="p-10 flex flex-col gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-xl font-extrabold text-slate-900 hover:text-blue-600 transition-colors flex items-center justify-between"
                >
                  {link.name}
                  <div className="w-6 h-[1px] bg-slate-200" />
                </Link>
              ))}
              <Link
                href="/book-analysis"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-8 bg-slate-900 text-white p-5 rounded-2xl text-base font-bold text-center shadow-xl flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                Get Forensic Evaluation
              </Link>
           </div>
        </div>
      )}
    </nav>
  );
}
