"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Users, Mail, Phone, Building } from "lucide-react";

interface ReferencesSectionProps {
  cv: any;
  setCVData: (data: any) => void;
}

export function ReferencesSection({ cv, setCVData }: ReferencesSectionProps) {
  const [references, setReferences] = useState(cv.references || []);
  const [showAvailableOnRequest, setShowAvailableOnRequest] = useState(
    cv.referencesAvailableOnRequest || false
  );

  const addReference = () => {
    const newReference = {
      id: Date.now().toString(),
      name: "",
      position: "",
      organization: "",
      email: "",
      phone: "",
      relationship: "",
      order: references.length,
    };
    const updated = [...references, newReference];
    setReferences(updated);
    setCVData((prev: any) => ({ ...prev, references: updated }));
  };

  const updateReference = (index: number, field: string, value: any) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
    setCVData((prev: any) => ({ ...prev, references: updated }));
  };

  const removeReference = (index: number) => {
    const updated = references.filter((_: any, i: number) => i !== index);
    setReferences(updated);
    setCVData((prev: any) => ({ ...prev, references: updated }));
  };

  const toggleAvailableOnRequest = () => {
    const newValue = !showAvailableOnRequest;
    setShowAvailableOnRequest(newValue);
    setCVData((prev: any) => ({ ...prev, referencesAvailableOnRequest: newValue }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Provide professional references (optional)
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant={showAvailableOnRequest ? "outline" : "ghost"}
            size="sm"
            onClick={toggleAvailableOnRequest}
          >
            {showAvailableOnRequest
              ? "Show References"
              : "Available on Request"}
          </Button>
          {!showAvailableOnRequest && (
            <Button onClick={addReference} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Reference
            </Button>
          )}
        </div>
      </div>

      {showAvailableOnRequest ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-700 font-medium mb-2">
            References Available Upon Request
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Your CV will indicate that references can be provided when requested
          </p>
          <Button onClick={toggleAvailableOnRequest} variant="outline">
            Show Reference Details Instead
          </Button>
        </Card>
      ) : references.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Users className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">No references added yet</p>
          <div className="flex gap-2 justify-center">
            <Button onClick={addReference} variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Reference
            </Button>
            <Button onClick={toggleAvailableOnRequest} variant="ghost">
              Use "Available on Request"
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {references.map((reference: any, index: number) => (
            <Card key={reference.id || index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  Reference {index + 1}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeReference(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <Label htmlFor={`ref-name-${index}`}>Full Name *</Label>
                  <Input
                    id={`ref-name-${index}`}
                    value={reference.name}
                    onChange={(e) =>
                      updateReference(index, "name", e.target.value)
                    }
                    placeholder="e.g., Dr. John Smith"
                  />
                </div>

                {/* Position and Organization */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`ref-position-${index}`}>Job Title *</Label>
                    <Input
                      id={`ref-position-${index}`}
                      value={reference.position}
                      onChange={(e) =>
                        updateReference(index, "position", e.target.value)
                      }
                      placeholder="e.g., Professor, Senior Manager"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`ref-organization-${index}`}>
                      <Building className="h-4 w-4 inline mr-1" />
                      Organization *
                    </Label>
                    <Input
                      id={`ref-organization-${index}`}
                      value={reference.organization}
                      onChange={(e) =>
                        updateReference(index, "organization", e.target.value)
                      }
                      placeholder="e.g., University, Company Name"
                    />
                  </div>
                </div>

                {/* Relationship */}
                <div>
                  <Label htmlFor={`ref-relationship-${index}`}>
                    Relationship
                  </Label>
                  <Input
                    id={`ref-relationship-${index}`}
                    value={reference.relationship}
                    onChange={(e) =>
                      updateReference(index, "relationship", e.target.value)
                    }
                    placeholder="e.g., PhD Supervisor, Former Manager"
                  />
                </div>

                {/* Contact Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`ref-email-${index}`}>
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email *
                    </Label>
                    <Input
                      id={`ref-email-${index}`}
                      type="email"
                      value={reference.email}
                      onChange={(e) =>
                        updateReference(index, "email", e.target.value)
                      }
                      placeholder="reference@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`ref-phone-${index}`}>
                      <Phone className="h-4 w-4 inline mr-1" />
                      Phone
                    </Label>
                    <Input
                      id={`ref-phone-${index}`}
                      type="tel"
                      value={reference.phone}
                      onChange={(e) =>
                        updateReference(index, "phone", e.target.value)
                      }
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Privacy Note */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Always ask for permission before listing
          someone as a reference. Consider using "References Available Upon
          Request" and provide details only when specifically asked.
        </p>
      </Card>
    </div>
  );
}
