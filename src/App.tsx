import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { StatsBar } from "./components/StatsBar";
import { SatelliteViewer } from "./components/SatelliteViewer";
import { ImageUploader } from "./components/ImageUploader";
import { AnalysisReport } from "./components/AnalysisReport";
import { PresetSelector } from "./components/PresetSelector";
import { HistoryList } from "./components/HistoryList";
import { GeospatialMap } from "./components/GeospatialMap";
import { IncidentResponse } from "./components/IncidentResponse";
import { AICopilotChat } from "./components/AICopilotChat";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";
import { AdminPortal } from "./components/AdminPortal";
import { AuthModal } from "./components/AuthModal";
import { LoginPage } from "./components/LoginPage";
import { VFXBackground } from "./components/VFXBackground";
import { SATELLITE_PRESETS } from "./data/presets";
import {
  DetectionResult,
  SatellitePreset,
  AnalysisStats,
  DisasterType,
  AppModule,
  User,
  DisasterIncident
} from "./types";
import { ShieldAlert, Bot } from "lucide-react";
import {
  playScanSweep,
  playCriticalAlert,
  playAuthSuccess,
  playTelemetryPing
} from "./utils/audioEffects";

export function App() {
  // User Authentication State: Displays LoginPage first if not logged in
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("satellite_auth_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return null; // Show LoginPage first as requested
  });

  // Navigation & Drawer States
  const [activeTab, setActiveTab] = useState<AppModule>("scanner");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // Backend Health & Data States
  const [backendConnected, setBackendConnected] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [presets, setPresets] = useState<SatellitePreset[]>(SATELLITE_PRESETS);
  const [history, setHistory] = useState<DetectionResult[]>([]);
  const [incidents, setIncidents] = useState<DisasterIncident[]>([]);
  const [stats, setStats] = useState<AnalysisStats | null>(null);

  // Active Scanner Mission State
  const [selectedPreset, setSelectedPreset] = useState<SatellitePreset | null>(SATELLITE_PRESETS[0]);
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string>(SATELLITE_PRESETS[0].imageUrl);
  const [locationName, setLocationName] = useState(SATELLITE_PRESETS[0].location);
  const [coordinates, setCoordinates] = useState(SATELLITE_PRESETS[0].coordinates);
  const [disasterTypeHint, setDisasterTypeHint] = useState<DisasterType>(SATELLITE_PRESETS[0].disasterType);
  const [sensor, setSensor] = useState(SATELLITE_PRESETS[0].sensor);

  // Result & Execution States
  const [activeResult, setActiveResult] = useState<DetectionResult | null>(() => {
    const p = SATELLITE_PRESETS[0];
    return {
      id: `scan-init-${p.id}`,
      timestamp: new Date().toISOString(),
      imageUrl: p.imageUrl,
      ...p.fallbackResult,
      isAiGenerated: true
    };
  });
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    checkHealth();
    fetchHistory();
    fetchStats();
    fetchPresets();
    fetchIncidents();
  }, []);

  const checkHealth = async () => {
    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        const data = await res.json();
        setBackendConnected(true);
        setHasApiKey(Boolean(data.hasApiKey));
      } else {
        setBackendConnected(false);
      }
    } catch {
      setBackendConnected(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await fetch("/api/presets");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setPresets(data);
        }
      }
    } catch (e) {
      console.warn("Using bundled presets:", e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
        if (!activeResult && data.length > 0) {
          setActiveResult(data[0]);
          setActiveImageUrl(data[0].imageUrl);
        }
      }
    } catch (e) {
      console.warn("Failed to fetch history:", e);
    }
  };

  const fetchIncidents = async () => {
    try {
      const res = await fetch("/api/incidents");
      if (res.ok) {
        const data = await res.json();
        setIncidents(data);
      }
    } catch (e) {
      console.warn("Failed to fetch incidents:", e);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.warn("Failed to fetch stats:", e);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem("satellite_auth_user", JSON.stringify(user));
  };

  const handleLogout = () => {
    playTelemetryPing(600);
    setCurrentUser(null);
    localStorage.removeItem("satellite_auth_user");
    setIsAuthModalOpen(false);
  };

  const handleSelectPreset = (preset: SatellitePreset) => {
    setSelectedPreset(preset);
    setCustomImage(null);
    setActiveImageUrl(preset.imageUrl);
    setLocationName(preset.location);
    setCoordinates(preset.coordinates);
    setDisasterTypeHint(preset.disasterType);
    setSensor(preset.sensor);
    setErrorMsg(null);
    setActiveResult({
      id: `scan-${preset.id}-${Date.now()}`,
      timestamp: new Date().toISOString(),
      imageUrl: preset.imageUrl,
      ...preset.fallbackResult,
      isAiGenerated: false
    });
    playTelemetryPing(950);
  };

  const handleCustomImageUploaded = (base64: string) => {
    setCustomImage(base64);
    setActiveImageUrl(base64);
    setSelectedPreset(null);
    setLocationName("Custom Reconnaissance Target");
    setErrorMsg(null);
    playAuthSuccess();
  };

  const handleClearCustomImage = () => {
    setCustomImage(null);
    if (presets.length > 0) {
      handleSelectPreset(presets[0]);
    }
  };

  const handleExecuteDetection = async (presetOverride?: SatellitePreset) => {
    setIsScanning(true);
    setErrorMsg(null);
    playScanSweep();

    const targetPreset = presetOverride || selectedPreset;

    try {
      const payload: any = {
        locationName,
        coordinates,
        satelliteSensor: sensor,
        disasterTypeHint
      };

      if (customImage) {
        payload.imageData = customImage;
      } else if (targetPreset) {
        payload.presetId = targetPreset.id;
        payload.imageUrl = targetPreset.imageUrl;
      } else {
        payload.imageUrl = activeImageUrl;
      }

      const res = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Analysis failed with status " + res.status);
      }

      const newRecord: DetectionResult = await res.json();
      setActiveResult(newRecord);
      setActiveImageUrl(newRecord.imageUrl || activeImageUrl);

      // Play appropriate telemetry sound
      if (newRecord.immediateEvacuationNeed || newRecord.severityLevel === "Catastrophic") {
        playCriticalAlert();
      } else {
        playAuthSuccess();
      }

      fetchHistory();
      fetchStats();

      if (activeTab !== "scanner") {
        setActiveTab("scanner");
      }
    } catch (err: any) {
      console.error("Detection error:", err);
      setErrorMsg(err.message || "Failed to analyze satellite imagery.");

      if (targetPreset) {
        const fallback: DetectionResult = {
          id: `scan-${Date.now()}`,
          timestamp: new Date().toISOString(),
          imageUrl: targetPreset.imageUrl,
          ...targetPreset.fallbackResult
        };
        setActiveResult(fallback);
        playAuthSuccess();
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/history/${id}`, { method: "DELETE" });
      if (res.ok) {
        setHistory((prev) => prev.filter((r) => r.id !== id));
        fetchStats();
        playTelemetryPing(500);
      }
    } catch (e) {
      console.error("Delete failed:", e);
    }
  };

  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/history", { method: "DELETE" });
      if (res.ok) {
        setHistory([]);
        fetchStats();
        playTelemetryPing(400);
      }
    } catch (e) {
      console.error("Clear failed:", e);
    }
  };

  const handleSelectRecordFromHistory = (record: DetectionResult) => {
    setActiveResult(record);
    setActiveImageUrl(record.imageUrl);
    setLocationName(record.locationName);
    setCoordinates(record.coordinates);
    setDisasterTypeHint(record.primaryHazard);
    setSensor(record.satelliteSensor);
    setActiveTab("scanner");
    playTelemetryPing(850);
  };

  const handleEscalateToDispatch = async (result: DetectionResult) => {
    try {
      playCriticalAlert();
      // Provision incident in backend store
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `CRITICAL: ${result.primaryHazard} Escalation - ${result.locationName}`,
          location: result.locationName,
          hazardType: result.primaryHazard,
          severity: result.confidenceScore > 0.85 ? "Catastrophic" : "Severe",
          coordinatorName: currentUser?.name || "Command Officer"
        })
      });
      if (res.ok) {
        await fetchIncidents();
      }
    } catch (e) {
      console.error("Escalation dispatch error:", e);
    } finally {
      setActiveTab("incidents");
    }
  };

  // -------------------------------------------------------------
  // 1. If user is NOT logged in: SHOW LOGIN PAGE FIRST!
  // -------------------------------------------------------------
  if (!currentUser) {
    return (
      <>
        <VFXBackground />
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // -------------------------------------------------------------
  // 2. If user IS logged in: SHOW COMMAND DASHBOARD WITH 8 MODULES
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 relative transition-colors">
      {/* VFX Ambient Background Canvas & Mode Overlays */}
      <VFXBackground />

      {/* Primary Navigation & Brand Header */}
      <Header
        backendConnected={backendConnected}
        hasApiKey={hasApiKey}
        onRefresh={() => {
          checkHealth();
          fetchStats();
          fetchHistory();
          fetchIncidents();
          playTelemetryPing(1000);
        }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        isFloatingChatOpen={isFloatingChatOpen}
        onToggleFloatingChat={() => setIsFloatingChatOpen(!isFloatingChatOpen)}
      />

      {/* Global Analytics KPI Bar */}
      <StatsBar stats={stats} />

      {/* Main Container for 8 Modules */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6 relative z-10">
        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-800 text-rose-300 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </span>
            <button
              onClick={() => setErrorMsg(null)}
              className="text-slate-400 hover:text-slate-200 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        )}

        {/* Module 1: Satellite Scanner & AI Disaster Detection */}
        {activeTab === "scanner" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-5">
              <SatelliteViewer
                imageUrl={activeImageUrl}
                result={activeResult}
                isScanning={isScanning}
                onScan={() => handleExecuteDetection()}
              />
              <ImageUploader
                customImage={customImage}
                onImageUploaded={handleCustomImageUploaded}
                onClearCustomImage={handleClearCustomImage}
                locationName={locationName}
                setLocationName={setLocationName}
                coordinates={coordinates}
                setCoordinates={setCoordinates}
                disasterTypeHint={disasterTypeHint}
                setDisasterTypeHint={setDisasterTypeHint}
                sensor={sensor}
                setSensor={setSensor}
                isLoading={isScanning}
                onRunDetection={() => handleExecuteDetection()}
              />
            </div>

            <div className="lg:col-span-5 space-y-5">
              <AnalysisReport
                result={activeResult}
                onEscalateToDispatch={handleEscalateToDispatch}
              />
            </div>
          </div>
        )}

        {/* Module 2: Mission Library & Satellite Imagery Presets */}
        {activeTab === "presets" && (
          <PresetSelector
            presets={presets}
            selectedPresetId={selectedPreset?.id || null}
            onSelectPreset={handleSelectPreset}
            onAnalyzeDirectly={(preset) => {
              handleSelectPreset(preset);
              handleExecuteDetection(preset);
            }}
            isLoading={isScanning}
          />
        )}

        {/* Module 3: Live Geospatial Hazard Map & Orbital Tracker */}
        {activeTab === "map" && (
          <GeospatialMap
            presets={presets}
            history={history}
            onSelectTarget={(preset) => {
              handleSelectPreset(preset);
              setActiveTab("scanner");
            }}
          />
        )}

        {/* Module 4: Disaster Incident Response & Dispatch */}
        {activeTab === "incidents" && (
          <IncidentResponse
            incidents={incidents}
            currentUser={currentUser}
            onRefreshIncidents={fetchIncidents}
          />
        )}

        {/* Module 5: Telemetry Database Archive */}
        {activeTab === "database" && (
          <HistoryList
            history={history}
            selectedId={activeResult?.id || null}
            onSelectRecord={handleSelectRecordFromHistory}
            onDeleteRecord={handleDeleteRecord}
            onClearHistory={handleClearHistory}
            isLoading={isScanning}
          />
        )}

        {/* Module 6: Interactive AI Disaster Copilot & Real-Time Chat */}
        {activeTab === "copilot" && (
          <div className="max-w-4xl mx-auto">
            <AICopilotChat
              activeResult={activeResult}
              currentUser={currentUser}
              isFloating={false}
            />
          </div>
        )}

        {/* Module 7: Analytics & Environmental Impact Telemetry */}
        {activeTab === "analytics" && (
          <AnalyticsDashboard
            stats={stats}
            history={history}
          />
        )}

        {/* Module 8: Admin Command Portal & System Overview Dashboard */}
        {activeTab === "admin" && (
          <AdminPortal
            currentUser={currentUser}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Floating AI Chatbot Drawer / Widget (Accessible anywhere) */}
      {isFloatingChatOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-6 duration-200">
          <AICopilotChat
            activeResult={activeResult}
            currentUser={currentUser}
            isFloating={true}
            onCloseFloating={() => setIsFloatingChatOpen(false)}
          />
        </div>
      )}

      {/* Interactive Profile & Clearance Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Satellite Disaster Detection System • 8 Integrated Modules with Live Geospatial & Multi-Spectral Telemetry</span>
          <span className="font-mono text-[11px] text-slate-600">
            Sentinel-2, Landsat-9, WorldView-3 & Gemini 3.8 Flash • Deployment-Ready
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
