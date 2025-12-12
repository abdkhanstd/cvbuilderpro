import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRCode } from "@/lib/qr-code";
import { nanoid } from "nanoid";

function generateShareToken(): string {
  return nanoid(16); // Generate a 16-character unique token
}

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/cvs/[id]/share - Get share information
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    const cv = await prisma.cV.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Get admin-configured sharing settings from AI settings record (fallback to env)
    const adminSettings = await prisma.aISettings.findFirst();
    const baseUrl = adminSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const sharingEnabled = typeof adminSettings?.enableSharing === "boolean" ? adminSettings.enableSharing : (process.env.ENABLE_SHARING !== "false");

    if (!sharingEnabled) {
      return NextResponse.json({ error: "Sharing is disabled" }, { status: 403 });
    }

    // Check if share exists
    const share = await prisma.cVShare.findUnique({
      where: { cvId: params.id },
      include: {
        attachedCvs: {
          include: {
            cv: {
              select: { id: true, title: true, fullName: true }
            }
          }
        }
      },
    });

    if (!share) {
      return NextResponse.json({ share: null });
    }

    const shareUrl = `${baseUrl}/share/${share.shareToken}`;
    const qrCodeUrl = await generateQRCode(shareUrl);

    return NextResponse.json({
      share: {
        id: share.id,
        shareUrl,
        qrCodeUrl,
        isActive: share.isActive,
        expiresAt: share.expiresAt?.toISOString() || null,
        allowDownload: share.allowDownload,
        viewCount: share.viewCount,
        downloadCount: share.downloadCount,
        attachedCvs: share.attachedCvs.map(ac => ac.cvId),
        createdAt: share.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting share info:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/cvs/[id]/share - Create share link
export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const cv = await prisma.cV.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    const body = await request.json();
    const { expiresAt, allowDownload = true } = body;

    // Get admin-configured sharing settings from AI settings record (fall back to env)
    const adminSettings = await prisma.aISettings.findFirst();
    const baseUrl = adminSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const sharingEnabled = typeof adminSettings?.enableSharing === "boolean" ? adminSettings.enableSharing : (process.env.ENABLE_SHARING !== "false");
    const maxSharedCvs = typeof adminSettings?.maxSharedCvs === "number" ? adminSettings.maxSharedCvs : parseInt(process.env.MAX_SHARED_CVS || "10");

    if (!sharingEnabled) {
      return NextResponse.json({ error: "Sharing is disabled by admin" }, { status: 403 });
    }

    // Check user's current share count
    const userShareCount = await prisma.cVShare.count({
      where: { cv: { userId: user.id } },
    });

    if (maxSharedCvs > 0 && userShareCount >= maxSharedCvs) {
      return NextResponse.json({
        error: `Maximum ${maxSharedCvs} shared CVs allowed per user`
      }, { status: 403 });
    }

    // Check if share already exists
    const existingShare = await prisma.cVShare.findUnique({
      where: { cvId: params.id },
    });

    if (existingShare) {
      const shareUrl = `${baseUrl}/share/${existingShare.shareToken}`;
      const qrCodeUrl = await generateQRCode(shareUrl);

      return NextResponse.json({
        share: {
          id: existingShare.id,
          shareUrl,
          qrCodeUrl,
          isActive: existingShare.isActive,
          expiresAt: existingShare.expiresAt?.toISOString() || null,
          allowDownload: existingShare.allowDownload,
          viewCount: existingShare.viewCount,
          downloadCount: existingShare.downloadCount,
          attachedCvs: [],
          createdAt: existingShare.createdAt.toISOString(),
        },
      });
    }

    // Create new share
    const share = await prisma.cVShare.create({
      data: {
        cvId: params.id,
        userId: user.id,
        shareToken: generateShareToken(),
        isActive: true,
        allowDownload: allowDownload,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        viewCount: 0,
        downloadCount: 0,
      },
    });

    const shareUrl = `${baseUrl}/share/${share.shareToken}`;
    const qrCodeUrl = await generateQRCode(shareUrl);

    return NextResponse.json({
      share: {
        id: share.id,
        shareUrl,
        qrCodeUrl,
        isActive: share.isActive,
        expiresAt: share.expiresAt?.toISOString() || null,
        allowDownload: share.allowDownload,
        viewCount: share.viewCount,
        downloadCount: share.downloadCount,
        attachedCvs: [],
        createdAt: share.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error creating share:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/cvs/[id]/share - Update share settings
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const cv = await prisma.cV.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    const body = await request.json();
    const { isActive, attachedCvs, expiresAt, allowDownload } = body;

    const share = await prisma.cVShare.findUnique({
      where: { cvId: params.id },
    });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    // Update share
    const updateData: any = {};
    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    }
    if (typeof allowDownload === "boolean") {
      updateData.allowDownload = allowDownload;
    }

    const updatedShare = await prisma.cVShare.update({
      where: { id: share.id },
      data: updateData,
    });

    // Handle attached CVs
    if (Array.isArray(attachedCvs)) {
      // Remove existing attachments
      await prisma.cVShareAttachment.deleteMany({
        where: { shareId: share.id },
      });

      // Add new attachments
      if (attachedCvs.length > 0) {
        const attachments = attachedCvs.map(cvId => ({
          shareId: share.id,
          cvId,
        }));
        await prisma.cVShareAttachment.createMany({
          data: attachments,
        });
      }
    }

    // Get updated share with attachments
    const shareWithAttachments = await prisma.cVShare.findUnique({
      where: { id: share.id },
      include: {
        attachedCvs: {
          include: {
            cv: {
              select: { id: true, title: true, fullName: true }
            }
          }
        }
      },
    });

    const adminSettings = await prisma.aISettings.findFirst();
    const baseUrl = adminSettings?.baseUrl || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const shareUrl = `${baseUrl}/share/${updatedShare.shareToken}`;
    const qrCodeUrl = await generateQRCode(shareUrl);

    return NextResponse.json({
      share: {
        id: updatedShare.id,
        shareUrl,
        qrCodeUrl,
        isActive: updatedShare.isActive,
        expiresAt: updatedShare.expiresAt?.toISOString() || null,
        allowDownload: updatedShare.allowDownload,
        viewCount: updatedShare.viewCount,
        downloadCount: updatedShare.downloadCount,
        attachedCvs: shareWithAttachments?.attachedCvs.map(ac => ac.cvId) || [],
        createdAt: updatedShare.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error updating share:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/cvs/[id]/share - Stop sharing
export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const cv = await prisma.cV.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    const share = await prisma.cVShare.findUnique({
      where: { cvId: params.id },
    });

    if (!share) {
      return NextResponse.json({ error: "Share not found" }, { status: 404 });
    }

    // Delete attachments first
    await prisma.cVShareAttachment.deleteMany({
      where: { shareId: share.id },
    });

    // Delete share
    await prisma.cVShare.delete({
      where: { id: share.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting share:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}