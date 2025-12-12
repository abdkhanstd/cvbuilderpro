import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

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
      emailProvider,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      smtpFrom,
      smtpFromName,
      smtpSecure,
      smtpSecurity,
    } = body;

    // Determine secure mode based on smtpSecurity or smtpSecure
    const isSecure = smtpSecurity === "SSL" || smtpSecure === true;

    const fromAddress = smtpFrom || smtpUser || "";
    const fromName = smtpFromName || "CV Builder";
    const toAddress = smtpUser || smtpFrom || "";

    let transporter;

    if (emailProvider === "MICROSOFT") {
      // Use Microsoft OAuth
      const settings = await prisma.aISettings.findUnique({
        where: { userId: user.id },
      });

      if (!settings) {
        return NextResponse.json(
          { error: "Settings not found. Please save settings first." },
          { status: 400 }
        );
      }

      // Type assertion for new fields
      const msSettings = settings as typeof settings & {
        msAccessToken: string | null;
        msRefreshToken: string | null;
        msTokenExpiry: Date | null;
        msClientId: string | null;
        msClientSecret: string | null;
        msTenantId: string | null;
      };

      if (!msSettings.msAccessToken || !msSettings.msRefreshToken) {
        return NextResponse.json(
          { error: "Microsoft OAuth not authorized. Please click 'Authorize with Microsoft' button." },
          { status: 400 }
        );
      }

      // Check if token needs refresh
      let accessToken = msSettings.msAccessToken;
      
      if (msSettings.msTokenExpiry && new Date() >= msSettings.msTokenExpiry) {
        // Refresh token
        const tokenEndpoint = `https://login.microsoftonline.com/${msSettings.msTenantId || "common"}/oauth2/v2.0/token`;
        
        const tokenResponse = await fetch(tokenEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: msSettings.msClientId || "",
            client_secret: msSettings.msClientSecret || "",
            refresh_token: msSettings.msRefreshToken,
            grant_type: "refresh_token",
            scope: "https://outlook.office.com/SMTP.Send offline_access",
          }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
          return NextResponse.json(
            { error: `Token refresh failed: ${tokenData.error_description || tokenData.error}. Please re-authorize.` },
            { status: 400 }
          );
        }

        accessToken = tokenData.access_token;

        // Update tokens in database
        await prisma.aISettings.update({
          where: { userId: user.id },
          data: {
            msAccessToken: tokenData.access_token,
            msRefreshToken: tokenData.refresh_token || msSettings.msRefreshToken,
            msTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
          } as Record<string, unknown>,
        });
      }

      transporter = nodemailer.createTransport({
        host: "smtp-mail.outlook.com",
        port: 587,
        secure: false,
        auth: {
          type: "OAuth2",
          user: fromAddress,
          accessToken: accessToken,
        },
      });
    } else {
      // Use SMTP
      if (!smtpHost || !smtpUser || !smtpPassword) {
        return NextResponse.json(
          { error: "SMTP host, username, and password are required" },
          { status: 400 }
        );
      }

      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort || 587,
        secure: isSecure,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });
    }

    // Verify connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: toAddress,
      subject: "CV Builder - Test Email Configuration",
      text: `
Hello,

This is a test email from CV Builder to verify your email configuration.

If you received this email, your settings are configured correctly!

Configuration:
- Provider: ${emailProvider === "MICROSOFT" ? "Microsoft OAuth" : "SMTP"}
${emailProvider !== "MICROSOFT" ? `- SMTP Host: ${smtpHost}
- SMTP Port: ${smtpPort}
- Security: ${smtpSecurity || (isSecure ? "SSL" : "STARTTLS")}` : "- Using OAuth2 authentication"}
- From: ${fromAddress}

Best regards,
CV Builder System
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .success { color: #059669; font-weight: bold; font-size: 18px; margin-bottom: 15px; }
    .details { background: white; padding: 15px; border-radius: 6px; margin-top: 15px; border: 1px solid #e5e7eb; }
    .detail-item { margin: 8px 0; }
    .label { color: #6b7280; }
    .footer { text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✉️ CV Builder</h1>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">Email Test</p>
    </div>
    <div class="content">
      <p class="success">✓ Your email configuration is working!</p>
      <p>This is a test email from CV Builder to verify your email settings.</p>
      
      <div class="details">
        <h3 style="margin-top: 0;">Configuration Details</h3>
        <div class="detail-item"><span class="label">Provider:</span> ${emailProvider === "MICROSOFT" ? "Microsoft OAuth" : "SMTP"}</div>
        ${emailProvider !== "MICROSOFT" ? `
        <div class="detail-item"><span class="label">SMTP Host:</span> ${smtpHost}</div>
        <div class="detail-item"><span class="label">SMTP Port:</span> ${smtpPort}</div>
        <div class="detail-item"><span class="label">Secure:</span> ${smtpSecure ? "Yes (TLS/SSL)" : "No (STARTTLS)"}</div>
        ` : '<div class="detail-item"><span class="label">Auth:</span> OAuth2</div>'}
        <div class="detail-item"><span class="label">From:</span> ${fromAddress}</div>
      </div>
    </div>
    <div class="footer">
      <p>CV Builder - Academic CV Management System</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Test email sent successfully",
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    
    let errorMessage = "Failed to send test email";
    if (error instanceof Error) {
      // Provide more helpful error messages
      if (error.message.includes("basic authentication is disabled")) {
        errorMessage = "Microsoft has disabled basic SMTP authentication for personal accounts. Please use Microsoft OAuth instead.";
      } else if (error.message.includes("Invalid login")) {
        errorMessage = "Authentication failed. Check your credentials or use OAuth for Outlook.com personal accounts.";
      } else if (error.message.includes("ETIMEDOUT")) {
        errorMessage = "Connection timed out. Check your SMTP server address and port.";
      } else if (error.message.includes("wrong version number")) {
        errorMessage = "TLS/SSL version mismatch. Try toggling the 'Use Direct TLS' option.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
