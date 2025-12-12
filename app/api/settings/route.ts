import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/settings - Get user settings
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
      defaultTemplate: profile.defaultTemplate,
      autoSaveEnabled: profile.autoSaveEnabled,
      emailNotifications: profile.emailNotifications,
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// PUT /api/settings - Update user settings
export async function PUT(req: NextRequest) {
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

    const body = await req.json();

    // Update or create profile
      const templateInput = typeof body.defaultTemplate === "string"
        ? body.defaultTemplate.trim().toUpperCase()
        : "PROFESSIONAL";
      const allowedTemplates = new Set([
        "MODERN",
        "PROFESSIONAL",
        "ACADEMIC",
        "MINIMAL",
        "CREATIVE",
        "TECHNICAL",
        "ELEGANT",
        "DARK",
      ]);

      const normalizedDefaultTemplate = allowedTemplates.has(templateInput)
        ? templateInput
        : "PROFESSIONAL";
      const settingsData = {
        defaultTemplate: normalizedDefaultTemplate,
        autoSaveEnabled: body.autoSaveEnabled !== undefined ? body.autoSaveEnabled : true,
        emailNotifications: body.emailNotifications !== undefined ? body.emailNotifications : true,
      };

    if (user.profile) {
      await prisma.userProfile.update({
        where: { userId: user.id },
        data: settingsData,
      });
    } else {
      await prisma.userProfile.create({
        data: {
          userId: user.id,
          ...settingsData,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
