import React, { useRef } from "react";
import { Upload, Image as ImageIcon, MapPin, Compass, Sparkles, AlertCircle } from "lucide-react";
import { DisasterType } from "../types";

interface ImageUploaderProps {
  customImage: string | null;
  onImageUploaded: (base64: string) => void;
  onClearCustomImage: () => void;
  locationName: string;
  setLocationName: (val: string) => void;
  coordinates: { lat: number; lng: number };
  setCoordinates: (coords: { lat: number; lng: number }) => void;
  disasterTypeHint: DisasterType;
  setDisasterTypeHint: (val: DisasterType) => void;
  sensor: string;
  setSensor: (val: string) => void;
  isLoading: boolean;
  onRunDetection: () => void;
}

const DISASTER_TYPES: DisasterType[] = [
  "Auto-Detect",
  "Wildfire",
  "Flood",
  "Earthquake",
  "Cyclone",
  "Landslide",
  "Volcanic Eruption",
  "Drought"
];

const SENSOR_PRESETS = [
  "Sentinel-2 MSI (Multispectral 10m)",
  "Landsat-9 OLI-2 / TIRS-2 (15m/30m)",
  "WorldView-3 / PlanetScope (0.3m-3m VHR)",
  "NOAA-20 / VIIRS Day-Night Band",
  "Sentinel-1 SAR (C-Band Radar)",
  "MODIS Terra/Aqua (250m Surface Reflectance)"
];

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  customImage,
  onImageUploaded,
  onClearCustomImage,
  locationName,
  setLocationName,
  coordinates,
  setCoordinates,
  disasterTypeHint,
  setDisasterTypeHint,
  sensor,
  setSensor,
  isLoading,
  onRunDetection
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPEG, WebP, or GeoTIFF preview).");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onImageUploaded(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div id="satellite-mission-config" className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
          <Upload className="w-4 h-4 text-cyan-400" />
          <span>Upload Satellite Reconnaissance Scan</span>
        </h3>
        {customImage && (
          <button
            type="button"
            onClick={onClearCustomImage}
            className="text-xs text-slate-400 hover:text-rose-400 transition-colors"
          >
            Clear Upload
          </button>
        )}
      </div>

      {/* Upload Dropzone */}
      <div
        id="image-dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
          customImage
            ? "border-cyan-500/50 bg-cyan-950/20"
            : "border-slate-700/80 hover:border-cyan-500/60 bg-slate-950/40 hover:bg-slate-950/70"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {customImage ? (
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-700 bg-slate-900 shrink-0">
              <img src={customImage} alt="Uploaded custom scan" className="w-full h-full object-cover" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-semibold text-cyan-300 truncate">Custom Satellite Image Staged</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Ready for multi-spectral disaster analysis</p>
              <p className="text-[10px] text-slate-500 font-mono mt-1">Click to replace imagery file</p>
            </div>
          </div>
        ) : (
          <div className="py-2 space-y-1.5">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-cyan-400 flex items-center justify-center mx-auto mb-2">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-slate-200">
              Drag and drop satellite imagery or <span className="text-cyan-400 underline">browse files</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Supports RGB True-Color, NIR/SWIR False-Color, SAR, and Orthomosaic GeoTIFF previews (PNG, JPG, WebP)
            </p>
          </div>
        )}
      </div>

      {/* Sensor and AOI Metadata Inputs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Disaster Type Hint */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Hazard Category / Hint
          </label>
          <select
            id="disaster-type-select"
            value={disasterTypeHint}
            onChange={(e) => setDisasterTypeHint(e.target.value as DisasterType)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {DISASTER_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Satellite Sensor Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
            Satellite Sensor / Platform
          </label>
          <select
            id="satellite-sensor-select"
            value={sensor}
            onChange={(e) => setSensor(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            {SENSOR_PRESETS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* AOI Location Name */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-cyan-400" />
            <span>Target Location / AOI</span>
          </label>
          <input
            id="location-input"
            type="text"
            value={locationName}
            onChange={(e) => setLocationName(e.target.value)}
            placeholder="e.g. Valencia Flood Sector 4"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Coordinates Latitude / Longitude */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>Coordinates (Lat, Lng)</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              id="lat-input"
              type="number"
              step="0.0001"
              value={coordinates.lat}
              onChange={(e) => setCoordinates({ ...coordinates, lat: parseFloat(e.target.value) || 0 })}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              placeholder="Latitude"
            />
            <input
              id="lng-input"
              type="number"
              step="0.0001"
              value={coordinates.lng}
              onChange={(e) => setCoordinates({ ...coordinates, lng: parseFloat(e.target.value) || 0 })}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
              placeholder="Longitude"
            />
          </div>
        </div>
      </div>

      {/* Execute Analysis Trigger */}
      <div className="pt-2">
        <button
          id="run-detection-btn"
          type="button"
          disabled={isLoading}
          onClick={onRunDetection}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Analyzing Multi-Spectral Satellite Data...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Launch AI Disaster Detection</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
