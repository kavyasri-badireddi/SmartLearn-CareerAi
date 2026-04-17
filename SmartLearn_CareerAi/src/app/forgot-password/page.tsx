"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Mail, Key } from "lucide-react";
import axios from "axios";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [devLink, setDevLink] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setMessage(null);

        try {
            const res = await axios.post("/api/auth/forgot-password", { email });
            setMessage(res.data.message);
            if (res.data.devLink) setDevLink(res.data.devLink);
            setLoading(false);
        } catch (err: any) {
            setError(err.response?.data?.error || "Something went wrong.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-outfit px-6">
            <div className="w-full max-w-md bg-white p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="mb-10 text-center">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-100">
                        <Key className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Forgot Password?</h1>
                    <p className="text-slate-500 text-sm font-medium">Enter your email and we'll send you a recovery link.</p>
                </div>

                {!message ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-4 text-sm text-slate-900 focus:bg-white transition-all shadow-inner"
                                    placeholder="name@university.edu"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-[11px] text-red-600 font-bold rounded-xl uppercase tracking-wider">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-lg disabled:opacity-50"
                        >
                            <span>{loading ? "Sending..." : "Send Recovery Link"}</span>
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                            <p className="text-sm font-bold text-emerald-800 leading-relaxed">{message}</p>
                        </div>

                        {devLink && (
                            <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
                                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">🛠️ Developer Mode</p>
                                <p className="text-xs text-blue-800 font-medium">SMTP is not configured. Use this test link:</p>
                                <Link href={devLink} className="block w-full py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-all">
                                    Test Reset Link
                                </Link>
                            </div>
                        )}

                        <Link
                            href="/login"
                            className="inline-block text-xs font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                        >
                            Back to Sign In
                        </Link>
                    </div>
                )}

                {!message && (
                    <div className="mt-8 text-center">
                        <Link href="/login" className="text-xs text-slate-400 font-bold hover:text-blue-600 transition-colors">
                            Remember your password? Sign In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
