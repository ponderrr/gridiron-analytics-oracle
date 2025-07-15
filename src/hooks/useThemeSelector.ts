import { useTheme } from "@/contexts/ThemeContext";

/**
 * Custom hook for theme selection and toggling.
 * @returns {object} Theme state and handlers
 */
export function useThemeSelector() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  /**
   * Toggle between light and dark theme.
   */
  const toggleTheme = () => {
    const newTheme = effectiveTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  return {
    theme,
    setTheme,
    effectiveTheme,
    toggleTheme,
  };
}
