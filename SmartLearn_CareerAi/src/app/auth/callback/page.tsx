"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BrainCircuit } from "lucide-react";

function AuthCallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get("token");
        const user = searchParams.get("user");

        if (token && user) {
            try {
                // Save to local storage to match existing auth system
                localStorage.setItem("token", token);
                localStorage.setItem("user", user);

                // Redirect to dashboard
                router.push("/dashboard");
            } catch (error) {
                console.error("Auth storage failed:", error);
                router.push("/login?error=storage_failed");
            }
        } else {
            router.push("/login?error=invalid_callback");
        }
    }, [router, searchParams]);

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center font-outfit">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center animate-bounce shadow-2xl shadow-blue-200 mb-8">
                <BrainCircuit className="text-white w-10 h-10" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Synchronizing Identity...</h1>
            <p className="text-slate-400 text-sm mt-2 font-medium">Please wait while we establish your secure session.</p>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        }>
            <AuthCallbackHandler />
        </Suspense>
    );
}
