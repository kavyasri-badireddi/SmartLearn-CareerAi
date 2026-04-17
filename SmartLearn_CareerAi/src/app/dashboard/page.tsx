"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    LayoutDashboard,
    FileText,
    Target,
    Settings,
    Plus,
    LogOut,
    Bell,
    Search,
    BrainCircuit,
    Upload,
    CheckCircle2,
    Check,
    Layers,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    ArrowRight,
    Command,
    ExternalLink,
    Trash2,
    Pencil,
    Save,
    Edit3,
    Eye,
    Download,
    FileType,
    FileJson,
    BookOpen,
    Sparkles,
    Key,
    Lock,
    Zap,
    BarChart3,
    TrendingUp,
    AlertCircle
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";


// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// PROCESSING OVERLAY â€” Clean Professional Loading Screen
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

const PROCESSING_STEPS = [
    { label: 'Extracting text from document', icon: FileText },
    { label: 'Analyzing content structure', icon: Search },
    { label: 'Generating AI summary', icon: Sparkles },
    { label: 'Creating quiz questions', icon: Target },
    { label: 'Building flashcards', icon: BookOpen },
    { label: 'Finalizing study kit', icon: CheckCircle2 },
];

const STUDY_TIPS = [
    "🧠 Active recall improves retention by 150% compared to passive reading.",
    "🔁 Spaced repetition is one of the most effective study techniques known.",
    "🎓 Teaching a concept to someone else solidifies your own understanding.",
    "⏱️ Taking short breaks every 25 minutes boosts focus and productivity.",
    "🔗 Connecting new information to what you already know creates stronger memories.",
    "✍️ Writing notes by hand improves comprehension over typing.",
    "😴 Sleep plays a critical role in consolidating what you've learned.",
    "🔀 Mixing different topics in one study session enhances learning.",
];

function ProcessingOverlay({ onCancel }: { onCancel?: () => void }) {
    const [stepIdx, setStepIdx] = useState(0);
    const [elapsed, setElapsed] = useState(0);
    const [tipIdx, setTipIdx] = useState(0);

    // Advance steps every ~30s, stop one before last so final step stays "active"
    useEffect(() => {
        const t = setInterval(() => {
            setStepIdx(p => (p < PROCESSING_STEPS.length - 2 ? p + 1 : p));
        }, 30000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const t = setInterval(() => setElapsed(e => e + 1), 1000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const t = setInterval(() => {
            setTipIdx(p => (p + 1) % STUDY_TIPS.length);
        }, 6000);
        return () => clearInterval(t);
    }, []);

    const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
    // Cap progress at 92% so it never shows 100% while still processing
    const progress = Math.min(((stepIdx + 1) / PROCESSING_STEPS.length) * 100, 92);

    return (
        <div className="fixed inset-0 z-[200] bg-white/95 backdrop-blur-2xl flex items-center justify-center overflow-hidden">
            {/* Soft gradient accents */}
            <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full pointer-events-none opacity-30"
                style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)', transform: 'translate(-30%, -30%)' }} />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none opacity-30"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

            <div className="relative w-full max-w-lg mx-auto px-6">
                {/* Animated icon */}
                <div className="flex justify-center mb-10">
                    <div className="relative">
                        <motion.div
                            className="absolute inset-[-20px]"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                        >
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-blue-400" />
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet-400" />
                        </motion.div>
                        <motion.div
                            className="absolute inset-[-30px]"
                            animate={{ rotate: -360 }}
                            transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                        >
                            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-indigo-300" />
                            <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1 h-1 rounded-full bg-blue-300" />
                        </motion.div>

                        <motion.div
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-xl shadow-blue-200/50"
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        >
                            <Sparkles className="w-9 h-9 text-white" />
                        </motion.div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-8">
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
                        Analyzing Your Document
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1.5 font-medium">
                        Our AI is preparing your personalized study kit
                    </p>
                </div>

                {/* Progress bar */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Progress</span>
                        <span className="text-[9px] font-mono font-bold text-slate-400">{fmt(elapsed)}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)', backgroundSize: '200% 100%' }}
                            animate={{ width: `${progress}%`, backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'] }}
                            transition={{
                                width: { duration: 0.8, ease: 'easeOut' },
                                backgroundPosition: { duration: 3, repeat: Infinity, ease: 'linear' },
                            }}
                        />
                    </div>
                </div>

                {/* Steps checklist */}
                <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5 mb-8">
                    <div className="space-y-3">
                        {PROCESSING_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const isDone = i < stepIdx;
                            const isActive = i === stepIdx;
                            return (
                                <motion.div
                                    key={i}
                                    className="flex items-center gap-3"
                                    initial={{ opacity: 0.4 }}
                                    animate={{ opacity: isDone || isActive ? 1 : 0.35 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {isDone ? (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0"
                                        >
                                            <CheckCircle2 size={14} className="text-blue-500" />
                                        </motion.div>
                                    ) : isActive ? (
                                        <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0">
                                            <motion.div
                                                className="w-2 h-2 rounded-full bg-blue-500"
                                                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center flex-shrink-0">
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        </div>
                                    )}
                                    <Icon size={13} className={isDone ? 'text-blue-500' : isActive ? 'text-blue-600' : 'text-slate-300'} />
                                    <span className={`text-[11px] font-bold ${isDone ? 'text-blue-600' : isActive ? 'text-slate-800' : 'text-slate-400'}`}>
                                        {step.label}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                {/* Rotating study tip */}
                <div className="text-center">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2">💡 Did you know?</p>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={tipIdx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4 }}
                            className="text-[11px] text-slate-500 leading-relaxed max-w-sm mx-auto font-medium"
                        >
                            {STUDY_TIPS[tipIdx]}
                        </motion.p>
                    </AnimatePresence>
                </div>

                {/* Cancel button */}
                {onCancel && (
                    <div className="text-center mt-8">
                        <motion.button
                            onClick={onCancel}
                            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100/80 hover:bg-red-50 hover:text-red-500 border border-slate-200 hover:border-red-200 transition-all duration-200 cursor-pointer"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            ✕ Stop Processing
                        </motion.button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(true);
    const [user, setUser] = useState<any>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
            router.push("/login");
            return;
        }
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        fetchNotes(parsedUser.id);
    }, []);

    const fetchNotes = async (userId: string) => {
        try {
            const response = await fetch(`/api/notes?userId=${userId}`);
            const data = await response.json();
            if (Array.isArray(data)) setNotes(data);
        } catch (err) {
            console.error("Failed to fetch notes");
        } finally {
            setIsLoadingNotes(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        router.push("/");
    };

    const handlePasswordChange = async (data: any) => {
        setPasswordError(null);
        setPasswordSuccess(null);
        try {
            const token = localStorage.getItem("token");
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    currentPassword: data.currentPassword,
                    newPassword: data.newPassword
                })
            });
            const result = await res.json();
            if (res.ok) {
                setPasswordSuccess("Password updated successfully.");
                setTimeout(() => setShowPasswordModal(false), 2000);
            } else {
                setPasswordError(result.error || "Security update failed.");
            }
        } catch (err) {
            setPasswordError("Critical communication failure.");
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-outfit">
            {/* Minimal Header */}
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
                        <div className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white shadow-sm border border-slate-200/60 text-slate-900 text-[11px] font-bold uppercase tracking-widest cursor-default whitespace-nowrap px-4">
                            <Layers size={14} className="text-blue-600" />
                            Research Library
                        </div>
                        <Link
                            href="/career"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 text-[11px] font-semibold uppercase tracking-widest transition-all whitespace-nowrap px-4"
                        >
                            <BrainCircuit size={14} className="text-slate-400" />
                            Career Intelligence
                        </Link>
                    </div>
                </div>

                <div className="flex items-center space-x-6 justify-end w-64">
                    <div className="relative">
                        <div
                            onClick={() => setShowProfileMenu(!showProfileMenu)}
                            className="flex items-center space-x-4 pl-6 border-l border-slate-200 cursor-pointer group select-none"
                        >
                            <div className="text-right">
                                <p className="text-[11px] font-black text-slate-900 leading-none mb-1 group-hover:text-blue-600 transition-colors">{user?.name || "Member"}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Academic Profile</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-slate-900 group-hover:bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-lg transition-all group-hover:scale-105 active:scale-95">
                                {user?.name?.[0]?.toUpperCase() || "S"}
                            </div>
                        </div>

                        <AnimatePresence>
                            {showProfileMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-4 w-56 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-slate-200/50 p-2 z-[60]"
                                >
                                    <button
                                        onClick={() => {
                                            setShowPasswordModal(true);
                                            setShowProfileMenu(false);
                                        }}
                                        className="w-full flex items-center space-x-3 p-3 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <Key size={16} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Change Password</span>
                                    </button>
                                    <div className="h-px bg-slate-50 my-1 mx-2" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center space-x-3 p-3 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors text-left"
                                    >
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-red-100 flex items-center justify-center">
                                            <LogOut size={16} />
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest">Sign Out</span>
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </header>

            {showPasswordModal && (
                <ChangePasswordModal
                    onClose={() => setShowPasswordModal(false)}
                    onSubmit={handlePasswordChange}
                    error={passwordError}
                    success={passwordSuccess}
                />
            )}

            <main className="p-8 md:p-12 max-w-7xl mx-auto pb-32 space-y-12">


                <NotesTab onProcessed={() => fetchNotes(user.id)} existingNotes={notes} userId={user?.id} />
            </main>
        </div >
    );
}

function NotesTab({ onProcessed, existingNotes, userId }: { onProcessed: () => void, existingNotes: any[], userId?: string }) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeNote, setActiveNote] = useState<any>(null);
    const [showModal, setShowModal] = useState<"quiz" | "flashcards" | "summary" | null>(null);
    const [abortController, setAbortController] = useState<AbortController | null>(null);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !userId) return;

        setUploadError(null);
        const controller = new AbortController();
        setAbortController(controller);
        setIsProcessing(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", file.name.split('.')[0]);
        formData.append("userId", userId);

        try {
            const res = await fetch("/api/notes/process", { method: "POST", body: formData, signal: controller.signal });
            const data = await res.json();
            
            if (!res.ok) {
                setUploadError(data.error || "Neural processing failed. Please try again.");
                return;
            }

            setActiveNote(data);
            onProcessed();
        } catch (err: any) {
            if (err?.name === 'AbortError') {
                console.log('Processing cancelled by user');
            } else {
                setUploadError("Communication failure or server timeout. Please try again.");
                console.error("Processing error");
            }
        } finally {
            setIsProcessing(false);
            setAbortController(null);
        }
    };

    const handleCancelProcessing = () => {
        if (abortController) {
            abortController.abort();
        }
        setIsProcessing(false);
        setAbortController(null);
    };

    const handleDelete = async (noteId: string) => {
        try {
            const res = await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
            if (res.ok) {
                onProcessed(); // Refresh the list
            }
        } catch (err) {
            console.error("Failed to delete note");
        }
    };

    const handleRename = async (noteId: string, newTitle: string) => {
        try {
            const res = await fetch(`/api/notes/${noteId}`, {
                method: "PATCH",
                body: JSON.stringify({ title: newTitle }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                onProcessed(); // Refresh the list
            }
        } catch (err) {
            console.error("Failed to rename note");
        }
    };

    const handleUpdateSummary = async (noteId: string, newSummary: string) => {
        try {
            const res = await fetch(`/api/notes/${noteId}`, {
                method: "PATCH",
                body: JSON.stringify({ summary: newSummary }),
                headers: { "Content-Type": "application/json" }
            });
            if (res.ok) {
                const updated = await res.json();
                setActiveNote(updated);
                onProcessed();
            }
        } catch (err) {
            console.error("Failed to update summary");
        }
    };

    return (
        <div className="space-y-12">
            {/* Processing overlay — shows during document processing */}
            <AnimatePresence>
                {isProcessing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <ProcessingOverlay onCancel={handleCancelProcessing} />
                    </motion.div>
                )}
            </AnimatePresence>

            {!activeNote ? (
                <div className="space-y-12">
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900">Document Library</h1>
                            <p className="text-slate-500 text-sm font-bold mt-1">Manage and analyze your research repository.</p>
                        </div>
                        <label className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-3 cursor-pointer hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                            {isProcessing ? <Plus className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                            <span>Import Content</span>
                            <input type="file" id="note-upload" className="hidden" onChange={handleFileUpload} accept=".pdf,.doc,.docx,.txt" disabled={isProcessing} />
                        </label>
                    </div>

                    <AnimatePresence>
                        {uploadError && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white border border-rose-200 rounded-3xl p-6 flex items-center gap-5 text-rose-600 mb-8 shadow-sm shadow-rose-100/50"
                            >
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertCircle size={20} />
                                </div>
                                <div>
                                    <h4 className="text-[11px] font-black uppercase tracking-widest leading-none mb-1">System Error</h4>
                                    <p className="text-xs font-medium opacity-90">{uploadError}</p>
                                </div>
                                <button
                                    onClick={() => setUploadError(null)}
                                    className="ml-auto w-8 h-8 flex items-center justify-center hover:bg-red-100/50 rounded-lg transition-colors text-red-400"
                                >
                                    <X size={16} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {existingNotes.map((note) => (
                            <div
                                key={note.id}
                                onClick={() => setActiveNote(note)}
                                className="relative p-8 bg-white border border-slate-200 rounded-3xl hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-50 transition-all cursor-pointer group"
                            >
                                <div className="absolute top-6 right-6 flex space-x-2 opacity-0 group-hover:opacity-100 transition-all bg-white/80 backdrop-blur-sm p-2 rounded-xl">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newTitle = prompt("Enter new title:", note.title);
                                            if (newTitle && newTitle !== note.title) {
                                                handleRename(note.id, newTitle);
                                            }
                                        }}
                                        className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                                        title="Rename Document"
                                    >
                                        <Pencil size={16} />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Are you sure you want to delete this document and all its study kits?")) {
                                                handleDelete(note.id);
                                            }
                                        }}
                                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                        title="Delete Document"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center mb-10 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                    <FileText size={24} />
                                </div>
                                <h3 className="font-black text-slate-900 mb-2 line-clamp-2 leading-tight text-base pr-12">{note.title}</h3>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(note.createdAt).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
                    <button onClick={() => setActiveNote(null)} className="flex items-center text-[10px] font-black text-blue-600 hover:underline uppercase tracking-[0.2em]">
                        <ArrowLeft className="w-4 h-4 mr-2" /> All Documents
                    </button>

                    <div className="pb-10 border-b border-slate-100">
                        <h2 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">{activeNote.title}</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Summary Card */}
                        <div
                            onClick={() => setShowModal("summary")}
                            className="p-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all flex flex-col group cursor-pointer"
                        >
                            <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center mb-10 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-xl font-black mb-6 tracking-tight text-slate-900">Intelligence Summary</h3>
                            <div className="prose prose-slate prose-sm max-w-none text-slate-500 line-clamp-4 flex-grow overflow-hidden pointer-events-none">
                                <ReactMarkdown>
                                    {activeNote.summary}
                                </ReactMarkdown>
                            </div>
                            <div className="mt-10 pt-6 border-t border-slate-50">
                            </div>
                        </div>

                        {/* Quiz Card */}
                        <ModuleAction
                            title="Analytical Quiz"
                            description="Test comprehension using algorithmically generated questions based on key topics."
                            onClick={() => setShowModal("quiz")}
                            icon={<CheckCircle2 size={24} />}
                        />

                        {/* Flashcards Card */}
                        <ModuleAction
                            title="Recall Deck"
                            description="Optimized flashcards for high-retention memory encoding of important points."
                            onClick={() => setShowModal("flashcards")}
                            icon={<ExternalLink size={24} />}
                        />
                    </div>
                </motion.div>
            )}

            {showModal === "summary" && (
                <SummaryModal
                    note={activeNote}
                    onClose={() => setShowModal(null)}
                    onUpdate={(newSummary: string) => handleUpdateSummary(activeNote.id, newSummary)}
                />
            )}
            {showModal === "quiz" && <QuizModal note={activeNote} onClose={() => setShowModal(null)} />}
            {showModal === "flashcards" && <FlashcardModal note={activeNote} onClose={() => setShowModal(null)} />}
        </div>
    );
}

function SummaryModal({ note, onClose, onUpdate }: { note: any, onClose: () => void, onUpdate: (s: string) => void }) {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(note.summary || "");
    const [showExportMenu, setShowExportMenu] = useState(false);

    const handleSave = () => {
        onUpdate(text);
        setIsEditing(false);
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        const splitText = doc.splitTextToSize(text.replace(/[#*]/g, ''), 180);
        doc.setFontSize(20);
        doc.text(note.title, 15, 20);
        doc.setFontSize(11);
        doc.text(splitText, 15, 35);
        doc.save(`${note.title}.pdf`);
    };

    const exportDOCX = async () => {
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({ text: note.title, heading: HeadingLevel.HEADING_1 }),
                    ...text.split('\n').map((line: string) => new Paragraph({ text: line.replace(/[#*]/g, '') }))
                ],
            }],
        });
        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${note.title}.docx`);
    };

    const exportTXT = () => {
        const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        saveAs(blob, `${note.title}.txt`);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-md flex items-start justify-center p-0 md:p-8 overflow-y-auto">
            <div className="w-full max-w-5xl bg-white min-h-screen md:min-h-0 md:rounded-[3rem] shadow-2xl overflow-hidden relative mb-12">
                {/* Sticky Header */}
                <div className="sticky top-0 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-8 py-6 flex flex-col md:flex-row justify-between items-center z-50 gap-4">
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-0.5 block">Deep Intelligence Report</span>
                            <h2 className="text-xl font-black text-slate-900 line-clamp-1">{note.title}</h2>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="px-5 py-3 bg-slate-900 text-white rounded-xl flex items-center space-x-2 hover:bg-slate-800 transition-all text-[10px] font-black uppercase tracking-widest"
                            >
                                <Download size={16} />
                                <span>Export Material</span>
                            </button>

                            {showExportMenu && (
                                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-2xl p-2 z-[60] animate-in fade-in slide-in-from-top-2">
                                    <button onClick={exportPDF} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-center space-x-3 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center font-bold text-[10px]">PDF</div>
                                        <span className="text-[11px] font-bold text-slate-700">Adobe PDF Document</span>
                                    </button>
                                    <button onClick={exportDOCX} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-center space-x-3 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center font-bold text-[10px]">DOCX</div>
                                        <span className="text-[11px] font-bold text-slate-700">MS Word Document</span>
                                    </button>
                                    <button onClick={exportTXT} className="w-full text-left p-3 hover:bg-slate-50 rounded-xl flex items-center space-x-3 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center font-bold text-[10px]">TXT</div>
                                        <span className="text-[11px] font-bold text-slate-700">Plain Text File</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-5 py-3 rounded-xl flex items-center space-x-2 transition-all ${isEditing ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                            {isEditing ? <Eye size={16} /> : <Edit3 size={16} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{isEditing ? "Preview" : "Edit Concept"}</span>
                        </button>

                        {isEditing && (
                            <button
                                onClick={handleSave}
                                className="px-5 py-3 bg-green-600 text-white rounded-xl flex items-center space-x-2 hover:bg-green-700 transition-all shadow-lg shadow-green-200"
                            >
                                <Save size={16} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Save</span>
                            </button>
                        )}
                        <button onClick={onClose} className="p-3 bg-slate-50 text-slate-400 hover:text-red-500 rounded-xl transition-colors"><X size={20} /></button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-8 md:p-16 relative">
                    <div className="absolute top-16 right-16 opacity-[0.03] pointer-events-none">
                        <BookOpen size={300} />
                    </div>

                    {isEditing ? (
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-[800px] bg-transparent border-none focus:ring-0 text-lg text-slate-700 leading-relaxed font-medium font-mono placeholder-slate-300 resize-none outline-none"
                            placeholder="Add your highlights, points, and bold concepts here..."
                        />
                    ) : (
                        <div className="prose prose-slate prose-lg max-w-none text-slate-700 leading-loose scroll-mt-24">
                            <ReactMarkdown
                                components={{
                                    code: ({ node, className, children, ...props }: any) => {
                                        const isBlock = className?.includes('language-') || String(children).includes('\n');
                                        if (isBlock) {
                                            return (
                                                <div className="relative my-4 group">
                                                    <pre className="bg-slate-900 text-slate-100 rounded-xl p-5 overflow-x-auto text-sm leading-relaxed font-mono">
                                                        <code>{String(children).replace(/\n$/, '')}</code>
                                                    </pre>
                                                    <button
                                                        onClick={() => navigator.clipboard.writeText(String(children).replace(/\n$/, ''))}
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-widest"
                                                    >
                                                        Copy
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>{children}</code>;
                                    },
                                    img: ({ node, ...props }) => (
                                        <div className="my-12 flex flex-col items-center">
                                            <img
                                                {...props}
                                                className="rounded-3xl shadow-2xl border border-slate-100 max-h-[600px] object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = `https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=1024&auto=format&fit=crop`;
                                                }}
                                            />
                                            <span className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Neural Visualization Output</span>
                                        </div>
                                    )
                                }}
                            >
                                {text}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                <div className="bg-slate-50/50 p-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <span>Control Center V6.5</span>
                    <div className="flex space-x-8">
                        <span>Digital Signature Verified</span>
                        <span>Neural Buffer Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ModuleAction({ title, description, onClick, icon }: { title: string, description: string, onClick: () => void, icon: any }) {
    return (
        <button
            onClick={onClick}
            className="p-10 bg-white border border-slate-200 rounded-3xl text-left hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-50 transition-all group"
        >
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">{icon}</div>
            <h3 className="text-xl font-black mb-3 tracking-tight text-slate-900">{title}</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed">{description}</p>
        </button>
    );
}



function QuizModal({ note, onClose }: { note: any, onClose: () => void }) {
    const questions = note.quizzes?.[0]?.questions || [];
    const [idx, setIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
    const [multiSelected, setMultiSelected] = useState<Set<number>>(new Set());
    const [submitted, setSubmitted] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [done, setDone] = useState(false);

    const currentQuestion = questions[idx];
    const qType = currentQuestion?.type || 'mcq';
    const progress = questions.length > 0 ? ((idx + 1) / questions.length) * 100 : 0;

    // Reset state when moving between questions
    useEffect(() => {
        setSelectedIdx(null);
        setMultiSelected(new Set());
        setSubmitted(false);
        setShowExplanation(false);
    }, [idx]);

    // Type badge config
    const typeBadges: Record<string, { label: string; color: string }> = {
        mcq: { label: 'Multiple Choice', color: 'bg-blue-100 text-blue-700' },
        fill_blank: { label: 'Fill in the Blank', color: 'bg-violet-100 text-violet-700' },
        true_false: { label: 'True or False', color: 'bg-amber-100 text-amber-700' },
        multi_select: { label: 'Select All That Apply', color: 'bg-emerald-100 text-emerald-700' },
    };
    const badge = typeBadges[qType] || typeBadges.mcq;

    // Check if an option is correct (works for both single and multi-select)
    const isOptionCorrect = (opt: string): boolean => {
        if (Array.isArray(currentQuestion?.answer)) {
            return currentQuestion.answer.includes(opt);
        }
        return opt === currentQuestion?.answer;
    };

    // Handle single-answer selection (MCQ, fill_blank, true_false)
    const handleSingleAnswer = (ansIdx: number) => {
        if (selectedIdx !== null) return;
        setSelectedIdx(ansIdx);
        setShowExplanation(true);
        if (isOptionCorrect(currentQuestion.options[ansIdx])) {
            setScore(s => s + 1);
        }
    };

    // Toggle checkbox for multi-select
    const toggleMultiOption = (ansIdx: number) => {
        if (submitted) return;
        setMultiSelected(prev => {
            const next = new Set(prev);
            if (next.has(ansIdx)) next.delete(ansIdx);
            else next.add(ansIdx);
            return next;
        });
    };

    // Submit multi-select answer
    const handleMultiSubmit = () => {
        if (submitted || multiSelected.size === 0) return;
        setSubmitted(true);
        setShowExplanation(true);

        // Check if all selected are correct and no correct ones are missed
        const correctAnswers: string[] = Array.isArray(currentQuestion.answer) ? currentQuestion.answer : [currentQuestion.answer];
        const selectedOptions = Array.from(multiSelected).map(i => currentQuestion.options[i]);
        const allCorrectSelected = correctAnswers.every(a => selectedOptions.includes(a));
        const noWrongSelected = selectedOptions.every(s => correctAnswers.includes(s));

        if (allCorrectSelected && noWrongSelected) {
            setScore(s => s + 1);
        }
    };

    const nextQuestion = () => {
        if (idx < questions.length - 1) {
            setIdx(i => i + 1);
            setSelectedIdx(null);
            setMultiSelected(new Set());
            setSubmitted(false);
            setShowExplanation(false);
        } else {
            setDone(true);
        }
    };

    const isAnswered = qType === 'multi_select' ? submitted : selectedIdx !== null;

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md overflow-y-auto py-10 px-4 custom-scrollbar">
            <div className="min-h-full flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden relative"
                >
                    {!done ? (
                        <div className="flex flex-col">
                            {/* Progress bar */}
                            <div className="h-1.5 w-full bg-slate-100 relative">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    className="absolute h-full bg-blue-600 transition-all duration-700 ease-out"
                                />
                            </div>

                            <div className="p-10 md:p-14 space-y-10">
                                {/* Header with question count + type badge */}
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-3 flex-wrap gap-y-2">
                                        <div className="flex items-center bg-slate-100 rounded-full px-1 py-1">
                                            <button
                                                onClick={() => idx > 0 && setIdx(idx - 1)}
                                                disabled={idx === 0}
                                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm disabled:opacity-20 transition-all text-slate-500"
                                                title="Previous Question"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                            <div className="px-3 text-[10px] font-black text-slate-500 uppercase tracking-widest min-w-[100px] text-center">
                                                {idx + 1} / {questions.length}
                                            </div>
                                            <button
                                                onClick={() => idx < questions.length - 1 && setIdx(idx + 1)}
                                                disabled={idx === questions.length - 1}
                                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white hover:shadow-sm disabled:opacity-20 transition-all text-slate-500"
                                                title="Next Question"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full scale-90 md:scale-100 text-[10px] font-black uppercase tracking-wider ${badge.color}`}>
                                            {badge.label}
                                        </div>
                                    </div>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-red-500 hover:rotate-90"
                                    >
                                        <X size={20} />
                                    </button>
                                </div>

                                {/* Question + Options */}
                                <div className="space-y-8">
                                    <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight leading-tight whitespace-pre-line">
                                        {currentQuestion?.question}
                                    </h2>

                                    {/* Multi-select instruction */}
                                    {qType === 'multi_select' && !submitted && (
                                        <p className="text-sm font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2">
                                            <Check size={16} /> Select ALL correct answers, then click Submit
                                        </p>
                                    )}

                                    <div className="space-y-4">
                                        {currentQuestion?.options.map((opt: string, i: number) => {
                                            const correct = isOptionCorrect(opt);

                                            if (qType === 'multi_select') {
                                                // â”€â”€â”€ MULTI-SELECT (Checkboxes) â”€â”€â”€
                                                const checked = multiSelected.has(i);
                                                let style = "w-full p-5 rounded-2xl border-2 flex items-center space-x-4 transition-all duration-300 text-left ";

                                                if (submitted) {
                                                    if (correct && checked) style += "bg-emerald-50 border-emerald-500 text-emerald-900";
                                                    else if (correct && !checked) style += "bg-amber-50 border-amber-400 text-amber-800";
                                                    else if (!correct && checked) style += "bg-rose-50 border-rose-300 text-rose-900";
                                                    else style += "bg-slate-50/50 border-slate-100 text-slate-400";
                                                } else {
                                                    style += checked
                                                        ? "bg-blue-50 border-blue-500 text-blue-900"
                                                        : "bg-white border-slate-100 text-slate-700 hover:border-blue-300 hover:bg-blue-50/30 cursor-pointer";
                                                }

                                                return (
                                                    <button key={i} onClick={() => toggleMultiOption(i)} className={style} disabled={submitted}>
                                                        <span className={`w-6 h-6 rounded-md border-2 flex items-center justify-center text-xs font-black flex-shrink-0 transition-all ${submitted
                                                            ? (correct ? 'bg-emerald-600 border-emerald-600 text-white' : checked ? 'bg-rose-600 border-rose-600 text-white' : 'border-slate-200')
                                                            : checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                                                            }`}>
                                                            {(checked || (submitted && correct)) && <Check size={12} />}
                                                        </span>
                                                        <span className="flex-1 font-bold text-sm leading-snug">{opt}</span>
                                                        {submitted && correct && <CheckCircle2 size={20} className="text-emerald-500 flex-shrink-0" />}
                                                    </button>
                                                );
                                            }

                                            // â”€â”€â”€ SINGLE-SELECT (MCQ, Fill Blank, True/False) â”€â”€â”€
                                            const isSelected = i === selectedIdx;
                                            let styleClass = "w-full p-6 rounded-2xl border-2 flex items-center space-x-5 transition-all duration-300 text-left relative overflow-hidden ";

                                            if (selectedIdx !== null) {
                                                if (correct) styleClass += "bg-emerald-50 border-emerald-500 text-emerald-900";
                                                else if (isSelected) styleClass += "bg-rose-50 border-rose-200 text-rose-900";
                                                else styleClass += "bg-slate-50/50 border-slate-100 text-slate-500";
                                            } else {
                                                styleClass += "bg-white border-slate-100 text-slate-700 hover:border-blue-500 hover:bg-blue-50/30 hover:shadow-lg hover:shadow-blue-50 group cursor-pointer";
                                            }

                                            let labelBg = "bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent";
                                            if (selectedIdx !== null) {
                                                if (correct) labelBg = "bg-emerald-600 text-white border-transparent";
                                                else if (isSelected) labelBg = "bg-rose-600 text-white border-transparent";
                                                else labelBg = "bg-slate-200 text-slate-500 border-transparent";
                                            }

                                            // True/False gets special wide buttons
                                            if (qType === 'true_false') {
                                                return (
                                                    <button key={i} onClick={() => handleSingleAnswer(i)} className={styleClass} disabled={selectedIdx !== null}>
                                                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black transition-all border-2 ${labelBg}`}>
                                                            {opt === 'True' ? <Check size={16} /> : <X size={16} />}
                                                        </span>
                                                        <span className="flex-1 font-black text-lg">{opt}</span>
                                                        {selectedIdx !== null && correct && <CheckCircle2 size={24} className="text-emerald-500" />}
                                                    </button>
                                                );
                                            }

                                            return (
                                                <button key={i} onClick={() => handleSingleAnswer(i)} className={styleClass} disabled={selectedIdx !== null}>
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black transition-all border-2 ${labelBg}`}>
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    <span className="flex-1 font-bold text-base leading-snug">{opt}</span>
                                                    {selectedIdx !== null && correct && <CheckCircle2 size={24} className="text-emerald-500 relative z-10" />}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* Submit button for multi-select */}
                                    {qType === 'multi_select' && !submitted && (
                                        <button
                                            onClick={handleMultiSubmit}
                                            disabled={multiSelected.size === 0}
                                            className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-emerald-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-emerald-100"
                                        >
                                            Submit Answers ({multiSelected.size} selected)
                                        </button>
                                    )}
                                </div>

                                {/* Explanation */}
                                <AnimatePresence>
                                    {showExplanation && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="pt-10 border-t border-slate-100"
                                        >
                                            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 space-y-6">
                                                <div className="flex items-center space-x-3 text-slate-400">
                                                    <Sparkles size={16} />
                                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Explanation</h4>
                                                </div>
                                                <p className="text-slate-600 text-base font-medium leading-relaxed italic">
                                                    &ldquo;{currentQuestion.explanation}&rdquo;
                                                </p>

                                                <button
                                                    onClick={nextQuestion}
                                                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.4em] hover:bg-black transition-all flex items-center justify-center space-x-3 shadow-2xl shadow-slate-200 group"
                                                >
                                                    <span>{idx < questions.length - 1 ? "Next Question" : "View Results"}</span>
                                                    <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="p-16 md:p-24 text-center space-y-12">
                            <div className="w-24 h-24 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto border border-blue-100 text-blue-600 shadow-2xl shadow-blue-50/50">
                                <Target size={48} />
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.8em]">Assessment Complete</h3>
                                <div className="text-6xl md:text-7xl font-black tracking-tighter text-slate-900 leading-none">
                                    {Math.round((score / questions.length) * 100)}<span className="text-2xl text-slate-200">%</span>
                                </div>
                                <p className="text-slate-400 font-bold text-base">Score: <span className="text-slate-900">{score} / {questions.length}</span></p>
                            </div>
                            <button
                                onClick={onClose}
                                className="px-16 py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.5em] rounded-2xl hover:bg-black transition-all shadow-2xl shadow-slate-200"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}



function FlashcardModal({ note, onClose }: { note: any, onClose: () => void }) {
    const cards = note.flashcards || [];
    const [idx, setIdx] = useState(0);
    const [flipped, setFlipped] = useState(false);

    const next = () => { if (idx < cards.length - 1) { setIdx(i => i + 1); setFlipped(false); } };
    const prev = () => { if (idx > 0) { setIdx(i => i - 1); setFlipped(false); } };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-50/98 backdrop-blur-2xl p-6 overflow-hidden font-outfit">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-[10%] right-[20%] w-[400px] h-[400px] bg-indigo-50/30 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-2xl relative">
                <div className="flex justify-between items-center mb-16 px-4">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-600">
                            <BookOpen size={20} />
                        </div>
                        <div className="text-left">
                            <h2 className="text-base font-black text-slate-900 leading-none mb-1">Study Deck</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">Card {idx + 1} of {cards.length}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white hover:bg-slate-50 border border-slate-100 text-slate-400 hover:text-red-500 transition-all shadow-sm group"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform" />
                    </button>
                </div>

                <div className="relative">
                    <div
                        onClick={() => setFlipped(!flipped)}
                        className="h-[460px] w-full cursor-pointer group"
                    >
                        <motion.div
                            animate={{ rotateY: flipped ? 180 : 0 }}
                            className="w-full h-full relative preserve-3d"
                            transition={{ duration: 0.6, type: "spring", stiffness: 120, damping: 20 }}
                        >
                            <div className="absolute inset-0 backface-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center p-16 text-center ring-1 ring-slate-900/5 hover:border-blue-200 transition-colors">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-300 mb-8">Question</span>
                                <h3 className="text-xl md:text-2xl font-bold text-slate-900 leading-[1.3] tracking-tight">{cards[idx]?.front}</h3>
                                <div className="absolute bottom-12 flex flex-col items-center space-y-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 animate-bounce">
                                        <Sparkles size={14} />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Tap to flip card</span>
                                </div>
                            </div>

                            <div className="absolute inset-0 backface-hidden rounded-[2.5rem] bg-white border border-blue-50 shadow-[0_32px_64px_-16px_rgba(59,130,246,0.12)] flex flex-col items-center justify-center p-16 text-center rotate-y-180 ring-2 ring-blue-50">
                                <span className="absolute top-12 text-[9px] font-black uppercase tracking-[0.4em] text-blue-400">Answer</span>
                                <h3 className="text-lg md:text-xl font-medium text-slate-800 leading-relaxed tracking-tight max-w-[90%]">{cards[idx]?.back}</h3>
                                <div className="absolute bottom-12 flex items-center space-x-2">
                                    <div className="h-1 w-6 bg-blue-500 rounded-full" />
                                    <div className="h-1 w-1 bg-blue-200 rounded-full" />
                                    <div className="h-1 w-1 bg-blue-200 rounded-full" />
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); prev(); }}
                        disabled={idx === 0}
                        className="absolute left-[-80px] top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-300 hover:text-blue-600 disabled:opacity-0 transition-all border border-slate-100 hidden lg:flex"
                    >
                        <ChevronLeft size={32} />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); next(); }}
                        disabled={idx === cards.length - 1}
                        className="absolute right-[-80px] top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-300 hover:text-blue-600 disabled:opacity-0 transition-all border border-slate-100 hidden lg:flex"
                    >
                        <ChevronRight size={32} />
                    </button>
                </div>

                <div className="mt-16 flex flex-col items-center space-y-10">
                    <div className="flex space-x-2.5 items-center">
                        {cards.map((_: any, i: number) => (
                            <div
                                key={i}
                                className={`transition-all duration-500 rounded-full ${i === idx ? 'w-10 h-1.5 bg-blue-600 shadow-sm' : 'w-1.5 h-1.5 bg-slate-200'}`}
                            />
                        ))}
                    </div>

                    <div className="flex items-center bg-white p-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40">
                        <button
                            onClick={prev}
                            disabled={idx === 0}
                            className="px-10 py-4 rounded-[1.5rem] hover:bg-slate-50 disabled:opacity-20 text-slate-900 font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            Prev
                        </button>
                        <div className="h-8 w-px bg-slate-100 mx-1" />
                        <div className="px-6 text-xs font-black text-slate-400 font-mono tabular-nums">
                            {idx + 1} / {cards.length}
                        </div>
                        <div className="h-8 w-px bg-slate-100 mx-1" />
                        <button
                            onClick={next}
                            disabled={idx === cards.length - 1}
                            className="px-10 py-4 bg-slate-900 text-white rounded-[1.5rem] hover:bg-blue-600 disabled:opacity-30 font-black text-[10px] uppercase tracking-widest transition-all shadow-lg hover:shadow-blue-200"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


function ChangePasswordModal({ onClose, onSubmit, error, success }: { onClose: () => void, onSubmit: (data: any) => void, error: string | null, success: string | null }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError(null);

        if (newPassword !== confirmPassword) {
            setLocalError("Passwords do not match.");
            return;
        }

        if (newPassword.length < 8) {
            setLocalError("Password must be at least 8 characters.");
            return;
        }

        onSubmit({ currentPassword, newPassword });
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100"
            >
                <div className="p-10 relative">
                    <button onClick={onClose} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-xl transition-colors text-slate-300 hover:text-red-500 z-10">
                        <X size={20} />
                    </button>

                    <div className="text-center mb-10">
                        <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200/50">
                            <Lock size={28} />
                        </div>
                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Change Password</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Current Password</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                                placeholder="Enter current password"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                                placeholder="Min. 8 characters"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none"
                                placeholder="Repeat new password"
                                required
                            />
                        </div>

                        {(error || localError) && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-red-50 border border-red-100 text-[11px] text-red-600 font-bold rounded-xl flex items-center space-x-2"
                            >
                                <X size={14} className="flex-shrink-0" />
                                <span>{error || localError}</span>
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-emerald-50 border border-emerald-100 text-[11px] text-emerald-600 font-bold rounded-xl flex items-center space-x-2"
                            >
                                <Check size={14} className="flex-shrink-0" />
                                <span>{success}</span>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-5 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-xl hover:shadow-blue-200 active:scale-[0.98]"
                        >
                            Change Password
                        </button>
                    </form>
                </div>
            </motion.div>
        </div>
    );
}
