"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    BrainCircuit, Upload, FileText, Target, Zap, CheckCircle2,
    AlertTriangle, XCircle, TrendingUp, Award, Layers, BookOpen,
    ArrowLeft, ChevronDown, ChevronUp, Sparkles, BarChart3,
    Clock, Code2, Lightbulb, ShieldCheck, Search, RotateCcw,
    Download, ExternalLink, Star, AlertCircle, Info, Cpu,
    Briefcase, GraduationCap, FolderKanban, Wrench, Globe,
    Loader2
} from "lucide-react";
import Link from "next/link";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface SectionScores {
    skills: number;
    experience: number;
    projects: number;
    tools: number;
    domain_knowledge: number;
}

interface SkillsAnalysis {
    strong_matches: string[];
    partial_matches: string[];
    missing_skills: string[];
}

interface ProjectRelevance {
    description: string;
    relevance_score: number;
    note: string;
}

interface SkillGapItem {
    skill: string;
    priority: "critical" | "recommended" | "nice-to-have";
    reason: string;
}

interface ResumeQuality {
    score: number;
    hasQuantifiedAchievements: boolean;
    hasClearProjectDescriptions: boolean;
    hasMeasurableImpact: boolean;
    hasModernTechStack: boolean;
    feedback: string[];
}

interface AnalysisReport {
    job_role: string;
    overall_match_score: number;
    fit_category: string;
    section_scores: SectionScores;
    skills_analysis: SkillsAnalysis;
    project_relevance: ProjectRelevance[];
    skill_gap_analysis: SkillGapItem[];
    resume_improvement_suggestions: string[];
    ats_optimization_tips: string[];
    metadata: {
        model: string;
        processingTime: number;
        resumeWordCount: number;
        jdWordCount: number;
        domain: string;
        yearsRequired: number;
    };
}

// ─────────────────────────────────────────────
// Score Colors
// ─────────────────────────────────────────────

function scoreColor(score: number) {
    if (score >= 70) return { text: "text-emerald-700", bg: "bg-emerald-500", light: "bg-emerald-50", border: "border-emerald-200" };
    if (score >= 45) return { text: "text-amber-600", bg: "bg-amber-500", light: "bg-amber-50", border: "border-amber-200" };
    return { text: "text-rose-600", bg: "bg-rose-500", light: "bg-rose-50", border: "border-rose-200" };
}

function fitColors(fit: string) {
    if (fit === "Strong Fit") return { gradient: "from-emerald-600 to-emerald-400", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (fit === "Moderate Fit") return { gradient: "from-amber-500 to-amber-400", badge: "bg-amber-50 text-amber-700 border-amber-200" };
    return { gradient: "from-rose-500 to-rose-400", badge: "bg-rose-50 text-rose-700 border-rose-200" };
}

// ─────────────────────────────────────────────
// Score Arc Component
// ─────────────────────────────────────────────

function ScoreArc({ score, size = 180 }: { score: number; size?: number }) {
    const radius = (size - 20) / 2;
    const circumference = Math.PI * radius; // Semi-circle
    const strokeDashoffset = circumference - (score / 100) * circumference;
    const col = scoreColor(score);

    return (
        <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 20 }}>
            <svg width={size} height={size / 2 + 20} viewBox={`0 0 ${size} ${size / 2 + 20}`}>
                {/* Track */}
                <path
                    d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="12"
                    strokeLinecap="round"
                />
                {/* Progress */}
                <motion.path
                    d={`M 10 ${size / 2 + 10} A ${radius} ${radius} 0 0 1 ${size - 10} ${size / 2 + 10}`}
                    fill="none"
                    stroke="url(#arcGrad)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                />
                <defs>
                    <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor={score >= 70 ? "#059669" : score >= 45 ? "#d97706" : "#e11d48"} />
                        <stop offset="100%" stopColor={score >= 70 ? "#34d399" : score >= 45 ? "#fbbf24" : "#fb7185"} />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute bottom-0 flex flex-col items-center">
                <motion.span
                    className={`text-4xl font-bold ${col.text}`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, duration: 0.4 }}
                >
                    {score}
                </motion.span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">/ 100</span>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Animated Progress Bar
// ─────────────────────────────────────────────

function ProgressBar({ score, delay = 0 }: { score: number; delay?: number }) {
    const col = scoreColor(score);
    return (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
                className={`h-full rounded-full ${col.bg}`}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, ease: "easeOut", delay }}
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// Skill Badge
// ─────────────────────────────────────────────

function SkillBadge({ skill, type }: { skill: string; type: "match" | "partial" | "missing" }) {
    const styles = {
        match: "bg-emerald-50 text-emerald-700 border border-emerald-200",
        partial: "bg-amber-50 text-amber-700 border border-amber-200",
        missing: "bg-red-50 text-red-600 border border-red-200",
    };
    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${styles[type]} capitalize`}
        >
            {type === "match" && <CheckCircle2 size={10} className="mr-1.5" />}
            {type === "partial" && <AlertCircle size={10} className="mr-1.5" />}
            {type === "missing" && <XCircle size={10} className="mr-1.5" />}
            {skill}
        </motion.span>
    );
}

// ─────────────────────────────────────────────
// Priority Badge for Skill Gap
// ─────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: "critical" | "recommended" | "nice-to-have" }) {
    const map = {
        critical: "bg-red-100 text-red-700 border-red-200",
        recommended: "bg-amber-100 text-amber-700 border-amber-200",
        "nice-to-have": "bg-blue-100 text-blue-700 border-blue-200",
    };
    const labels = { critical: "Critical", recommended: "Recommended", "nice-to-have": "Nice to Have" };
    return (
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${map[priority]}`}>
            {labels[priority]}
        </span>
    );
}

// ─────────────────────────────────────────────
// Quality Check Row
// ─────────────────────────────────────────────

function QualityRow({ label, passed }: { label: string; passed: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${passed ? "bg-emerald-100" : "bg-red-100"}`}>
                {passed
                    ? <CheckCircle2 size={13} className="text-emerald-600" />
                    : <XCircle size={13} className="text-red-500" />}
            </div>
            <span className={`text-sm font-semibold ${passed ? "text-slate-700" : "text-slate-500"}`}>{label}</span>
        </div>
    );
}

// ─────────────────────────────────────────────
// Analysis Loader
// ─────────────────────────────────────────────

const ANALYSIS_STEPS = [
    { label: "Extracting resume text & sections", icon: FileText },
    { label: "Loading semantic embedding model", icon: Cpu },
    { label: "Parsing job description requirements", icon: Search },
    { label: "Computing semantic similarity vectors", icon: BrainCircuit },
    { label: "Running cosine similarity analysis", icon: BarChart3 },
    { label: "Generating compatibility report", icon: Sparkles },
];

function AnalysisLoader({ elapsed }: { elapsed: number }) {
    const stepIdx = Math.min(Math.floor(elapsed / 12), ANALYSIS_STEPS.length - 1);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)" }}
        >
            <div className="w-full max-w-md mx-4 bg-white p-8 rounded-xl border border-slate-200 shadow-xl shadow-slate-200/50">
                {/* Animated brain icon */}
                <div className="flex justify-center mb-8">
                    <div className="relative">
                        {[0, 1, 2].map(i => (
                            <motion.div
                                key={i}
                                className="absolute inset-0 rounded-full border-2 border-blue-400/30"
                                animate={{ scale: [1, 1.5 + i * 0.3, 1], opacity: [0.6, 0, 0.6] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: "easeOut" }}
                            />
                        ))}
                        <div className="w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <BrainCircuit size={32} className="text-white" />
                        </div>
                    </div>
                </div>

                <h2 className="text-xl font-bold text-slate-800 text-center mb-2">Analyzing Your Resume</h2>
                <p className="text-slate-500 text-sm text-center font-medium mb-8">
                    Semantic AI engine running deep compatibility analysis…
                </p>

                {/* Steps */}
                <div className="space-y-4 mb-8">
                    {ANALYSIS_STEPS.map((step, i) => {
                        const Icon = step.icon;
                        const done = i < stepIdx;
                        const active = i === stepIdx;
                        return (
                            <motion.div
                                key={i}
                                className="flex items-center gap-4"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${done ? "bg-emerald-100/50 border border-emerald-200/50"
                                    : active ? "bg-blue-600 shadow-lg shadow-blue-500/30 scale-110"
                                        : "bg-slate-50 border border-slate-200"
                                    }`}>
                                    {done
                                        ? <CheckCircle2 size={16} className="text-emerald-500" />
                                        : active
                                            ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                                <Loader2 size={16} className="text-white" />
                                            </motion.div>
                                            : <Icon size={14} className="text-slate-400" />}
                                </div>
                                <span className={`text-[13px] transition-all duration-500 ${done ? "text-slate-500 font-medium"
                                    : active ? "text-blue-700 font-black tracking-wide"
                                        : "text-slate-600 font-medium"
                                    }`}>
                                    {step.label}
                                </span>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Progress bar */}
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full bg-blue-500"
                        animate={{ width: `${Math.min(((stepIdx + 1) / ANALYSIS_STEPS.length) * 100, 95)}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                </div>
                <p className="text-slate-500 text-xs text-center mt-3 font-mono">{elapsed}s elapsed</p>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Input Section
// ─────────────────────────────────────────────

function InputPanel({
    onAnalyze, isAnalyzing,
}: {
    onAnalyze: (resume: string, jd: string, file: File | null) => void;
    isAnalyzing: boolean;
}) {
    const [resumeText, setResumeText] = useState("");
    const [jdText, setJdText] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);
    const [fileObj, setFileObj] = useState<File | null>(null);
    const [uploadMode, setUploadMode] = useState<"text" | "file">("text");
    const fileRef = useRef<HTMLInputElement>(null);

    const handleFile = useCallback((file: File) => {
        if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword", "text/plain"].includes(file.type)) {
            alert("Please upload a PDF, DOCX, or TXT file.");
            return;
        }
        setFileName(file.name);
        setFileObj(file);
    }, []);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    };

    const canAnalyze = (uploadMode === "file" ? !!fileObj : resumeText.trim().length > 50)
        && jdText.trim().length > 50;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* ── Resume Input ── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <FileText size={18} className="text-indigo-600" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 1</p>
                            <h3 className="text-sm font-bold text-slate-800">Your Resume</h3>
                        </div>
                    </div>
                    {/* Toggle */}
                    <div className="flex bg-slate-100 rounded-xl p-1 gap-1">
                        {(["text", "file"] as const).map(mode => (
                            <button
                                key={mode}
                                onClick={() => setUploadMode(mode)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${uploadMode === mode ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                    }`}
                            >
                                {mode === "text" ? "Paste Text" : "Upload File"}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-6">
                    {uploadMode === "text" ? (
                        <textarea
                            value={resumeText}
                            onChange={e => setResumeText(e.target.value)}
                            placeholder="Paste your full resume text here…&#10;&#10;Include all sections: Skills, Experience, Projects, Education, Certifications."
                            className="w-full h-72 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent transition-all leading-relaxed placeholder-slate-400 font-medium"
                        />
                    ) : (
                        <div
                            onDrop={handleDrop}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => fileRef.current?.click()}
                            className={`h-72 rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${dragOver
                                ? "border-indigo-400 bg-indigo-50"
                                : fileObj
                                    ? "border-emerald-300 bg-emerald-50"
                                    : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
                                }`}
                        >
                            <input
                                ref={fileRef}
                                type="file"
                                className="hidden"
                                accept=".pdf,.doc,.docx,.txt"
                                onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }}
                            />
                            {fileObj ? (
                                <>
                                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-4">
                                        <CheckCircle2 size={28} className="text-emerald-600" />
                                    </div>
                                    <p className="font-bold text-emerald-700 text-sm">{fileName}</p>
                                    <p className="text-emerald-500 text-xs mt-1 font-medium">File ready for analysis</p>
                                    <button
                                        onClick={e => { e.stopPropagation(); setFileObj(null); setFileName(null); }}
                                        className="mt-4 text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
                                    >
                                        Remove File
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center mb-4">
                                        <Upload size={24} className="text-slate-400" />
                                    </div>
                                    <p className="font-bold text-slate-700 text-sm">Drop your resume here</p>
                                    <p className="text-slate-400 text-xs mt-1 font-medium">PDF, DOCX, or TXT · Max 10MB</p>
                                </>
                            )}
                        </div>
                    )}
                    <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-wider">
                        {uploadMode === "text"
                            ? `${resumeText.split(/\s+/).filter(Boolean).length} words`
                            : fileObj ? `${fileObj.name} · ${(fileObj.size / 1024).toFixed(1)} KB` : "No file selected"}
                    </p>
                </div>
            </div>

            {/* ── JD Input ── */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                        <Briefcase size={18} className="text-purple-600" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Step 2</p>
                        <h3 className="text-sm font-bold text-slate-800">Job Description</h3>
                    </div>
                </div>
                <div className="p-6">
                    <textarea
                        value={jdText}
                        onChange={e => setJdText(e.target.value)}
                        placeholder="Paste the complete job description here…&#10;&#10;Include: Role title, Requirements, Responsibilities, Skills, and any preferred qualifications."
                        className="w-full h-72 text-sm text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-transparent transition-all leading-relaxed placeholder-slate-400 font-medium"
                    />
                    <p className="text-[10px] text-slate-400 font-bold mt-3 uppercase tracking-wider">
                        {jdText.split(/\s+/).filter(Boolean).length} words
                    </p>
                </div>
            </div>

            {/* ── Analyze Button ── */}
            <div className="lg:col-span-2 flex justify-center">
                <motion.button
                    onClick={() => onAnalyze(resumeText, jdText, fileObj)}
                    disabled={!canAnalyze || isAnalyzing}
                    whileHover={canAnalyze ? { scale: 1.02, y: -2 } : {}}
                    whileTap={canAnalyze ? { scale: 0.98 } : {}}
                    className={`relative flex items-center gap-3 px-10 py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-xl ${canAnalyze
                        ? "bg-slate-900 text-white shadow-slate-300 hover:shadow-slate-400 cursor-pointer"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                        }`}
                >
                    {isAnalyzing ? (
                        <>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Loader2 size={18} />
                            </motion.div>
                            Analyzing…
                        </>
                    ) : (
                        <>
                            <Zap size={18} />
                            Run Semantic Analysis
                            <Sparkles size={16} className="opacity-70" />
                        </>
                    )}
                    {canAnalyze && !isAnalyzing && (
                        <motion.div
                            className="absolute inset-0 rounded-xl bg-white/10"
                            animate={{ opacity: [0, 0.3, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                    )}
                </motion.button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────
// Report: Overview Card
// ─────────────────────────────────────────────

function OverviewCard({ report }: { report: AnalysisReport }) {
    const fit = fitColors(report.fit_category);
    const col = scoreColor(report.overall_match_score);

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
            {/* Top gradient strip */}
            <div className={`h-1.5 bg-gradient-to-r ${fit.gradient}`} />

            <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                {/* Arc score */}
                <div className="flex flex-col items-center gap-3">
                    <ScoreArc score={report.overall_match_score} />
                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${fit.badge}`}>
                        {report.fit_category}
                    </span>
                </div>

                {/* Details */}
                <div className="flex-1">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Target Role</p>
                    <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-4">{report.job_role}</h2>
                </div>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Report: Section Scores
// ─────────────────────────────────────────────

const SECTION_META = [
    { key: "skills", label: "Skill Match", icon: Code2, weight: "35%" },
    { key: "experience", label: "Experience", icon: Briefcase, weight: "30%" },
    { key: "projects", label: "Project Alignment", icon: FolderKanban, weight: "15%" },
    { key: "tools", label: "Tools & Technologies", icon: Wrench, weight: "10%" },
    { key: "domain_knowledge", label: "Domain Knowledge", icon: GraduationCap, weight: "10%" },
];

function SectionScoresCard({ scores }: { scores: SectionScores }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-8"
        >
            <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <BarChart3 size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Section Scores</h3>
            </div>

            <div className="space-y-6">
                {SECTION_META.map(({ key, label, icon: Icon, weight }, i) => {
                    const score = (scores as any)[key] as number;
                    const col = scoreColor(score);
                    return (
                        <div key={key}>
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2.5">
                                    <Icon size={15} className="text-slate-400" />
                                    <span className="text-sm font-bold text-slate-700">{label}</span>
                                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">({weight})</span>
                                </div>
                                <motion.span
                                    className={`text-sm font-bold ${col.text}`}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                >
                                    {score}%
                                </motion.span>
                            </div>
                            <ProgressBar score={score} delay={0.3 + i * 0.1} />
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Report: Skills Analysis
// ─────────────────────────────────────────────

function SkillsCard({ skills }: { skills: SkillsAnalysis }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-8"
        >
            <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Target size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Skills Analysis</h3>
            </div>

            <div className="space-y-6">
                {/* Strong */}
                {skills.strong_matches.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">
                                Strong Matches ({skills.strong_matches.length})
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skills.strong_matches.map(s => <SkillBadge key={s} skill={s} type="match" />)}
                        </div>
                    </div>
                )}

                {/* Partial */}
                {skills.partial_matches.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <AlertCircle size={14} className="text-amber-500" />
                            <p className="text-xs font-bold text-amber-700 uppercase tracking-widest">
                                Partial Matches ({skills.partial_matches.length})
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skills.partial_matches.map(s => <SkillBadge key={s} skill={s} type="partial" />)}
                        </div>
                    </div>
                )}

                {/* Missing */}
                {skills.missing_skills.length > 0 && (
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <XCircle size={14} className="text-red-500" />
                            <p className="text-xs font-bold text-red-700 uppercase tracking-widest">
                                Missing Skills ({skills.missing_skills.length})
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {skills.missing_skills.map(s => <SkillBadge key={s} skill={s} type="missing" />)}
                        </div>
                    </div>
                )}

                {skills.strong_matches.length === 0 && skills.partial_matches.length === 0 && skills.missing_skills.length === 0 && (
                    <p className="text-slate-400 text-sm text-center py-4 font-medium">
                        No specific technology skills detected in the job description. Analysis is based on semantic content.
                    </p>
                )}
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Report: Skill Gap Analysis
// ─────────────────────────────────────────────

function SkillGapCard({ gaps }: { gaps: SkillGapItem[] }) {
    const [open, setOpen] = useState(true);

    if (!gaps || gaps.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
        >
            <button
                onClick={() => setOpen(!open)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                        <AlertTriangle size={20} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">Skill Gap Analysis</h3>
                    <span className="px-2.5 py-1 bg-red-100 text-red-600 rounded-full text-xs font-bold">{gaps.length}</span>
                </div>
                {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-8 pb-8 space-y-3">
                            {gaps.map((gap, i) => (
                                <motion.div
                                    key={gap.skill}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.06 }}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
                                >
                                    <PriorityBadge priority={gap.priority} />
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-sm capitalize mb-0.5">{gap.skill}</p>
                                        <p className="text-slate-500 text-xs font-medium">{gap.reason}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Report: Project Relevance
// ─────────────────────────────────────────────

function ProjectsCard({ projects }: { projects: ProjectRelevance[] }) {
    if (!projects || projects.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-8"
        >
            <div className="flex items-center gap-3 mb-7">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                    <FolderKanban size={20} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Project Relevance</h3>
            </div>
            <div className="space-y-4">
                {projects.map((p, i) => {
                    const col = scoreColor(p.relevance_score);
                    return (
                        <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <p className="text-sm font-bold text-slate-700 flex-1">{p.description}</p>
                                <span className={`text-sm font-bold flex-shrink-0 ${col.text}`}>{p.relevance_score}%</span>
                            </div>
                            <ProgressBar score={p.relevance_score} delay={0.2 + i * 0.1} />
                            <p className="text-xs text-slate-500 font-medium mt-2">{p.note}</p>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Report: Resume Quality
// ─────────────────────────────────────────────



function SuggestionsCard({
    suggestions, title, icon: Icon, color,
}: {
    suggestions: string[];
    title: string;
    icon: any;
    color: string;
}) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-8"
        >
            <div className="flex items-center gap-3 mb-7">
                <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                    <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            <div className="space-y-3">
                {suggestions.map((s, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.07 }}
                        className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100"
                    >
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                        </span>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">{s}</p>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────

export default function CareerPage() {
    const [report, setReport] = useState<AnalysisReport | null>(null);
    const [isAnalyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [elapsed, setElapsed] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const runAnalysis = async (resumeText: string, jdText: string, file: File | null) => {
        setAnalyzing(true);
        setError(null);
        setReport(null);
        setElapsed(0);

        // Start elapsed timer
        timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);

        try {
            let body: FormData | string;
            let headers: Record<string, string> = {};

            if (file) {
                const fd = new FormData();
                fd.append("resumeFile", file);
                fd.append("jobDescription", jdText);
                fd.append("userId", "anonymous");
                body = fd;
            } else {
                headers["Content-Type"] = "application/json";
                body = JSON.stringify({ resumeText, jobDescription: jdText, userId: "anonymous" });
            }

            const res = await fetch("/api/career/analyze", { method: "POST", headers, body });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Analysis failed");
            setReport(data);

        } catch (err: any) {
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            if (timerRef.current) clearInterval(timerRef.current);
            setAnalyzing(false);
        }
    };

    const reset = () => {
        setReport(null);
        setError(null);
        setElapsed(0);
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] font-outfit text-slate-800">
            {/* Analysis loader overlay */}
            <AnimatePresence>
                {isAnalyzing && <AnalysisLoader elapsed={elapsed} />}
            </AnimatePresence>

            {/* Header */}
            <header className="h-20 border-b border-slate-200 flex items-center justify-between px-10 sticky top-0 bg-white/80 backdrop-blur-xl z-50">
                <div className="flex items-center space-x-3 w-64">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-100">
                        <BrainCircuit className="text-white w-6 h-6" />
                    </div>
                    <span className="text-lg font-black tracking-tighter text-slate-900 leading-none">SmartLearn AI</span>
                </div>

                {/* Module Toggle */}
                <div className="flex justify-center flex-1">
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full max-w-[400px] shadow-inner border border-slate-200/50">
                        <Link
                            href="/dashboard"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 text-[11px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap px-4"
                        >
                            <Layers size={14} className="text-slate-400" />
                            Research Library
                        </Link>
                        <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white shadow-sm border border-slate-200/60 text-slate-900 text-[11px] font-bold uppercase tracking-widest cursor-default whitespace-nowrap px-4">
                            <BrainCircuit size={14} className="text-blue-600" />
                            Career Intelligence
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-6 justify-end w-64">
                    {report && (
                        <button
                            onClick={reset}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest transition-all border border-slate-200"
                        >
                            <RotateCcw size={13} />
                            New Analysis
                        </button>
                    )}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 pb-24">
                {/* Hero */}
                <AnimatePresence mode="wait">
                    {!report && !isAnalyzing && (
                        <motion.div
                            key="hero"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center mb-14"
                        >

                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-bold uppercase tracking-widest mb-6 shadow-sm">
                                <Sparkles size={12} />
                                Career AI Module
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 leading-tight tracking-tight mb-6">
                                Upload your Resume & JD
                                <span className="block bg-gradient-to-r from-blue-600 to-slate-500 bg-clip-text text-transparent mt-1">
                                    Get a Complete Analysis
                                </span>
                            </h1>

                            {/* Feature pills */}
                            <div className="flex flex-wrap justify-center gap-3 mt-10">
                                {[
                                    { icon: BrainCircuit, label: "Semantic Embeddings" },
                                    { icon: BarChart3, label: "Section Scoring" },
                                    { icon: AlertTriangle, label: "Skill Gap Analysis" },
                                    { icon: Lightbulb, label: "AI Suggestions" },
                                    { icon: Award, label: "ATS Optimization" },
                                ].map(({ icon: Icon, label }) => (
                                    <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 cursor-default hover:border-blue-200 hover:shadow-md transition-all shadow-sm text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                                        <Icon size={14} className="text-blue-500" />
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Error */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-6 bg-white border border-rose-200 rounded-xl flex items-start gap-4 shadow-sm shadow-rose-100/50"
                    >
                        <XCircle size={20} className="text-rose-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-rose-700 font-bold text-sm mb-1">Analysis Failed</p>
                            <p className="text-rose-600 text-[13px] font-medium leading-relaxed">{error}</p>
                        </div>
                    </motion.div>
                )}

                {/* Input form (hidden when report is ready) */}
                {!report && (
                    <div className={`${isAnalyzing ? "opacity-30 pointer-events-none" : ""} transition-opacity`}>
                        <InputPanel onAnalyze={runAnalysis} isAnalyzing={isAnalyzing} />
                    </div>
                )}

                {/* Report */}
                {report && (
                    <motion.div
                        key="report"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-6"
                    >
                        {/* Overview */}
                        <OverviewCard report={report} />

                        {/* 2-col grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SectionScoresCard scores={report.section_scores} />
                            <SkillsCard skills={report.skills_analysis} />
                        </div>

                        {/* Skill gap */}
                        <SkillGapCard gaps={report.skill_gap_analysis} />

                        {/* Projects */}
                        <ProjectsCard projects={report.project_relevance} />

                        {/* Suggestions */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <SuggestionsCard
                                suggestions={report.resume_improvement_suggestions}
                                title="Improvement Suggestions"
                                icon={TrendingUp}
                                color="bg-indigo-50 text-indigo-600"
                            />
                            <SuggestionsCard
                                suggestions={report.ats_optimization_tips}
                                title="ATS Optimization Tips"
                                icon={Award}
                                color="bg-purple-50 text-purple-600"
                            />
                        </div>

                        {/* JSON Export */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="flex justify-center"
                        >
                            <button
                                onClick={() => {
                                    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `ats-report-${Date.now()}.json`;
                                    a.click();
                                    URL.revokeObjectURL(url);
                                }}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 shadow-sm text-slate-700 hover:text-indigo-600 text-[10px] font-bold uppercase tracking-widest transition-all"
                            >
                                <Download size={14} />
                                Export Full Report (JSON)
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
