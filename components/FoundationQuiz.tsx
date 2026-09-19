'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, HelpCircle, Activity } from 'lucide-react';
import Link from 'next/link';

type Step = 'cracks' | 'sticking' | 'history' | 'result';

export default function FoundationQuiz() {
    const [step, setStep] = useState<Step>('cracks');
    const [score, setScore] = useState(0);

    const handleAnswer = (points: number, nextStep: Step) => {
        setScore(prev => prev + points);
        setStep(nextStep);
    };

    const getResult = () => {
        if (score >= 6) return 'EVALUATE';
        if (score >= 3) return 'DOCUMENT';
        return 'OBSERVE';
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white text-center">
                <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Foundation Signs Check
                </h3>
            </div>

            <div className="p-8">
                {/* STEP 1: CRACKS */}
                {step === 'cracks' && (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                        <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Question 1 of 3</span>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">What type of interior cracks have you noticed?</h2>

                        <div className="space-y-3">
                            <button onClick={() => handleAnswer(3, 'sticking')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Yes, diagonal cracks above doors/windows.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                            <button onClick={() => handleAnswer(1, 'sticking')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Yes, hairline vertical cracks near seams.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                            <button onClick={() => handleAnswer(0, 'sticking')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">No cracks visible.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: STICKING */}
                {step === 'sticking' && (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                        <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Question 2 of 3</span>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Do your doors stick or fail to latch?</h2>

                        <div className="space-y-3">
                            <button onClick={() => handleAnswer(3, 'history')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Yes, primarily during Summer or Droughts.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                            <button onClick={() => handleAnswer(1, 'history')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Occasional rubbing, but they close.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                            <button onClick={() => handleAnswer(0, 'history')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">No, all doors operate smoothly.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 3: HISTORY */}
                {step === 'history' && (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                        <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Question 3 of 3</span>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Home History</h2>

                        <div className="space-y-3">
                            <button onClick={() => handleAnswer(3, 'result')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Older slab-on-grade home.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                            <button onClick={() => handleAnswer(1, 'result')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Newer slab or post-tension home.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                            <button onClick={() => handleAnswer(0, 'result')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Pier and beam foundation.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                        </div>
                    </div>
                )}

                {/* RESULT */}
                {step === 'result' && (
                    <div className="animate-in zoom-in duration-300 text-center">
                        {getResult() === 'EVALUATE' && (
                            <div className="bg-red-50 border border-red-100 p-6 rounded-xl mb-6">
                                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-red-700 mb-2">Multiple Signs Worth Evaluating</h2>
                                <p className="text-red-900 mb-4">You reported several signs that can be useful to review together at the property. This screening check does not determine whether structural movement is active.</p>
                                <Link href="/book-analysis" className="block w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition">
                                    Request a Foundation Evaluation
                                </Link>
                            </div>
                        )}

                        {getResult() === 'DOCUMENT' && (
                            <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl mb-6">
                                <HelpCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-orange-700 mb-2">Document and Compare</h2>
                                <p className="text-orange-900 mb-4">You reported some signs worth documenting over time. Note when they change and consider an evaluation if they are progressing or occurring together.</p>
                                <Link href="/book-analysis" className="block w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition">
                                    Request an Evaluation
                                </Link>
                            </div>
                        )}

                        {getResult() === 'OBSERVE' && (
                            <div className="bg-green-50 border border-green-100 p-6 rounded-xl mb-6">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-green-700 mb-2">Fewer Signs Reported</h2>
                                <p className="text-green-900 mb-4">Your answers include fewer common warning signs. This does not rule out a property issue, so document changes and seek an evaluation if concerns persist.</p>
                                <Link href="/" className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition">
                                    Return Home
                                </Link>
                            </div>
                        )}

                        <button onClick={() => { setStep('cracks'); setScore(0); }} className="text-slate-400 text-sm hover:text-slate-600 underline">
                            Restart Check
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
