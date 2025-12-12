/**
 * Theme Configuration Schema (TCS)
 * A JSON-based schema for storing comprehensive CV theme configurations
 * Supports both global and section-level customization
 */

export interface PhotoStyle {
  position: "left" | "right" | "center" | "top-left" | "top-right" | "top-center";
  size: "small" | "medium" | "large" | "xl";
  shape: "circle" | "square" | "rounded" | "hexagon";
  borderWidth: number;
  borderColor: string;
  borderStyle: "solid" | "dashed" | "double" | "none";
  shadow: "none" | "sm" | "md" | "lg" | "xl";
  grayscale: boolean;
}

export interface SectionThemeOverride {
  sectionId: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    text?: string;
    border?: string;
  };
  typography?: {
    titleSize?: number;
    titleFont?: string;
    titleTransform?: "none" | "uppercase" | "capitalize" | "lowercase";
    bodySize?: number;
    bodyFont?: string;
  };
  layout?: {
    padding?: string;
    spacing?: string;
    columns?: number;
  };
  style?: {
    background?: "solid" | "gradient" | "pattern" | "none";
    borderStyle?: "none" | "solid" | "dashed" | "dotted";
    borderWidth?: number;
    borderRadius?: number;
    showIcon?: boolean;
    iconPosition?: "left" | "top" | "inline";
  };
}

export interface ThemeConfiguration {
  id: string;
  name: string;
  description?: string;
  author?: string;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Global theme settings
  global: {
    colors: {
      primary: string;
      primaryLight: string;
      primaryDark: string;
      secondary: string;
      accent: string;
      textPrimary: string;
      textSecondary: string;
      background: string;
      surface: string;
      border: string;
    };
    typography: {
      nameSize: number;
      sectionTitleSize: number;
      entryTitleSize: number;
      bodySize: number;
      smallSize: number;
      headingFont?: string;
      bodyFont?: string;
      lineHeight?: number;
      letterSpacing?: string;
      headingTransform?: "none" | "uppercase" | "capitalize" | "lowercase";
    };
    layout: {
      sectionPadding: number;
      sectionSpacing: number;
      itemSpacing: number;
      pagePadding: string;
      maxWidth: string;
      columns?: number;
      columnGap?: string;
    };
    style: {
      borderRadius: number;
      sectionStyle: "filled" | "outlined" | "minimal";
      useIcons: boolean;
      iconStyle?: "outline" | "filled" | "duotone";
      sectionDividers: boolean;
      dividerStyle?: "solid" | "dashed" | "dotted" | "double";
      skillPills: boolean;
      headingStyle: "bold" | "underline" | "background";
      dateFormat: "short" | "long" | "numeric";
      headerStyle?: "compact" | "expanded" | "centered";
      cardStyle?: "flat" | "raised" | "bordered";
    };
  };
  
  // Photo/Profile image customization
  photo: PhotoStyle;
  
  // Header layout customization
  header: {
    layout: "traditional" | "modern" | "minimal" | "split" | "centered";
    showPhoto: boolean;
    photoPosition: "left" | "right" | "top" | "center";
    backgroundColor?: string;
    textColor?: string;
    padding?: string;
    alignment?: "left" | "center" | "right";
  };
  
  // Section-specific overrides
  sectionOverrides: {
    [sectionId: string]: SectionThemeOverride;
  };
  
  // Layout configuration
  layoutId?: string; // Reference to CVLayout
  
  // Export settings (for PDF)
  export: {
    pageSize: "A4" | "Letter" | "Legal";
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    fontSize: number;
    lineHeight: number;
    colors: boolean; // Color or grayscale PDF
  };
}

/**
 * Default theme configuration
 */
export const DEFAULT_THEME_CONFIG: ThemeConfiguration = {
  id: "default",
  name: "Default Professional",
  description: "Clean and professional default theme",
  version: "1.0.0",
  
  global: {
    colors: {
      primary: "#2563eb",
      primaryLight: "#3b82f6",
      primaryDark: "#1e40af",
      secondary: "#64748b",
      accent: "#10b981",
      textPrimary: "#1f2937",
      textSecondary: "#6b7280",
      background: "#ffffff",
      surface: "#f9fafb",
      border: "#e5e7eb",
    },
    typography: {
      nameSize: 32,
      sectionTitleSize: 18,
      entryTitleSize: 16,
      bodySize: 14,
      smallSize: 12,
      headingFont: "Inter, system-ui, sans-serif",
      bodyFont: "Inter, system-ui, sans-serif",
      lineHeight: 1.6,
      letterSpacing: "0",
      headingTransform: "none",
    },
    layout: {
      sectionPadding: 16,
      sectionSpacing: 24,
      itemSpacing: 12,
      pagePadding: "32px",
      maxWidth: "850px",
      columns: 1,
      columnGap: "24px",
    },
    style: {
      borderRadius: 8,
      sectionStyle: "minimal",
      useIcons: true,
      iconStyle: "outline",
      sectionDividers: true,
      dividerStyle: "solid",
      skillPills: true,
      headingStyle: "bold",
      dateFormat: "short",
      headerStyle: "compact",
      cardStyle: "flat",
    },
  },
  
  photo: {
    position: "top-left",
    size: "medium",
    shape: "circle",
    borderWidth: 2,
    borderColor: "#2563eb",
    borderStyle: "solid",
    shadow: "md",
    grayscale: false,
  },
  
  header: {
    layout: "modern",
    showPhoto: true,
    photoPosition: "left",
    backgroundColor: "#ffffff",
    textColor: "#1f2937",
    padding: "24px",
    alignment: "left",
  },
  
  sectionOverrides: {},
  
  layoutId: "classic-single",
  
  export: {
    pageSize: "A4",
    margins: {
      top: 40,
      right: 40,
      bottom: 40,
      left: 40,
    },
    fontSize: 10,
    lineHeight: 1.5,
    colors: true,
  },
};

/**
 * Merge section override with global theme
 */
export function mergeSectionTheme(
  globalTheme: ThemeConfiguration,
  sectionId: string
): ThemeConfiguration {
  const override = globalTheme.sectionOverrides[sectionId];
  if (!override) return globalTheme;

  return {
    ...globalTheme,
    global: {
      colors: { ...globalTheme.global.colors, ...override.colors },
      typography: { ...globalTheme.global.typography, ...override.typography },
      layout: { ...globalTheme.global.layout, ...override.layout },
      style: { ...globalTheme.global.style, ...override.style },
    },
  };
}

/**
 * Save theme configuration to JSON
 */
export function serializeTheme(theme: ThemeConfiguration): string {
  return JSON.stringify(theme, null, 2);
}

/**
 * Load theme configuration from JSON
 */
export function deserializeTheme(json: string): ThemeConfiguration {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("Failed to parse theme configuration:", error);
    return DEFAULT_THEME_CONFIG;
  }
}

/**
 * Get photo size in pixels
 */
export function getPhotoSize(size: PhotoStyle["size"]): number {
  switch (size) {
    case "small": return 64;
    case "medium": return 96;
    case "large": return 128;
    case "xl": return 160;
    default: return 96;
  }
}

/**
 * Get shadow CSS class
 */
export function getPhotoShadow(shadow: PhotoStyle["shadow"]): string {
  switch (shadow) {
    case "sm": return "shadow-sm";
    case "md": return "shadow-md";
    case "lg": return "shadow-lg";
    case "xl": return "shadow-xl";
    case "none": return "";
    default: return "shadow-md";
  }
}

/**
 * Get shape CSS classes
 */
export function getPhotoShape(shape: PhotoStyle["shape"]): string {
  switch (shape) {
    case "circle": return "rounded-full";
    case "square": return "rounded-none";
    case "rounded": return "rounded-lg";
    case "hexagon": return "clip-hexagon"; // Custom CSS needed
    default: return "rounded-full";
  }
}
