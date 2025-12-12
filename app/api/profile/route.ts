import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

// GET /api/profile - Get user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create profile if it doesn't exist
    let profile = user.profile;
    if (!profile) {
      profile = await prisma.userProfile.create({
        data: { userId: user.id },
      });
    }

    return NextResponse.json({
      user: {
        name: user.name || "",
        email: user.email,
        image: user.image || null,
      },
      profile: {
        phone: profile.phone || "",
        location: profile.location || "",
        website: profile.website || "",
        bio: profile.bio || "",
        profileImage: profile.profileImage || user.image || "",
        linkedin: profile.linkedin || "",
        googleScholar: profile.googleScholar || "",
        orcid: profile.orcid || "",
        researchGate: profile.researchGate || "",
        github: profile.github || "",
        twitter: profile.twitter || "",
        hIndex: profile.hIndex,
        totalCitations: profile.totalCitations,
      }
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update user profile
export async function PUT(req: NextRequest) {
  try {
    console.log("=== Profile Update Request ===");
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.error("Unauthorized: No session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      console.error("User not found:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    console.log("Profile update data:", {
      hasProfileImage: !!body.profileImage,
      profileImageUrl: body.profileImage ? body.profileImage.substring(0, 50) + '...' : 'none'
    });

    // Update user name
    if (body.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name: body.name },
      });
    }

    // Update or create profile
    const profileData: Record<string, any> = {};

    const assignIfPresent = (key: string, value: any, formatter?: (input: any) => any) => {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        profileData[key] = formatter ? formatter(value) : (value ?? null);
      }
    };

    assignIfPresent("phone", body.phone);
    assignIfPresent("location", body.location);
    assignIfPresent("website", body.website);
    assignIfPresent("bio", body.bio);
    assignIfPresent("linkedin", body.linkedin);
    assignIfPresent("googleScholar", body.googleScholar);
    assignIfPresent("orcid", body.orcid);
    assignIfPresent("researchGate", body.researchGate);
    assignIfPresent("github", body.github);
    assignIfPresent("twitter", body.twitter);
    assignIfPresent("hIndex", body.hIndex, (value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }
      const parsed = parseInt(String(value), 10);
      return Number.isNaN(parsed) ? null : parsed;
    });
    assignIfPresent("totalCitations", body.totalCitations, (value) => {
      if (value === undefined || value === null || value === "") {
        return null;
      }
      const parsed = parseInt(String(value), 10);
      return Number.isNaN(parsed) ? null : parsed;
    });
    assignIfPresent("profileImage", body.profileImage, (value) => {
      if (typeof value !== "string") {
        return null;
      }
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : null;
    });

    console.log("Updating profile with data:", JSON.stringify(profileData, null, 2));

    if (user.profile) {
      console.log("Updating existing profile for user:", user.id);
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: profileData,
      });
    } else {
      console.log("Creating new profile for user:", user.id);
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          ...profileData,
        },
      });
    }

    console.log("✅ Profile updated successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Error updating profile:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Failed to update profile", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
