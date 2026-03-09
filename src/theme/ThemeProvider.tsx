import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { PaperProvider } from "react-native-paper";
import { createAppTheme } from "./index";
import { useChurchStore } from "../stores/useChurchStore";
import AsyncStorage from "@react-native-async-storage/async-storage";

type ThemeType = "light" | "dark";

interface ThemeContextType {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "light", toggleTheme: () => {} });

export const useThemeContext = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeType>("light");
  const appTheme = useChurchStore(state => state.appTheme);

  // Load saved theme preference
  React.useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme as ThemeType);
        }
      } catch (error) {
        console.error("Error loading theme:", error);
      }
    };
    loadTheme();
  }, []);

  // Toggle theme and save preference
  const toggleTheme = useCallback(async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme);
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  }, [theme]);

  // Build Paper theme dynamically based on mode + church colors
  const paperTheme = useMemo(
    () => createAppTheme(theme, appTheme?.[theme] || null),
    [theme, appTheme]
  );

  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      <PaperProvider theme={paperTheme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};
