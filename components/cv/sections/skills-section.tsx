"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Sparkles } from "lucide-react";
import { AISuggestButton } from "@/components/cv/ai-suggest-button";
import { useToast } from "@/hooks/use-toast";

interface SkillsSectionProps {
  cv: any;
  setCVData: (data: any) => void;
}

export function SkillsSection({ cv, setCVData }: SkillsSectionProps) {
  const [skills, setSkills] = useState(cv.skills || []);
  const [selectedCategory, setSelectedCategory] = useState("Programming Languages");
  const { toast } = useToast();
  const [loadingAI, setLoadingAI] = useState(false);

  const categories = [
    "Programming Languages",
    "Frameworks & Libraries",
    "Tools & Technologies",
    "Soft Skills",
    "Languages",
    "Other",
  ];

  const addSkill = () => {
    const newSkill = {
      id: Date.now().toString(),
      name: "",
      category: selectedCategory,
      level: "INTERMEDIATE",
      order: skills.length,
    };
    const updated = [...skills, newSkill];
    setSkills(updated);
    setCVData((prev: any) => ({ ...prev, skills: updated }));
  };

  const suggestSkills = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: "skills",
          field: "skills_list",
          context: {
            currentSkills: skills.map((s: any) => s.name).join(", "),
            education: cv.education,
            experience: cv.experience,
            category: selectedCategory,
          },
          currentValue: "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI suggestions");
      }

      const data = await response.json();
      const suggestion = data.suggestion;

      // Parse suggested skills (expecting comma-separated or line-separated list)
      const suggestedSkills = suggestion
        .split(/[,\n]/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
        .slice(0, 10); // Limit to 10 suggestions

      // Add suggested skills
      const newSkills = suggestedSkills.map((skillName: string, idx: number) => ({
        id: (Date.now() + idx).toString(),
        name: skillName,
        category: selectedCategory,
        level: "INTERMEDIATE",
        order: skills.length + idx,
      }));

      const updated = [...skills, ...newSkills];
      setSkills(updated);
      setCVData((prev: any) => ({ ...prev, skills: updated }));

      toast({
        title: "Success",
        description: `Added ${newSkills.length} suggested skills`,
      });
    } catch (error) {
      console.error("AI suggestion error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI suggestions. Please try again.",
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const updateSkill = (index: number, field: string, value: any) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    setSkills(updated);
    setCVData((prev: any) => ({ ...prev, skills: updated }));
  };

  const removeSkill = (index: number) => {
    const updated = skills.filter((_: any, i: number) => i !== index);
    setSkills(updated);
    setCVData((prev: any) => ({ ...prev, skills: updated }));
  };

  // Group skills by category
  const groupedSkills = skills.reduce((acc: any, skill: any) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Add your technical and soft skills
        </p>
        <div className="flex gap-2">
          <Button onClick={suggestSkills} variant="outline" size="sm" disabled={loadingAI}>
            <Sparkles className="h-4 w-4 mr-2" />
            {loadingAI ? "Suggesting..." : "AI Suggest Skills"}
          </Button>
          <Button onClick={addSkill} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Skill
          </Button>
        </div>
      </div>

      {Object.keys(groupedSkills).length > 0 && (
        <div className="space-y-6">
          {Object.entries(groupedSkills).map(([category, categorySkills]: [string, any]) => (
            <Card key={category} className="p-4">
              <h3 className="font-medium text-gray-900 mb-4">{category}</h3>
              <div className="space-y-3">
                {categorySkills.map((skill: any, index: number) => {
                  const globalIndex = skills.findIndex((s: any) => s.id === skill.id);
                  return (
                    <div key={skill.id || index} className="flex items-center gap-4">
                      <div className="flex-1">
                        <Input
                          value={skill.name}
                          onChange={(e) =>
                            updateSkill(globalIndex, "name", e.target.value)
                          }
                          placeholder="Skill name"
                        />
                      </div>
                      <div className="w-48">
                        <select
                          value={skill.level}
                          onChange={(e) =>
                            updateSkill(globalIndex, "level", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="BEGINNER">Beginner</option>
                          <option value="INTERMEDIATE">Intermediate</option>
                          <option value="ADVANCED">Advanced</option>
                          <option value="EXPERT">Expert</option>
                        </select>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSkill(globalIndex)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-4">
        <h3 className="font-medium text-gray-900 mb-4">Add New Skill</h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Category</Label>
            <select 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={suggestSkills} variant="outline" disabled={loadingAI}>
              <Sparkles className="h-4 w-4 mr-2" />
              AI Suggest
            </Button>
            <Button onClick={addSkill}>
              <Plus className="h-4 w-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
