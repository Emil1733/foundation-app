import { ShieldCheck, UserCheck, Scale, Map } from "lucide-react";

export default function TrustBadges() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-slate-100 my-12">
            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <UserCheck className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">Property-Specific Review</p>
                    <p className="text-xs text-slate-500">Your symptoms and address</p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">Repair Options</p>
                    <p className="text-xs text-slate-500">Compare the proposed scope</p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Scale className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">Informed Decisions</p>
                    <p className="text-xs text-slate-500">Questions before you commit</p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Map className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">USDA Soil Context</p>
                    <p className="text-xs text-slate-500">Public survey data explained</p>
                </div>
            </div>
        </div>
    );
}
