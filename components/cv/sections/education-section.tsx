"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { AISuggestButton } from "@/components/cv/ai-suggest-button";

interface EducationSectionProps {
  cv: any;
  setCVData: (data: any) => void;
}

export function EducationSection({ cv, setCVData }: EducationSectionProps) {
  const [education, setEducation] = useState(cv.education || []);

  // Sync with parent when cv.education changes
  useEffect(() => {
    if (cv.education && JSON.stringify(cv.education) !== JSON.stringify(education)) {
      setEducation(cv.education);
    }
  }, [cv.education]);

  // Helper to format date for month input (YYYY-MM)
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
    } catch {
      return "";
    }
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now().toString(),
      degree: "",
      institution: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      gpa: "",
      description: "",
    };
    const updated = [...education, newEducation];
    setEducation(updated);
    setCVData((prev: any) => ({ ...prev, education: updated }));
  };

  const updateEducation = (index: number, field: string, value: any) => {
    console.log('Updating education:', index, field, value);
    const updated = education.map((edu: any, i: number) =>
      i === index ? { ...edu, [field]: value } : edu
    );
    console.log('Updated education array:', updated);
    setEducation(updated);
    setCVData((prev: any) => ({ ...prev, education: updated }));
  };

  const removeEducation = (index: number) => {
    const updated = education.filter((_: any, i: number) => i !== index);
    setEducation(updated);
    setCVData((prev: any) => ({ ...prev, education: updated }));
  };

  return (
    <div className="space-y-4">
      {education.map((edu: any, index: number) => (
        <Card key={edu.id || index} className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                <h3 className="text-lg font-semibold">
                  Education {index + 1}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeEducation(index)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Degree *</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) =>
                    updateEducation(index, "degree", e.target.value)
                  }
                  placeholder="e.g., Bachelor of Science"
                />
              </div>
              <div>
                <Label>Institution *</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) =>
                    updateEducation(index, "institution", e.target.value)
                  }
                  placeholder="e.g., University of Example"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input
                  value={edu.location}
                  onChange={(e) =>
                    updateEducation(index, "location", e.target.value)
                  }
                  placeholder="e.g., City, Country"
                />
              </div>
              <div>
                <Label>GPA</Label>
                <Input
                  value={edu.gpa}
                  onChange={(e) =>
                    updateEducation(index, "gpa", e.target.value)
                  }
                  placeholder="3.8/4.0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="month"
                  value={formatDateForInput(edu.startDate)}
                  onChange={(e) =>
                    updateEducation(index, "startDate", e.target.value)
                  }
                  className="w-full"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <div className="space-y-2">
                  <Input
                    type="month"
                    value={formatDateForInput(edu.endDate)}
                    onChange={(e) =>
                      updateEducation(index, "endDate", e.target.value)
                    }
                    disabled={edu.current}
                  />
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={edu.current}
                      onChange={(e) =>
                        updateEducation(index, "current", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">Current</span>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Description</Label>
                <AISuggestButton
                  section="education"
                  field="description"
                  context={{
                    degree: edu.degree,
                    institution: edu.institution,
                    location: edu.location,
                  }}
                  currentValue={edu.description}
                  onSuggestion={(suggestion: string) =>
                    updateEducation(index, "description", suggestion)
                  }
                  size="sm"
                />
              </div>
              <Textarea
                value={edu.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateEducation(index, "description", e.target.value)
                }
                placeholder="Achievements, coursework, thesis..."
                rows={4}
              />
            </div>
          </div>
        </Card>
      ))}

      <Button onClick={addEducation} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Education
      </Button>
    </div>
  );
}
