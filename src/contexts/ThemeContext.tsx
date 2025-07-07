import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  effectiveTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme;
    return savedTheme || "dark";
  });

  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(
    "dark"
  );

  useEffect(() => {
    const updateEffectiveTheme = () => {
      let newEffectiveTheme: "light" | "dark" = "dark";

      if (theme === "system") {
        newEffectiveTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
      } else {
        newEffectiveTheme = theme;
      }

      setEffectiveTheme(newEffectiveTheme);

      // Apply theme to document
      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(newEffectiveTheme);

      // Update CSS custom properties
      if (newEffectiveTheme === "light") {
        document.documentElement.style.setProperty(
          "--theme-bg-primary",
          "#ffffff"
        );
        document.documentElement.style.setProperty(
          "--theme-bg-secondary",
          "#f8fafc"
        );
        document.documentElement.style.setProperty(
          "--theme-bg-tertiary",
          "#f1f5f9"
        );
        document.documentElement.style.setProperty(
          "--theme-bg-card",
          "#ffffff"
        );
        document.documentElement.style.setProperty(
          "--theme-bg-sidebar",
          "#f8fafc"
        );
        document.documentElement.style.setProperty(
          "--theme-text-primary",
          "#0f172a"
        );
        document.documentElement.style.setProperty(
          "--theme-text-secondary",
          "#475569"
        );
        document.documentElement.style.setProperty(
          "--theme-text-tertiary",
          "#64748b"
        );
        document.documentElement.style.setProperty("--theme-border", "#e2e8f0");
        document.documentElement.style.setProperty(
          "--theme-border-hover",
          "#cbd5e1"
        );
        document.documentElement.style.setProperty(
          "--theme-shadow",
          "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
        );
      } else {
        document.documentElement.style.setProperty(
          "--theme-bg-primary",
          "#0f172a"
        );
        document.documentElement.style.setProperty(
          "--theme-bg-secondary",
          "#1e293b"
        );
        document.documentElement.style.setProperty(
          "--theme-bg-tertiary",
          "#334155"
        );
        document.documentElement.style.setProperty(
          "--theme-bg-card",
          "#1e293b"
        );
        document.documentElement.style.setProperty(
          "--theme-bg-sidebar",
          "#0f172a"
        );
        document.documentElement.style.setProperty(
          "--theme-text-primary",
          "#f8fafc"
        );
        document.documentElement.style.setProperty(
          "--theme-text-secondary",
          "#cbd5e1"
        );
        document.documentElement.style.setProperty(
          "--theme-text-tertiary",
          "#94a3b8"
        );
        document.documentElement.style.setProperty("--theme-border", "#334155");
        document.documentElement.style.setProperty(
          "--theme-border-hover",
          "#475569"
        );
        document.documentElement.style.setProperty(
          "--theme-shadow",
          "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
        );
      }
    };

    updateEffectiveTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemThemeChange = () => {
      if (theme === "system") {
        updateEffectiveTheme();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleSystemThemeChange);
    }
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      } else if (mediaQuery.removeListener) {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, [theme]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const toggleTheme = () => {
    const newTheme = effectiveTheme === "dark" ? "light" : "dark";
    handleSetTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        setTheme: handleSetTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export { ThemeContext };
