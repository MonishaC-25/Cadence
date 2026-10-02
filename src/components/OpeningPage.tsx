import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  Shield,
  CheckCircle2,
  Lock,
  Layers,
  Zap,
  Globe,
  Users,
} from 'lucide-react';
import { TeamMember } from '../types';

interface OpeningPageProps {
  team: TeamMember[];
  onSignIn: (user: TeamMember) => void;
}

export const OpeningPage: React.FC<OpeningPageProps> = ({
  team,
  onSignIn,
}) => {
  const [selectedUser, setSelectedUser] = useState<TeamMember>(team[0]);
  const [authMethod, setAuthMethod] = useState<'google' | 'sso' | 'direct'>('google');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleStartAuth = (method: 'google' | 'sso' | 'direct') => {
    setAuthMethod(method);
    setIsAuthenticating(true);

    setTimeout(() => {
      setIsAuthenticating(false);
      onSignIn(selectedUser);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500/20 selection:text-emerald-300 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Top Header */}
      <header className="px-6 py-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
            <span className="font-mono font-bold text-base tracking-tighter">Cd</span>
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-sans">Cadence</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Enterprise Workspace Portal</span>
        </div>
      </header>

      {/* Main Hero & Auth Card */}
      <main className="max-w-7xl mx-auto px-6 py-8 sm:py-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Product Value Narrative */}
        <div className="lg:col-span-7 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Autonomous Meeting Intelligence &amp; Task Engine</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Turn discussions into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              relentless execution.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
            Cadence analyzes your hybrid and online meetings, extracts key decisions, assigns deliverables with instant employee email dispatch, and calculates payroll ROI impact.
          </p>

          {/* Value Props Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <Zap className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">4-Tier AI Redundancy</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Ultra-resilient Gemini cascades prevent rate limits and downtime.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Notification &amp; Email Relay</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Assigned employees are notified in-app with direct email copy.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <Layers className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Payroll &amp; Decision ROI</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Measure meeting costs per decision and audit department efficiency.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3">
              <Shield className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-white">Multi-Role Governance</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Confidential meeting tiers and strict administrator controls.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Sign In Container */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative space-y-6 text-left">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Enter Cadence Workspace</h2>
              <p className="text-xs text-slate-400">
                Sign in with your corporate account or choose an employee identity.
              </p>
            </div>

            {/* Google Sign In Button */}
            <div className="space-y-3">
              <button
                onClick={() => handleStartAuth('google')}
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-3 p-3 bg-white hover:bg-slate-100 text-slate-950 font-semibold text-xs rounded-xl shadow transition-all active:scale-[0.98]"
              >
                {/* Google Icon SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>
                  {isAuthenticating && authMethod === 'google'
                    ? 'Authenticating with Google...'
                    : 'Sign in with Google Workspace'}
                </span>
              </button>

              <button
                onClick={() => handleStartAuth('sso')}
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-2 p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {isAuthenticating && authMethod === 'sso'
                    ? 'Connecting to Okta / Azure SSO...'
                    : 'Single Sign-On (Okta / Azure AD)'}
                </span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-mono tracking-wider shrink-0">
                or demo as employee
              </span>
            </div>

            {/* Select Employee Persona */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Select Employee Profile</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  {selectedUser.isAdmin ? 'Admin Rights' : 'Staff Perspective'}
                </span>
              </label>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {team.map((member) => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedUser(member)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      selectedUser.id === member.id
                        ? 'bg-slate-800/90 border-emerald-500/50 shadow-sm'
                        : 'bg-slate-950/40 border-slate-800/60 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-white flex items-center gap-1.5 truncate">
                          <span>{member.name}</span>
                          {member.isAdmin && (
                            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/20">
                              ADMIN
                            </span>
                          )}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {member.roleTitle} · {member.email}
                        </p>
                      </div>
                    </div>

                    {selectedUser.id === member.id && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Direct Launch Button */}
            <button
              onClick={() => handleStartAuth('direct')}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
            >
              <span>Launch Cadence as {selectedUser.name.split(' ')[0]}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-slate-500 font-mono">
              <Shield className="w-3 h-3 text-slate-400" />
              <span>SOC2 Type II Certified · 256-Bit TLS In-Transit</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 border-t border-slate-900 relative z-10">
        <p>© 2026 Cadence Workspace Intelligence Inc. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <span>Google Workspace Integration</span>
          <span>·</span>
          <span>Slack &amp; Teams Connected</span>
          <span>·</span>
          <span>Automated Email Relay</span>
        </div>
      </footer>
    </div>
  );
};
