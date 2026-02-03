'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, HelpCircle, Activity } from 'lucide-react';
import clsx from 'clsx';
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
        if (score >= 6) return 'URGENT';
        if (score >= 3) return 'WARNING';
        return 'MONITOR';
    };

    return (
        <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 p-6 text-white text-center">
                <h3 className="text-lg font-bold flex items-center justify-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Structural Integrity Check
                </h3>
            </div>

            <div className="p-8">
                {/* STEP 1: CRACKS */}
                {step === 'cracks' && (
                    <div className="animate-in fade-in slide-in-from-right duration-500">
                        <span className="text-xs font-bold text-slate-400 uppercase mb-2 block">Question 1 of 3</span>
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Do you see cracks in your sheetrock?</h2>

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
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Built before 1990 (Slab on Grade).</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                            <button onClick={() => handleAnswer(1, 'result')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Built after 2010 (Post-Tension Slab).</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                            <button onClick={() => handleAnswer(0, 'result')} className="w-full p-4 text-left border rounded-xl hover:border-blue-500 hover:bg-blue-50 transition flex justify-between group">
                                <span className="font-medium text-slate-700 group-hover:text-blue-700">Pier & Beam Foundation.</span>
                                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                            </button>
                        </div>
                    </div>
                )}

                {/* RESULT */}
                {step === 'result' && (
                    <div className="animate-in zoom-in duration-300 text-center">
                        {getResult() === 'URGENT' && (
                            <div className="bg-red-50 border border-red-100 p-6 rounded-xl mb-6">
                                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-red-700 mb-2">High Likelihood of Failure</h2>
                                <p className="text-red-900 mb-4">Your symptoms indicate active failure in the load-bearing strata.</p>
                                <Link href="/book-analysis" className="block w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition">
                                    Request Priority Forensic Analysis
                                </Link>
                            </div>
                        )}

                        {getResult() === 'WARNING' && (
                            <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl mb-6">
                                <HelpCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-orange-700 mb-2">Monitor Closely</h2>
                                <p className="text-orange-900 mb-4">Seasonal movement is detected. Implement a moisture management plan.</p>
                                <Link href="/book-analysis" className="block w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 transition">
                                    Get a Preventative Assessment
                                </Link>
                            </div>
                        )}

                        {getResult() === 'MONITOR' && (
                            <div className="bg-green-50 border border-green-100 p-6 rounded-xl mb-6">
                                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                <h2 className="text-2xl font-bold text-green-700 mb-2">Stable Condition</h2>
                                <p className="text-green-900 mb-4">No immediate structural threats detected. Continual maintenance is key.</p>
                                <Link href="/" className="block w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition">
                                    Return to Registry
                                </Link>
                            </div>
                        )}

                        <button onClick={() => { setStep('cracks'); setScore(0); }} className="text-slate-400 text-sm hover:text-slate-600 underline">
                            Restart Assessment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
