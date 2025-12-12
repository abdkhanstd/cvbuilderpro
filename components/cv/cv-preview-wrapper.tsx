"use client";

import { useState, useEffect } from "react";
import { CVPreview } from "./cv-preview";
import { PreviewHeader } from "./preview-header";
import { CVTheme } from "@/lib/cv-themes";

interface CVPreviewWrapperProps {
  cv: any;
}

export function CVPreviewWrapper({ cv }: CVPreviewWrapperProps) {
  const [currentTheme, setCurrentTheme] = useState(cv.theme || 'modern-blue');
  const [customTheme, setCustomTheme] = useState<CVTheme | null>(null);

  // Load custom theme data if it exists
  useEffect(() => {
    if (cv.themeData) {
      try {
        const themeData = typeof cv.themeData === 'string' 
          ? JSON.parse(cv.themeData) 
          : cv.themeData;
        setCustomTheme(themeData);
      } catch (e) {
        console.error("Failed to parse theme data:", e);
      }
    }
  }, [cv.themeData]);

  return (
    <>
      {/* Header with theme selector */}
      <PreviewHeader 
        cvId={cv.id} 
        cvTitle={cv.title} 
        currentTheme={currentTheme}
        onThemeChange={(themeId) => {
          setCurrentTheme(themeId);
          setCustomTheme(null); // Reset custom theme when changing preset
        }}
      />

      {/* Preview Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <CVPreview 
            cv={cv} 
            themeId={currentTheme} 
            layoutId={cv.layout}
            customTheme={customTheme}
          />
        </div>
      </div>
    </>
  );
}
