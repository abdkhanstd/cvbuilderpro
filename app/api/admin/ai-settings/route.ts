import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    // Get or create AI settings for this admin user
    let aiSettings = await prisma.aISettings.findUnique({
      where: { userId: user.id },
    });

    if (!aiSettings) {
      // Create default settings
      aiSettings = await prisma.aISettings.create({
        data: {
          userId: user.id,
          defaultProvider: "OPENROUTER",
          aiSuggestionsEnabled: true,
          autoImproveText: false,
          citationAssist: true,
          grammarCheck: true,
        },
      });
    }

    return NextResponse.json({ settings: aiSettings });
  } catch (error) {
    console.error("Error fetching AI settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch AI settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const {
      openRouterKey,
      openRouterModel,
      openRouterFallbackModels,
      claudeKey,
      claudeModel,
      ollamaUrl,
      ollamaModel,
      defaultProvider,
      aiSuggestionsEnabled,
      autoImproveText,
      citationAssist,
      grammarCheck,
      // Email/SMTP settings
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFrom,
      smtpFromName,
      smtpSecure,
      smtpSecurity,
      emailVerificationEnabled,
      emailNotificationsEnabled,
      // Microsoft OAuth settings
      emailProvider,
      msClientId,
      msClientSecret,
      msTenantId,
      // Sharing settings (admin)
      baseUrl,
      enableSharing,
      maxSharedCvs,
    } = body;

    // Update or create AI settings
    const aiSettings = await prisma.aISettings.upsert({
      where: { userId: user.id },
      update: {
        openRouterKey,
        openRouterModel,
        openRouterFallbackModels: openRouterFallbackModels ? JSON.stringify(openRouterFallbackModels) : null,
        claudeKey,
        claudeModel,
        ollamaUrl,
        ollamaModel,
        defaultProvider,
        aiSuggestionsEnabled,
        autoImproveText,
        citationAssist,
        grammarCheck,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        smtpFrom,
        smtpFromName,
        smtpSecure,
        smtpSecurity,
        emailVerificationEnabled,
        emailNotificationsEnabled,
        emailProvider,
        msClientId,
        msClientSecret,
        msTenantId,
        baseUrl,
        enableSharing,
        maxSharedCvs,
      },
      create: {
        userId: user.id,
        openRouterKey,
        openRouterModel,
        openRouterFallbackModels: openRouterFallbackModels ? JSON.stringify(openRouterFallbackModels) : null,
        claudeKey,
        claudeModel,
        ollamaUrl,
        ollamaModel,
        defaultProvider,
        aiSuggestionsEnabled,
        autoImproveText,
        citationAssist,
        grammarCheck,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPassword,
        smtpFrom,
        smtpFromName,
        smtpSecure,
        smtpSecurity,
        emailVerificationEnabled,
        emailNotificationsEnabled,
        emailProvider,
        msClientId,
        msClientSecret,
        msTenantId,
        baseUrl,
        enableSharing,
        maxSharedCvs,
      },
    });

    return NextResponse.json({ settings: aiSettings });
  } catch (error) {
    console.error("Error saving AI settings:", error);
    return NextResponse.json(
      { error: "Failed to save AI settings" },
      { status: 500 }
    );
  }
}
