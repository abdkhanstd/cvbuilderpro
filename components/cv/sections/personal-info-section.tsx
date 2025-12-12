"use client";
import { useEffect, useState, type ChangeEvent, type Dispatch, type SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AISuggestButton } from "@/components/cv/ai-suggest-button";
import { QRCodeGenerator } from "@/components/ui/qr-code-generator";
import { Plus, Trash2, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalInfoSectionProps {
  cv: any;
  setCVData: Dispatch<SetStateAction<any>>;
  profile: any;
}

export function PersonalInfoSection({ cv, setCVData, profile }: PersonalInfoSectionProps) {
  const normalizeContactsForState = (source: any[]): any[] => {
    return (Array.isArray(source) ? source : [])
      .filter(Boolean)
      .map((contact, index) => ({
        ...contact,
        _localId: String(contact?._localId ?? contact?.id ?? `contact-${index}`),
      }))
      .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
      .map((contact, index) => ({ ...contact, order: index }));
  };

  const [contacts, setContacts] = useState(() =>
    normalizeContactsForState(Array.isArray(cv.contactInfo) ? cv.contactInfo : [])
  );

  useEffect(() => {
    setContacts(normalizeContactsForState(Array.isArray(cv.contactInfo) ? cv.contactInfo : []));
  }, [cv.contactInfo]);

  const handleChange = (field: string, value: string) => {
    setCVData((previous: any) => ({
      ...previous,
      [field]: value,
    }));
  };

  const commitContactInfo = (updater: (contacts: any[]) => any[]) => {
    setContacts((previous) => {
      const current = normalizeContactsForState(previous);
      const updated = normalizeContactsForState(updater(current) || []);

      if (updated.length > 0 && !updated.some((entry) => entry?.isPrimary)) {
        updated[0] = { ...updated[0], isPrimary: true };
      }

      const payload = updated.map(({ _localId, ...contact }) => contact);

      setCVData((previousCv: any) => ({
        ...previousCv,
        contactInfo: payload,
      }));

      return updated;
    });
  };

  const addContactInfo = () => {
    commitContactInfo((current) => {
      const next = [...current];
      const localId = `temp-${Date.now()}`;
      next.push({
        id: localId,
        _localId: localId,
        type: "email",
        value: "",
        label: "",
        isPrimary: current.length === 0,
        order: current.length,
      });
      return next;
    });
  };

  const removeContactInfo = (id: string) => {
    commitContactInfo((current) =>
      current.filter((contact) => String(contact?._localId ?? contact?.id ?? "") !== String(id))
    );
  };

  const updateContactInfo = (id: string, field: string, value: any) => {
    commitContactInfo((current) =>
      current.map((contact) =>
        String(contact?._localId ?? contact?.id ?? "") === String(id)
          ? { ...contact, [field]: value }
          : contact,
      )
    );
  };

  const setPrimaryContact = (id: string) => {
    commitContactInfo((current) =>
      current.map((contact) => ({
        ...contact,
        isPrimary: String(contact?._localId ?? contact?.id ?? "") === String(id),
      }))
    );
  };

  const resolvedProfileImage = typeof cv?.profileImage === "string" && cv.profileImage.trim()
    ? cv.profileImage
    : typeof profile?.profileImage === "string" && profile.profileImage.trim()
      ? profile.profileImage
      : "";

  const contactInfo = contacts;

  return (
    <div className="space-y-6">
      {/* Profile Image Control */}
      <div className="flex items-center gap-4 p-4 border rounded-lg bg-slate-50">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-200">
          {resolvedProfileImage ? (
            <img
              src={resolvedProfileImage}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-2xl">👤</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label>Profile Photo</Label>
          <div className="flex flex-wrap gap-2">
            {profile?.profileImage ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleChange("profileImage", profile.profileImage)}
                disabled={cv.profileImage === profile.profileImage}
              >
                {cv.profileImage === profile.profileImage ? "Synced with Profile" : "Use Profile Photo"}
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                No Profile Photo
              </Button>
            )}
            
            {cv.profileImage && (
              <Button 
                variant="ghost" 
                size="sm"
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleChange("profileImage", "")}
              >
                Remove Photo
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            To upload a new photo, go to your <a href="/dashboard/settings" className="text-blue-600 hover:underline" target="_blank">Settings</a>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={cv.fullName || ""}
            onChange={(e) => handleChange("fullName", e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div>
          <Label htmlFor="headline">Professional Headline</Label>
          <Input
            id="headline"
            value={cv.headline || ""}
            onChange={(e) => handleChange("headline", e.target.value)}
            placeholder="AI Researcher & Lecturer"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional line that appears under your name on the CV.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={cv.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="john@example.com, work@example.com"
          />
          <p className="text-xs text-gray-500 mt-1">
            Multiple emails can be separated by commas (e.g., work@example.com, personal@example.com)
          </p>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={cv.phone || ""}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={cv.location || ""}
            onChange={(e) => handleChange("location", e.target.value)}
            placeholder="City, Country"
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={cv.website || ""}
            onChange={(e) => handleChange("website", e.target.value)}
            placeholder="https://yourwebsite.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="linkedin">LinkedIn</Label>
          <div className="flex gap-2">
            <Input
              id="linkedin"
              value={cv.linkedin || ""}
              onChange={(e) => handleChange("linkedin", e.target.value)}
              placeholder="linkedin.com/in/username"
              className="flex-1"
            />
            <QRCodeGenerator url={cv.linkedin} label="LinkedIn" />
          </div>
        </div>
        <div>
          <Label htmlFor="github">GitHub</Label>
          <div className="flex gap-2">
            <Input
              id="github"
              value={cv.github || ""}
              onChange={(e) => handleChange("github", e.target.value)}
              placeholder="github.com/username"
              className="flex-1"
            />
            <QRCodeGenerator url={cv.github} label="GitHub" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="googleScholar">Google Scholar</Label>
          <div className="flex gap-2">
            <Input
              id="googleScholar"
              value={cv.googleScholar || ""}
              onChange={(e) => handleChange("googleScholar", e.target.value)}
              placeholder="scholar.google.com/citations?user=..."
              className="flex-1"
            />
            <QRCodeGenerator url={cv.googleScholar} label="Google Scholar" />
          </div>
        </div>
        <div>
          <Label htmlFor="website">Personal Website</Label>
          <div className="flex gap-2">
            <Input
              id="website"
              value={cv.website || ""}
              onChange={(e) => handleChange("website", e.target.value)}
              placeholder="https://yourwebsite.com"
              className="flex-1"
            />
            <QRCodeGenerator url={cv.website} label="Personal Website" />
          </div>
        </div>
      </div>

      {/* Additional Contact Information */}
      <div className="border-t pt-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Additional Contact Information</h3>
            <p className="text-xs text-gray-500 mt-1">
              Add multiple email addresses, phone numbers, or messaging apps
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addContactInfo}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Contact
          </Button>
        </div>

        {contactInfo.length > 0 && (
          <div className="space-y-3">
            {contactInfo.map((contact: any, index: number) => {
              const contactId = String(contact?._localId ?? contact?.id ?? `contact-${index}`);
              return (
              <div
                key={contactId}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  contact.isPrimary ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="grid grid-cols-12 gap-2 flex-1">
                  <div className="col-span-3">
                    <Select
                      value={contact.type}
                      onValueChange={(value) => updateContactInfo(contactId, "type", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="mobile">Mobile</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        <SelectItem value="telegram">Telegram</SelectItem>
                        <SelectItem value="wechat">WeChat</SelectItem>
                        <SelectItem value="skype">Skype</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5">
                    <Input
                      value={contact.value}
                      onChange={(e) => updateContactInfo(contactId, "value", e.target.value)}
                      placeholder={contact.type === "email" ? "email@example.com" : "+1 234 567 8900"}
                    />
                  </div>
                  <div className="col-span-3">
                    <Input
                      value={contact.label || ""}
                      onChange={(e) => updateContactInfo(contactId, "label", e.target.value)}
                      placeholder="Label (e.g., Work)"
                    />
                  </div>
                  <div className="col-span-1 flex items-center justify-center">
                    <Button
                      type="button"
                      variant={contact.isPrimary ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setPrimaryContact(contactId)}
                      title={contact.isPrimary ? "Primary contact" : "Set as primary"}
                    >
                      <Star className={`h-4 w-4 ${contact.isPrimary ? "fill-current" : ""}`} />
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeContactInfo(contactId)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              );
            })}
          </div>
        )}

        {contactInfo.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-gray-300 rounded-lg">
            No additional contacts added. Click "Add Contact" to include more ways to reach you.
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <AISuggestButton
            section="personal"
            field="summary"
            context={{
              fullName: cv.fullName,
              location: cv.location,
            }}
            currentValue={cv.summary || ""}
            onSuggestion={(suggestion: string) => handleChange("summary", suggestion)}
            size="sm"
          />
        </div>
        <Textarea
          id="summary"
          value={cv.summary || ""}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => handleChange("summary", e.target.value)}
          placeholder="Brief professional summary..."
          rows={5}
        />
      </div>

      {/* Academic Metrics (imported from Google Scholar) */}
      {(cv.hIndex || cv.totalCitations) && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">
            Academic Metrics (from Google Scholar)
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {cv.hIndex && (
              <div>
                <Label className="text-xs text-blue-700">h-index</Label>
                <p className="text-2xl font-bold text-blue-900">{cv.hIndex}</p>
              </div>
            )}
            {cv.totalCitations && (
              <div>
                <Label className="text-xs text-blue-700">Total Citations</Label>
                <p className="text-2xl font-bold text-blue-900">{cv.totalCitations}</p>
              </div>
            )}
            {cv.i10Index && (
              <div>
                <Label className="text-xs text-blue-700">i10-index</Label>
                <p className="text-2xl font-bold text-blue-900">{cv.i10Index}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
