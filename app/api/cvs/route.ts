import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CV_THEMES } from "@/lib/cv-themes";
import { CV_LAYOUTS } from "@/lib/cv-layouts";

// GET /api/cvs - Get all CVs for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cvs = await prisma.cV.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: {
          select: {
            shares: true,
            comments: true,
            exports: true,
          },
        },
      },
    });

    return NextResponse.json(cvs);
  } catch (error) {
    console.error("Error fetching CVs:", error);
    return NextResponse.json(
      { error: "Failed to fetch CVs" },
      { status: 500 }
    );
  }
}

// POST /api/cvs - Create a new CV
export async function POST(req: NextRequest) {
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
  const { title, template = "MODERN", theme: requestedTheme, photoPlacement, layout: requestedLayout } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const normalizedTemplate = typeof template === "string"
      ? template.trim().toUpperCase()
      : "MODERN";

    const templateConfig: Record<string, { theme: string; layout: string; category: string }> = {
      MODERN: { theme: "modern-blue", layout: "modern-two-column", category: "PROFESSIONAL" },
      PROFESSIONAL: { theme: "professional-green", layout: "executive-sidebar-left", category: "PROFESSIONAL" },
      ACADEMIC: { theme: "classic-indigo", layout: "academic-timeline", category: "ACADEMIC" },
      MINIMAL: { theme: "minimal-gray", layout: "minimal-clean", category: "PROFESSIONAL" },
      CREATIVE: { theme: "creative-orange", layout: "creative-asymmetric", category: "CREATIVE" },
      TECHNICAL: { theme: "tech-cyan", layout: "technical-grid", category: "TECHNICAL" },
      ELEGANT: { theme: "elegant-purple", layout: "executive-sidebar-right", category: "PROFESSIONAL" },
      DARK: { theme: "dark-slate", layout: "classic-single", category: "PROFESSIONAL" },
    };

    const templatePreset = templateConfig[normalizedTemplate];
    if (!templatePreset) {
      return NextResponse.json(
        { error: "Unsupported template selection" },
        { status: 400 }
      );
    }

    const availableThemeIds = new Set(CV_THEMES.map((theme) => theme.id));
    const availableLayouts = new Set(CV_LAYOUTS.map((layout) => layout.id));
    const allowedPhotoPlacements = new Set(["left", "right", "top", "none"]);

    const normalizedTheme = typeof requestedTheme === "string"
      ? requestedTheme.trim()
      : undefined;
    const themeOverride = normalizedTheme && availableThemeIds.has(normalizedTheme)
      ? normalizedTheme
      : undefined;

    const normalizedLayout = typeof requestedLayout === "string"
      ? requestedLayout.trim()
      : undefined;
    const layoutOverride = normalizedLayout && availableLayouts.has(normalizedLayout)
      ? normalizedLayout
      : undefined;

    const normalizedPhotoPlacement = typeof photoPlacement === "string" && allowedPhotoPlacements.has(photoPlacement)
      ? photoPlacement as "left" | "right" | "top" | "none"
      : undefined;

    // Auto-fill CV data from user profile
    const profile = user.profile;
    const cvData: Record<string, unknown> = {
      userId: user.id,
      title: title.trim(),
      template: normalizedTemplate,
      isPublic: false,
      viewCount: 0,
      downloadCount: 0,
      fullName: user.name || "",
      email: user.email,
      theme: themeOverride || templatePreset.theme,
      layout: templatePreset.layout,
      category: templatePreset.category,
      themeData: normalizedPhotoPlacement ? JSON.stringify({ photoPlacement: normalizedPhotoPlacement }) : null,
    };

    if (layoutOverride) {
      cvData.layout = layoutOverride;
    }

    // Add profile data if available
    if (profile) {
      if (profile.phone) cvData.phone = profile.phone;
      if (profile.location) cvData.location = profile.location;
      if (profile.website) cvData.website = profile.website;
      // Use profile image from profile, fallback to user image
      if (profile.profileImage) {
        cvData.profileImage = profile.profileImage;
      } else if (user.image) {
        cvData.profileImage = user.image;
      }
  if (profile.linkedin) cvData.linkedin = profile.linkedin;
  if (profile.github) cvData.github = profile.github;
      if (profile.hIndex) cvData.hIndex = profile.hIndex;
      if (profile.totalCitations) cvData.totalCitations = profile.totalCitations;
      if (profile.bio) cvData.summary = profile.bio;
    } else if (user.image) {
      // Fallback if no profile record exists but user has an image
      cvData.profileImage = user.image;
    }

    const cv = await prisma.cV.create({
      data: cvData,
    });

    const contactEntries: Array<{ type: string; value: string; label?: string; isPrimary?: boolean; order: number }> = [];
  const socialLinksData: Array<{ platform: string; url: string; order: number }> = [];

    if (user.email) {
      contactEntries.push({ type: "email", value: user.email, label: "Email", isPrimary: true, order: contactEntries.length });
    }
    if (profile?.phone) {
      contactEntries.push({ type: "phone", value: profile.phone, label: "Phone", order: contactEntries.length });
    }
    if (profile?.website) {
      contactEntries.push({ type: "website", value: profile.website, label: "Website", order: contactEntries.length });
    }
    if (profile?.googleScholar) {
      contactEntries.push({ type: "googleScholar", value: profile.googleScholar, label: "Google Scholar", order: contactEntries.length });
    }
    if (profile?.orcid) {
      contactEntries.push({ type: "orcid", value: profile.orcid, label: "ORCID", order: contactEntries.length });
    }
    if (profile?.researchGate) {
      contactEntries.push({ type: "researchGate", value: profile.researchGate, label: "ResearchGate", order: contactEntries.length });
    }
    if (profile?.twitter) {
      contactEntries.push({ type: "twitter", value: profile.twitter, label: "Twitter", order: contactEntries.length });
    }

    const addSocialLink = (platform: string, url?: string | null) => {
      if (!url) return;
      const trimmed = String(url).trim();
      if (!trimmed) return;
      socialLinksData.push({ platform, url: trimmed, order: socialLinksData.length });
    };

    addSocialLink("LinkedIn", profile?.linkedin || cvData.linkedin);
    addSocialLink("GitHub", profile?.github || cvData.github);
    addSocialLink("Twitter", profile?.twitter);
    addSocialLink("Google Scholar", profile?.googleScholar);
    addSocialLink("ORCID", profile?.orcid);
    addSocialLink("ResearchGate", profile?.researchGate);

    if (contactEntries.length > 0) {
      await prisma.contactInfo.createMany({
        data: contactEntries.map((entry) => ({
          cvId: cv.id,
          type: entry.type,
          value: entry.value,
          label: entry.label || null,
          isPrimary: entry.isPrimary === true,
          order: entry.order,
        })),
      });
    }

    if (socialLinksData.length > 0) {
      await prisma.socialLink.createMany({
        data: socialLinksData.map((link) => ({
          cvId: cv.id,
          platform: link.platform,
          url: link.url,
          order: link.order,
        })),
      });
    }

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        action: "CV_CREATED",
        metadata: JSON.stringify({ cvId: cv.id, template: cv.template, title: cv.title }),
      },
    });

    return NextResponse.json(cv, { status: 201 });
  } catch (error) {
    console.error("Error creating CV:", error);
    const message = error instanceof Error ? error.message : "Failed to create CV";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
