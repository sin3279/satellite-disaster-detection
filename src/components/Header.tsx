import React from "react";
import {
  Satellite,
  Radio,
  Sparkles,
  Database,
  Globe,
  Siren,
  Bot,
  BarChart3,
  Shield,
  User as UserIcon,
  Lock,
  MessageSquare
} from "lucide-react";
import { AppModule, User } from "../types";

interface HeaderProps {
  backendConnected: boolean;
  hasApiKey: boolean;
  onRefresh: () => void;
  activeTab: AppModule;
  setActiveTab: (tab: AppModule) => void;
  historyCount: number;
  currentUser: User | null;
  onOpenAuthModal: () => void;
  isFloatingChatOpen: boolean;
  onToggleFloatingChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendConnected,
  hasApiKey,
  onRefresh,
  activeTab,
  setActiveTab,
  historyCount,
  currentUser,
  onOpenAuthModal,
  isFloatingChatOpen,
  onToggleFloatingChat
}) => {
  const modulesList: { id: AppModule; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: "scanner", label: "Scanner", icon: <Radio className="w-3.5 h-3.5" /> },
    { id: "presets", label: "Missions", icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
    { id: "map", label: "Hazard Map", icon: <Globe className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: "incidents", label: "Dispatch", icon: <Siren className="w-3.5 h-3.5 text-rose-400" /> },
    { id: "database", label: "Database", icon: <Database className="w-3.5 h-3.5" />, badge: historyCount },
    { id: "copilot", label: "AI Copilot", icon: <Bot className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: "analytics", label: "Analytics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: "admin", label: "Admin Portal", icon: <Shield className="w-3.5 h-3.5 text-indigo-400" /> }
  ];

  return (
    <header id="app-header" className="bg-slate-900/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40">
      {/* Top Banner with Brand & User Clearance */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-800/60">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/30">
            <Satellite className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                Satellite Disaster Detection
              </h1>
              <span className="text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                8 Integrated Modules
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Orbital Earth Observation • AI Hazard Detection • Incident Command • Real-Time AI Copilot
            </p>
          </div>
        </div>

        {/* Right side controls: Backend status, AI Chatbot quick toggle, User Logon Profile */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Quick Floating Chatbot Launcher */}
          <button
            type="button"
            onClick={onToggleFloatingChat}
            className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFloatingChatOpen
                ? "bg-cyan-500 text-slate-950 border-cyan-400 shadow-md shadow-cyan-500/30"
                : "bg-slate-950 hover:bg-slate-800 border-cyan-500/40 text-cyan-300"
            }`}
            title="Open Real-time AI Disaster Copilot Chat"
          >
            <Bot className="w-4 h-4" />
            <span className="hidden sm:inline">AI Copilot</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>

          {/* Backend Status indicator */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] ${
              backendConnected
                ? "bg-emerald-950/40 text-emerald-400 border-emerald-800/50"
                : "bg-rose-950/40 text-rose-400 border-rose-800/50"
            }`}
            title={backendConnected ? "Express Backend Online" : "Backend Offline"}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? "bg-emerald-400 animate-pulse" : "bg-rose-400"
              }`}
            />
            <span className="font-mono">
              {backendConnected ? "ONLINE" : "OFFLINE"}
            </span>
          </div>

          {/* User Logon Profile Badge */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
          >
            <div className="w-5 h-5 rounded-full bg-cyan-900/60 border border-cyan-600 flex items-center justify-center text-cyan-300">
              {currentUser ? <UserIcon className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            </div>
            <div className="text-left">
              {currentUser ? (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-100 max-w-[100px] truncate">{currentUser.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 uppercase font-bold">
                    {currentUser.role}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-cyan-400">Sign In / Role Access</span>
              )}
            </div>
          </button>
        </div>
      </div>

      {/* Primary 8-Modules Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 overflow-x-auto no-scrollbar">
        <nav className="flex items-center gap-1 min-w-max">
          {modulesList.map((m, index) => {
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                id={`tab-${m.id}-btn`}
                onClick={() => setActiveTab(m.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent"
                }`}
              >
                <span className="text-[10px] font-mono text-slate-500 font-bold">M{index + 1}</span>
                {m.icon}
                <span>{m.label}</span>
                {m.badge !== undefined && typeof m.badge === "number" && m.badge > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
                    {m.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
