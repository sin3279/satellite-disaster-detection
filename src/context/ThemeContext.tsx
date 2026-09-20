import React, { createContext, useContext, useState, useEffect } from "react";
import { isAudioEnabled, setAudioEnabled as setAudioGlobal, playTelemetryPing } from "../utils/audioEffects";

export type ThemeId = "orbital" | "tactical" | "emerald" | "crimson" | "aerospace";
export type VfxMode = "standard" | "scanlines" | "cyber-hud";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  category: "dark" | "light";
  primaryColor: string;
  glowColor: string;
  description: string;
}

export const THEMES: ThemeConfig[] = [
  {
    id: "orbital",
    name: "Orbital Cyan",
    category: "dark",
    primaryColor: "#06b6d4",
    glowColor: "rgba(6, 182, 212, 0.4)",
    description: "Deep space telemetry with cyan-blue orbital radar lines"
  },
  {
    id: "tactical",
    name: "Tactical Amber",
    category: "dark",
    primaryColor: "#f59e0b",
    glowColor: "rgba(245, 158, 11, 0.4)",
    description: "FLIR thermal & emergency operations high-contrast amber"
  },
  {
    id: "emerald",
    name: "Radar Matrix",
    category: "dark",
    primaryColor: "#10b981",
    glowColor: "rgba(16, 185, 129, 0.4)",
    description: "Military earth observation & bio-sentinel radar green"
  },
  {
    id: "crimson",
    name: "Crisis Crimson",
    category: "dark",
    primaryColor: "#f43f5e",
    glowColor: "rgba(244, 63, 94, 0.4)",
    description: "DEFCON-1 high-threat emergency disaster response"
  },
  {
    id: "aerospace",
    name: "Aerospace Light",
    category: "light",
    primaryColor: "#0284c7",
    glowColor: "rgba(2, 132, 199, 0.3)",
    description: "High-contrast clean daylight laboratory & aviation interface"
  }
];

interface ThemeContextType {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  vfxMode: VfxMode;
  setVfxMode: (m: VfxMode) => void;
  soundEnabled: boolean;
  setSoundEnabled: (s: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "orbital",
  setTheme: () => {},
  vfxMode: "standard",
  setVfxMode: () => {},
  soundEnabled: true,
  setSoundEnabled: () => {}
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    return (localStorage.getItem("satellite_theme") as ThemeId) || "orbital";
  });

  const [vfxMode, setVfxModeState] = useState<VfxMode>(() => {
    return (localStorage.getItem("satellite_vfx_mode") as VfxMode) || "standard";
  });

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(isAudioEnabled);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
    localStorage.setItem("satellite_theme", newTheme);
    playTelemetryPing(1000);
  };

  const setVfxMode = (mode: VfxMode) => {
    setVfxModeState(mode);
    localStorage.setItem("satellite_vfx_mode", mode);
    playTelemetryPing(750);
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    setAudioGlobal(enabled);
    if (enabled) playTelemetryPing(880);
  };

  useEffect(() => {
    // Apply theme class and data-theme to document element
    document.documentElement.setAttribute("data-theme", theme);
    document.body.className = `theme-${theme} ${theme === "aerospace" ? "light-mode" : "dark-mode"}`;
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        vfxMode,
        setVfxMode,
        soundEnabled,
        setSoundEnabled
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
