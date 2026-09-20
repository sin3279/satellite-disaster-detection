export type DisasterType = 
  | "Wildfire"
  | "Flood"
  | "Earthquake"
  | "Cyclone"
  | "Landslide"
  | "Drought"
  | "Volcanic Eruption"
  | "Auto-Detect";

export type SeverityLevel = "Minimal" | "Moderate" | "Significant" | "Severe" | "Catastrophic";

export type UserRole = "admin" | "commander" | "analyst" | "responder" | "viewer";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency: string;
  avatarUrl?: string;
  status: "active" | "standby" | "inactive";
  lastActive: string;
  clearanceLevel: "Level 1" | "Level 2" | "Level 3 - Top Secret";
}

export interface HazardZone {
  id: string;
  label: string;
  severity: "critical" | "warning" | "advisory";
  bbox: [number, number, number, number]; // [ymin, xmin, ymax, xmax] in percentages (0 to 100)
  description: string;
}

export interface DetectionResult {
  id: string;
  timestamp: string;
  title: string;
  locationName: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  satelliteSensor: string;
  disasterType: string;
  primaryHazard: DisasterType;
  severityLevel: SeverityLevel;
  severityScore: number; // 1 - 5
  confidenceScore: number; // 0 - 1
  estimatedDamageAreaKm2: number;
  affectedStructuresCount: number;
  immediateEvacuationNeed: boolean;
  detectionSummary: string;
  environmentalImpact: string;
  identifiedZones: HazardZone[];
  emergencyResponseRecommendations: string[];
  imageUrl: string;
  isAiGenerated?: boolean;
}

export interface SatellitePreset {
  id: string;
  title: string;
  location: string;
  country: string;
  disasterType: DisasterType;
  date: string;
  sensor: string;
  resolution: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  thumbnailUrl: string;
  description: string;
  fallbackResult: Omit<DetectionResult, "id" | "timestamp" | "imageUrl">;
}

export interface AnalysisStats {
  totalScans: number;
  criticalAlerts: number;
  totalAreaMonitoredKm2: number;
  hazardBreakdown: Record<string, number>;
  hasGeminiKey?: boolean;
}

export interface IncidentUnit {
  id: string;
  name: string;
  type: "USAR Team" | "Aerial Water Bomber" | "Mobile Medical Clinic" | "Amphibious Evac Squad" | "UAV Recon Drone";
  status: "Dispatched" | "On-Scene" | "Standby" | "Refueling";
  assignedSector: string;
  personnelCount: number;
}

export interface DisasterIncident {
  id: string;
  title: string;
  location: string;
  hazardType: DisasterType;
  severity: SeverityLevel;
  status: "Active Response" | "Containment" | "Evacuation Ordered" | "Resolved";
  dispatchedUnits: IncidentUnit[];
  reportedTime: string;
  evacuatedCount: number;
  coordinatorName: string;
  priorityScore: number; // 1 to 100
}

export interface ChatMessage {
  id: string;
  sender: "user" | "copilot" | "system";
  text: string;
  timestamp: string;
  actionSuggestions?: string[];
  telemetryRef?: string;
}

export interface SensorStatus {
  id: string;
  name: string;
  agency: "ESA" | "NASA / USGS" | "Maxar / Planet" | "NOAA";
  orbitStatus: "Nominal Pass" | "Re-tasking" | "Calibrating" | "Sun-Synchronous";
  resolution: string;
  spectralBands: number;
  nextPassTime: string;
  healthScore: number; // 0 - 100
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  severity: "info" | "warning" | "critical";
  ipAddress: string;
}

export type AppModule = 
  | "scanner"       // Module 1: Interactive Scanner & Detection
  | "presets"       // Module 2: Mission Library
  | "map"           // Module 3: Live Geospatial Map
  | "incidents"     // Module 4: Disaster Response & Dispatch
  | "database"      // Module 5: Telemetry Database
  | "copilot"       // Module 6: Real-time AI Disaster Copilot
  | "analytics"     // Module 7: Analytics & Impact Reporting
  | "admin";        // Module 8: Admin Portal & Overview Dashboard
