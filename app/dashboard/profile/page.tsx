"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    bio: "",
    profileImage: "",
    linkedin: "",
    googleScholar: "",
    orcid: "",
    researchGate: "",
    github: "",
    twitter: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      console.log("=== Fetching Profile ===");
      const res = await fetch("/api/profile", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        console.log("Profile data received:", {
          hasProfileImage: !!data.profile?.profileImage,
          profileImageUrl: data.profile?.profileImage
        });
        setProfile({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.profile?.phone || "",
          location: data.profile?.location || "",
          website: data.profile?.website || "",
          bio: data.profile?.bio || "",
          profileImage: data.profile?.profileImage || data.user?.image || "",
          linkedin: data.profile?.linkedin || "",
          googleScholar: data.profile?.googleScholar || "",
          orcid: data.profile?.orcid || "",
          researchGate: data.profile?.researchGate || "",
          github: data.profile?.github || "",
          twitter: data.profile?.twitter || "",
        });
      } else {
        const errorData = await res.json();
        console.error("Failed to fetch profile:", errorData);
        toast.error("Failed to load profile");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log("=== Uploading Image ===");
    console.log("File:", file.name, file.size, file.type);

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Upload successful, URL:", data.url);
        setProfile({ ...profile, profileImage: data.url });
        toast.success("Image uploaded successfully");
      } else {
        const errorData = await res.json();
        console.error("Upload failed:", errorData);
        toast.error(errorData.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    console.log("=== Submitting Profile ===");
    console.log("Profile data being saved:", {
      hasProfileImage: !!profile.profileImage,
      profileImageValue: profile.profileImage
    });

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
        // Don't refetch immediately to avoid race conditions or UI flicker
        // The local state is already up to date with what we sent
        // await fetchProfile(); 
      } else {
        const errorData = await res.json();
        console.error("Profile update failed:", errorData);
        toast.error(errorData.details || errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500 mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Image */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Image</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {profile.profileImage ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                  <Image
                    src={profile.profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setProfile({ ...profile, profileImage: "" })}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Upload Photo
                </div>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
              </Label>
              <p className="text-sm text-gray-500 mt-2">
                JPG, PNG or GIF. Max size 5MB.
              </p>
            </div>
          </div>
        </Card>

        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                placeholder="City, Country"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Social Links */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Social & Research Links</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={profile.linkedin}
                onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                value={profile.github}
                onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <Label htmlFor="googleScholar">Google Scholar</Label>
              <Input
                id="googleScholar"
                value={profile.googleScholar}
                onChange={(e) =>
                  setProfile({ ...profile, googleScholar: e.target.value })
                }
                placeholder="https://scholar.google.com/citations?user=..."
              />
            </div>
            <div>
              <Label htmlFor="orcid">ORCID</Label>
              <Input
                id="orcid"
                value={profile.orcid}
                onChange={(e) => setProfile({ ...profile, orcid: e.target.value })}
                placeholder="0000-0000-0000-0000"
              />
            </div>
            <div>
              <Label htmlFor="researchGate">ResearchGate</Label>
              <Input
                id="researchGate"
                value={profile.researchGate}
                onChange={(e) =>
                  setProfile({ ...profile, researchGate: e.target.value })
                }
                placeholder="https://researchgate.net/profile/..."
              />
            </div>
            <div>
              <Label htmlFor="twitter">Twitter</Label>
              <Input
                id="twitter"
                value={profile.twitter}
                onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
