import { ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: "How to Compare Foundation Repair Proposals | Foundation Risk Registry",
    description: "A practical guide to comparing foundation evaluation findings, repair scopes, measurements, drainage considerations, warranties, and provider qualifications.",
};

const questions = [
    { title: "What evidence supports the scope?", text: "Ask what was measured, where movement was observed, whether changes are documented over time, and which findings are driving the proposed work." },
    { title: "What cause is being addressed?", text: "A repair proposal should explain how drainage, plumbing, grading, fill, soil moisture, construction details, or other site conditions were considered." },
    { title: "Why this repair system?", text: "Ask why the proposed system fits the observed conditions, what alternatives were considered, and what assumptions the scope depends on." },
    { title: "What is included in the price?", text: "Compare access, excavation, interior work, plumbing checks, permits where applicable, cleanup, landscaping restoration, and any excluded work." },
    { title: "What does the warranty actually cover?", text: "Read transfer terms, exclusions, adjustment provisions, service fees, and who is responsible for honoring the warranty." },
    { title: "Who is responsible for the opinion and work?", text: "The evaluator or repair provider should identify its business, qualifications, scope, and responsibility for recommendations or construction." },
];

export default function ReviewsPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <header className="relative isolate overflow-hidden bg-slate-950 px-6 py-16 text-white md:py-20">
                <div aria-hidden="true" className="absolute inset-0 -z-30 bg-cover bg-[position:center_48%]" style={{ backgroundImage: "url('/foundation-hero-generated.webp')" }} />
                <div aria-hidden="true" className="absolute inset-0 -z-20 bg-slate-950/68" />
                <div className="mx-auto max-w-4xl">
                    <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-slate-300 transition hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to FoundationRisk</Link>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">Homeowner Guide</p>
                    <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">Compare Foundation Repair Proposals With Better Questions</h1>
                    <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">Repair proposals can differ substantially. Compare the evidence, assumptions, scope, provider responsibility, and warranty instead of relying on a headline price alone.</p>
                </div>
            </header>
            <main className="mx-auto max-w-5xl px-6 py-16">
                <div className="grid gap-5 md:grid-cols-2">
                    {questions.map((item, i) => (
                        <section key={item.title} className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">{i + 1}</div>
                            <h2 className="text-xl font-bold text-slate-900">{item.title}</h2>
                            <p className="mt-3 text-sm leading-6 text-slate-600">{item.text}</p>
                        </section>
                    ))}
                </div>
                <section className="mt-12 rounded-3xl bg-slate-950 p-8 text-white sm:p-10">
                    <BookOpen className="h-7 w-7 text-blue-300" />
                    <h2 className="mt-4 text-2xl font-bold">Need help organizing the next step?</h2>
                    <p className="mt-3 max-w-2xl text-slate-300">If you are seeing cracks, uneven floors, sticking doors, or other signs of movement, submit the property details so the request can be reviewed.</p>
                    <Link href="/book-analysis" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-500"><ShieldCheck className="h-5 w-5" /> Request a Foundation Evaluation</Link>
                </section>
            </main>
        </div>
    );
}
