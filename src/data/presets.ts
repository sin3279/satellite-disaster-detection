import { SatellitePreset } from "../types";

export const SATELLITE_PRESETS: SatellitePreset[] = [
  {
    id: "california-wildfire-2020",
    title: "August Complex Wildfire - California",
    location: "Mendocino National Forest, CA",
    country: "United States",
    disasterType: "Wildfire",
    date: "September 2020",
    sensor: "Sentinel-2 MSI (SWIR/NIR Band Combination)",
    resolution: "10m Ground Sample Distance",
    coordinates: {
      lat: 39.8183,
      lng: -122.8686,
    },
    // High-resolution satellite view of massive wildfire smoke plumes and burn scar
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=300&q=80",
    description: "Multi-spectral Sentinel-2 satellite pass capturing active thermal fire fronts, severe pyro-cumulonimbus cloud generation, and rapid vegetation loss across 4,000+ square kilometers.",
    fallbackResult: {
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
        },
        {
          id: "zone-3",
          label: "Populated Valley Fringe",
          severity: "critical",
          bbox: [60, 68, 88, 92],
          description: "Residential settlement within direct trajectory of ember storm; urgent perimeter defense required."
        }
      ],
      emergencyResponseRecommendations: [
        "Issue immediate Level 3 'GO NOW' evacuation orders for grid sector C-4 and eastern drainage corridors.",
        "Dispatch heavy aerial tanker drops (DC-10 / 747 Supertanker) along Ridge Road containment firebreak.",
        "Establish Incident Command Post 25km south-southwest outside the prevailing downwind smoke plume.",
        "Activate real-time infrared drone reconnaissance to pinpoint hidden hot spots along the residential buffer."
      ]
    }
  },
  {
    id: "pakistan-floods-2022",
    title: "Indus River Basin Catastrophic Inundation",
    location: "Sindh & Balochistan Provinces",
    country: "Pakistan",
    disasterType: "Flood",
    date: "August 2022",
    sensor: "Landsat-9 OLI-2 (NDWI Normalized Water Index)",
    resolution: "15m Multi-spectral",
    coordinates: {
      lat: 26.8532,
      lng: 68.1256,
    },
    // High-resolution satellite view of submerged landscape and river overflows
    imageUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=1600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=300&q=80",
    description: "Orbital earth observation of the Indus River bursting banks, converting over one-third of the province into an inland sea, completely submerging agricultural districts.",
    fallbackResult: {
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
      detectionSummary: "Synthetic Aperture Radar (SAR) and NDWI water masking demonstrate standing water depths exceeding 2.5 meters across 12 contiguous districts. Major transportation corridors (N-5 Highway) breached at 14 distinct coordinates.",
      environmentalImpact: "Complete destruction of cotton and rice crops. High contamination risk of municipal aquifer wells, stagnation-driven waterborne epidemics imminent.",
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
        },
        {
          id: "zone-3",
          label: "Stranded Population Pockets (High Ground)",
          severity: "warning",
          bbox: [68, 55, 90, 85],
          description: "Cut off from overland supply chains; reachable solely via amphibian transport or helicopter drops."
        }
      ],
      emergencyResponseRecommendations: [
        "Deploy amphibious relief vessels and military utility helicopters for trapped island communities.",
        "Mobilize mobile reverse-osmosis water purification units and waterborne disease vaccination stockpiles.",
        "Establish controlled siphon breach points to divert flood surge away from remaining high-density urban levees.",
        "Distribute emergency satellite SOS beacons to isolated medical relief clinics."
      ]
    }
  },
  {
    id: "turkey-earthquake-2023",
    title: "Kahramanmaraş Mega-Earthquake Epicenter",
    location: "Antakya / Kahramanmaraş Region",
    country: "Turkey",
    disasterType: "Earthquake",
    date: "February 2023",
    sensor: "WorldView-3 / PlanetScope Very-High-Resolution",
    resolution: "0.5m Optical Panchromatic Sharpened",
    coordinates: {
      lat: 37.5753,
      lng: 36.9228,
    },
    imageUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=300&q=80",
    description: "Sub-meter commercial satellite reconnaissance showing severe structural pancake collapses, fault surface rupture displacement, and urban grid disruption following Mw 7.8 mainshock.",
    fallbackResult: {
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
      detectionSummary: "Optical change detection against baseline pre-event imagery indicates catastrophic pancake collapse across 68 multi-story residential blocks. Fault rupture trace visible with ~3.4m lateral strike-slip displacement.",
      environmentalImpact: "Ruptured natural gas distribution pipelines sparking localized urban fires. Destruction of municipal potable water trunk lines and seismic liquefaction along alluvial riverbanks.",
      identifiedZones: [
        {
          id: "zone-1",
          label: "Total Structural Collapse District",
          severity: "critical",
          bbox: [25, 20, 60, 65],
          description: "High-density multi-story residential collapse zone; urgent Urban Search & Rescue (USAR) priority."
        },
        {
          id: "zone-2",
          label: "East Anatolian Fault Line Rupture",
          severity: "critical",
          bbox: [5, 45, 95, 55],
          description: "Visible surface offset intersecting runway infrastructure and arterial highway."
        },
        {
          id: "zone-3",
          label: "Emergency Staging & Triage Open Ground",
          severity: "advisory",
          bbox: [68, 12, 92, 40],
          description: "Geotechnically stable municipal stadium grounds suitable for field hospitals and tent cities."
        }
      ],
      emergencyResponseRecommendations: [
        "Direct international Heavy USAR teams equipped with acoustic listening probes and thermal cameras to Zone 1.",
        "Shut off regional high-pressure natural gas supply valves to arrest post-earthquake conflagrations.",
        "Establish seismic aftershock monitoring array to warn first responders working in precariously tilted buildings.",
        "Clear obstructed airport taxiway debris to re-open rapid humanitarian airlift corridors."
      ]
    }
  },
  {
    id: "hurricane-ian-2022",
    title: "Hurricane Ian Landfall & Storm Surge",
    location: "Sanibel Island / Fort Myers Beach, FL",
    country: "United States",
    disasterType: "Cyclone",
    date: "September 2022",
    sensor: "NOAA-20 VIIRS / Sentinel-2 Visible",
    resolution: "10m Optical & Thermal Radiometer",
    coordinates: {
      lat: 26.4490,
      lng: -82.0224,
    },
    imageUrl: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=1600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=300&q=80",
    description: "Category 4 tropical cyclone landfall bringing a 4.5-meter catastrophic storm surge, tearing away barrier island bridge connections and scouring coastal infrastructure.",
    fallbackResult: {
      title: "Hurricane Ian Coastal Surge Impact Analysis",
      locationName: "Sanibel & Fort Myers Beach, FL",
      coordinates: { lat: 26.4490, lng: -82.0224 },
      satelliteSensor: "NOAA-20 VIIRS + Sentinel-2",
      disasterType: "Category 4 Hurricane & Extreme Storm Surge",
      primaryHazard: "Cyclone",
      severityLevel: "Severe",
      severityScore: 4,
      confidenceScore: 0.95,
      estimatedDamageAreaKm2: 580.2,
      affectedStructuresCount: 8900,
      immediateEvacuationNeed: true,
      detectionSummary: "Post-storm satellite multispectral imagery reveals widespread overwash fans, total destruction of barrier island causeway sections, and deep marine sediment deposition extending 1.2km inland.",
      environmentalImpact: "Severe beach dune erosion, saltwater intrusion into shallow freshwater wetlands, thousands of metric tons of hazardous marine debris deposited into residential canals.",
      identifiedZones: [
        {
          id: "zone-1",
          label: "Severed Causeway & Island Isolation",
          severity: "critical",
          bbox: [35, 45, 60, 75],
          description: "Sanibel Causeway structural span collapse, eliminating overland emergency access."
        },
        {
          id: "zone-2",
          label: "Frontline Coastal Surge Scour Zone",
          severity: "critical",
          bbox: [50, 15, 88, 55],
          description: "Complete scouring of beachfront structures with debris piled across inland drainage."
        },
        {
          id: "zone-3",
          label: "Grid Failure & Back-Bay Flooding",
          severity: "warning",
          bbox: [12, 18, 45, 48],
          description: "Persistent 1.2m tidal water entrapment in low-gradient subdivisions."
        }
      ],
      emergencyResponseRecommendations: [
        "Initiate helicopter and marine vessel extraction for trapped barrier island residents.",
        "Mobilize Florida National Guard temporary pontoon bridging units to reconnect severed road links.",
        "Enforce strict curfews to deter looting and prevent electrocution from submerged energized power equipment.",
        "Dispatch environmental hazmat cleanup teams to contain leaking marine fuel docks and sewage overflows."
      ]
    }
  },
  {
    id: "lahaina-fire-2023",
    title: "Lahaina Coastal Wildfire & Town Destruction",
    location: "Lahaina, Maui, Hawaii",
    country: "United States",
    disasterType: "Wildfire",
    date: "August 2023",
    sensor: "Maxar WorldView-2 / Landsat-8",
    resolution: "0.5m High Resolution",
    coordinates: {
      lat: 20.8783,
      lng: -156.6825,
    },
    imageUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=300&q=80",
    description: "Rapidly propagating hurricane-fueled brushfire sweeping downhill into historic coastal settlement, destroying over 2,200 structures in under 6 hours.",
    fallbackResult: {
      title: "Lahaina Town Fire Damage Assessment",
      locationName: "Lahaina, Maui, HI",
      coordinates: { lat: 20.8783, lng: -156.6825 },
      satelliteSensor: "Maxar WorldView-2 (0.46m Pan-sharpened)",
      disasterType: "Urban-Wildland Interface Fire Storm",
      primaryHazard: "Wildfire",
      severityLevel: "Catastrophic",
      severityScore: 5,
      confidenceScore: 0.97,
      estimatedDamageAreaKm2: 12.8,
      affectedStructuresCount: 2207,
      immediateEvacuationNeed: true,
      detectionSummary: "Complete thermal destruction of historic commercial core and contiguous residential neighborhoods. High-resolution orthomosaics display foundation-only remains and scorched harbor waterfront.",
      environmentalImpact: "Toxic ash containing lead, arsenic, and asbestos washed into nearshore coral reef ecosystems during subsequent precipitation events.",
      identifiedZones: [
        {
          id: "zone-1",
          label: "Historic Core Incineration Perimeter",
          severity: "critical",
          bbox: [28, 22, 75, 68],
          description: "Over 85% structural destruction rate; high density of hazardous building materials."
        },
        {
          id: "zone-2",
          label: "Harbor & Offshore Vessel Burn Zone",
          severity: "warning",
          bbox: [55, 65, 85, 92],
          description: "Dozens of charred vessels and fuel slicks floating in the harbor basin."
        },
        {
          id: "zone-3",
          label: "Bypass Highway Choke Point",
          severity: "warning",
          bbox: [10, 15, 35, 45],
          description: "Severely congested evacuation artery flanked by downed power transmission lines."
        }
      ],
      emergencyResponseRecommendations: [
        "Deploy EPA hazardous material containment teams to seal toxic ash piles before ocean runoff occurs.",
        "Establish DNA identification center and forensic search teams for disaster victim recovery.",
        "Install silt fencing and ocean-containment booms along the Lahaina harbor and Front Street shoreline.",
        "Restore secure satellite telecommunications backhaul for emergency responders and displaced families."
      ]
    }
  },
  {
    id: "etna-volcano-2023",
    title: "Mount Etna Volcanic Ash & Lava Effusion",
    location: "Sicily",
    country: "Italy",
    disasterType: "Volcanic Eruption",
    date: "August 2023",
    sensor: "Sentinel-3 SLSTR Thermal Infrared",
    resolution: "300m Thermal Band",
    coordinates: {
      lat: 37.7510,
      lng: 14.9934,
    },
    imageUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=80",
    thumbnailUrl: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=300&q=80",
    description: "Active paroxysm producing 10km ash column, thermal radiance anomalies exceeding 1,200 MW, and lava flows descending the Valle del Bove.",
    fallbackResult: {
      title: "Mount Etna Volcanic Paroxysm Telemetry",
      locationName: "Catania / Mount Etna, Sicily",
      coordinates: { lat: 37.7510, lng: 14.9934 },
      satelliteSensor: "Sentinel-3 SLSTR + Meteosat SEVIRI",
      disasterType: "Volcanic Eruption & Pyroclastic Ash Cloud",
      primaryHazard: "Volcanic Eruption",
      severityLevel: "Significant",
      severityScore: 3,
      confidenceScore: 0.93,
      estimatedDamageAreaKm2: 85.0,
      affectedStructuresCount: 45,
      immediateEvacuationNeed: false,
      detectionSummary: "Thermal infrared sensors detect intense lava effusion along the southeast crater fissure. Plume tracking shows high SO2 concentrations drifting east-southeast toward Catania International Airport (CTA).",
      environmentalImpact: "Heavy tephra fallout covering metropolitan roads in 2-5cm basaltic ash. Air quality degradation and grounding of regional civilian airspace.",
      identifiedZones: [
        {
          id: "zone-1",
          label: "Active Lava Effusion Channel",
          severity: "critical",
          bbox: [35, 40, 65, 68],
          description: "Active basaltic lava flow front descending within uninhabited Valle del Bove depression."
        },
        {
          id: "zone-2",
          label: "Aviation Hazard Ash Plume Corridor",
          severity: "warning",
          bbox: [10, 50, 40, 95],
          description: "High-altitude ash cloud (FL280) drifting over commercial flight corridors."
        },
        {
          id: "zone-3",
          label: "Urban Ash Deposition Sector",
          severity: "advisory",
          bbox: [68, 55, 95, 88],
          description: "Heavy ash fall on municipal infrastructure causing road slippage and drainage clogging."
        }
      ],
      emergencyResponseRecommendations: [
        "Issue aviation NOTAM and divert flights away from Catania and eastern Sicilian airspace.",
        "Distribute P2/N95 respiratory masks to populations in downwind tephra fallout zones.",
        "Implement municipal 30 km/h vehicle speed limits to prevent multi-car pileups on ash-slicked highways.",
        "Activate continuous infrasound and ground deformation tiltmeter monitoring for crater wall collapse."
      ]
    }
  }
];
