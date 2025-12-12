"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Award } from "lucide-react";

interface CertificationsSectionProps {
  cv: any;
  setCVData: (data: any) => void;
}

export function CertificationsSection({
  cv,
  setCVData,
}: CertificationsSectionProps) {
  const [certifications, setCertifications] = useState(
    cv.certifications || []
  );

  const addCertification = () => {
    const newCertification = {
      id: Date.now().toString(),
      name: "",
      issuer: "",
      issueDate: "",
      expiryDate: "",
      credentialId: "",
      credentialUrl: "",
      order: certifications.length,
    };
    const updated = [...certifications, newCertification];
    setCertifications(updated);
    setCVData((prev: any) => ({ ...prev, certifications: updated }));
  };

  const updateCertification = (index: number, field: string, value: any) => {
    const updated = [...certifications];
    updated[index] = { ...updated[index], [field]: value };
    setCertifications(updated);
    setCVData((prev: any) => ({ ...prev, certifications: updated }));
  };

  const removeCertification = (index: number) => {
    const updated = certifications.filter((_: any, i: number) => i !== index);
    setCertifications(updated);
    setCVData((prev: any) => ({ ...prev, certifications: updated }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Add professional certifications and licenses
        </p>
        <Button onClick={addCertification} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {certifications.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-2">
            <Award className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-600 mb-4">No certifications added yet</p>
          <Button onClick={addCertification} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Certification
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {certifications.map((cert: any, index: number) => (
            <Card key={cert.id || index} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-medium text-gray-900">
                  Certification {index + 1}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Certification Name */}
                <div>
                  <Label htmlFor={`cert-name-${index}`}>
                    Certification Name *
                  </Label>
                  <Input
                    id={`cert-name-${index}`}
                    value={cert.name}
                    onChange={(e) =>
                      updateCertification(index, "name", e.target.value)
                    }
                    placeholder="e.g., AWS Certified Solutions Architect"
                  />
                </div>

                {/* Issuing Organization */}
                <div>
                  <Label htmlFor={`cert-issuer-${index}`}>
                    Issuing Organization *
                  </Label>
                  <Input
                    id={`cert-issuer-${index}`}
                    value={cert.issuer}
                    onChange={(e) =>
                      updateCertification(index, "issuer", e.target.value)
                    }
                    placeholder="e.g., Amazon Web Services"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`cert-issue-${index}`}>Issue Date *</Label>
                    <Input
                      id={`cert-issue-${index}`}
                      type="month"
                      value={cert.issueDate}
                      onChange={(e) =>
                        updateCertification(index, "issueDate", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor={`cert-expiry-${index}`}>
                      Expiry Date
                    </Label>
                    <Input
                      id={`cert-expiry-${index}`}
                      type="month"
                      value={cert.expiryDate}
                      onChange={(e) =>
                        updateCertification(index, "expiryDate", e.target.value)
                      }
                      placeholder="Leave empty if no expiry"
                    />
                  </div>
                </div>

                {/* Credential Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`cert-id-${index}`}>Credential ID</Label>
                    <Input
                      id={`cert-id-${index}`}
                      value={cert.credentialId}
                      onChange={(e) =>
                        updateCertification(
                          index,
                          "credentialId",
                          e.target.value
                        )
                      }
                      placeholder="e.g., AWS-1234567890"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`cert-url-${index}`}>Credential URL</Label>
                    <Input
                      id={`cert-url-${index}`}
                      type="url"
                      value={cert.credentialUrl}
                      onChange={(e) =>
                        updateCertification(
                          index,
                          "credentialUrl",
                          e.target.value
                        )
                      }
                      placeholder="https://verify.example.com"
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
