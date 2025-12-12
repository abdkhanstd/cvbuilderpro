"use client";

import { useState } from "react";
import { CV_THEMES } from "@/lib/cv-themes";
import { Check, Palette } from "lucide-react";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
}

export function ThemeSelector({ currentTheme, onThemeChange }: ThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm font-medium">Theme</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Theme Grid */}
          <div className="absolute right-0 mt-2 w-96 max-h-[600px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50">
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-4">Choose Theme</h3>
              <div className="grid grid-cols-2 gap-3">
                {CV_THEMES.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => {
                      onThemeChange(theme.id);
                      setIsOpen(false);
                    }}
                    className={`relative p-3 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                      currentTheme === theme.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Theme Preview */}
                    <div className="mb-2">
                      <div
                        className="h-12 rounded-md mb-2"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`,
                        }}
                      />
                      <div className="flex gap-1">
                        <div
                          className="flex-1 h-2 rounded"
                          style={{ backgroundColor: theme.colors.primaryLight }}
                        />
                        <div
                          className="flex-1 h-2 rounded"
                          style={{ backgroundColor: theme.colors.accent }}
                        />
                        <div
                          className="flex-1 h-2 rounded"
                          style={{ backgroundColor: theme.colors.border }}
                        />
                      </div>
                    </div>

                    {/* Theme Info */}
                    <div>
                      <div className="font-semibold text-sm mb-1 flex items-center justify-between">
                        {theme.name}
                        {currentTheme === theme.id && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600">{theme.description}</p>
                    </div>

                    {/* Style Indicators */}
                    <div className="mt-2 flex gap-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                        {theme.style.headerStyle}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded">
                        {theme.style.skillStyle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
