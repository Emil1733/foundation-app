'use client';

import SoilRiskWidget from "@/components/SoilRiskWidget";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = {
    robots: 'noindex',
};

export default function WidgetPage() {
    return (
        <div className="flex flex-col items-center justify-center p-4 min-h-[400px]">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* WIDGET HEADER */}
                <div className="bg-slate-900 p-3 text-center">
                    <h3 className="text-white text-sm font-bold flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-400" /> Official Soil Risk Check
                    </h3>
                </div>

                {/* CORE FUNCTIONALITY */}
                <div className="p-0">
                    {/* We force specific styling on the widget via CSS or just wrapper properties */}
                    <SoilRiskWidget />
                </div>

                {/* SEO BACKLINK (The "Bait") */}
                <div className="bg-slate-50 p-2 text-center border-t border-slate-200">
                    <Link
                        href="https://foundation-app-self.vercel.app"
                        target="_blank"
                        className="text-[10px] text-slate-500 hover:text-blue-600 font-medium flex items-center justify-center gap-1"
                    >
                        Powered by Foundation Risk Registry &trade;
                    </Link>
                </div>
            </div>
        </div>
    );
}
