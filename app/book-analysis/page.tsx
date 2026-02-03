'use client';

import { useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle, AlertTriangle, MapPin, Phone, User, Home } from 'lucide-react';
import Link from 'next/link';

import { submitLead } from './actions';

export default function BookAnalysisPage() {
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        symptoms: [] as string[],
        address: '',
        zip: '',
        name: '',
        email: '',
        phone: '',
        notes: ''
    });

    const steps = [
        { id: 1, title: 'Symptoms' },
        { id: 2, title: 'Property' },
        { id: 3, title: 'Contact' }
    ];

    const symptomsList = [
        { id: 'cracks_wall', label: 'Diagonal Wall Cracks', icon: '🏚️' },
        { id: 'doors_sticking', label: 'Doors Won\'t Close', icon: '🚪' },
        { id: 'gaps_trim', label: 'Gaps in Trim/molding', icon: '📏' },
        { id: 'brick_cracks', label: 'Exterior Brick Cracks', icon: '🧱' },
        { id: 'uneven_floor', label: 'Sloping Floors', icon: '📉' },
        { id: 'pre_purchase', label: 'Buying/Selling Home', icon: '🤝' },
    ];

    const handleSymptomToggle = (id: string) => {
        setFormData(prev => ({
            ...prev,
            symptoms: prev.symptoms.includes(id)
                ? prev.symptoms.filter(s => s !== id)
                : [...prev.symptoms, id]
        }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const result = await submitLead(formData);
            
            if (result.success) {
                setIsSuccess(true);
                // Optional: Redirect or Show Success UI
            } else {
                alert('Error: ' + result.error);
            }
        } catch (err) {
            alert('An unexpected error occurred. Please call to confirm.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
             <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)] flex items-center justify-center p-6">
                <main className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-green-200 p-8 text-center animate-in zoom-in duration-300">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-4">Analysis Requested</h1>
                    <p className="text-slate-600 mb-8">
                        We have received your forensic intake for <span className="font-bold">{formData.address}</span>.
                        <br /><br />
                        An engineer will review your soil data match and contact you at <span className="font-bold">{formData.email}</span> shortly.
                    </p>
                    <Link href="/" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition">
                        Return to Registry
                    </Link>
                </main>
             </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
            <header className="bg-white border-b border-slate-200 py-4 px-6 md:px-12 flex items-center justify-between">
                <Link href="/" className="font-bold text-slate-900 text-xl flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-600" />
                    Foundation Risk Registry
                </Link>
                <div className="hidden md:flex text-sm text-slate-500 font-medium">
                    Forensic Intake Protocol v2.4
                </div>
            </header>

            <main className="max-w-2xl mx-auto py-12 px-6">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                        <CheckCircle className="w-4 h-4" />
                        Preliminary Assessment
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
                        Request Forensic Analysis
                    </h1>
                    <p className="text-slate-600 text-lg max-w-lg mx-auto">
                        Get a no-cost engineering review of your property's geological risk profile.
                        <span className="block mt-2 font-bold text-slate-800">No Sales Pressure. Just Data.</span>
                    </p>
                </div>

                {/* PROGRESS BAR */}
                <div className="flex items-center justify-between mb-10 px-4">
                    {steps.map((s, i) => (
                        <div key={s.id} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all
                                ${step >= s.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'}
                            `}>
                                {step > s.id ? <CheckCircle className="w-5 h-5" /> : s.id}
                            </div>
                            {i < steps.length - 1 && (
                                <div className={`w-16 h-1 mx-2 rounded-full ${step > s.id ? 'bg-blue-600' : 'bg-slate-200'}`} />
                            )}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    
                    {/* STEP 1: SYMPTOMS */}
                    {step === 1 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-orange-500" />
                                What signs are you seeing?
                            </h2>
                            <p className="text-sm text-slate-500">Select all that apply to help our engineers diagnose the failure mode.</p>
                            
                            <div className="grid grid-cols-2 gap-4">
                                {symptomsList.map((s) => (
                                    <button
                                        key={s.id}
                                        type="button"
                                        onClick={() => handleSymptomToggle(s.id)}
                                        className={`p-4 rounded-xl border-2 text-left transition-all hover:bg-slate-50
                                            ${formData.symptoms.includes(s.id) 
                                                ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600' 
                                                : 'border-slate-100 hover:border-blue-200'
                                            }
                                        `}
                                    >
                                        <div className="text-2xl mb-2">{s.icon}</div>
                                        <div className="font-bold text-slate-900 text-sm">{s.label}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="pt-6 flex justify-end">
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={formData.symptoms.length === 0}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                                >
                                    Continue <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: PROPERTY */}
                    {step === 2 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-500" />
                                Property Location
                            </h2>
                            <p className="text-sm text-slate-500">We use this to pull the USDA Soil Map Unit for your specific lot.</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Street Address</label>
                                    <div className="relative">
                                        <Home className="absolute top-3 left-3 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="text" 
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="123 Example St"
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Zip Code</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="75024"
                                        value={formData.zip}
                                        onChange={(e) => setFormData({...formData, zip: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between">
                                <button type="button" onClick={prevStep} className="text-slate-500 font-bold px-4 py-2 hover:text-slate-700">Back</button>
                                <button
                                    type="button"
                                    onClick={nextStep}
                                    disabled={!formData.address || !formData.zip}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all"
                                >
                                    Verify Soil Data <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CONTACT */}
                    {step === 3 && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                             <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <User className="w-5 h-5 text-green-500" />
                                Engineering Report Delivery
                            </h2>
                            <p className="text-sm text-slate-500">Where should we send your Forensic Risk Profile?</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Your Name</label>
                                    <input 
                                        type="text" 
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Jane Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Email Address</label>
                                    <input 
                                        type="email" 
                                        required
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="jane@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute top-3 left-3 w-5 h-5 text-slate-400" />
                                        <input 
                                            type="tel" 
                                            required
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="(555) 555-5555"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                                        <ShieldCheck className="w-3 h-3" /> We do not sell your data. Engineers use this number only to verify address details.
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between">
                                <button type="button" onClick={prevStep} className="text-slate-500 font-bold px-4 py-2 hover:text-slate-700">Back</button>
                                <button
                                    type="submit"
                                    className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-green-200 w-full justify-center"
                                >
                                    Get My Forensic Analysis
                                </button>
                            </div>
                        </div>
                    )}

                </form>

                <div className="mt-8 text-center text-xs text-slate-400">
                    <p>Secure SSL Encryption. Licensed Engineering Protocols.</p>
                </div>
            </main>
        </div>
    );
}
