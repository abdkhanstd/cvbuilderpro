"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Trophy } from "lucide-react";

interface AwardsSectionProps {
  cv: any;
  setCVData: (data: any) => void;
}

export function AwardsSection({ cv, setCVData }: AwardsSectionProps) {
  const [awards, setAwards] = useState(cv.awards || []);

  const addAward = () => {
    const newAward = {
      id: Date.now().toString(),
      title: "",
      issuer: "",
      date: "",
      description: "",
      order: awards.length,
    };
    const updated = [...awards, newAward];
    setAwards(updated);
    setCVData((prev: any) => ({ ...prev, awards: updated }));
  };

  const updateAward = (index: number, field: string, value: any) => {
    const updated = [...awards];
    updated[index] = { ...updated[index], [field]: value };
    setAwards(updated);
    setCVData((prev: any) => ({ ...prev, awards: updated }));
  };

  const removeAward = (index: number) => {
    const updated = awards.filter((_: any, i: number) => i !== index);
    setAwards(updated);
    setCVData((prev: any) => ({ ...prev, awards: updated }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Highlight your achievements, honors, and awards
        </p>
        <Button onClick={addAward} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Award
        </Button>
      </div>

      {awards.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Trophy className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">No awards added yet</p>
          <Button onClick={addAward} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Award
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {awards.map((award: any, index: number) => (
            <Card key={award.id || index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-medium text-gray-900">Award {index + 1}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAward(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Award Title */}
                <div>
                  <Label htmlFor={`award-title-${index}`}>Award Title *</Label>
                  <Input
                    id={`award-title-${index}`}
                    value={award.title}
                    onChange={(e) =>
                      updateAward(index, "title", e.target.value)
                    }
                    placeholder="e.g., Best Paper Award, Dean's List"
                  />
                </div>

                {/* Issuing Organization */}
                <div>
                  <Label htmlFor={`award-issuer-${index}`}>
                    Issuing Organization *
                  </Label>
                  <Input
                    id={`award-issuer-${index}`}
                    value={award.issuer}
                    onChange={(e) =>
                      updateAward(index, "issuer", e.target.value)
                    }
                    placeholder="e.g., IEEE, University Name, Company"
                  />
                </div>

                {/* Date */}
                <div>
                  <Label htmlFor={`award-date-${index}`}>Date Received *</Label>
                  <Input
                    id={`award-date-${index}`}
                    type="month"
                    value={award.date}
                    onChange={(e) => updateAward(index, "date", e.target.value)}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor={`award-desc-${index}`}>Description</Label>
                  <Textarea
                    id={`award-desc-${index}`}
                    value={award.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      updateAward(index, "description", e.target.value)
                    }
                    placeholder="Describe what you achieved and why you received this award..."
                    rows={3}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
