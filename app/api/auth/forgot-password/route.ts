import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if email exists for security
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Get admin email settings
    const adminSettings = await prisma.aISettings.findFirst({
      where: {
        smtpHost: { not: null },
        smtpUser: { not: null },
        smtpPassword: { not: null },
      },
    });

    if (!adminSettings?.smtpHost || !adminSettings?.smtpUser || !adminSettings?.smtpPassword) {
      console.error("Email not configured - reset token created but email not sent");
      return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a password reset link has been sent.",
      });
    }

    // Create email transporter
    // smtpSecure: false = STARTTLS on port 587, true = direct TLS on port 465
    const transporter = nodemailer.createTransport({
      host: adminSettings.smtpHost,
      port: adminSettings.smtpPort || 587,
      secure: adminSettings.smtpSecure === true, // Only true for port 465 direct TLS
      auth: {
        user: adminSettings.smtpUser,
        pass: adminSettings.smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Get base URL
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`;
    const fromAddress = adminSettings.smtpFrom || adminSettings.smtpUser;
    const fromName = adminSettings.smtpFromName || "CV Builder";

    // Send email
    await transporter.sendMail({
      from: `"${fromName}" <${fromAddress}>`,
      to: user.email,
      subject: "Reset Your Password - CV Builder",
      text: `
Hello${user.name ? ` ${user.name}` : ''},

You requested to reset your password for your CV Builder account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.

Best regards,
CV Builder Team
      `.trim(),
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .footer { margin-top: 20px; color: #6b7280; font-size: 14px; }
    .warning { color: #dc2626; font-size: 13px; margin-top: 15px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">🔐 Password Reset</h1>
      <p style="margin: 10px 0 0 0; opacity: 0.9;">CV Builder</p>
    </div>
    <div class="content">
      <p>Hello${user.name ? ` <strong>${user.name}</strong>` : ''},</p>
      <p>You requested to reset your password for your CV Builder account.</p>
      <p>Click the button below to set a new password:</p>
      
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Password</a>
      </div>
      
      <p class="warning">⏰ This link will expire in 1 hour.</p>
      
      <p>If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.</p>
      
      <div class="footer">
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #667eea;">${resetUrl}</p>
      </div>
    </div>
  </div>
</body>
</html>
      `.trim(),
    });

    return NextResponse.json({
      success: true,
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
