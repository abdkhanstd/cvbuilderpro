import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, category, subject, message } = body;

    // Validate required fields
    if (!name || !email || !category || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Get email settings from admin (assuming there's an admin user with email settings)
    // We'll get the first admin user's settings or create default ones
    let emailSettings = await prisma.aISettings.findFirst({
      where: {
        smtpHost: { not: null },
        smtpUser: { not: null },
        smtpPassword: { not: null },
      },
    });

    if (!emailSettings) {
      // Try to find any settings with email configuration
      emailSettings = await prisma.aISettings.findFirst();
    }

    if (!emailSettings) {
      return NextResponse.json(
        { error: "Email service not configured. Please contact support directly." },
        { status: 500 }
      );
    }

    const {
      smtpHost,
      smtpPort = 587,
      smtpUser,
      smtpPassword,
      smtpFrom,
      smtpFromName = "CV Builder Support",
      smtpSecure = false,
      smtpSecurity = "STARTTLS",
      emailProvider = "SMTP",
      msClientId,
      msClientSecret,
      msRefreshToken,
      msAccessToken,
      msTokenExpiry,
    } = emailSettings;

    // Determine secure mode
    const isSecure = smtpSecurity === "SSL" || smtpSecure === true;

    const fromAddress = smtpFrom || smtpUser || "";
    const supportEmail = process.env.SUPPORT_EMAIL || "support@cvbuilder.com"; // Support recipient email

    let transporter;
    let accessToken = msAccessToken;

    if (emailProvider === "MICROSOFT" && msRefreshToken) {
      // Handle Microsoft OAuth token refresh if needed
      if (!accessToken || (msTokenExpiry && new Date() > msTokenExpiry)) {
        try {
          const tokenResponse = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
              client_id: msClientId!,
              client_secret: msClientSecret!,
              refresh_token: msRefreshToken,
              grant_type: "refresh_token",
              scope: "https://outlook.office.com/SMTP.Send offline_access",
            }),
          });

          if (!tokenResponse.ok) {
            throw new Error("Failed to refresh Microsoft OAuth token");
          }

          const tokenData = await tokenResponse.json();
          accessToken = tokenData.access_token;

          // Update tokens in database
          await prisma.aISettings.updateMany({
            data: {
              msAccessToken: tokenData.access_token,
              msRefreshToken: tokenData.refresh_token || msRefreshToken,
              msTokenExpiry: new Date(Date.now() + tokenData.expires_in * 1000),
            } as Record<string, unknown>,
          });
        } catch (error) {
          console.error("Failed to refresh Microsoft OAuth token:", error);
          // Fall back to SMTP if OAuth fails
        }
      }

      if (accessToken) {
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
      }
    }

    // Use SMTP if not using Microsoft OAuth or if OAuth failed
    if (!transporter) {
      if (!smtpHost || !smtpUser || !smtpPassword) {
        return NextResponse.json(
          { error: "Email service not properly configured" },
          { status: 500 }
        );
      }

      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
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

    // Get category display name
    const categoryNames: Record<string, string> = {
      general: "General Question",
      technical: "Technical Issue",
      feature: "Feature Request",
      account: "Account Help",
      billing: "Billing Question",
      other: "Other",
    };

    const categoryDisplay = categoryNames[category] || category;

    // Send email to support
    await transporter.sendMail({
      from: `"${smtpFromName}" <${fromAddress}>`,
      to: supportEmail,
      subject: `[CV Builder Support] ${categoryDisplay}: ${subject}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border-radius: 0 0 8px 8px; }
    .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .detail-item { margin: 8px 0; }
    .label { font-weight: bold; color: #374151; }
    .message { background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; margin: 15px 0; }
    .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CV Builder Support Request</h1>
      <p>New support request received</p>
    </div>
    <div class="content">
      <div class="details">
        <h3>Contact Information</h3>
        <div class="detail-item"><span class="label">Name:</span> ${name}</div>
        <div class="detail-item"><span class="label">Email:</span> ${email}</div>
        <div class="detail-item"><span class="label">Category:</span> ${categoryDisplay}</div>
        <div class="detail-item"><span class="label">Subject:</span> ${subject}</div>
      </div>

      <div class="message">
        <h3>Message</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      </div>

      <div class="details">
        <h3>System Information</h3>
        <div class="detail-item"><span class="label">Timestamp:</span> ${new Date().toLocaleString()}</div>
        <div class="detail-item"><span class="label">User Agent:</span> ${req.headers.get('user-agent') || 'Unknown'}</div>
      </div>
    </div>
    <div class="footer">
      <p>CV Builder Pro - Academic CV Management System</p>
      <p>Please respond to the user's email: ${email}</p>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "Support request sent successfully",
    });
  } catch (error) {
    console.error("Error sending support email:", error);

    let errorMessage = "Failed to send support request";
    if (error instanceof Error) {
      if (error.message.includes("Invalid login")) {
        errorMessage = "Email authentication failed. Please try again later.";
      } else if (error.message.includes("ETIMEDOUT")) {
        errorMessage = "Connection timeout. Please try again later.";
      } else {
        errorMessage = "An error occurred while sending your request. Please try again.";
      }
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}