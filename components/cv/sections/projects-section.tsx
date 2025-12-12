"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { AISuggestButton } from "@/components/cv/ai-suggest-button";

interface ProjectsSectionProps {
  cv: any;
  setCVData: (data: any) => void;
}

export function ProjectsSection({ cv, setCVData }: ProjectsSectionProps) {
  const [projects, setProjects] = useState(cv.projects || []);

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      name: "",
      description: "",
      technologies: "",
      role: "",
      startDate: "",
      endDate: "",
      url: "",
      githubUrl: "",
      order: projects.length,
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    setCVData((prev: any) => ({ ...prev, projects: updated }));
  };

  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...projects];
    updated[index] = { ...updated[index], [field]: value };
    setProjects(updated);
    setCVData((prev: any) => ({ ...prev, projects: updated }));
  };

  const removeProject = (index: number) => {
    const updated = projects.filter((_: any, i: number) => i !== index);
    setProjects(updated);
    setCVData((prev: any) => ({ ...prev, projects: updated }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showcase your personal, academic, or professional projects
        </p>
        <Button onClick={addProject} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-2">🚀</div>
          <p className="text-gray-600 mb-4">No projects added yet</p>
          <Button onClick={addProject} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Project
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {projects.map((project: any, index: number) => (
            <Card key={project.id || index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  Project {index + 1}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Project Name */}
                <div>
                  <Label htmlFor={`project-name-${index}`}>Project Name *</Label>
                  <Input
                    id={`project-name-${index}`}
                    value={project.name}
                    onChange={(e) =>
                      updateProject(index, "name", e.target.value)
                    }
                    placeholder="e.g., Machine Learning Classifier"
                  />
                </div>

                {/* Role */}
                <div>
                  <Label htmlFor={`project-role-${index}`}>Your Role</Label>
                  <Input
                    id={`project-role-${index}`}
                    value={project.role}
                    onChange={(e) =>
                      updateProject(index, "role", e.target.value)
                    }
                    placeholder="e.g., Lead Developer, Team Member"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`project-start-${index}`}>Start Date</Label>
                    <Input
                      id={`project-start-${index}`}
                      type="month"
                      value={project.startDate}
                      onChange={(e) =>
                        updateProject(index, "startDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`project-end-${index}`}>
                      End Date
                    </Label>
                    <Input
                      id={`project-end-${index}`}
                      type="month"
                      value={project.endDate}
                      onChange={(e) =>
                        updateProject(index, "endDate", e.target.value)
                      }
                      placeholder="Leave empty if ongoing"
                    />
                  </div>
                </div>

                {/* Technologies */}
                <div>
                  <Label htmlFor={`project-tech-${index}`}>
                    Technologies Used
                  </Label>
                  <Input
                    id={`project-tech-${index}`}
                    value={project.technologies}
                    onChange={(e) =>
                      updateProject(index, "technologies", e.target.value)
                    }
                    placeholder="e.g., Python, TensorFlow, React, Node.js"
                  />
                </div>

                {/* Description with AI */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor={`project-desc-${index}`}>Description</Label>
                    <AISuggestButton
                      section="projects"
                      field="description"
                      context={{
                        projectName: project.name,
                        role: project.role,
                        technologies: project.technologies,
                      }}
                      currentValue={project.description}
                      onSuggestion={(suggestion: string) =>
                        updateProject(index, "description", suggestion)
                      }
                    />
                  </div>
                  <Textarea
                    id={`project-desc-${index}`}
                    value={project.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      updateProject(index, "description", e.target.value)
                    }
                    placeholder="Describe the project goals, your contributions, and key achievements..."
                    rows={4}
                  />
                </div>

                {/* Links */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`project-url-${index}`}>
                      <LinkIcon className="h-4 w-4 inline mr-1" />
                      Project URL
                    </Label>
                    <Input
                      id={`project-url-${index}`}
                      type="url"
                      value={project.url}
                      onChange={(e) =>
                        updateProject(index, "url", e.target.value)
                      }
                      placeholder="https://project-demo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`project-github-${index}`}>
                      GitHub Repository
                    </Label>
                    <Input
                      id={`project-github-${index}`}
                      type="url"
                      value={project.githubUrl}
                      onChange={(e) =>
                        updateProject(index, "githubUrl", e.target.value)
                      }
                      placeholder="https://github.com/username/repo"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
