import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface AdminSettings {
  emailProvider: string;
  smtpHost: string | null;
  smtpPort: number;
  smtpUser: string | null;
  smtpPassword: string | null;
  smtpFrom: string | null;
  smtpFromName: string | null;
  smtpSecure: boolean;
  msClientId: string | null;
  msClientSecret: string | null;
  msTenantId: string | null;
  msRefreshToken: string | null;
  msAccessToken: string | null;
  msTokenExpiry: Date | null;
}

async function refreshMicrosoftToken(settings: AdminSettings, userId: string): Promise<string | null> {
  if (!settings.msClientId || !settings.msClientSecret || !settings.msRefreshToken) {
    return null;
  }

  const tokenEndpoint = `https://login.microsoftonline.com/${settings.msTenantId || "common"}/oauth2/v2.0/token`;

  try {
    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: settings.msClientId,
        client_secret: settings.msClientSecret,
        refresh_token: settings.msRefreshToken,
        grant_type: "refresh_token",
        scope: "https://outlook.office.com/SMTP.Send offline_access",
      }),
    });

    const data = await response.json();

    if (data.error) {
      console.error("Token refresh error:", data);
      return null;
    }

    // Update tokens in database
    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    await prisma.aISettings.update({
      where: { userId },
      data: {
        msAccessToken: data.access_token,
        msRefreshToken: data.refresh_token || settings.msRefreshToken,
        msTokenExpiry: expiresAt,
      },
    });

    return data.access_token;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

async function sendWithMicrosoft(
  settings: AdminSettings,
  userId: string,
  options: EmailOptions
): Promise<void> {
  // Check if token needs refresh
  let accessToken = settings.msAccessToken;
  
  if (!accessToken || !settings.msTokenExpiry || new Date() >= settings.msTokenExpiry) {
    accessToken = await refreshMicrosoftToken(settings, userId);
    if (!accessToken) {
      throw new Error("Failed to get valid Microsoft access token. Please re-authorize.");
    }
  }

  // Use nodemailer with OAuth2
  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      type: "OAuth2",
      user: settings.smtpUser || settings.smtpFrom || "",
      accessToken: accessToken,
    },
  });

  const fromAddress = settings.smtpFrom || settings.smtpUser || "";
  const fromName = settings.smtpFromName || "CV Builder";

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

async function sendWithSMTP(settings: AdminSettings, options: EmailOptions): Promise<void> {
  if (!settings.smtpHost || !settings.smtpUser || !settings.smtpPassword) {
    throw new Error("SMTP settings not configured");
  }

  const transporter = nodemailer.createTransport({
    host: settings.smtpHost,
    port: settings.smtpPort || 587,
    secure: settings.smtpSecure === true,
    auth: {
      user: settings.smtpUser,
      pass: settings.smtpPassword,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const fromAddress = settings.smtpFrom || settings.smtpUser;
  const fromName = settings.smtpFromName || "CV Builder";

  await transporter.sendMail({
    from: `"${fromName}" <${fromAddress}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}

export async function sendEmail(userId: string, options: EmailOptions): Promise<void> {
  const settings = await prisma.aISettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    throw new Error("Email settings not configured");
  }

  // Cast to our interface with type assertion
  const adminSettings = settings as unknown as AdminSettings;

  if (adminSettings.emailProvider === "MICROSOFT") {
    await sendWithMicrosoft(adminSettings, userId, options);
  } else {
    await sendWithSMTP(adminSettings, options);
  }
}

export async function sendEmailWithSettings(settings: AdminSettings, userId: string, options: EmailOptions): Promise<void> {
  if (settings.emailProvider === "MICROSOFT") {
    await sendWithMicrosoft(settings, userId, options);
  } else {
    await sendWithSMTP(settings, options);
  }
}

// Send email using the first available admin's settings (for system emails)
export async function sendSystemEmail(options: EmailOptions): Promise<void> {
  // Find an admin with configured email settings
  const adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!adminUser) {
    throw new Error("No admin user found");
  }

  const settings = await prisma.aISettings.findUnique({
    where: { userId: adminUser.id },
  });

  if (!settings) {
    throw new Error("Email settings not configured by admin");
  }

  const adminSettings = settings as unknown as AdminSettings;
  
  if (adminSettings.emailProvider === "MICROSOFT") {
    await sendWithMicrosoft(adminSettings, adminUser.id, options);
  } else {
    await sendWithSMTP(adminSettings, options);
  }
}

// Send verification email to new users
export async function sendVerificationEmail(email: string, token: string, name?: string): Promise<void> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verifyUrl = `${baseUrl}/auth/verify-email?token=${token}`;

  await sendSystemEmail({
    to: email,
    subject: "Verify Your Email - CV Builder",
    text: `
Hello${name ? ` ${name}` : ""},

Thank you for registering with CV Builder!

Please verify your email address by clicking the link below:

${verifyUrl}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

Best regards,
CV Builder Team
    `.trim(),
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #2563eb; margin: 0;">CV Builder</h1>
  </div>
  
  <div style="background: #f8fafc; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="margin-top: 0;">Verify Your Email Address</h2>
    <p>Hello${name ? ` <strong>${name}</strong>` : ""},</p>
    <p>Thank you for registering with CV Builder! Please click the button below to verify your email address:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${verifyUrl}" style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
        Verify Email Address
      </a>
    </div>
    
    <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
    <p style="background: #e2e8f0; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">${verifyUrl}</p>
    
    <p style="color: #666; font-size: 14px; margin-top: 20px;">This link will expire in 24 hours.</p>
  </div>
  
  <div style="text-align: center; color: #666; font-size: 12px;">
    <p>If you did not create an account, please ignore this email.</p>
    <p>&copy; ${new Date().getFullYear()} CV Builder. All rights reserved.</p>
  </div>
</body>
</html>
    `.trim(),
  });
}
