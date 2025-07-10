export const ENHANCED_THEME_SYSTEM = {
  // Consistent spacing scale
  SPACING: {
    xs: "0.25rem", // 4px
    sm: "0.5rem", // 8px
    md: "1rem", // 16px
    lg: "1.5rem", // 24px
    xl: "2rem", // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },

  // Typography system
  TYPOGRAPHY: {
    FONT_FAMILIES: {
      primary: '"Inter", system-ui, sans-serif',
      mono: '"JetBrains Mono", "Monaco", monospace',
    },
    FONT_WEIGHTS: {
      light: "300",
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
    FONT_SIZES: {
      xs: "0.75rem", // 12px
      sm: "0.875rem", // 14px
      base: "1rem", // 16px
      lg: "1.125rem", // 18px
      xl: "1.25rem", // 20px
      "2xl": "1.5rem", // 24px
      "3xl": "1.875rem", // 30px
      "4xl": "2.25rem", // 36px
    },
    LINE_HEIGHTS: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
  },

  // Enhanced color system
  COLORS: {
    LIGHT: {
      // Primary backgrounds
      bg_primary: "#ffffff",
      bg_secondary: "#f8fafc",
      bg_tertiary: "#f1f5f9",
      bg_card: "#ffffff",
      bg_accent: "#f0f9ff",

      // Text colors
      text_primary: "#0f172a",
      text_secondary: "#475569",
      text_tertiary: "#64748b",
      text_muted: "#94a3b8",

      // Borders and dividers
      border_primary: "#e2e8f0",
      border_secondary: "#cbd5e1",
      border_accent: "#3b82f6",

      // Interactive states
      hover_bg: "#f1f5f9",
      focus_ring: "#3b82f6",
      active_bg: "#e0f2fe",
    },
    DARK: {
      // Primary backgrounds
      bg_primary: "#0f172a",
      bg_secondary: "#1e293b",
      bg_tertiary: "#334155",
      bg_card: "#1e293b",
      bg_accent: "#1e293b",

      // Text colors
      text_primary: "#f8fafc",
      text_secondary: "#cbd5e1",
      text_tertiary: "#94a3b8",
      text_muted: "#64748b",

      // Borders and dividers
      border_primary: "#334155",
      border_secondary: "#475569",
      border_accent: "#3b82f6",

      // Interactive states
      hover_bg: "#334155",
      focus_ring: "#3b82f6",
      active_bg: "#1e40af",
    },

    // Semantic colors (theme-agnostic)
    SEMANTIC: {
      success: "#10b981",
      warning: "#f59e0b",
      error: "#ef4444",
      info: "#3b82f6",

      success_bg: "rgba(16, 185, 129, 0.1)",
      warning_bg: "rgba(245, 158, 11, 0.1)",
      error_bg: "rgba(239, 68, 68, 0.1)",
      info_bg: "rgba(59, 130, 246, 0.1)",
    },
  },

  // Shadow system
  SHADOWS: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  // Border radius system
  RADIUS: {
    sm: "0.25rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    "2xl": "1.5rem",
    full: "9999px",
  },

  // Component-specific variables
  COMPONENTS: {
    BUTTON: {
      height_sm: "2rem",
      height_md: "2.5rem",
      height_lg: "3rem",
      padding_x_sm: "0.75rem",
      padding_x_md: "1rem",
      padding_x_lg: "1.5rem",
    },
    CARD: {
      padding_sm: "1rem",
      padding_md: "1.5rem",
      padding_lg: "2rem",
      border_radius: "0.75rem",
    },
    INPUT: {
      height: "2.5rem",
      padding_x: "0.75rem",
      border_radius: "0.5rem",
    },
  },
};

// Helper function to get theme-aware CSS variables
export const getThemeVariables = (theme: "light" | "dark") => {
  const colors =
    ENHANCED_THEME_SYSTEM.COLORS[theme.toUpperCase() as "LIGHT" | "DARK"];

  return {
    // CSS custom properties
    "--color-bg-primary": colors.bg_primary,
    "--color-bg-secondary": colors.bg_secondary,
    "--color-bg-tertiary": colors.bg_tertiary,
    "--color-bg-card": colors.bg_card,
    "--color-bg-accent": colors.bg_accent,

    "--color-text-primary": colors.text_primary,
    "--color-text-secondary": colors.text_secondary,
    "--color-text-tertiary": colors.text_tertiary,
    "--color-text-muted": colors.text_muted,

    "--color-border-primary": colors.border_primary,
    "--color-border-secondary": colors.border_secondary,
    "--color-border-accent": colors.border_accent,

    "--color-hover-bg": colors.hover_bg,
    "--color-focus-ring": colors.focus_ring,
    "--color-active-bg": colors.active_bg,

    // Spacing
    ...Object.entries(ENHANCED_THEME_SYSTEM.SPACING).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [`--spacing-${key}`]: value,
      }),
      {}
    ),

    // Typography
    "--font-primary": ENHANCED_THEME_SYSTEM.TYPOGRAPHY.FONT_FAMILIES.primary,
    "--font-mono": ENHANCED_THEME_SYSTEM.TYPOGRAPHY.FONT_FAMILIES.mono,

    // Shadows
    ...Object.entries(ENHANCED_THEME_SYSTEM.SHADOWS).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [`--shadow-${key}`]: value,
      }),
      {}
    ),

    // Border radius
    ...Object.entries(ENHANCED_THEME_SYSTEM.RADIUS).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [`--radius-${key}`]: value,
      }),
      {}
    ),
  };
};
