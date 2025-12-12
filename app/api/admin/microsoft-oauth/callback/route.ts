import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("Microsoft OAuth error:", error, errorDescription);
      return NextResponse.redirect(
        new URL(`/dashboard/admin/settings?error=${encodeURIComponent(errorDescription || error)}&tab=email`, req.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/dashboard/admin/settings?error=No authorization code received&tab=email", req.url)
      );
    }

    // Get current settings to retrieve client credentials
    const settings = await prisma.aISettings.findUnique({
      where: { userId: user.id },
    });

    if (!settings?.msClientId || !settings?.msClientSecret) {
      return NextResponse.redirect(
        new URL("/dashboard/admin/settings?error=Microsoft client credentials not configured&tab=email", req.url)
      );
    }

    // Exchange code for tokens
    const tokenEndpoint = `https://login.microsoftonline.com/${settings.msTenantId || "common"}/oauth2/v2.0/token`;
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/admin/microsoft-oauth/callback`;

    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: settings.msClientId,
        client_secret: settings.msClientSecret,
        code: code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
        scope: "https://outlook.office.com/SMTP.Send offline_access",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange error:", tokenData);
      return NextResponse.redirect(
        new URL(`/dashboard/admin/settings?error=${encodeURIComponent(tokenData.error_description || tokenData.error)}&tab=email`, req.url)
      );
    }

    // Save tokens to database
    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);

    await prisma.aISettings.update({
      where: { userId: user.id },
      data: {
        msAccessToken: tokenData.access_token,
        msRefreshToken: tokenData.refresh_token,
        msTokenExpiry: expiresAt,
        emailProvider: "MICROSOFT",
      },
    });

    return NextResponse.redirect(
      new URL("/dashboard/admin/settings?success=Microsoft OAuth connected successfully&tab=email", req.url)
    );
  } catch (error) {
    console.error("Microsoft OAuth callback error:", error);
    return NextResponse.redirect(
      new URL("/dashboard/admin/settings?error=Failed to complete OAuth&tab=email", req.url)
    );
  }
}
