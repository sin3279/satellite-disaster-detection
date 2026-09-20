import React, { useState } from "react";
import { User, UserRole } from "../types";
import { useTheme, THEMES } from "../context/ThemeContext";
import {
  Satellite,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  Key,
  Volume2,
  VolumeX,
  Palette,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Radio,
  Globe
} from "lucide-react";
import { playAuthSuccess, playTelemetryPing } from "../utils/audioEffects";

interface LoginPageProps {
  onLoginSuccess: (user: User) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const { theme, setTheme, soundEnabled, setSoundEnabled } = useTheme();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("commander");
  const [agency, setAgency] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    playTelemetryPing(880);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      playAuthSuccess();
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    playTelemetryPing(880);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          agency: agency || "Disaster Relief Organization"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      playAuthSuccess();
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRoleSelect = (demoEmail: string, demoPass: string) => {
    playTelemetryPing(1200);
    setLoading(true);
    setError(null);

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: demoEmail, password: demoPass })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          playAuthSuccess();
          onLoginSuccess(data.user);
        } else {
          setError(data.error || "Instant authentication failed");
          setLoading(false);
        }
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleGuestQuickAccess = () => {
    playAuthSuccess();
    onLoginSuccess({
      id: "usr-guest",
      name: "Commander Guest",
      email: "guest@satellite-command.gov",
      role: "admin",
      agency: "Orbital Earth Observation Command",
      status: "active",
      lastActive: "Just now",
      clearanceLevel: "Level 3 - Top Secret"
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* Background Orbital Visuals */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="w-full h-full border border-cyan-500/20 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] grid grid-cols-8 grid-rows-6" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse [animation-delay:2s]" />
      </div>

      {/* Top Bar: Telemetry Status, Theme Selector & Sound Toggle */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight block text-slate-100">
              Aegis Orbital Command
            </span>
            <span className="text-[10px] font-mono text-cyan-400">
              TELEMETRY: DEFCON 3 • GROUND STATION READY
            </span>
          </div>
        </div>

        {/* Global Controls: Themes & Audio */}
        <div className="flex items-center gap-2">
          {/* Theme Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as any)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-slate-200">
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sound Mute Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            title={soundEnabled ? "Mute Telemetry SFX" : "Enable Telemetry SFX"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </header>

      {/* Main Logon Card & Quick Role Access Section */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row items-center justify-center gap-8">
        {/* Left Side: System Telemetry & Brand Highlights */}
        <div className="lg:w-1/2 space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>GLOBAL DISASTER DETECTION SYSTEM v2.0</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Orbital Earth Observation & Real-Time Crisis Response
          </h1>

          <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Multi-spectral satellite surveillance pipeline powered by Gemini AI, Sentinel-2, Landsat-9, and synthetic aperture radar for immediate disaster assessment and emergency relief dispatch.
          </p>

          {/* 1-Click Fast Role Access */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Instant 1-Click Role Access (No Typing Required)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickRoleSelect("admin@satellite.gov", "admin123")}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all group shadow-md"
              >
                <div className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200 flex items-center justify-between">
                  <span>👑 System Admin</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">All 8 modules & retasking</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("commander@fema.gov", "commander123")}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-rose-500/40 hover:border-rose-400 text-left transition-all group shadow-md"
              >
                <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200 flex items-center justify-between">
                  <span>🚨 Disaster Commander</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Incident command & dispatch</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("analyst@esa.int", "analyst123")}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-blue-500/40 hover:border-blue-400 text-left transition-all group shadow-md"
              >
                <div className="text-xs font-bold text-blue-300 group-hover:text-blue-200 flex items-center justify-between">
                  <span>🛰️ Remote Sensing Analyst</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Spectral band AI detection</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickRoleSelect("responder@redcross.org", "responder123")}
                className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all group shadow-md"
              >
                <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200 flex items-center justify-between">
                  <span>🚑 USAR First Responder</span>
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Search & evacuation units</div>
              </button>
            </div>
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleGuestQuickAccess}
              className="text-xs text-slate-400 hover:text-cyan-300 underline underline-offset-4 transition-colors"
            >
              Or enter immediately as Quick Operator Guest →
            </button>
          </div>
        </div>

        {/* Right Side: Authentication Card */}
        <div className="lg:w-1/2 w-full max-w-md">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl relative">
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  {isRegistering ? "Register Agency Clearance" : "Operator Authentication"}
                </h2>
                <p className="text-xs text-slate-400">
                  {isRegistering ? "Create your response profile" : "Enter credentials for encrypted session"}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={isRegistering ? handleRegister : handleManualLogin} className="space-y-3.5">
              {isRegistering && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Full Name & Title
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Commander Jane Doe"
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Agency Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@satellite.gov"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Passcode
                </label>
                <div className="relative">
                  <Key className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                    >
                      <option value="admin">System Admin</option>
                      <option value="commander">Disaster Commander</option>
                      <option value="analyst">Remote Analyst</option>
                      <option value="responder">First Responder</option>
                      <option value="viewer">Public Citizen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                      Agency Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. NOAA"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2 text-xs text-slate-100"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{isRegistering ? "Create Clearance Profile" : "Access Command Dashboard"}</span>
                )}
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                {isRegistering
                  ? "Already have an agency profile? Sign In"
                  : "Need to request new agency clearance? Register here"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer info */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-900">
        <span>Satellite Disaster Detection System • Deployment-Ready Node.js + Vite</span>
        <span className="font-mono text-[11px] text-slate-600">ESA • NASA • USGS • Planet Telemetry Ground Stations</span>
      </footer>
    </div>
  );
};
