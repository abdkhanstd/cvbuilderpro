"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { AISuggestButton } from "@/components/cv/ai-suggest-button";

interface ExperienceSectionProps {
  cv: any;
  setCVData: (data: any) => void;
}

export function ExperienceSection({ cv, setCVData }: ExperienceSectionProps) {
  const [experience, setExperience] = useState(cv.experience || []);

  // Sync with parent when cv.experience changes
  useEffect(() => {
    if (cv.experience && JSON.stringify(cv.experience) !== JSON.stringify(experience)) {
      setExperience(cv.experience);
    }
  }, [cv.experience]);

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

  const addExperience = () => {
    const newExperience = {
      id: Date.now().toString(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      location: "",
      employmentType: "FULL_TIME",
    };
    const updated = [...experience, newExperience];
    setExperience(updated);
    setCVData((prev: any) => ({ ...prev, experience: updated }));
  };

  const updateExperience = (index: number, field: string, value: any) => {
    console.log('Updating experience:', index, field, value);
    const updated = [...experience];
    updated[index] = { ...updated[index], [field]: value };
    console.log('Updated experience array:', updated);
    setExperience(updated);
    setCVData((prev: any) => ({ ...prev, experience: updated }));
  };

  const removeExperience = (index: number) => {
    const updated = experience.filter((_: any, i: number) => i !== index);
    setExperience(updated);
    setCVData((prev: any) => ({ ...prev, experience: updated }));
  };

  return (
    <div className="space-y-6">
      {experience.map((exp: any, index: number) => (
        <Card key={exp.id || index} className="p-4">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
              <h3 className="font-medium text-gray-900">
                Experience {index + 1}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeExperience(index)}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company *</Label>
                <Input
                  value={exp.company}
                  onChange={(e) =>
                    updateExperience(index, "company", e.target.value)
                  }
                  placeholder="Company Name"
                />
              </div>
              <div>
                <Label>Position *</Label>
                <Input
                  value={exp.position}
                  onChange={(e) =>
                    updateExperience(index, "position", e.target.value)
                  }
                  placeholder="Job Title"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Location</Label>
                <Input
                  value={exp.location}
                  onChange={(e) =>
                    updateExperience(index, "location", e.target.value)
                  }
                  placeholder="City, Country"
                />
              </div>
              <div>
                <Label>Employment Type</Label>
                <select
                  value={exp.employmentType}
                  onChange={(e) =>
                    updateExperience(index, "employmentType", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="FULL_TIME">Full-time</option>
                  <option value="PART_TIME">Part-time</option>
                  <option value="CONTRACT">Contract</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="FREELANCE">Freelance</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input
                  type="month"
                  value={formatDateForInput(exp.startDate)}
                  onChange={(e) =>
                    updateExperience(index, "startDate", e.target.value)
                  }
                  placeholder="YYYY-MM"
                  className="w-full"
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="month"
                  value={formatDateForInput(exp.endDate)}
                  onChange={(e) =>
                    updateExperience(index, "endDate", e.target.value)
                  }
                  disabled={exp.current}
                  placeholder="YYYY-MM"
                  className="w-full"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exp.current}
                    onChange={(e) =>
                      updateExperience(index, "current", e.target.checked)
                    }
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Current</span>
                </label>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Description</Label>
                <AISuggestButton
                  section="experience"
                  field="description"
                  context={{
                    title: exp.title,
                    company: exp.company,
                    location: exp.location,
                  }}
                  currentValue={exp.description}
                  onSuggestion={(suggestion: string) =>
                    updateExperience(index, "description", suggestion)
                  }
                  size="sm"
                />
              </div>
              <Textarea
                value={exp.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  updateExperience(index, "description", e.target.value)
                }
                placeholder="Key responsibilities and achievements..."
                rows={5}
              />
            </div>
          </div>
        </Card>
      ))}

      <Button onClick={addExperience} variant="outline" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Experience
      </Button>
    </div>
  );
}
