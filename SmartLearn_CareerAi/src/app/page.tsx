"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { BrainCircuit, ArrowRight, CheckCircle2, Globe, FileText, Target, BookOpen, Layers, Database, Cpu, Lock, UserCircle } from "lucide-react";

export default function LandingPage() {
  const techStack = [
    "Next.js 15", "TypeScript", "BART Transformers", "Tailwind CSS", "PostgreSQL", "PDF-Parse"];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-outfit selection:bg-blue-100">
      {/* Professional Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200 h-20">
        <div className="w-full px-8 md:px-12 h-full flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-200 group-hover:scale-105 transition-transform">
              <BrainCircuit className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-black tracking-tighter text-slate-900">SmartLearn AI</span>
          </Link>

          <div className="flex items-center space-x-8">
            <Link href="/login" className="text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors">Sign In</Link>
            <Link
              href="/signup"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 hover:scale-105 active:scale-95"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50/50 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-10"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.5)]" />
            <span>Insight Innovators presents</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]"
          >
            SmartLearn & Research AI: <br />
            <span className="text-blue-600 italic">Intelligent Study and Academic Assistant.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            A professional research and academic optimization platform. <br />
            Transform your study materials into intelligent knowledge assets
            using local neural processing and semantic analysis.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Link
              href="/signup"
              className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-xl font-outfit font-black hover:bg-slate-800 transition-all flex items-center justify-center space-x-3 shadow-2xl active:scale-95"
            >
              <span className="uppercase tracking-widest text-xs">Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

          </motion.div>
        </div>

        {/* Main USP Grid */}
        <div className="max-w-7xl mx-auto mt-32 px-6 grid md:grid-cols-3 gap-8 pb-32">
          <USPItem
            icon={<FileText className="w-6 h-6 text-blue-600" />}
            title="Smart Summarizer"
            description="High-speed semantic extraction of key concepts from PDFs using local BART Transformers."
            badge="Neural Engine"
          />
          <USPItem
            icon={<BookOpen className="w-6 h-6 text-blue-600" />}
            title="Interactive Quizzes"
            description="Auto-generated practice assessments to reinforce your knowledge and track learning progress."
            badge="Active"
          />
          <USPItem
            icon={<Layers className="w-6 h-6 text-blue-600" />}
            title="AI Flashcards"
            description="Dynamic flashcard generation from your study materials for efficient revision and memory."
            badge="Optimized"
          />
          <USPItem
            icon={<BrainCircuit className="w-6 h-6 text-blue-600" />}
            title="Career Intelligence"
            description="Deep semantic analysis matching your skills to job descriptions perfectly."
            badge="Careers"
          />
          <USPItem
            icon={<Target className="w-6 h-6 text-blue-600" />}
            title="Learning Pathways"
            description="Customized roadmaps that adapt dynamically to your personal study goals."
            badge="Adaptive"
          />
          <USPItem
            icon={<Globe className="w-6 h-6 text-blue-600" />}
            title="Global Resources"
            description="Seamlessly connect to an extensive pool of curated open-access academic literature."
            badge="Network"
          />
        </div>
      </main>

      {/* Main Footer Section */}
      <footer className="bg-white border-t border-slate-100">
        <div className="py-20 overflow-hidden border-b border-slate-50 relative">
          {/* Fade overlays for the marquee edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

          <div className="mb-10 text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">Core Technology Infrastructure</div>
          <div className="relative">
            <div className="flex animate-marquee whitespace-nowrap gap-16 items-center">
              {[...techStack, ...techStack].map((tech, idx) => (
                <div key={idx} className="flex items-center space-x-6 cursor-default">
                  <div className="w-1.5 h-1.5 bg-blue-500/30 rounded-full" />
                  <span className="text-xl font-bold text-slate-900/60 tracking-tight transition-colors hover:text-blue-600">{tech}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="py-20 px-8 md:px-12">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center gap-8">


            <div className="h-px w-20 bg-slate-100" />

            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              © 2026 Academic Workspace Solutions • Secure Identity Protocol V1.0
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function USPItem({ icon, title, description, badge }: { icon: any, title: string, description: string, badge: string }) {
  return (
    <div className="bg-white p-10 rounded-3xl border border-slate-200 transition-all relative overflow-hidden shadow-sm">
      <div className="absolute top-0 right-0 p-4">
        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">{badge}</span>
      </div>
      <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 border border-blue-100 text-blue-600 shadow-sm">
        {icon}
      </div>
      <h3 className="text-2xl font-black mb-4 tracking-tight text-slate-900">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  );
}
