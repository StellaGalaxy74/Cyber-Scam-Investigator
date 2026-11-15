import { ArrowRight, CheckCircle2, Globe, Image, MessageSquare, Phone, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { AppRoute } from '../types/navigation.ts';

interface LandingPageProps {
  onNavigate: (route: AppRoute) => void;
}

export function LandingPage({ onNavigate }: LandingPageProps) {
  const { firebaseUser } = useAuth();

  return (
    <div className="min-h-screen bg-[#060A13] text-slate-100">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#060A13]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-8">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="font-display text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0"
          >
            Smart Cyber Scam Investigator
          </a>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300" aria-label="Primary">
            <a href="#capabilities" className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0">
              Capabilities
            </a>
            <button
              type="button"
              onClick={() => onNavigate('education')}
              className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
            >
              Safety Center
            </button>
            <button
              type="button"
              onClick={() => onNavigate('india-help')}
              className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
            >
              India 1930 Help
            </button>
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
            >
              Command Center
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate(firebaseUser ? 'dashboard' : 'auth')}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 rounded-lg hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0"
            >
              {firebaseUser ? 'Open Dashboard' : 'Start Investigation'}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero Split Section */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-medium text-cyan-400 tracking-wide">
                Personal Digital Forensics · Explainable AI · Zero Credential Storage
              </p>

              <h1
                className="font-display font-bold tracking-tight text-slate-50 leading-[1.1]"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                Investigate suspicious messages, links, and payment requests before acting.
              </h1>

              <p className="text-base text-slate-300 leading-relaxed max-w-xl">
                Smart Cyber Scam Investigator combines AI behavioral analysis, safe URL and TLS inspection, DNS email verification, and multimodal screenshot OCR to expose phishing, UPI fraud, and impersonation scams with evidence-based reports.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('message')}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Analyze a Suspicious Message</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('india-help')}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-[#0B1120] px-5 py-3 text-sm font-medium text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
                >
                  <ShieldAlert className="h-4 w-4 text-red-400" />
                  <span>India 1930 Emergency Guide</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[280px] rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden">
                <img
                  src="/src/assets/images/hero_command_center_1794731347347.jpg"
                  alt="Cybercrime forensic command center monitoring threat topology"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060A13]/90 via-[#060A13]/25 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-4 text-xs text-slate-200">
                  <span>Multi-layered verification without executing untrusted links</span>
                  <span className="font-mono text-cyan-300 tabular-nums shrink-0">0–100 Risk Scoring</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Column Capability Strip below hero */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-800/80 pt-8">
            <button
              type="button"
              onClick={() => onNavigate('message')}
              className="text-left rounded-xl border border-slate-800 bg-[#0B1120] p-5 hover:border-cyan-500/40 transition-colors space-y-2"
            >
              <MessageSquare className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">Message Scam Analyzer</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Detect urgency traps, fake job offers, and UPI phishing in SMS, WhatsApp, and emails.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('url')}
              className="text-left rounded-xl border border-slate-800 bg-[#0B1120] p-5 hover:border-cyan-500/40 transition-colors space-y-2"
            >
              <Globe className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">Safe URL & TLS Scanner</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Inspect typosquatting, punycode spoofing, DNS records, and HTTPS certificates safely.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('contact')}
              className="text-left rounded-xl border border-slate-800 bg-[#0B1120] p-5 hover:border-cyan-500/40 transition-colors space-y-2"
            >
              <Phone className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">Phone & Email Forensics</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verify country codes, E.164 format, email MX servers, and SPF/DMARC anti-spoofing records.
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('screenshot')}
              className="text-left rounded-xl border border-slate-800 bg-[#0B1120] p-5 hover:border-cyan-500/40 transition-colors space-y-2"
            >
              <Image className="h-5 w-5 text-cyan-400" />
              <h2 className="text-sm font-semibold text-slate-100">Screenshot & PDF OCR</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Extract text from suspicious chat screenshots or payment receipts for instant forensics.
              </p>
            </button>
          </div>
        </section>

        {/* Bento Capabilities & Evidence Standards */}
        <section id="capabilities" className="max-w-7xl mx-auto px-6 py-16 border-t border-slate-800/80">
          <div className="max-w-2xl space-y-3 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Evidence-first investigation, never guesswork.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every report explicitly separates verified technical facts from suspicious indicators and probabilistic AI predictions, exported cleanly to PDF.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden flex flex-col">
              <div className="h-64 relative overflow-hidden border-b border-slate-800">
                <img
                  src="/src/assets/images/forensics_evidence_analysis_1794731347451.jpg"
                  alt="Digital forensics analyst reviewing suspicious network and message headers"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    01. Explainable 12-Point Investigation Reports
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Every analysis assigns a 0–100 risk score, threat classification (LOW, MEDIUM, HIGH, CRITICAL), psychological manipulation breakdown, financial warning signs, and downloadable PDF documentation for bank disputes or cybercrime filing.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    SSRF-protected URL checks
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Automatic OTP/Card redaction
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    PDF Evidence Export
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0B1120] overflow-hidden flex flex-col">
              <div className="h-64 relative overflow-hidden border-b border-slate-800">
                <img
                  src="/src/assets/images/india_cyber_shield_1794731347639.jpg"
                  alt="Digital payment security shield protecting financial transfers"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-transparent to-transparent" />
              </div>
              <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-100">
                    02. India Cybercrime & UPI Rapid Response
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    Built-in guidance for India’s 1930 helpline, National Cyber Crime Reporting Portal (cybercrime.gov.in), RBI fraud safeguards, and digital evidence preservation checklists.
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate('assistant')}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-medium text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    <span>Ask AI Assistant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('india-help')}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 whitespace-nowrap"
                  >
                    <span>View 1930 Guide</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            Smart Cyber Scam Investigator · AI assessments are advisory and never replace official law enforcement or banking verification.
          </p>
          <div className="flex items-center gap-6 shrink-0">
            <button type="button" onClick={() => onNavigate('education')} className="hover:text-slate-200">
              Safety Education
            </button>
            <button type="button" onClick={() => onNavigate('india-help')} className="hover:text-slate-200">
              India 1930 Help
            </button>
            <button type="button" onClick={() => onNavigate('auth')} className="hover:text-slate-200">
              Sign In
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
