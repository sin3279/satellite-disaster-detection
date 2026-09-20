import React, { useState } from "react";
import { DisasterIncident, IncidentUnit, User } from "../types";
import { Siren, Users, Send, ShieldAlert, CheckCircle, Clock, Truck, Plane, Radio, AlertTriangle, Plus } from "lucide-react";

interface IncidentResponseProps {
  incidents: DisasterIncident[];
  currentUser: User | null;
  onRefreshIncidents: () => void;
}

export const IncidentResponse: React.FC<IncidentResponseProps> = ({
  incidents,
  currentUser,
  onRefreshIncidents
}) => {
  const [selectedIncident, setSelectedIncident] = useState<DisasterIncident>(incidents[0] || null);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchUnitType, setDispatchUnitType] = useState<IncidentUnit["type"]>("USAR Team");
  const [dispatchUnitName, setDispatchUnitName] = useState("");
  const [dispatchSector, setDispatchSector] = useState("North Ridge Perimeter");
  const [personnelCount, setPersonnelCount] = useState<number>(16);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIncident) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/incidents/${selectedIncident.id}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          unitName: dispatchUnitName || `${dispatchUnitType} Squad`,
          unitType: dispatchUnitType,
          assignedSector: dispatchSector,
          personnelCount
        })
      });

      if (res.ok) {
        setIsDispatching(false);
        setDispatchUnitName("");
        onRefreshIncidents();
      }
    } catch (e) {
      console.error("Dispatch failed:", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status: DisasterIncident["status"]) => {
    if (!selectedIncident) return;
    try {
      const res = await fetch(`/api/incidents/${selectedIncident.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        onRefreshIncidents();
      }
    } catch (e) {
      console.error("Status update failed:", e);
    }
  };

  const getStatusBadge = (status: DisasterIncident["status"]) => {
    switch (status) {
      case "Active Response":
        return "bg-rose-950 text-rose-300 border-rose-800";
      case "Evacuation Ordered":
        return "bg-amber-950 text-amber-300 border-amber-800";
      case "Containment":
        return "bg-blue-950 text-blue-300 border-blue-800";
      case "Resolved":
        return "bg-emerald-950 text-emerald-300 border-emerald-800";
    }
  };

  const getUnitIcon = (type: IncidentUnit["type"]) => {
    switch (type) {
      case "Aerial Water Bomber":
        return <Plane className="w-4 h-4 text-cyan-400" />;
      case "UAV Recon Drone":
        return <Radio className="w-4 h-4 text-emerald-400" />;
      case "Mobile Medical Clinic":
        return <Truck className="w-4 h-4 text-rose-400" />;
      default:
        return <Users className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div id="incident-response-module" className="space-y-5">
      {/* Module Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Siren className="w-4 h-4 text-rose-400 animate-pulse" />
            <span>Disaster Incident Response & Unit Dispatch</span>
            <span className="text-xs font-mono text-cyan-400">
              (Module 4 • Incident Command Operations)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Coordinate USAR squads, aerial firefighting sorties, watercraft evacuation, and triage operations
          </p>
        </div>

        {/* Dispatch Action Button */}
        {selectedIncident && (
          <button
            type="button"
            onClick={() => setIsDispatching(true)}
            className="py-1.5 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-900/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Dispatch Relief Unit</span>
          </button>
        )}
      </div>

      {/* Main Grid: Incidents List (4 Cols) + Active Incident Command (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Incidents Master List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Active Disaster Theater ({incidents.length})
          </span>

          <div className="space-y-2.5">
            {incidents.map((incident) => {
              const isSelected = selectedIncident?.id === incident.id;
              return (
                <div
                  key={incident.id}
                  onClick={() => setSelectedIncident(incident)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/50"
                      : "bg-slate-950 hover:bg-slate-900/80 border-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-xs font-bold text-slate-100 truncate">
                      {incident.title}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${getStatusBadge(incident.status)}`}>
                      {incident.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 mb-2">
                    {incident.location} • <span className="text-slate-300">{incident.hazardType}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
                    <span>Units: <b className="text-slate-200">{incident.dispatchedUnits.length}</b></span>
                    <span>Evacuated: <b className="text-emerald-400">{incident.evacuatedCount.toLocaleString()}</b></span>
                    <span className="font-mono text-rose-400">PRIORITY {incident.priorityScore}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Incident Command Dashboard */}
        {selectedIncident ? (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded-md border font-bold uppercase ${getStatusBadge(selectedIncident.status)}`}>
                    {selectedIncident.status}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {selectedIncident.id}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  {selectedIncident.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Location: <span className="text-slate-200 font-medium">{selectedIncident.location}</span> • Lead Coordinator: <span className="text-cyan-300 font-medium">{selectedIncident.coordinatorName}</span>
                </p>
              </div>

              {/* Status Update Quick Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Active Response")}
                  className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-medium cursor-pointer"
                >
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Evacuation Ordered")}
                  className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 text-xs font-medium cursor-pointer"
                >
                  Evacuation
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Containment")}
                  className="px-2.5 py-1 rounded bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 text-xs font-medium cursor-pointer"
                >
                  Containment
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus("Resolved")}
                  className="px-2.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 text-xs font-medium cursor-pointer"
                >
                  Resolved
                </button>
              </div>
            </div>

            {/* Tactical Metrics Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Field Personnel</span>
                <span className="text-lg font-mono font-bold text-slate-100">
                  {selectedIncident.dispatchedUnits.reduce((a, b) => a + b.personnelCount, 0)}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Citizens Evacuated</span>
                <span className="text-lg font-mono font-bold text-emerald-400">
                  {selectedIncident.evacuatedCount.toLocaleString()}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Threat Index</span>
                <span className="text-lg font-mono font-bold text-rose-400">
                  {selectedIncident.severity}
                </span>
              </div>
            </div>

            {/* Dispatched Units Roster */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Dispatched Response Units & Air Sorties ({selectedIncident.dispatchedUnits.length})</span>
                </h4>
              </div>

              <div className="space-y-2">
                {selectedIncident.dispatchedUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0">
                        {getUnitIcon(unit.type)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-100">{unit.name}</div>
                        <div className="text-[11px] text-slate-400">
                          {unit.type} • Sector: <span className="text-cyan-300">{unit.assignedSector}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div>
                        <div className="text-xs font-mono text-slate-200 font-bold">{unit.personnelCount} Personnel</div>
                        <div className="text-[10px] text-emerald-400 font-mono">{unit.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-400 text-xs">
            Select an active incident from the list to inspect response details.
          </div>
        )}
      </div>

      {/* Dispatch Modal Dialog */}
      {isDispatching && selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                <span>Deploy Unit to {selectedIncident.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDispatching(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleDispatch} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Unit Type
                </label>
                <select
                  value={dispatchUnitType}
                  onChange={(e) => setDispatchUnitType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                >
                  <option value="USAR Team">USAR Team (Search & Rescue)</option>
                  <option value="Aerial Water Bomber">Aerial Water Bomber (CalFire / DC-10)</option>
                  <option value="Mobile Medical Clinic">Mobile Medical Clinic</option>
                  <option value="Amphibious Evac Squad">Amphibious Evac Squad</option>
                  <option value="UAV Recon Drone">UAV Recon Drone (Thermal FLIR)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                  Callsign / Unit Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Strike Force Omega"
                  value={dispatchUnitName}
                  onChange={(e) => setDispatchUnitName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Assigned Sector
                  </label>
                  <input
                    type="text"
                    value={dispatchSector}
                    onChange={(e) => setDispatchSector(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">
                    Personnel Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={personnelCount}
                    onChange={(e) => setPersonnelCount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDispatching(false)}
                  className="flex-1 py-2 px-3 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 px-3 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
                >
                  {isSubmitting ? "Deploying..." : "Confirm Deployment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
