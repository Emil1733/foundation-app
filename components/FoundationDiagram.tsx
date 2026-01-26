export default function FoundationDiagram() {
    return (
        <div className="my-12 bg-slate-900 rounded-xl p-8 text-white">
            <h3 className="text-xl font-bold mb-8 text-center">Why Shallow Repairs Fail vs. Our Solution</h3>

            <div className="flex flex-col md:flex-row gap-12 md:gap-8 justify-center items-center md:items-end h-auto md:h-64">

                {/* Failed Method */}
                <div className="flex-1 flex flex-col items-center gap-2 group w-full">
                    <div className="w-full max-w-[140px] h-32 bg-red-500/10 border-2 border-red-500/50 border-dashed rounded-lg relative overflow-hidden transition-all group-hover:h-36">
                        <div className="absolute bottom-0 w-full h-12 bg-red-500/20 animate-pulse" />
                        <div className="absolute top-2 w-full text-center text-xs font-bold text-red-400">Active Zone</div>
                        <div className="absolute bottom-2 w-full text-center text-[10px] text-red-300">Swelling Clay</div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-red-400 text-lg">Pressed Piling</div>
                        <div className="text-sm text-slate-400">Moves with Clay</div>
                    </div>
                </div>

                {/* Success Method */}
                <div className="flex-1 flex flex-col items-center gap-2 relative w-full mt-4 md:mt-0">
                    <div className="absolute -top-6 md:-top-12 bg-blue-600 text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10 animate-bounce">
                        The Fix
                    </div>
                    <div className="w-full max-w-[140px] h-48 bg-blue-500/10 border-2 border-blue-500 rounded-lg relative overflow-hidden flex flex-col justify-end shadow-2xl shadow-blue-900/50">
                        <div className="w-full h-16 bg-slate-800 border-t border-slate-600 flex items-center justify-center relative z-10">
                            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Bedrock</span>
                        </div>
                        <div className="absolute inset-0 flex justify-center">
                            <div className="w-4 h-full bg-gradient-to-t from-blue-500 to-blue-300 shadow-[0_0_20px_rgba(96,165,250,0.6)]" />
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="font-bold text-blue-400 text-lg">Deep Steel Pier</div>
                        <div className="text-sm text-slate-400">Anchored in Strata</div>
                    </div>
                </div>

            </div>

            <p className="text-center text-sm text-slate-400 mt-8 max-w-md mx-auto">
                <strong>Visual Proof:</strong> While concrete cylinders sit in the "Active Zone" (expanding/shrinking clay),
                our steel piers penetrate until they hit load-bearing strata (refusal).
            </p>
        </div>
    );
}
