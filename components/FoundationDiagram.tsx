export default function FoundationDiagram() {
    return (
        <div className="my-12 bg-slate-900 rounded-xl p-8 text-white">
            <h3 className="text-xl font-bold mb-3 text-center">Why Foundation Repair Scope Depends on Site Evidence</h3>
            <p className="text-sm text-slate-400 text-center max-w-2xl mx-auto mb-8">
                Different support systems address different conditions. A mapped soil record cannot determine the correct repair type or depth for an individual property.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2">1. Measure movement</div>
                    <div className="font-bold text-white mb-2">Establish the pattern</div>
                    <p className="text-sm text-slate-400">Floor elevations, crack history, opening alignment, and repeat measurements help distinguish active, historic, and cosmetic changes.</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2">2. Identify contributors</div>
                    <div className="font-bold text-white mb-2">Review water and support</div>
                    <p className="text-sm text-slate-400">Drainage, plumbing, grading, fill, vegetation, foundation design, and subsurface conditions can change what an appropriate response looks like.</p>
                </div>
                <div className="rounded-xl border border-slate-700 bg-slate-800/60 p-5">
                    <div className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-2">3. Compare scopes</div>
                    <div className="font-bold text-white mb-2">Tie the proposal to evidence</div>
                    <p className="text-sm text-slate-400">Ask why a proposed system, location, quantity, and depth match the measured problem. Compare exclusions and warranty terms as well as price.</p>
                </div>
            </div>

            <p className="text-xs text-slate-500 text-center mt-6">
                This diagram is planning guidance, not an engineering design or recommendation for a specific repair system.
            </p>
        </div>
    );
}
