import React, { useState } from "react";
import { DetectionResult, DisasterType } from "../types";
import { Database, Trash2, Search, Filter, Calendar, MapPin, Eye, AlertTriangle, Flame, Droplet, Activity, Wind, AlertCircle } from "lucide-react";
import { playTelemetryPing } from "../utils/audioEffects";

interface HistoryListProps {
  history: DetectionResult[];
  selectedId: string | null;
  onSelectRecord: (record: DetectionResult) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  isLoading: boolean;
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  selectedId,
  onSelectRecord,
  onDeleteRecord,
  onClearHistory,
  isLoading
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [hazardFilter, setHazardFilter] = useState<string>("all");
  const [isConfirmingPurge, setIsConfirmingPurge] = useState(false);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.primaryHazard.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter =
      hazardFilter === "all" || item.primaryHazard.toLowerCase() === hazardFilter.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  const getHazardIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "wildfire":
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case "flood":
        return <Droplet className="w-3.5 h-3.5 text-cyan-400" />;
      case "earthquake":
        return <Activity className="w-3.5 h-3.5 text-orange-400" />;
      case "cyclone":
        return <Wind className="w-3.5 h-3.5 text-indigo-400" />;
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div id="satellite-database-view" className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Telemetry Database Archive</span>
            <span className="text-xs font-mono text-cyan-400">
              ({history.length} Saved Records)
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Persistent records of processed satellite passes, damage assessments, and bounding box hazard coordinates
          </p>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {isConfirmingPurge ? (
              <div className="flex items-center gap-2 bg-rose-950/80 border border-rose-700/80 rounded-lg px-2.5 py-1 text-xs">
                <span className="text-rose-200">Confirm purge database?</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmingPurge(false);
                    onClearHistory();
                    playTelemetryPing(400);
                  }}
                  className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  Yes, Purge
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingPurge(false)}
                  className="text-slate-400 hover:text-slate-200 px-1"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingPurge(true);
                  playTelemetryPing(700);
                }}
                className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1.5 cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge Database</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            id="database-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by location, hazard, or mission title..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            id="database-filter-select"
            value={hazardFilter}
            onChange={(e) => setHazardFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 w-full sm:w-auto"
          >
            <option value="all">All Hazards</option>
            <option value="wildfire">Wildfire</option>
            <option value="flood">Flood</option>
            <option value="earthquake">Earthquake</option>
            <option value="cyclone">Cyclone / Storm</option>
            <option value="volcanic eruption">Volcanic Eruption</option>
          </select>
        </div>
      </div>

      {/* History Items Grid */}
      {filteredHistory.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-8 text-center text-slate-500 space-y-2">
          <Database className="w-8 h-8 mx-auto text-slate-700" />
          <p className="text-xs">No records found matching current query or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredHistory.map((item) => {
            const isSelected = selectedId === item.id;
            return (
              <div
                key={item.id}
                id={`db-record-${item.id}`}
                onClick={() => onSelectRecord(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex gap-3.5 ${
                  isSelected
                    ? "bg-slate-900 border-cyan-500 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/40"
                    : "bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80"
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-950 shrink-0 border border-slate-800 relative">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-1 left-1">
                    <span className="p-1 rounded bg-slate-950/80 backdrop-blur-sm block">
                      {getHazardIcon(item.primaryHazard)}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/40">
                        {item.primaryHazard}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-xs font-semibold text-slate-100 truncate mt-1">
                      {item.title}
                    </h3>

                    <p className="text-[11px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span>{item.locationName}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span className="font-mono text-slate-300">
                      {item.estimatedDamageAreaKm2} km²
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRecord(item);
                        }}
                        className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Inspect</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRecord(item.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        title="Delete from database"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
