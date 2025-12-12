/**
 * CV Theme System
 * 
 * Theme Description Language (TDL):
 * Each theme is defined with:
 * - colors: Primary, secondary, accent, text colors
 * - layout: Spacing, sizing, alignment
 * - typography: Font sizes, weights
 * - style: Visual characteristics (borders, shadows, corners)
 */

export interface CVTheme {
  id: string;
  name: string;
  description: string;
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
  layout: {
    headerPadding: number;
    sectionPadding: number;
    spacing: number;
    borderRadius: number;
  };
  typography: {
    nameSize: number;
    sectionTitleSize: number;
    entryTitleSize: number;
    bodySize: number;
    smallSize: number;
    headingFont?: string;
    bodyFont?: string;
    baseFontSize?: string;
    lineHeight?: string;
    headingTransform?: 'none' | 'uppercase' | 'capitalize' | 'lowercase' | 'first-capital';
    letterSpacing?: string;
  };
  style: {
    headerStyle: 'solid' | 'gradient' | 'outlined' | 'minimal';
    sectionStyle: 'bordered' | 'filled' | 'minimal';
    skillStyle: 'pill' | 'tag' | 'badge' | 'simple';
    profileImageShape: 'circle' | 'rounded' | 'square';
    borderWidth: number;
    sectionDividers?: boolean;
    skillPills?: boolean;
    headingStyle?: 'bold' | 'underline' | 'background';
    dateFormat?: 'short' | 'long' | 'numeric';
    nameDisplayOrder?: 'firstLast' | 'lastFirst';
  };
  // Photo customization properties
  showPhoto?: boolean;
  photoSize?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
  photoAspect?: 'square' | 'portrait' | 'landscape';
  photoBorderWidth?: number;
  photoBorderColor?: string;
  photoShadow?: boolean;
  photoGrayscale?: boolean;
}

// Helper function to add default typography and photo values
const addDefaultTypography = (theme: CVTheme): CVTheme => {
  return {
    ...theme,
    typography: {
      ...theme.typography,
      headingFont: theme.typography.headingFont || 'Helvetica',
      bodyFont: theme.typography.bodyFont || 'Helvetica',
      baseFontSize: theme.typography.baseFontSize || `${theme.typography.bodySize}px`,
      lineHeight: theme.typography.lineHeight || '1.5',
      headingTransform: theme.typography.headingTransform || 'uppercase',
      letterSpacing: theme.typography.letterSpacing || '0.5px',
    },
    style: {
      ...theme.style,
      sectionDividers: theme.style.sectionDividers ?? true,
      skillPills: theme.style.skillPills ?? true,
      headingStyle: theme.style.headingStyle || 'bold',
      dateFormat: theme.style.dateFormat || 'short',
    },
    // Photo defaults
    showPhoto: theme.showPhoto !== false,
    photoSize: theme.photoSize || 'medium',
    photoAspect: theme.photoAspect || 'square',
    photoBorderWidth: theme.photoBorderWidth ?? 2,
    photoBorderColor: theme.photoBorderColor || '#ffffff',
    photoShadow: theme.photoShadow || false,
    photoGrayscale: theme.photoGrayscale || false,
  };
};

export const CV_THEMES: CVTheme[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean and professional with blue accents',
    colors: {
      primary: '#2563eb',
      primaryLight: '#eff6ff',
      primaryDark: '#1e40af',
      secondary: '#64748b',
      accent: '#3b82f6',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      background: '#ffffff',
      surface: '#f9fafb',
      border: '#e5e7eb',
    },
    layout: {
      headerPadding: 16,
      sectionPadding: 16,
      spacing: 12,
      borderRadius: 8,
    },
    typography: {
      nameSize: 18,
      sectionTitleSize: 11,
      entryTitleSize: 10,
      bodySize: 10,
      smallSize: 9,
    },
    style: {
      headerStyle: 'solid',
      sectionStyle: 'bordered',
      skillStyle: 'pill',
      profileImageShape: 'circle',
      borderWidth: 1,
    },
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    description: 'Sophisticated purple theme for creative professionals',
    colors: {
      primary: '#7c3aed',
      primaryLight: '#f5f3ff',
      primaryDark: '#5b21b6',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      background: '#ffffff',
      surface: '#faf5ff',
      border: '#e9d5ff',
    },
    layout: {
      headerPadding: 20,
      sectionPadding: 18,
      spacing: 14,
      borderRadius: 12,
    },
    typography: {
      nameSize: 20,
      sectionTitleSize: 12,
      entryTitleSize: 11,
      bodySize: 10,
      smallSize: 9,
    },
    style: {
      headerStyle: 'gradient',
      sectionStyle: 'filled',
      skillStyle: 'badge',
      profileImageShape: 'rounded',
      borderWidth: 2,
    },
  },
  {
    id: 'minimal-gray',
    name: 'Minimal Gray',
    description: 'Minimalist design with subtle gray tones',
    colors: {
      primary: '#374151',
      primaryLight: '#f3f4f6',
      primaryDark: '#1f2937',
      secondary: '#6b7280',
      accent: '#9ca3af',
      textPrimary: '#111827',
      textSecondary: '#6b7280',
      background: '#ffffff',
      surface: '#f9fafb',
      border: '#d1d5db',
    },
    layout: {
      headerPadding: 14,
      sectionPadding: 14,
      spacing: 10,
      borderRadius: 4,
    },
    typography: {
      nameSize: 16,
      sectionTitleSize: 10,
      entryTitleSize: 10,
      bodySize: 9,
      smallSize: 8,
    },
    style: {
      headerStyle: 'minimal',
      sectionStyle: 'minimal',
      skillStyle: 'simple',
      profileImageShape: 'square',
      borderWidth: 1,
    },
  },
  {
    id: 'bold-red',
    name: 'Bold Red',
    description: 'Eye-catching red theme for making a statement',
    colors: {
      primary: '#dc2626',
      primaryLight: '#fef2f2',
      primaryDark: '#991b1b',
      secondary: '#ef4444',
      accent: '#f87171',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      background: '#ffffff',
      surface: '#fef2f2',
      border: '#fecaca',
    },
    layout: {
      headerPadding: 18,
      sectionPadding: 16,
      spacing: 12,
      borderRadius: 6,
    },
    typography: {
      nameSize: 19,
      sectionTitleSize: 11,
      entryTitleSize: 10,
      bodySize: 10,
      smallSize: 9,
    },
    style: {
      headerStyle: 'solid',
      sectionStyle: 'bordered',
      skillStyle: 'tag',
      profileImageShape: 'circle',
      borderWidth: 2,
    },
  },
  {
    id: 'professional-green',
    name: 'Professional Green',
    description: 'Trustworthy green theme for business professionals',
    colors: {
      primary: '#059669',
      primaryLight: '#ecfdf5',
      primaryDark: '#047857',
      secondary: '#10b981',
      accent: '#34d399',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      background: '#ffffff',
      surface: '#f0fdf4',
      border: '#d1fae5',
    },
    layout: {
      headerPadding: 16,
      sectionPadding: 16,
      spacing: 12,
      borderRadius: 8,
    },
    typography: {
      nameSize: 18,
      sectionTitleSize: 11,
      entryTitleSize: 10,
      bodySize: 10,
      smallSize: 9,
    },
    style: {
      headerStyle: 'solid',
      sectionStyle: 'bordered',
      skillStyle: 'pill',
      profileImageShape: 'circle',
      borderWidth: 1,
    },
  },
  {
    id: 'creative-orange',
    name: 'Creative Orange',
    description: 'Vibrant orange theme for creative minds',
    colors: {
      primary: '#ea580c',
      primaryLight: '#fff7ed',
      primaryDark: '#c2410c',
      secondary: '#f97316',
      accent: '#fb923c',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      background: '#ffffff',
      surface: '#fff7ed',
      border: '#fed7aa',
    },
    layout: {
      headerPadding: 20,
      sectionPadding: 18,
      spacing: 14,
      borderRadius: 10,
    },
    typography: {
      nameSize: 20,
      sectionTitleSize: 12,
      entryTitleSize: 11,
      bodySize: 10,
      smallSize: 9,
    },
    style: {
      headerStyle: 'gradient',
      sectionStyle: 'filled',
      skillStyle: 'badge',
      profileImageShape: 'rounded',
      borderWidth: 2,
    },
  },
  {
    id: 'tech-cyan',
    name: 'Tech Cyan',
    description: 'Modern cyan theme for tech professionals',
    colors: {
      primary: '#0891b2',
      primaryLight: '#ecfeff',
      primaryDark: '#0e7490',
      secondary: '#06b6d4',
      accent: '#22d3ee',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      background: '#ffffff',
      surface: '#ecfeff',
      border: '#cffafe',
    },
    layout: {
      headerPadding: 16,
      sectionPadding: 16,
      spacing: 12,
      borderRadius: 8,
    },
    typography: {
      nameSize: 18,
      sectionTitleSize: 11,
      entryTitleSize: 10,
      bodySize: 10,
      smallSize: 9,
    },
    style: {
      headerStyle: 'solid',
      sectionStyle: 'bordered',
      skillStyle: 'pill',
      profileImageShape: 'circle',
      borderWidth: 1,
    },
  },
  {
    id: 'warm-amber',
    name: 'Warm Amber',
    description: 'Warm and inviting amber tones',
    colors: {
      primary: '#d97706',
      primaryLight: '#fffbeb',
      primaryDark: '#b45309',
      secondary: '#f59e0b',
      accent: '#fbbf24',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      background: '#ffffff',
      surface: '#fffbeb',
      border: '#fde68a',
    },
    layout: {
      headerPadding: 18,
      sectionPadding: 16,
      spacing: 12,
      borderRadius: 8,
    },
    typography: {
      nameSize: 18,
      sectionTitleSize: 11,
      entryTitleSize: 10,
      bodySize: 10,
      smallSize: 9,
    },
    style: {
      headerStyle: 'solid',
      sectionStyle: 'bordered',
      skillStyle: 'tag',
      profileImageShape: 'circle',
      borderWidth: 1,
    },
  },
  {
    id: 'classic-indigo',
    name: 'Classic Indigo',
    description: 'Timeless indigo for traditional CVs',
    colors: {
      primary: '#4f46e5',
      primaryLight: '#eef2ff',
      primaryDark: '#3730a3',
      secondary: '#6366f1',
      accent: '#818cf8',
      textPrimary: '#1f2937',
      textSecondary: '#6b7280',
      background: '#ffffff',
      surface: '#eef2ff',
      border: '#e0e7ff',
    },
    layout: {
      headerPadding: 16,
      sectionPadding: 16,
      spacing: 12,
      borderRadius: 6,
    },
    typography: {
      nameSize: 17,
      sectionTitleSize: 11,
      entryTitleSize: 10,
      bodySize: 10,
      smallSize: 9,
    },
    style: {
      headerStyle: 'solid',
      sectionStyle: 'bordered',
      skillStyle: 'pill',
      profileImageShape: 'circle',
      borderWidth: 1,
    },
  },
  {
    id: 'dark-slate',
    name: 'Dark Slate',
    description: 'Dark and sophisticated slate theme',
    colors: {
      primary: '#0f172a',
      primaryLight: '#f1f5f9',
      primaryDark: '#020617',
      secondary: '#334155',
      accent: '#475569',
      textPrimary: '#0f172a',
      textSecondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      border: '#cbd5e1',
    },
    layout: {
      headerPadding: 18,
      sectionPadding: 16,
      spacing: 12,
      borderRadius: 4,
    },
    typography: {
      nameSize: 19,
      sectionTitleSize: 11,
      entryTitleSize: 10,
      bodySize: 10,
      smallSize: 9,
    },
    style: {
      headerStyle: 'solid',
      sectionStyle: 'bordered',
      skillStyle: 'pill',
      profileImageShape: 'square',
      borderWidth: 2,
    },
  },
];

export const getTheme = (themeId: string): CVTheme => {
  const theme = CV_THEMES.find(t => t.id === themeId) || CV_THEMES[0];
  return addDefaultTypography(theme);
};

export const getThemeIds = (): string[] => {
  return CV_THEMES.map(t => t.id);
};
