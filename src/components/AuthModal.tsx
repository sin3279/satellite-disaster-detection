import React, { useState } from "react";
import { User, UserRole } from "../types";
import { Shield, Lock, Mail, User as UserIcon, Building, CheckCircle2, AlertCircle, Key, Satellite } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  onLogout
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("analyst");
  const [agency, setAgency] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to log in");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, agency: agency || "Disaster Emergency Team" })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo Logins
  const quickDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsRegistering(false);
    setError(null);

    // Trigger login directly
    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: demoEmail, password: demoPass })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          onLoginSuccess(data.user);
          onClose();
        } else {
          setError(data.error || "Demo login failed");
        }
      })
      .catch((err) => setError(err.message));
  };

  return (
    <div id="auth-modal-backdrop" className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="auth-dialog-card"
        className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Orbital Command Authentication</span>
            </h2>
            <p className="text-xs text-slate-400">
              {currentUser
                ? `Logged in as ${currentUser.name}`
                : isRegistering
                ? "Request secure agency access clearance"
                : "Enter credentials or select a pre-configured role"}
            </p>
          </div>
        </div>

        {/* If user is already logged in, show current profile & option to logout */}
        {currentUser ? (
          <div className="space-y-4 py-2">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 uppercase font-semibold">Active Session</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 uppercase font-bold">
                  {currentUser.role}
                </span>
              </div>
              <div className="text-sm font-bold text-slate-100">{currentUser.name}</div>
              <div className="text-xs text-slate-400">{currentUser.email}</div>
              <div className="text-xs text-slate-400 pt-1 border-t border-slate-800">
                Agency: <span className="text-slate-300">{currentUser.agency}</span>
              </div>
              <div className="text-[11px] font-mono text-emerald-400">
                Clearance: {currentUser.clearanceLevel}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                }}
                className="flex-1 py-2 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-semibold transition-colors"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 px-4 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 transition-colors"
              >
                Continue to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Quick 1-Click Demo Profiles */}
            <div className="mb-5">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Instant Role Profiles</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickDemoLogin("admin@satellite.gov", "admin123")}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">👑 System Admin</div>
                  <div className="text-[10px] text-slate-400">Full control & sensors</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin("commander@fema.gov", "commander123")}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-rose-500/40 hover:border-rose-400 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-rose-300 group-hover:text-rose-200">🚨 Commander</div>
                  <div className="text-[10px] text-slate-400">Dispatch & Evacuation</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin("analyst@esa.int", "analyst123")}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-blue-500/40 hover:border-blue-400 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-blue-300 group-hover:text-blue-200">🛰️ Earth Analyst</div>
                  <div className="text-[10px] text-slate-400">Spectral AI Imagery</div>
                </button>

                <button
                  type="button"
                  onClick={() => quickDemoLogin("responder@redcross.org", "responder123")}
                  className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 text-left transition-all group"
                >
                  <div className="text-xs font-bold text-emerald-300 group-hover:text-emerald-200">🚑 First Responder</div>
                  <div className="text-[10px] text-slate-400">Field USAR units</div>
                </button>
              </div>
            </div>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-mono">
                <span className="bg-slate-900 px-2 text-slate-500">or manual authentication</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-3">
              {isRegistering && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Col. Alexander Stone"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@disaster-response.gov"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Assigned Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="admin">System Admin</option>
                      <option value="commander">Disaster Commander</option>
                      <option value="analyst">Remote Analyst</option>
                      <option value="responder">First Responder</option>
                      <option value="viewer">Public Citizen</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                      Agency / Org
                    </label>
                    <input
                      type="text"
                      value={agency}
                      onChange={(e) => setAgency(e.target.value)}
                      placeholder="e.g. UN OCHA"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 mt-4 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>{isRegistering ? "Register Account" : "Access Command Portal"}</span>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                className="text-xs text-cyan-400 hover:underline"
              >
                {isRegistering
                  ? "Already have access credentials? Sign In"
                  : "Need to create a new clearance profile? Register"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
