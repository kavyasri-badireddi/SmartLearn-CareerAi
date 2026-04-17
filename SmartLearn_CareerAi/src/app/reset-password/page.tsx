"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BrainCircuit, ArrowRight, Lock, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

function ResetPasswordForm() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (!token) {
            setError("Invalid session. Please request a new link.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.post("/api/auth/reset-password", { token, password });
            setSuccess(true);
            setLoading(false);
            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || "Reset failed. Link may be expired.");
            setLoading(false);
        }
    };

    if (!token && !success) {
        return (
            <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-outfit px-6 text-center">
                <div className="p-10 bg-white rounded-3xl border border-slate-200 shadow-xl max-w-md w-full">
                    <h1 className="text-2xl font-bold text-slate-900 mb-4">Missing Link</h1>
                    <p className="text-slate-500 mb-8 font-medium">This link is invalid or has already been used.</p>
                    <Link href="/forgot-password" className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all">
                        Request New Link
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-outfit px-6">
            <div className="w-full max-w-md bg-white p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="mb-10 text-center">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-100">
                        <BrainCircuit className="text-white w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">New Password</h1>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-12 text-sm text-slate-900 focus:bg-white transition-all shadow-inner"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm Identity</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3.5 pl-10 pr-12 text-sm text-slate-900 focus:bg-white transition-all shadow-inner"
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 text-[11px] text-rose-600 font-bold rounded-xl uppercase tracking-wider">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-lg disabled:opacity-50"
                        >
                            <span>{loading ? "Updating..." : "Update Password"}</span>
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>
                    </form>
                ) : (
                    <div className="text-center space-y-8">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-500/20 text-emerald-500 scale-110">
                            <CheckCircle2 size={42} className="animate-in zoom-in duration-500" />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-black text-slate-900">Success!</h2>
                            <p className="text-slate-400 font-bold text-sm">Your secure access has been restored.</p>
                        </div>
                        <div className="pt-4">
                            <div className="w-full bg-slate-50 rounded-full h-1 overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 2.5 }}
                                    className="h-full bg-emerald-500"
                                />
                            </div>
                            <p className="text-[10px] text-slate-300 font-black uppercase tracking-widest mt-4">Redirecting to login portal...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
