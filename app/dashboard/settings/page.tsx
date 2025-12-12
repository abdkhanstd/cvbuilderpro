"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Save, Shield, Bell, Palette, Upload, User, X, Eye, EyeOff, Key } from "lucide-react";
import { toast } from "sonner";

interface Settings {
  defaultTemplate: string;
  autoSaveEnabled: boolean;
  emailNotifications: boolean;
}

function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      setError("New password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Password changed successfully");
        setOpen(false);
        setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Key className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Enter your current password and choose a new password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPasswords ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPasswords ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPasswords ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showPasswords"
              checked={showPasswords}
              onChange={(e) => setShowPasswords(e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="showPasswords" className="text-sm font-normal cursor-pointer">
              Show passwords
            </Label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Changing...
                </>
              ) : (
                "Change Password"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ProfilePhotoSection() {
  // const { toast } = useToast(); // Removed
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.profile?.profileImage || data.user?.image || null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Invalid file type. Please select an image file.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large. Please select an image smaller than 5MB.");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      const uploadData = await uploadResponse.json();
      const imageUrl = uploadData.url;

      // Update profile with new image
      const profileResponse = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileImage: imageUrl }),
      });

      if (profileResponse.ok) {
        setProfileImage(imageUrl);
        toast.success("Profile photo updated successfully");
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload profile photo");
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async () => {
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profileImage: null }),
      });

      if (response.ok) {
        setProfileImage(null);
        toast.success("Profile photo removed");
      }
    } catch (error) {
      toast.error("Failed to remove profile photo");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white bg-gray-200 shadow-sm">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile photo"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-400">
              <User className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isUploading}
              onClick={handleUploadClick}
              type="button"
            >
              {isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isUploading ? "Uploading..." : "Upload Photo"}
            </Button>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            {profileImage && (
              <Button
                variant="outline"
                size="sm"
                onClick={removePhoto}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            JPG, PNG or GIF. Max size 5MB.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const { data: session } = useSession();
  // const { toast } = useToast(); // Removed
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    defaultTemplate: "PROFESSIONAL",
    autoSaveEnabled: true,
    emailNotifications: true,
  });
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
    linkedin: "",
    github: "",
    twitter: "",
    googleScholar: "",
    orcid: "",
    researchGate: "",
  });

  useEffect(() => {
    fetchSettings();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfileData({
          name: data.user?.name || "",
          email: data.user?.email || "",
          phone: data.profile?.phone || "",
          location: data.profile?.location || "",
          website: data.profile?.website || "",
          bio: data.profile?.bio || "",
          linkedin: data.profile?.linkedin || "",
          github: data.profile?.github || "",
          twitter: data.profile?.twitter || "",
          googleScholar: data.profile?.googleScholar || "",
          orcid: data.profile?.orcid || "",
          researchGate: data.profile?.researchGate || "",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Saving settings:", settings);
      console.log("Saving profile:", profileData);
      
      // Save settings
      const settingsResponse = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      // Save profile
      const profileResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      });

      const settingsData = await settingsResponse.json();
      const profileResponseData = await profileResponse.json();
      
      console.log("Settings response:", settingsData);
      console.log("Profile response:", profileResponseData);

      if (settingsResponse.ok && profileResponse.ok) {
        toast.success("Settings and profile updated successfully");
        // Don't refetch immediately to avoid race conditions
        // await fetchSettings();
        // await fetchProfile();
      } else {
        throw new Error(settingsData.error || profileResponseData.error || "Save failed");
      }
    } catch (error) {
      console.error("Error saving:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader user={session?.user} />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader user={session?.user} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your application preferences and defaults
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="John Doe"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    placeholder="john@example.com"
                    className="mt-2"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    placeholder="City, Country"
                    className="mt-2"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={profileData.website}
                  onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  placeholder="https://yourwebsite.com"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  placeholder="Brief description about yourself..."
                  className="mt-2"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Social Media Links */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Social Media & Academic Profiles</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={profileData.linkedin}
                    onChange={(e) => setProfileData({ ...profileData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={profileData.github}
                    onChange={(e) => setProfileData({ ...profileData, github: e.target.value })}
                    placeholder="https://github.com/username"
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    value={profileData.twitter}
                    onChange={(e) => setProfileData({ ...profileData, twitter: e.target.value })}
                    placeholder="https://twitter.com/username"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="googleScholar">Google Scholar</Label>
                  <Input
                    id="googleScholar"
                    value={profileData.googleScholar}
                    onChange={(e) => setProfileData({ ...profileData, googleScholar: e.target.value })}
                    placeholder="https://scholar.google.com/citations?user=..."
                    className="mt-2"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orcid">ORCID</Label>
                  <Input
                    id="orcid"
                    value={profileData.orcid}
                    onChange={(e) => setProfileData({ ...profileData, orcid: e.target.value })}
                    placeholder="https://orcid.org/0000-0000-0000-0000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="researchGate">ResearchGate</Label>
                  <Input
                    id="researchGate"
                    value={profileData.researchGate}
                    onChange={(e) => setProfileData({ ...profileData, researchGate: e.target.value })}
                    placeholder="https://www.researchgate.net/profile/..."
                    className="mt-2"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Profile Photo */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Profile Photo</h2>
            </div>
            <ProfilePhotoSection />
          </Card>

          {/* CV Preferences */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Palette className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">CV Preferences</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultTemplate">Default CV Template</Label>
                <Select
                  value={settings.defaultTemplate}
                  onValueChange={(value) =>
                    setSettings({ ...settings, defaultTemplate: value })
                  }
                >
                  <SelectTrigger id="defaultTemplate" className="w-full mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MODERN">Modern</SelectItem>
                    <SelectItem value="PROFESSIONAL">Professional</SelectItem>
                    <SelectItem value="ACADEMIC">Academic</SelectItem>
                    <SelectItem value="MINIMAL">Minimal</SelectItem>
                    <SelectItem value="CREATIVE">Creative</SelectItem>
                    <SelectItem value="TECHNICAL">Technical</SelectItem>
                    <SelectItem value="ELEGANT">Elegant</SelectItem>
                    <SelectItem value="DARK">Midnight</SelectItem>
                    {![
                      "MODERN",
                      "PROFESSIONAL",
                      "ACADEMIC",
                      "MINIMAL",
                      "CREATIVE",
                      "TECHNICAL",
                      "ELEGANT",
                      "DARK",
                    ].includes(settings.defaultTemplate) && settings.defaultTemplate ? (
                      <SelectItem value={settings.defaultTemplate}>
                        {settings.defaultTemplate}
                      </SelectItem>
                    ) : null}
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-500 mt-2">
                  This template will be selected by default when creating new CVs
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="space-y-0.5">
                  <Label htmlFor="autoSave">Auto-save</Label>
                  <p className="text-sm text-gray-500">
                    Automatically save changes as you edit your CV
                  </p>
                </div>
                <Switch
                  id="autoSave"
                  checked={settings.autoSaveEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, autoSaveEnabled: checked })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Notifications</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-sm text-gray-500">
                    Receive updates about CV shares, comments, and activity
                  </p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailNotifications: checked })
                  }
                />
              </div>
            </div>
          </Card>

          {/* Account & Security */}
          <Card className="p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Account & Security</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Account Type</Label>
                <p className="text-sm text-gray-600 mt-1">
                  {session?.user?.role === "ADMIN" ? "Administrator" : "Free Plan"}
                </p>
              </div>
              <div className="pt-4 border-t">
                <Label>Password</Label>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  Change your account password
                </p>
                <ChangePasswordDialog />
              </div>
              <div className="pt-4 border-t">
                <Label className="text-destructive">Danger Zone</Label>
                <p className="text-sm text-gray-500 mt-1 mb-3">
                  Permanently delete your account and all data
                </p>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} size="lg">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
