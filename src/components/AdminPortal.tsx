import React, { useState, useEffect } from "react";
import { User, UserRole, SensorStatus, SystemAuditLog } from "../types";
import {
  Shield,
  Server,
  Users,
  Activity,
  Satellite,
  Radio,
  Lock,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  HardDrive
} from "lucide-react";

interface AdminPortalProps {
  currentUser: User | null;
  onOpenAuthModal: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  currentUser,
  onOpenAuthModal
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [sensors, setSensors] = useState<SensorStatus[]>([]);
  const [auditLogs, setAuditLogs] = useState<SystemAuditLog[]>([]);
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [retaskingSensor, setRetaskingSensor] = useState<SensorStatus | null>(null);
  const [targetName, setTargetName] = useState("California Sierra Foothills");
  const [retaskSuccessMsg, setRetaskSuccessMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, systemRes] = await Promise.all([
        fetch("/api/auth/users"),
        fetch("/api/admin/system")
      ]);

      if (usersRes.ok) {
        const u = await usersRes.json();
        setUsers(u);
      }

      if (systemRes.ok) {
        const s = await systemRes.json();
        setSensors(s.sensors || []);
        setAuditLogs(s.auditLogs || []);
        setSystemHealth(s.systemHealth || null);
      }
    } catch (e) {
      console.error("Failed to load admin telemetry:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });

      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
      }
    } catch (e) {
      console.error("Update role failed:", e);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm("Revoke all agency access clearance for this user?")) {
      try {
        const res = await fetch(`/api/auth/users/${userId}`, {
          method: "DELETE"
        });
        if (res.ok) {
          setUsers((prev) => prev.filter((u) => u.id !== userId));
        }
      } catch (e) {
        console.error("Delete user failed:", e);
      }
    }
  };

  const handleRetaskSatellite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!retaskingSensor) return;

    try {
      const res = await fetch("/api/admin/retask-satellite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sensorId: retaskingSensor.id,
          targetName,
          targetCoordinates: { lat: 39.81, lng: -122.86 }
        })
      });

      const data = await res.json();
      if (res.ok) {
        setRetaskSuccessMsg(data.message);
        setRetaskingSensor(null);
        fetchAdminData();
        setTimeout(() => setRetaskSuccessMsg(null), 5000);
      }
    } catch (e) {
      console.error("Retask failed:", e);
    }
  };

  const isAdmin = currentUser?.role === "admin";

  return (
    <div id="admin-portal-module" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Admin Command Portal & System Overview Dashboard</span>
            <span className="text-xs font-mono text-cyan-400">
              (Module 8 • Operations Center)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Sensor constellation orbits, role-based user clearance, server health telemetry, and security audit logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="py-1.5 px-3 rounded-lg bg-cyan-950 border border-cyan-800 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign in as Admin for Full Control</span>
            </button>
          )}

          <button
            type="button"
            onClick={fetchAdminData}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {retaskSuccessMsg && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{retaskSuccessMsg}</span>
        </div>
      )}

      {/* Executive Overview Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Core Server Uptime</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {systemHealth?.serverUptime || "99.98%"}
          </div>
          <span className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Host: 0.0.0.0:3000 • Nominal
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">API Ingestion Latency</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-cyan-400">
            {systemHealth?.apiLatencyMs || 48} <span className="text-xs font-normal text-slate-400">ms</span>
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Full-stack Express + Vite</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Deployed Personnel</span>
            <Radio className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-400">
            {systemHealth?.activeDispatchedPersonnel || 187}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Across active incident sectors</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase">Authorized Operators</span>
            <Users className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-indigo-400">
            {users.length}
          </div>
          <span className="text-[10px] text-slate-500 mt-1 block">Level 1 - Level 3 Clearance</span>
        </div>
      </div>

      {/* Satellite Constellation Telemetry & Re-Tasking Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Satellite className="w-4 h-4 text-cyan-400" />
            <span>Earth Observation Constellation Telemetry & Sensors</span>
          </h3>
          <span className="text-xs font-mono text-cyan-400">{sensors.length} Spacecraft Active</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Spacecraft</th>
                <th className="py-2.5 px-3">Agency</th>
                <th className="py-2.5 px-3">Orbital Status</th>
                <th className="py-2.5 px-3">Spatial Resolution</th>
                <th className="py-2.5 px-3">Bands</th>
                <th className="py-2.5 px-3">Next AOI Pass</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {sensors.map((sensor) => (
                <tr key={sensor.id} className="hover:bg-slate-950/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-100 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>{sensor.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{sensor.agency}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${
                        sensor.orbitStatus === "Re-tasking"
                          ? "bg-amber-950 text-amber-300 border-amber-800"
                          : "bg-cyan-950 text-cyan-300 border-cyan-800"
                      }`}
                    >
                      {sensor.orbitStatus}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono">{sensor.resolution}</td>
                  <td className="py-2.5 px-3 font-mono">{sensor.spectralBands} Bands</td>
                  <td className="py-2.5 px-3 text-slate-300">{sensor.nextPassTime}</td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setRetaskingSensor(sensor)}
                      className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Retask Pass
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Management Roster */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Personnel & Agency Clearance Management</span>
          </h3>
          <span className="text-xs font-mono text-slate-400">Total: {users.length} Users</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-mono text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Operator Name</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Agency</th>
                <th className="py-2.5 px-3">Clearance Level</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3 text-right">Access Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-950/50">
                  <td className="py-2.5 px-3 font-medium text-slate-100">{u.name}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{u.email}</td>
                  <td className="py-2.5 px-3 text-slate-300">{u.agency}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-400 text-[11px]">{u.clearanceLevel}</td>
                  <td className="py-2.5 px-3">
                    <select
                      value={u.role}
                      onChange={(e) => handleUpdateRole(u.id, e.target.value as UserRole)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-xs text-cyan-300 font-mono focus:outline-none"
                    >
                      <option value="admin">admin</option>
                      <option value="commander">commander</option>
                      <option value="analyst">analyst</option>
                      <option value="responder">responder</option>
                      <option value="viewer">viewer</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1 rounded text-slate-400 hover:text-rose-400 transition-colors"
                      title="Revoke clearance"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security & Audit Telemetry Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span>Real-Time Security & Telemetry Audit Trail</span>
        </h3>

        <div className="space-y-2">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    log.severity === "critical"
                      ? "bg-rose-500"
                      : log.severity === "warning"
                      ? "bg-amber-500"
                      : "bg-cyan-500"
                  }`}
                />
                <span className="font-semibold text-slate-200">{log.action}</span>
              </div>
              <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px]">
                <span>Operator: {log.user}</span>
                <span>IP: {log.ipAddress}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retask Satellite Modal */}
      {retaskingSensor && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Satellite className="w-4 h-4 text-cyan-400" />
                <span>Retask Satellite: {retaskingSensor.name}</span>
              </h3>
              <button
                type="button"
                onClick={() => setRetaskingSensor(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRetaskSatellite} className="space-y-3 text-xs">
              <p className="text-slate-400 leading-relaxed">
                Transmit prioritized maneuvering commands to orbital thrusters to stage a high-incidence observation pass over the target theater.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Target Theater AOI
                </label>
                <input
                  type="text"
                  value={targetName}
                  onChange={(e) => setTargetName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRetaskingSensor(null)}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
                >
                  Transmit Telecommand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
