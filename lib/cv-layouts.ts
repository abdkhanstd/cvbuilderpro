/**
 * CV Layout System
 * Defines different layout structures for CV presentation
 * Independent from color themes - controls positioning and structure
 */

export type LayoutType = 
  | "single-column"
  | "two-column"
  | "sidebar-left"
  | "sidebar-right"
  | "timeline"
  | "minimal"
  | "asymmetric"
  | "grid";

export type SectionWidth = "full" | "half" | "third" | "two-thirds" | "sidebar" | "main";

export interface SectionLayout {
  column: number; // Which column (0-based)
  width: SectionWidth;
  order: number; // Order within column
}

export interface CVLayout {
  id: string;
  name: string;
  description: string;
  preview: string; // SVG or image path for preview
  columns: number; // 1, 2, or 3
  columnRatios?: number[]; // e.g., [1, 2] for sidebar:main ratio
  sectionPlacements: {
    personal?: SectionLayout;
    summary?: SectionLayout;
    experience?: SectionLayout;
    education?: SectionLayout;
    skills?: SectionLayout;
    publications?: SectionLayout;
    projects?: SectionLayout;
    certifications?: SectionLayout;
    awards?: SectionLayout;
    languages?: SectionLayout;
    references?: SectionLayout;
    customSections?: SectionLayout;
  };
  headerStyle: "compact" | "expanded" | "centered" | "sidebar";
  spacing: "tight" | "normal" | "relaxed";
  sectionDividers: boolean;
  pageBreakBehavior: "auto" | "section" | "avoid";
}

export const CV_LAYOUTS: CVLayout[] = [
  {
    id: "classic-single",
    name: "Classic Single Column",
    description: "Traditional single-column layout, ideal for ATS systems and conservative industries",
    preview: "/layouts/classic-single.svg",
    columns: 1,
    sectionPlacements: {
      personal: { column: 0, width: "full", order: 0 },
      summary: { column: 0, width: "full", order: 1 },
      experience: { column: 0, width: "full", order: 2 },
      education: { column: 0, width: "full", order: 3 },
      skills: { column: 0, width: "full", order: 4 },
      publications: { column: 0, width: "full", order: 5 },
      projects: { column: 0, width: "full", order: 6 },
      certifications: { column: 0, width: "full", order: 7 },
      awards: { column: 0, width: "full", order: 8 },
      languages: { column: 0, width: "full", order: 9 },
      references: { column: 0, width: "full", order: 10 },
    },
    headerStyle: "expanded",
    spacing: "normal",
    sectionDividers: true,
    pageBreakBehavior: "auto",
  },
  {
    id: "modern-two-column",
    name: "Modern Two Column",
    description: "Balanced two-column design with equal width columns for modern appeal",
    preview: "/layouts/modern-two-column.svg",
    columns: 2,
    columnRatios: [1, 1],
    sectionPlacements: {
      personal: { column: 0, width: "full", order: 0 },
      summary: { column: 0, width: "full", order: 1 },
      experience: { column: 0, width: "half", order: 2 },
      education: { column: 0, width: "half", order: 3 },
      publications: { column: 0, width: "half", order: 4 },
      projects: { column: 0, width: "half", order: 5 },
      skills: { column: 1, width: "half", order: 0 },
      certifications: { column: 1, width: "half", order: 1 },
      awards: { column: 1, width: "half", order: 2 },
      languages: { column: 1, width: "half", order: 3 },
      references: { column: 1, width: "half", order: 4 },
    },
    headerStyle: "centered",
    spacing: "normal",
    sectionDividers: true,
    pageBreakBehavior: "section",
  },
  {
    id: "executive-sidebar-left",
    name: "Executive Sidebar (Left)",
    description: "Professional sidebar layout with key info on left, experience on right",
    preview: "/layouts/executive-sidebar-left.svg",
    columns: 2,
    columnRatios: [1, 2],
    sectionPlacements: {
      personal: { column: 0, width: "sidebar", order: 0 },
      summary: { column: 1, width: "main", order: 0 },
      skills: { column: 0, width: "sidebar", order: 1 },
      languages: { column: 0, width: "sidebar", order: 2 },
      certifications: { column: 0, width: "sidebar", order: 3 },
      awards: { column: 0, width: "sidebar", order: 4 },
      experience: { column: 1, width: "main", order: 1 },
      education: { column: 1, width: "main", order: 2 },
      publications: { column: 1, width: "main", order: 3 },
      projects: { column: 1, width: "main", order: 4 },
      references: { column: 1, width: "main", order: 5 },
    },
    headerStyle: "sidebar",
    spacing: "normal",
    sectionDividers: false,
    pageBreakBehavior: "avoid",
  },
  {
    id: "executive-sidebar-right",
    name: "Executive Sidebar (Right)",
    description: "Professional sidebar layout with experience on left, key info on right",
    preview: "/layouts/executive-sidebar-right.svg",
    columns: 2,
    columnRatios: [2, 1],
    sectionPlacements: {
      personal: { column: 1, width: "sidebar", order: 0 },
      summary: { column: 0, width: "main", order: 0 },
      experience: { column: 0, width: "main", order: 1 },
      education: { column: 0, width: "main", order: 2 },
      publications: { column: 0, width: "main", order: 3 },
      projects: { column: 0, width: "main", order: 4 },
      skills: { column: 1, width: "sidebar", order: 1 },
      languages: { column: 1, width: "sidebar", order: 2 },
      certifications: { column: 1, width: "sidebar", order: 3 },
      awards: { column: 1, width: "sidebar", order: 4 },
      references: { column: 1, width: "sidebar", order: 5 },
    },
    headerStyle: "sidebar",
    spacing: "normal",
    sectionDividers: false,
    pageBreakBehavior: "avoid",
  },
  {
    id: "academic-timeline",
    name: "Academic Timeline",
    description: "Timeline-focused layout emphasizing chronological progression",
    preview: "/layouts/academic-timeline.svg",
    columns: 1,
    sectionPlacements: {
      personal: { column: 0, width: "full", order: 0 },
      summary: { column: 0, width: "full", order: 1 },
      education: { column: 0, width: "full", order: 2 },
      experience: { column: 0, width: "full", order: 3 },
      publications: { column: 0, width: "full", order: 4 },
      projects: { column: 0, width: "full", order: 5 },
      awards: { column: 0, width: "full", order: 6 },
      certifications: { column: 0, width: "full", order: 7 },
      skills: { column: 0, width: "full", order: 8 },
      languages: { column: 0, width: "full", order: 9 },
      references: { column: 0, width: "full", order: 10 },
    },
    headerStyle: "centered",
    spacing: "relaxed",
    sectionDividers: true,
    pageBreakBehavior: "section",
  },
  {
    id: "minimal-clean",
    name: "Minimal Clean",
    description: "Minimalist single-column with tight spacing for maximum content",
    preview: "/layouts/minimal-clean.svg",
    columns: 1,
    sectionPlacements: {
      personal: { column: 0, width: "full", order: 0 },
      summary: { column: 0, width: "full", order: 1 },
      experience: { column: 0, width: "full", order: 2 },
      education: { column: 0, width: "full", order: 3 },
      skills: { column: 0, width: "full", order: 4 },
      projects: { column: 0, width: "full", order: 5 },
      publications: { column: 0, width: "full", order: 6 },
      certifications: { column: 0, width: "full", order: 7 },
      languages: { column: 0, width: "full", order: 8 },
      awards: { column: 0, width: "full", order: 9 },
    },
    headerStyle: "compact",
    spacing: "tight",
    sectionDividers: false,
    pageBreakBehavior: "auto",
  },
  {
    id: "creative-asymmetric",
    name: "Creative Asymmetric",
    description: "Asymmetric layout with dynamic column widths for creative roles",
    preview: "/layouts/creative-asymmetric.svg",
    columns: 2,
    columnRatios: [3, 2],
    sectionPlacements: {
      personal: { column: 0, width: "full", order: 0 },
      summary: { column: 0, width: "two-thirds", order: 1 },
      experience: { column: 0, width: "two-thirds", order: 2 },
      projects: { column: 0, width: "two-thirds", order: 3 },
      publications: { column: 0, width: "two-thirds", order: 4 },
      skills: { column: 1, width: "third", order: 0 },
      education: { column: 1, width: "third", order: 1 },
      certifications: { column: 1, width: "third", order: 2 },
      awards: { column: 1, width: "third", order: 3 },
      languages: { column: 1, width: "third", order: 4 },
    },
    headerStyle: "expanded",
    spacing: "relaxed",
    sectionDividers: false,
    pageBreakBehavior: "section",
  },
  {
    id: "technical-grid",
    name: "Technical Grid",
    description: "Grid-based layout optimized for technical roles with many skills",
    preview: "/layouts/technical-grid.svg",
    columns: 2,
    columnRatios: [1, 1],
    sectionPlacements: {
      personal: { column: 0, width: "full", order: 0 },
      summary: { column: 0, width: "full", order: 1 },
      skills: { column: 0, width: "half", order: 2 },
      experience: { column: 0, width: "half", order: 3 },
      projects: { column: 0, width: "half", order: 4 },
      education: { column: 1, width: "half", order: 0 },
      certifications: { column: 1, width: "half", order: 1 },
      publications: { column: 1, width: "half", order: 2 },
      awards: { column: 1, width: "half", order: 3 },
      languages: { column: 1, width: "half", order: 4 },
    },
    headerStyle: "compact",
    spacing: "tight",
    sectionDividers: true,
    pageBreakBehavior: "auto",
  },
];

/**
 * Get layout by ID
 */
export function getLayoutById(id: string): CVLayout | undefined {
  return CV_LAYOUTS.find(layout => layout.id === id);
}

/**
 * Get default layout
 */
export function getDefaultLayout(): CVLayout {
  return CV_LAYOUTS[0]; // Classic Single Column
}

/**
 * Get column width class based on layout
 */
export function getColumnWidthClass(width: SectionWidth, columns: number): string {
  if (columns === 1) return "w-full";
  
  switch (width) {
    case "full":
      return "col-span-full";
    case "half":
      return "w-1/2";
    case "third":
      return "w-1/3";
    case "two-thirds":
      return "w-2/3";
    case "sidebar":
      return columns === 2 ? "w-1/3" : "w-1/4";
    case "main":
      return columns === 2 ? "w-2/3" : "w-3/4";
    default:
      return "w-full";
  }
}

/**
 * Get spacing class based on layout
 */
export function getSpacingClass(spacing: "tight" | "normal" | "relaxed"): string {
  switch (spacing) {
    case "tight":
      return "space-y-3";
    case "normal":
      return "space-y-6";
    case "relaxed":
      return "space-y-8";
    default:
      return "space-y-6";
  }
}
