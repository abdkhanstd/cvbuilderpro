"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Globe } from "lucide-react";

interface LanguagesSectionProps {
  cv: any;
  setCVData: (data: any) => void;
}

export function LanguagesSection({ cv, setCVData }: LanguagesSectionProps) {
  const [languages, setLanguages] = useState(cv.languages || []);

  const proficiencyLevels = [
    { value: "NATIVE", label: "Native / Bilingual" },
    { value: "FLUENT", label: "Fluent" },
    { value: "ADVANCED", label: "Advanced" },
    { value: "INTERMEDIATE", label: "Intermediate" },
    { value: "BASIC", label: "Basic" },
  ];

  const addLanguage = () => {
    const newLanguage = {
      id: Date.now().toString(),
      name: "",
      proficiency: "INTERMEDIATE",
      order: languages.length,
    };
    const updated = [...languages, newLanguage];
    setLanguages(updated);
    setCVData((prev: any) => ({ ...prev, languages: updated }));
  };

  const updateLanguage = (index: number, field: string, value: any) => {
    const updated = [...languages];
    updated[index] = { ...updated[index], [field]: value };
    setLanguages(updated);
    setCVData((prev: any) => ({ ...prev, languages: updated }));
  };

  const removeLanguage = (index: number) => {
    const updated = languages.filter((_: any, i: number) => i !== index);
    setLanguages(updated);
    setCVData((prev: any) => ({ ...prev, languages: updated }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          List languages you can speak and your proficiency level
        </p>
        <Button onClick={addLanguage} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Language
        </Button>
      </div>

      {languages.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Globe className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">No languages added yet</p>
          <Button onClick={addLanguage} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Language
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {languages.map((language: any, index: number) => (
            <Card key={language.id || index} className="p-4">
              <div className="flex items-center gap-4">
                {/* Language Name */}
                <div className="flex-1">
                  <Input
                    value={language.name}
                    onChange={(e) =>
                      updateLanguage(index, "name", e.target.value)
                    }
                    placeholder="e.g., English, Spanish, Mandarin"
                  />
                </div>

                {/* Proficiency Level */}
                <div className="w-64">
                  <select
                    value={language.proficiency}
                    onChange={(e) =>
                      updateLanguage(index, "proficiency", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {proficiencyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLanguage(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Reference Guide */}
      {languages.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2 text-sm">
            Proficiency Level Guide:
          </h4>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>
              <strong>Native/Bilingual:</strong> Language spoken from childhood
            </li>
            <li>
              <strong>Fluent:</strong> Can communicate effectively in any
              situation
            </li>
            <li>
              <strong>Advanced:</strong> Can discuss complex topics comfortably
            </li>
            <li>
              <strong>Intermediate:</strong> Can handle everyday conversations
            </li>
            <li>
              <strong>Basic:</strong> Can handle simple phrases and situations
            </li>
          </ul>
        </Card>
      )}
    </div>
  );
}
