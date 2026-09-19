import { ShieldCheck, UserCheck, Scale, Map } from "lucide-react";

export default function TrustBadges() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-slate-100 my-12">
            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <UserCheck className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">Property-Specific Help</p>
                    <p className="text-xs text-slate-500">Your home, symptoms & location</p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">Foundation Repair Guidance</p>
                    <p className="text-xs text-slate-500">Understand your options</p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Scale className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">Clear Next Steps</p>
                    <p className="text-xs text-slate-500">Know what to do next</p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Map className="w-6 h-6" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">Local Soil Context</p>
                    <p className="text-xs text-slate-500">USDA data for your area</p>
                </div>
            </div>
        </div>
    );
}
