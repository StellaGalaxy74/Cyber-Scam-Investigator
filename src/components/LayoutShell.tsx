import React, { useState } from 'react';
import {
  BookOpen,
  FileSearch,
  Globe,
  History,
  Image,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  MessageSquare,
  Phone,
  Settings,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import type { AppRoute } from '../types/navigation.ts';

interface LayoutShellProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  pageTitle: string;
  children: React.ReactNode;
}

const NAV_GROUPS: Array<{
  heading: string;
  items: Array<{ route: AppRoute; label: string; icon: typeof LayoutDashboard }>;
}> = [
  {
    heading: 'Command Center',
    items: [
      { route: 'dashboard', label: 'Investigation Dashboard', icon: LayoutDashboard },
      { route: 'assistant', label: 'AI Investigation Assistant', icon: Sparkles },
      { route: 'history', label: 'Investigation History', icon: History },
    ],
  },
  {
    heading: 'Forensic Scanners',
    items: [
      { route: 'message', label: 'Message Scam Analyzer', icon: MessageSquare },
      { route: 'url', label: 'URL & Domain Scanner', icon: Globe },
      { route: 'contact', label: 'Email & Phone Investigator', icon: Phone },
      { route: 'screenshot', label: 'Screenshot & OCR Analyzer', icon: Image },
    ],
  },
  {
    heading: 'Safety & Support',
    items: [
      { route: 'education', label: 'Cyber Safety Education', icon: BookOpen },
      { route: 'india-help', label: 'India 1930 Reporting Guide', icon: ShieldAlert },
      { route: 'settings', label: 'Profile & Settings', icon: Settings },
    ],
  },
];

export function LayoutShell({
  currentRoute,
  onNavigate,
  pageTitle,
  children,
}: LayoutShellProps) {
  const { firebaseUser, profile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (route: AppRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-[#080D1A] border-r border-slate-800/80">
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => handleNav('landing')}
          className="text-left focus-visible:outline-2 focus-visible:outline-cyan-400 rounded"
        >
          <span className="block font-display text-sm font-bold tracking-tight text-slate-100 whitespace-nowrap">
            Smart Cyber Scam Investigator
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-100"
          aria-label="Close navigation menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6" aria-label="Workspace Navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.heading} className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-500 tracking-wide">
              {group.heading}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = currentRoute === item.route;
                return (
                  <button
                    key={item.route}
                    type="button"
                    onClick={() => handleNav(item.route)}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors whitespace-nowrap text-left ${
                      active
                        ? 'bg-cyan-500/12 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-800/60 hover:text-slate-100 border border-transparent'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-800/80 p-4 space-y-3">
        <div className="rounded-lg border border-red-900/40 bg-red-950/20 px-3 py-2.5">
          <p className="text-[11px] font-semibold text-red-300">India Cyber Emergency</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Helpline <span className="font-mono text-slate-200 font-semibold">1930</span> · cybercrime.gov.in
          </p>
        </div>

        {firebaseUser ? (
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {profile?.displayName || firebaseUser.displayName || 'Investigator'}
              </p>
              <p className="text-[11px] text-slate-500 truncate">{firebaseUser.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              title="Sign out"
              aria-label="Sign out"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleNav('auth')}
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors whitespace-nowrap"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#060A13] text-slate-100 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">{sidebarContent}</div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 h-14 border-b border-slate-800/80 bg-[#060A13]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-300 hover:bg-slate-800"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="hover:text-slate-200 transition-colors whitespace-nowrap shrink-0 hidden sm:inline"
              >
                Workspace
              </button>
              <span aria-hidden="true" className="hidden sm:inline">/</span>
              <h1 className="text-sm font-semibold text-slate-100 truncate">{pageTitle}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('message')}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-cyan-500/50 hover:text-cyan-300 transition-colors whitespace-nowrap shrink-0"
            >
              <FileSearch className="h-3.5 w-3.5" />
              <span>New Scan</span>
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
