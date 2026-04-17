"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BrainCircuit, ArrowRight, Mail, Lock, Eye, EyeOff, ShieldCheck, Github } from "lucide-react";
import axios from "axios";

export default function SignupPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otp, setOtp] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [otpRequired, setOtpRequired] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const handleSocialLogin = (provider: string) => {
        if (provider === "Google") {
            window.location.href = "/api/auth/google";
            return;
        }
        if (provider === "GitHub") {
            window.location.href = "/api/auth/github";
            return;
        }
        setError(`Social signup via ${provider} is currently being integrated.`);
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post("/api/auth/signup", { name, email, password });
            if (res.data.otpRequired) {
                setOtpRequired(true);
                setLoading(false);
            }
        } catch (err: any) {
            setError(err.response?.data?.error || "Registration failed.");
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await axios.post("/api/auth/signup/verify", { name, email, password, otp });
            localStorage.setItem("user", JSON.stringify(res.data.user));
            localStorage.setItem("token", res.data.token);
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.error || "Verification failed.");
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (value.length > 1) {
            // Handle paste
            const pastedValue = value.slice(0, 6).split("");
            let newOtp = otp.split("");
            pastedValue.forEach((char, i) => {
                if (index + i < 6) newOtp[index + i] = char;
            });
            const updatedOtp = newOtp.join("");
            setOtp(updatedOtp);

            // Focus last filled or next empty
            const lastIndex = Math.min(index + pastedValue.length, 5);
            inputRefs.current[lastIndex]?.focus();
            return;
        }

        const newOtp = otp.split("");
        newOtp[index] = value;
        const updatedOtp = newOtp.join("");
        setOtp(updatedOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-outfit px-6">
            <div className="w-full max-w-[340px] bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-xl shadow-slate-200/50">
                <div className="mb-6 text-center">
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-100">
                        {otpRequired ? <ShieldCheck className="text-white w-4 h-4" /> : <BrainCircuit className="text-white w-4 h-4" />}
                    </div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">
                        {otpRequired ? "Verify Identity" : "Create Account"}
                    </h1>
                    <p className="text-slate-500 text-[12px] font-medium leading-tight">
                        {otpRequired
                            ? `Authenticating access for ${email}`
                            : "Start your journey with SmartLearn AI"
                        }
                    </p>
                </div>

                {!otpRequired ? (
                    <>
                        <form onSubmit={handleSignup} className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Identity Name</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">👤</span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-900 focus:bg-white transition-all shadow-inner outline-none"
                                        placeholder="Full Name"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Work Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 text-xs text-slate-900 focus:bg-white transition-all shadow-inner outline-none"
                                        placeholder="name@university.edu"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Secure Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-10 text-xs text-slate-900 focus:bg-white transition-all shadow-inner outline-none"
                                        placeholder="Min. 8 characters"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={12} /> : <Eye size={12} />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="p-2.5 bg-red-50 border border-red-100 text-[10px] text-red-600 font-bold rounded-lg">
                                    {error}
                                </div>
                            )}

                            <button
                                disabled={loading}
                                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-100 disabled:opacity-50 text-xs"
                            >
                                <span>{loading ? "Initializing..." : "Create Account"}</span>
                                {!loading && <ArrowRight className="w-3 h-3" />}
                            </button>
                        </form>

                        <div className="mt-5 relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest">
                                <span className="bg-white px-3 text-slate-400">Or continue with</span>
                            </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-2">
                            <button
                                onClick={() => handleSocialLogin("Google")}
                                className="flex items-center justify-center space-x-2 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-bold text-[10px] text-slate-700 active:scale-95"
                            >
                                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Google</span>
                            </button>
                            <button
                                onClick={() => handleSocialLogin("GitHub")}
                                className="flex items-center justify-center space-x-2 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-all font-bold text-[10px] text-slate-700 active:scale-95"
                            >
                                <Github className="w-3.5 h-3.5" />
                                <span>GitHub</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-8">
                        <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block text-center">Verification Code</label>
                            <div className="flex justify-between gap-2 max-w-[280px] mx-auto">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <input
                                        key={index}
                                        ref={(el) => { inputRefs.current[index] = el; }}
                                        type="text"
                                        maxLength={1}
                                        value={otp[index] || ""}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-10 h-14 bg-slate-50 border-2 border-slate-100 rounded-xl text-center text-xl font-bold text-blue-600 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        required
                                    />
                                ))}
                            </div>
                            <div className="space-y-2">
                                <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">
                                    Check your email for the 6-digit code
                                </p>
                                <div className="flex items-center justify-center space-x-2 py-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-xs text-red-600 font-bold rounded-xl">
                                {error}
                            </div>
                        )}

                        <button
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 shadow-lg shadow-indigo-100 disabled:opacity-50"
                        >
                            <span>{loading ? "Verifying..." : "Verify & Complete Setup"}</span>
                            {!loading && <ArrowRight className="w-4 h-4" />}
                        </button>

                        <button
                            type="button"
                            onClick={() => setOtpRequired(false)}
                            className="w-full text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-2"
                        >
                            Go Back
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-400 font-bold">
                        Already registered?
                        <Link href="/login" className="text-blue-600 ml-2 hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
