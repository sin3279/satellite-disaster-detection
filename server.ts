import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { SATELLITE_PRESETS } from "./src/data/presets";
import {
  DetectionResult,
  HazardZone,
  SeverityLevel,
  DisasterType,
  User,
  UserRole,
  DisasterIncident,
  IncidentUnit,
  SensorStatus,
  SystemAuditLog,
  ChatMessage
} from "./src/types";

const app = express();
const PORT = 3000;

// Enable JSON body parsing with large payload limit for base64 satellite imagery
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

// ----------------------------------------------------
// DATABASE & IN-MEMORY STORES
// ----------------------------------------------------

// 1. Users Store
const usersStore: User[] = [
  {
    id: "usr-admin-1",
    name: "Commander Sarah Vance",
    email: "admin@satellite.gov",
    role: "admin",
    agency: "Global Disaster Response Agency (GDRA)",
    status: "active",
    lastActive: "Just now",
    clearanceLevel: "Level 3 - Top Secret"
  },
  {
    id: "usr-cmd-2",
    name: "Marcus Holloway",
    email: "commander@fema.gov",
    role: "commander",
    agency: "Federal Emergency Management (FEMA)",
    status: "active",
    lastActive: "5 mins ago",
    clearanceLevel: "Level 3 - Top Secret"
  },
  {
    id: "usr-ana-3",
    name: "Dr. Elena Rostova",
    email: "analyst@esa.int",
    role: "analyst",
    agency: "European Space Agency (ESA Remote Sensing)",
    status: "active",
    lastActive: "12 mins ago",
    clearanceLevel: "Level 2"
  },
  {
    id: "usr-resp-4",
    name: "Captain David O'Connor",
    email: "responder@redcross.org",
    role: "responder",
    agency: "International Search & Rescue (USAR)",
    status: "active",
    lastActive: "35 mins ago",
    clearanceLevel: "Level 1"
  },
  {
    id: "usr-view-5",
    name: "Citizen Observer",
    email: "public@earth-watch.org",
    role: "viewer",
    agency: "Civilian Earth Watch Network",
    status: "active",
    lastActive: "1 hour ago",
    clearanceLevel: "Level 1"
  }
];

// Mock password map for demo simplicity
const userPasswords: Record<string, string> = {
  "admin@satellite.gov": "admin123",
  "commander@fema.gov": "commander123",
  "analyst@esa.int": "analyst123",
  "responder@redcross.org": "responder123",
  "public@earth-watch.org": "public123"
};

// 2. Telemetry Assessments Store
interface StoredRecord extends DetectionResult {
  notes?: string;
  tags?: string[];
}

const dbStore: StoredRecord[] = [
  {
    id: "hist-1",
    timestamp: "2026-09-18T14:22:10Z",
    title: "August Complex Wildfire Assessment",
    locationName: "Mendocino National Forest, CA",
    coordinates: { lat: 39.8183, lng: -122.8686 },
    satelliteSensor: "Sentinel-2 MSI (Bands 12, 8A, 4)",
    disasterType: "Catastrophic Wildfire & Active Firefront",
    primaryHazard: "Wildfire",
    severityLevel: "Catastrophic",
    severityScore: 5,
    confidenceScore: 0.96,
    estimatedDamageAreaKm2: 4180.5,
    affectedStructuresCount: 935,
    immediateEvacuationNeed: true,
    detectionSummary: "High short-wave infrared (SWIR) reflectance anomalies indicate active flame fronts along the northern ridgeline. Dense smoke column spans over 140km with severe burn scar showing complete canopy incinerations.",
    environmentalImpact: "Severe Normalized Burn Ratio (NBR) reduction (>0.65 drop). Extreme soil hydrophobicity risk and particulate matter PM2.5 concentrations exceeding hazardous thresholds.",
    identifiedZones: [
      {
        id: "zone-1",
        label: "Active Fire Perimeter Front",
        severity: "critical",
        bbox: [15, 20, 48, 65],
        description: "Rapidly advancing crown fire moving northeast along canyon topography at ~3.2 km/h."
      },
      {
        id: "zone-2",
        label: "Primary Burn Scar / Soil Exposure",
        severity: "warning",
        bbox: [45, 10, 85, 55],
        description: "Total timber mortality with high post-fire erosion and debris-flow susceptibility."
      }
    ],
    emergencyResponseRecommendations: [
      "Issue immediate Level 3 'GO NOW' evacuation orders for grid sector C-4 and eastern drainage corridors.",
      "Dispatch heavy aerial tanker drops (DC-10 / 747 Supertanker) along Ridge Road containment firebreak.",
      "Establish Incident Command Post 25km south-southwest outside the prevailing downwind smoke plume."
    ],
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80",
    isAiGenerated: false
  },
  {
    id: "hist-2",
    timestamp: "2026-09-17T09:40:00Z",
    title: "Indus Basin Mega-Flood Damage Assessment",
    locationName: "Sindh Province, Pakistan",
    coordinates: { lat: 26.8532, lng: 68.1256 },
    satelliteSensor: "Landsat-9 OLI-2 + Sentinel-1 SAR",
    disasterType: "Extreme Inundation & Riverine Flooding",
    primaryHazard: "Flood",
    severityLevel: "Catastrophic",
    severityScore: 5,
    confidenceScore: 0.98,
    estimatedDamageAreaKm2: 32800.0,
    affectedStructuresCount: 184000,
    immediateEvacuationNeed: true,
    detectionSummary: "Synthetic Aperture Radar (SAR) and NDWI water masking demonstrate standing water depths exceeding 2.5 meters across 12 contiguous districts. Major transportation corridors breached.",
    environmentalImpact: "Complete destruction of agricultural crops. High contamination risk of municipal aquifer wells.",
    identifiedZones: [
      {
        id: "zone-1",
        label: "Submerged Agricultural Heartland",
        severity: "critical",
        bbox: [20, 15, 75, 58],
        description: "Complete standing water submergence (>90% farmland loss)."
      },
      {
        id: "zone-2",
        label: "Breached Embankment Zone",
        severity: "critical",
        bbox: [10, 60, 42, 88],
        description: "Primary levee failure with high-velocity torrents inundating downstream villages."
      }
    ],
    emergencyResponseRecommendations: [
      "Deploy amphibious relief vessels and military utility helicopters for trapped island communities.",
      "Mobilize mobile reverse-osmosis water purification units and waterborne disease vaccination stockpiles."
    ],
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1600&q=80",
    isAiGenerated: false
  },
  {
    id: "hist-3",
    timestamp: "2026-09-15T18:15:30Z",
    title: "Kahramanmaraş Urban Destruction Survey",
    locationName: "Antakya Urban Sector, Turkey",
    coordinates: { lat: 37.5753, lng: 36.9228 },
    satelliteSensor: "WorldView-3 (0.31m Panchromatic)",
    disasterType: "Mass Structural Collapse & Surface Fault Rupture",
    primaryHazard: "Earthquake",
    severityLevel: "Catastrophic",
    severityScore: 5,
    confidenceScore: 0.94,
    estimatedDamageAreaKm2: 245.8,
    affectedStructuresCount: 1420,
    immediateEvacuationNeed: true,
    detectionSummary: "Optical change detection against baseline pre-event imagery indicates catastrophic pancake collapse across 68 multi-story residential blocks. Fault rupture trace visible with ~3.4m lateral displacement.",
    environmentalImpact: "Ruptured natural gas distribution pipelines sparking localized fires. Potable water line severance.",
    identifiedZones: [
      {
        id: "zone-1",
        label: "Total Structural Collapse District",
        severity: "critical",
        bbox: [25, 20, 60, 65],
        description: "High-density multi-story residential collapse zone; urgent Urban Search & Rescue (USAR) priority."
      }
    ],
    emergencyResponseRecommendations: [
      "Direct international Heavy USAR teams equipped with acoustic listening probes to Zone 1.",
      "Shut off regional high-pressure natural gas supply valves to arrest post-earthquake conflagrations."
    ],
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80",
    isAiGenerated: false
  }
];

// 3. Disaster Incidents & Dispatch Store
const incidentsStore: DisasterIncident[] = [
  {
    id: "inc-001",
    title: "Mendocino Canyon Complex Wildfire Response",
    location: "Mendocino National Forest, CA",
    hazardType: "Wildfire",
    severity: "Catastrophic",
    status: "Active Response",
    reportedTime: "2026-09-18T14:40:00Z",
    evacuatedCount: 4250,
    coordinatorName: "Commander Sarah Vance",
    priorityScore: 98,
    dispatchedUnits: [
      {
        id: "unit-1",
        name: "Strike Team Alpha (CalFire 41)",
        type: "Aerial Water Bomber",
        status: "On-Scene",
        assignedSector: "Sector C-4 Ridge",
        personnelCount: 18
      },
      {
        id: "unit-2",
        name: "Eagle-Eye Recon Squad 9",
        type: "UAV Recon Drone",
        status: "On-Scene",
        assignedSector: "North Rim Buffer",
        personnelCount: 6
      },
      {
        id: "unit-3",
        name: "USAR Heavy Squad 3",
        type: "USAR Team",
        status: "Dispatched",
        assignedSector: "Valley Road Perimeter",
        personnelCount: 32
      }
    ]
  },
  {
    id: "inc-002",
    title: "Indus Southern Basin Breach Inundation",
    location: "Sindh Province, Pakistan",
    hazardType: "Flood",
    severity: "Catastrophic",
    status: "Evacuation Ordered",
    reportedTime: "2026-09-17T10:00:00Z",
    evacuatedCount: 28400,
    coordinatorName: "Marcus Holloway",
    priorityScore: 95,
    dispatchedUnits: [
      {
        id: "unit-4",
        name: "Amphibious Rescue Unit Bravo",
        type: "Amphibious Evac Squad",
        status: "On-Scene",
        assignedSector: "Dadu Embankment",
        personnelCount: 44
      },
      {
        id: "unit-5",
        name: "Mobile Field Hospital 02",
        type: "Mobile Medical Clinic",
        status: "Dispatched",
        assignedSector: "High Ground Camp B",
        personnelCount: 22
      }
    ]
  },
  {
    id: "inc-003",
    title: "Antakya High-Density Collapse Rescue",
    location: "Antakya Urban Sector, Turkey",
    hazardType: "Earthquake",
    severity: "Catastrophic",
    status: "Active Response",
    reportedTime: "2026-09-15T19:00:00Z",
    evacuatedCount: 8900,
    coordinatorName: "Capt. David O'Connor",
    priorityScore: 99,
    dispatchedUnits: [
      {
        id: "unit-6",
        name: "International USAR Task Force 1",
        type: "USAR Team",
        status: "On-Scene",
        assignedSector: "Central Residential Grid",
        personnelCount: 65
      }
    ]
  }
];

// 4. Satellite Constellation Statuses
const constellationSensors: SensorStatus[] = [
  {
    id: "sen-s2a",
    name: "Sentinel-2A MSI",
    agency: "ESA",
    orbitStatus: "Sun-Synchronous",
    resolution: "10m Optical / Red-Edge",
    spectralBands: 13,
    nextPassTime: "In 42 mins",
    healthScore: 99
  },
  {
    id: "sen-s2b",
    name: "Sentinel-2B MSI",
    agency: "ESA",
    orbitStatus: "Nominal Pass",
    resolution: "10m SWIR / NIR",
    spectralBands: 13,
    nextPassTime: "In 1h 15m",
    healthScore: 98
  },
  {
    id: "sen-l9",
    name: "Landsat-9 OLI-2 / TIRS-2",
    agency: "NASA / USGS",
    orbitStatus: "Nominal Pass",
    resolution: "15m Pan / 30m Thermal",
    spectralBands: 11,
    nextPassTime: "In 2h 08m",
    healthScore: 100
  },
  {
    id: "sen-wv3",
    name: "WorldView-3 Commercial VHR",
    agency: "Maxar / Planet",
    orbitStatus: "Re-tasking",
    resolution: "0.31m Panchromatic",
    spectralBands: 16,
    nextPassTime: "Targeted AOI Staged",
    healthScore: 96
  },
  {
    id: "sen-viirs",
    name: "NOAA-20 VIIRS Day/Night",
    agency: "NOAA",
    orbitStatus: "Sun-Synchronous",
    resolution: "375m Radiometer",
    spectralBands: 22,
    nextPassTime: "In 3h 25m",
    healthScore: 97
  },
  {
    id: "sen-s1a",
    name: "Sentinel-1A SAR (C-Band)",
    agency: "ESA",
    orbitStatus: "Nominal Pass",
    resolution: "20m All-Weather Radar",
    spectralBands: 4,
    nextPassTime: "In 55 mins",
    healthScore: 99
  }
];

// 5. System Audit Logs
const auditLogs: SystemAuditLog[] = [
  {
    id: "log-1",
    timestamp: "2026-09-20T08:05:12Z",
    user: "admin@satellite.gov",
    action: "Dispatched Strike Team Alpha to Mendocino Ridge",
    severity: "warning",
    ipAddress: "192.168.1.10"
  },
  {
    id: "log-2",
    timestamp: "2026-09-20T07:44:20Z",
    user: "commander@fema.gov",
    action: "Issued Level 3 Evacuation Alert for Sindh Sector 4",
    severity: "critical",
    ipAddress: "10.0.4.12"
  },
  {
    id: "log-3",
    timestamp: "2026-09-20T06:12:00Z",
    user: "analyst@esa.int",
    action: "Calibrated Sentinel-2 SWIR band false-color model",
    severity: "info",
    ipAddress: "194.12.88.3"
  },
  {
    id: "log-4",
    timestamp: "2026-09-20T05:00:10Z",
    user: "System Daemon",
    action: "Orbital ephemeris telemetry synchronized with ESA NORAD catalog",
    severity: "info",
    ipAddress: "127.0.0.1"
  }
];

// Lazy Gemini SDK client initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// ----------------------------------------------------
// AUTHENTICATION ROUTES (LOGON & ROLES)
// ----------------------------------------------------

// User Login
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials: User not found" });
  }

  // Verify password
  const expectedPassword = userPasswords[email.toLowerCase()] || "password123";
  if (password !== expectedPassword) {
    return res.status(401).json({ error: "Invalid credentials: Incorrect password" });
  }

  // Update last active
  user.lastActive = "Just now";
  user.status = "active";

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: user.email,
    action: `User logged in successfully with ${user.role.toUpperCase()} role`,
    severity: "info",
    ipAddress: req.ip || "127.0.0.1"
  });

  res.json({
    success: true,
    user,
    token: `token-${user.id}-${Date.now()}`
  });
});

// User Registration
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password, role = "analyst", agency = "Disaster Research Team" } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" });
  }

  const existing = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const newUser: User = {
    id: `usr-${Date.now()}`,
    name,
    email,
    role: (role as UserRole) || "analyst",
    agency,
    status: "active",
    lastActive: "Just now",
    clearanceLevel: role === "admin" ? "Level 3 - Top Secret" : role === "commander" ? "Level 3 - Top Secret" : "Level 2"
  };

  usersStore.push(newUser);
  userPasswords[email.toLowerCase()] = password;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: newUser.email,
    action: `New user registered with role ${newUser.role}`,
    severity: "info",
    ipAddress: req.ip || "127.0.0.1"
  });

  res.json({
    success: true,
    user: newUser,
    token: `token-${newUser.id}-${Date.now()}`
  });
});

// Get all users (Admin view)
app.get("/api/auth/users", (_req: Request, res: Response) => {
  res.json(usersStore);
});

// Update user (Admin modify role / status)
app.patch("/api/auth/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, status, clearanceLevel } = req.body;
  const user = usersStore.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (role) user.role = role;
  if (status) user.status = status;
  if (clearanceLevel) user.clearanceLevel = clearanceLevel;

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: "Admin",
    action: `Updated credentials/role for ${user.name} (${user.email}) to ${user.role}`,
    severity: "warning",
    ipAddress: "127.0.0.1"
  });

  res.json({ success: true, user });
});

// Delete user (Admin)
app.delete("/api/auth/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = usersStore.findIndex((u) => u.id === id);
  if (index !== -1) {
    const deleted = usersStore.splice(index, 1)[0];
    auditLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: "Admin",
      action: `Deleted user ${deleted.name} (${deleted.email})`,
      severity: "critical",
      ipAddress: "127.0.0.1"
    });
    return res.json({ success: true });
  }
  res.status(404).json({ error: "User not found" });
});

// ----------------------------------------------------
// CORE SATELLITE & DETECTION ROUTES
// ----------------------------------------------------

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
    version: "2.0.0",
    modulesCount: 8
  });
});

// Satellite presets list
app.get("/api/presets", (_req: Request, res: Response) => {
  res.json(SATELLITE_PRESETS);
});

// Database History (GET all)
app.get("/api/history", (req: Request, res: Response) => {
  const hazard = req.query.hazard as string | undefined;
  if (hazard && hazard !== "all" && hazard !== "All") {
    const filtered = dbStore.filter((r) => r.primaryHazard.toLowerCase() === hazard.toLowerCase());
    return res.json(filtered);
  }
  res.json(dbStore);
});

// Database History (DELETE by ID)
app.delete("/api/history/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const index = dbStore.findIndex((r) => r.id === id);
  if (index !== -1) {
    dbStore.splice(index, 1);
    return res.json({ success: true, remaining: dbStore.length });
  }
  res.status(404).json({ error: "Record not found" });
});

// Database History (CLEAR ALL)
app.delete("/api/history", (_req: Request, res: Response) => {
  dbStore.length = 0;
  res.json({ success: true, count: 0 });
});

// Stats summary
app.get("/api/stats", (_req: Request, res: Response) => {
  const totalScans = dbStore.length;
  let totalArea = 0;
  let criticalAlerts = 0;
  const breakdown: Record<string, number> = {};

  for (const item of dbStore) {
    totalArea += item.estimatedDamageAreaKm2 || 0;
    if (item.severityLevel === "Severe" || item.severityLevel === "Catastrophic" || item.immediateEvacuationNeed) {
      criticalAlerts++;
    }
    const type = item.primaryHazard || "Other";
    breakdown[type] = (breakdown[type] || 0) + 1;
  }

  res.json({
    totalScans,
    criticalAlerts,
    totalAreaMonitoredKm2: Math.round(totalArea * 10) / 10,
    hazardBreakdown: breakdown,
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Main AI Satellite Detection Endpoint
app.post("/api/detect", async (req: Request, res: Response) => {
  try {
    const {
      presetId,
      imageData, // base64 data URL
      imageUrl,
      locationName = "Target AOI (Area of Interest)",
      coordinates = { lat: 34.0522, lng: -118.2437 },
      satelliteSensor = "Sentinel-2 Multispectral Instrument (MSI)",
      disasterTypeHint = "Auto-Detect"
    } = req.body;

    const preset = presetId ? SATELLITE_PRESETS.find((p) => p.id === presetId) : null;
    let finalImageUrl = imageUrl || (preset ? preset.imageUrl : "");
    let base64Part: { inlineData: { data: string; mimeType: string } } | null = null;

    if (imageData && typeof imageData === "string" && imageData.startsWith("data:")) {
      finalImageUrl = imageData;
      const matches = imageData.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        base64Part = {
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        };
      }
    }

    const ai = getAI();

    if (ai && (base64Part || finalImageUrl)) {
      try {
        let imageInputPart = base64Part;

        if (!imageInputPart && finalImageUrl && finalImageUrl.startsWith("http")) {
          try {
            const fetchRes = await fetch(finalImageUrl);
            if (fetchRes.ok) {
              const arrayBuffer = await fetchRes.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              const contentType = fetchRes.headers.get("content-type") || "image/jpeg";
              imageInputPart = {
                inlineData: {
                  mimeType: contentType.split(";")[0],
                  data: buffer.toString("base64")
                }
              };
            }
          } catch (fetchErr) {
            console.warn("Could not download external image URL for Gemini:", fetchErr);
          }
        }

        if (imageInputPart) {
          const prompt = `You are an elite satellite remote sensing scientist and disaster response specialist AI.
Analyze this satellite or aerial earth observation image.

Context:
- Location / AOI: ${locationName}
- Coordinates: Latitude ${coordinates.lat}, Longitude ${coordinates.lng}
- Sensor: ${satelliteSensor}
- Disaster Hint: ${disasterTypeHint}

Output ONLY a valid JSON object matching this schema:
{
  "title": "Short descriptive title of the disaster assessment",
  "disasterType": "Scientific description of detected disaster",
  "primaryHazard": "One of: 'Wildfire', 'Flood', 'Earthquake', 'Cyclone', 'Landslide', 'Drought', 'Volcanic Eruption'",
  "severityLevel": "One of: 'Minimal', 'Moderate', 'Significant', 'Severe', 'Catastrophic'",
  "severityScore": integer 1 to 5,
  "confidenceScore": float 0.70 to 0.99,
  "estimatedDamageAreaKm2": estimated numerical area km²,
  "affectedStructuresCount": estimated integer count,
  "immediateEvacuationNeed": boolean,
  "detectionSummary": "Technical summary of spectral anomalies, burn scars, water masks, or structural collapse (3-4 sentences)",
  "environmentalImpact": "Impact on vegetation, water quality, air, or soil (2-3 sentences)",
  "identifiedZones": [
    {
      "id": "zone-1",
      "label": "Zone Name",
      "severity": "'critical' or 'warning' or 'advisory'",
      "bbox": [ymin, xmin, ymax, xmax] as percentage integers 0-100,
      "description": "Specific hazard observation"
    }
  ],
  "emergencyResponseRecommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ]
}`;

          const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [
              {
                role: "user",
                parts: [imageInputPart, { text: prompt }]
              }
            ],
            config: {
              responseMimeType: "application/json"
            }
          });

          const rawText = response.text || "{}";
          const cleanJson = rawText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
          const parsed = JSON.parse(cleanJson);

          const newResult: StoredRecord = {
            id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString(),
            title: parsed.title || `${parsed.primaryHazard || "Disaster"} Assessment`,
            locationName,
            coordinates,
            satelliteSensor,
            disasterType: parsed.disasterType || `${parsed.primaryHazard || "Anomaly"} Detected`,
            primaryHazard: (parsed.primaryHazard as DisasterType) || "Wildfire",
            severityLevel: (parsed.severityLevel as SeverityLevel) || "Moderate",
            severityScore: Number(parsed.severityScore) || 3,
            confidenceScore: Math.min(Math.max(Number(parsed.confidenceScore) || 0.88, 0.5), 0.99),
            estimatedDamageAreaKm2: Number(parsed.estimatedDamageAreaKm2) || 45.0,
            affectedStructuresCount: Number(parsed.affectedStructuresCount) || 120,
            immediateEvacuationNeed: Boolean(parsed.immediateEvacuationNeed),
            detectionSummary: parsed.detectionSummary || "Satellite optical imagery processed with spectral change detection.",
            environmentalImpact: parsed.environmentalImpact || "Vegetation index drop and localized environmental disruption observed.",
            identifiedZones: Array.isArray(parsed.identifiedZones) ? parsed.identifiedZones : [],
            emergencyResponseRecommendations: Array.isArray(parsed.emergencyResponseRecommendations)
              ? parsed.emergencyResponseRecommendations
              : ["Deploy reconnaissance team", "Monitor satellite pass in next 12 hours"],
            imageUrl: finalImageUrl,
            isAiGenerated: true
          };

          dbStore.unshift(newResult);
          return res.json(newResult);
        }
      } catch (geminiError) {
        console.warn("Gemini detection call failed, falling back to preset data:", geminiError);
      }
    }

    // Fallback: If preset was selected
    if (preset) {
      const fallback: StoredRecord = {
        id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toISOString(),
        imageUrl: preset.imageUrl,
        ...preset.fallbackResult,
        isAiGenerated: false
      };
      dbStore.unshift(fallback);
      return res.json(fallback);
    }

    // Fallback: Generic image
    const userFallbackHazard: DisasterType = disasterTypeHint === "Auto-Detect" ? "Flood" : (disasterTypeHint as DisasterType);
    const genericFallback: StoredRecord = {
      id: `scan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      title: `${userFallbackHazard} Satellite Assessment - ${locationName}`,
      locationName,
      coordinates,
      satelliteSensor,
      disasterType: `Multi-Spectral ${userFallbackHazard} Anomaly`,
      primaryHazard: userFallbackHazard,
      severityLevel: "Significant",
      severityScore: 3,
      confidenceScore: 0.91,
      estimatedDamageAreaKm2: 135.4,
      affectedStructuresCount: 310,
      immediateEvacuationNeed: true,
      detectionSummary: `Automated optical reflectance analysis indicates severe surface anomaly characteristic of ${userFallbackHazard.toLowerCase()} conditions.`,
      environmentalImpact: "Loss of topsoil stability, accelerated sediment runoff, and high risk to local drinking water reservoirs.",
      identifiedZones: [
        {
          id: "zone-1",
          label: `Primary ${userFallbackHazard} Impact Zone`,
          severity: "critical",
          bbox: [20, 25, 65, 75],
          description: `Concentrated damage corridor exhibiting stark contrast.`
        }
      ],
      emergencyResponseRecommendations: [
        "Deploy tactical emergency response teams to perimeter coordinate checkpoints.",
        "Establish aerial unmanned surveillance drone grid over the central quadrant."
      ],
      imageUrl: finalImageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80",
      isAiGenerated: false
    };

    dbStore.unshift(genericFallback);
    return res.json(genericFallback);
  } catch (err: any) {
    console.error("Error in /api/detect:", err);
    res.status(500).json({ error: "Detection analysis failed: " + (err.message || String(err)) });
  }
});

// ----------------------------------------------------
// INCIDENT RESPONSE & DISPATCH ROUTES (MODULE 4)
// ----------------------------------------------------

// Get all active incidents
app.get("/api/incidents", (_req: Request, res: Response) => {
  res.json(incidentsStore);
});

// Create new incident
app.post("/api/incidents", (req: Request, res: Response) => {
  const { title, location, hazardType, severity, coordinatorName = "Commander Sarah Vance" } = req.body;

  const newIncident: DisasterIncident = {
    id: `inc-${Date.now().toString().slice(-4)}`,
    title: title || `${hazardType} Response Protocol`,
    location: location || "Assigned AOI",
    hazardType: hazardType || "Wildfire",
    severity: severity || "Severe",
    status: "Active Response",
    reportedTime: new Date().toISOString(),
    evacuatedCount: 0,
    coordinatorName,
    priorityScore: severity === "Catastrophic" ? 95 : 80,
    dispatchedUnits: [
      {
        id: `unit-${Date.now()}-1`,
        name: "First-Response Recon Drone Team",
        type: "UAV Recon Drone",
        status: "Dispatched",
        assignedSector: "Grid Sector 1",
        personnelCount: 4
      }
    ]
  };

  incidentsStore.unshift(newIncident);
  res.json(newIncident);
});

// Dispatch new unit to an incident
app.post("/api/incidents/:id/dispatch", (req: Request, res: Response) => {
  const { id } = req.params;
  const { unitName, unitType, assignedSector, personnelCount = 12 } = req.body;

  const incident = incidentsStore.find((inc) => inc.id === id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  const newUnit: IncidentUnit = {
    id: `unit-${Date.now().toString().slice(-4)}`,
    name: unitName || `${unitType} Alpha`,
    type: unitType || "USAR Team",
    status: "Dispatched",
    assignedSector: assignedSector || "Main Impact Perimeter",
    personnelCount: Number(personnelCount) || 12
  };

  incident.dispatchedUnits.push(newUnit);

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: "Incident Commander",
    action: `Dispatched ${newUnit.name} (${newUnit.type}) to ${incident.title} [Sector: ${newUnit.assignedSector}]`,
    severity: "warning",
    ipAddress: "127.0.0.1"
  });

  res.json({ success: true, incident });
});

// Update incident status
app.patch("/api/incidents/:id/status", (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, evacuatedCount } = req.body;

  const incident = incidentsStore.find((inc) => inc.id === id);
  if (!incident) {
    return res.status(404).json({ error: "Incident not found" });
  }

  if (status) incident.status = status;
  if (typeof evacuatedCount === "number") incident.evacuatedCount = evacuatedCount;

  res.json({ success: true, incident });
});

// ----------------------------------------------------
// REAL-TIME INTERACTIVE AI CHATBOT (MODULE 6)
// ----------------------------------------------------
app.post("/api/chat", async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [], activeDisasterContext } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const ai = getAI();

    if (ai) {
      try {
        const systemInstruction = `You are Aegis-Orbital, an elite real-time AI Satellite Disaster Response Copilot.
You communicate directly with emergency commanders, remote sensing analysts, first responders, and citizens during natural disasters.

Your capabilities:
1. Explain satellite remote sensing imagery, spectral indices (NDVI, NDWI, SWIR false-color, SAR interferometry, thermal anomalies).
2. Triage natural disasters (wildfires, flash floods, earthquakes, hurricanes, volcanic eruptions).
3. Provide tactical incident response solutions: safe evacuation routes, containment firebreaks, sandbagging protocols, USAR structural collapse protocols, and hazmat containment.
4. Calculate buffer zones, safe coordinates, and population protection strategies.
5. Ground your answer in any currently active satellite mission assessment context.

Active Disaster Context (if any):
${activeDisasterContext ? JSON.stringify(activeDisasterContext, null, 2) : "No specific mission currently active. General operational readiness."}

Formatting guidelines:
- Be clear, authoritative, urgent when life-safety is concerned, and highly actionable.
- Use bold bullet points and technical precision.
- Offer 2-3 specific follow-up actions or questions at the end of your reply.`;

        // Format history for Gemini
        const formattedContents = conversationHistory
          .filter((msg: any) => msg.sender === "user" || msg.sender === "copilot")
          .map((msg: any) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.text }]
          }));

        // Append latest user message
        formattedContents.push({
          role: "user",
          parts: [{ text: message }]
        });

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: formattedContents,
          config: {
            systemInstruction
          }
        });

        const replyText = response.text || "Communication established. How can I assist with your disaster response mission?";

        return res.json({
          reply: replyText,
          timestamp: new Date().toISOString(),
          isAiGenerated: true
        });
      } catch (geminiChatErr) {
        console.warn("Gemini chat error, using expert fallback rule engine:", geminiChatErr);
      }
    }

    // Intelligent context-grounded fallback rule engine
    const lower = message.toLowerCase();
    let reply = "";
    let actionSuggestions: string[] = [];

    if (lower.includes("evacuat") || lower.includes("route") || lower.includes("safe")) {
      reply = `🚨 **Tactical Evacuation Protocol Advisory**\n\nBased on orbital telemetry, evacuation corridors must avoid prevailing downwind smoke plumes and low-lying river drainage basins.\n\n1. **Level 3 'GO NOW' Order**: In effect for sectors within 5km of the active perimeter.\n2. **Primary Ingress/Egress**: Use Federal Route 101 or Interstate High Ground bypasses. Secondary county unpaved bridges are flagged at risk of washouts.\n3. **Assembly Staging**: Head to Municipal Sports Complex (Coordinates: 39.75°N, 122.90°W).`;
      actionSuggestions = ["Dispatch emergency mass alert", "Map perimeter GPS coordinates", "Check air quality telemetry"];
    } else if (lower.includes("fire") || lower.includes("wildfire") || lower.includes("burn")) {
      reply = `🔥 **Wildfire Containment & Thermal Telemetry**\n\nMulti-spectral Sentinel-2 SWIR analysis reveals active crown fire advancing at ~3.2 km/h. \n\n- **Aerial Support**: Requesting DC-10 heavy retardant drop along ridge containment line.\n- **Wind Vector**: 24 knot gusts from SW; anticipate ember spotting up to 1.8km ahead of main flame front.\n- **Firebreak**: Deploy bulldozer crews to clear a 30-meter mineral soil buffer immediately.`;
      actionSuggestions = ["Target aerial water drop", "Deploy UAV thermal recon", "Issue civilian ember warning"];
    } else if (lower.includes("flood") || lower.includes("water") || lower.includes("submerg")) {
      reply = `🌊 **Flood Inundation & SAR Analysis**\n\nSynthetic Aperture Radar (Sentinel-1 SAR) indicates water penetration through regional levees, with standing water depth exceeding 2.2 meters.\n\n- **Water Potability Warning**: All municipal wells in the affected quadrant are contaminated; boil water notice mandatory.\n- **Extraction Fleet**: 4 amphibious hovercraft and 2 utility helicopters deployed for rooftop rescues.\n- **Critical Infrastructure**: Electrical substations 3 & 4 disconnected to prevent grid surges.`;
      actionSuggestions = ["Deploy amphibious rescue team", "Distribute reverse-osmosis purifiers", "Map submerged bridges"];
    } else if (lower.includes("earthquake") || lower.includes("collapse") || lower.includes("rubble")) {
      reply = `🏚️ **Urban Structural Collapse & USAR Protocol**\n\nHigh-resolution WorldView-3 optical change detection has pinpointed pancake collapses in multi-story residential blocks.\n\n- **Acoustic Search Priority**: Teams are utilizing seismic listening devices in Grid B2.\n- **Gas Pipeline Hazards**: Main city distribution valves shut off to avoid post-quake conflagrations.\n- **Aftershock Warning**: Mw 5.2+ aftershocks anticipated within 48 hours. Secure precariously tilted facades.`;
      actionSuggestions = ["Dispatch Heavy USAR Task Force", "Deploy canine search units", "Set up emergency field hospital"];
    } else if (lower.includes("sensor") || lower.includes("satellite") || lower.includes("orbit")) {
      reply = `🛰️ **Orbital Satellite Constellation Telemetry**\n\nCurrently tracking 6 operational Earth Observation spacecraft:\n- **Sentinel-2A/B**: 10m spatial resolution optical pass scheduled in 42 minutes.\n- **Landsat-9**: Multi-spectral thermal infrared (TIRS-2) active over quadrant.\n- **WorldView-3**: Re-tasking request approved for 0.31m ultra-high resolution panchromatic capture.\n\nWould you like to schedule an emergency priority retasking pass?`;
      actionSuggestions = ["Retask WorldView-3 to active AOI", "Download multispectral GeoTIFF", "Switch to SAR radar band"];
    } else {
      reply = `📡 **Aegis-Orbital Emergency Copilot Online**\n\nI am actively monitoring all satellite passes, incident dispatches, and hazard maps for your operational theater.\n\nYou can ask me to:\n- Analyze active evacuation zones and route safety\n- Interpret satellite spectral bands (SWIR fire fronts, NDWI floods, SAR radar)\n- Coordinate dispatch of USAR squads, aerial tankers, and medical clinics\n- Calculate disaster damage estimates and population impact`;
      actionSuggestions = ["Analyze active evacuation zones", "Wildfire containment tactics", "Flood contamination protocols", "Request satellite retasking"];
    }

    res.json({
      reply,
      timestamp: new Date().toISOString(),
      actionSuggestions,
      isAiGenerated: false
    });
  } catch (chatError: any) {
    console.error("Chat error:", chatError);
    res.status(500).json({ error: "Failed to process AI chat message: " + (chatError.message || String(chatError)) });
  }
});

// ----------------------------------------------------
// ADMIN PORTAL & SATELLITE CONSTELLATION (MODULE 8)
// ----------------------------------------------------

// Admin system overview
app.get("/api/admin/system", (_req: Request, res: Response) => {
  const activeIncidentsCount = incidentsStore.filter((i) => i.status !== "Resolved").length;
  const activeDispatchedPersonnel = incidentsStore.reduce((acc, curr) => {
    return acc + curr.dispatchedUnits.reduce((uAcc, u) => uAcc + u.personnelCount, 0);
  }, 0);

  res.json({
    sensors: constellationSensors,
    auditLogs: auditLogs.slice(0, 15),
    systemHealth: {
      serverUptime: "99.98%",
      apiLatencyMs: 48,
      activeWebSocketTelemetry: true,
      activeIncidentsCount,
      activeDispatchedPersonnel,
      totalRegisteredUsers: usersStore.length,
      storageUsedMb: 142.8
    }
  });
});

// Admin Retask Satellite Simulation
app.post("/api/admin/retask-satellite", (req: Request, res: Response) => {
  const { sensorId, targetCoordinates, targetName } = req.body;
  const sensor = constellationSensors.find((s) => s.id === sensorId);

  if (!sensor) {
    return res.status(404).json({ error: "Sensor not found in constellation" });
  }

  sensor.orbitStatus = "Re-tasking";
  sensor.nextPassTime = "Targeting AOI in 14 mins";

  auditLogs.unshift({
    id: `log-${Date.now()}`,
    timestamp: new Date().toISOString(),
    user: "Admin / Mission Commander",
    action: `Priority re-tasking command transmitted to ${sensor.name} targeting ${targetName || "Coordinates " + JSON.stringify(targetCoordinates)}`,
    severity: "critical",
    ipAddress: "127.0.0.1"
  });

  res.json({
    success: true,
    message: `Re-tasking telemetry packet verified for ${sensor.name}. High-priority imagery acquisition queued.`,
    sensor
  });
});

// ----------------------------------------------------
// VITE OR STATIC SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Satellite Disaster Detection server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
