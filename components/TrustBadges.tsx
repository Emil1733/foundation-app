import { ShieldCheck, UserCheck, Scale, Leaf } from "lucide-react";

export default function TrustBadges() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8 border-t border-b border-slate-100 my-12">
            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <UserCheck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm">P.E. Certified</h4>
                    <p className="text-xs text-slate-500">Engineer oversight</p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm">Lifetime Warranty</h4>
                    <p className="text-xs text-slate-500">Transferable coverage</p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Scale className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm">Code Compliant</h4>
                    <p className="text-xs text-slate-500">Fully permitted</p>
                </div>
            </div>

            <div className="flex flex-col items-center text-center gap-2">
                <div className="bg-blue-50 p-3 rounded-full text-blue-600">
                    <Leaf className="w-6 h-6" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 text-sm">Eco-Friendly</h4>
                    <p className="text-xs text-slate-500">Low impact verify</p>
                </div>
            </div>
        </div>
    );
}
