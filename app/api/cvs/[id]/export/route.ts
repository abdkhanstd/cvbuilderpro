import { promises as fs } from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { renderCVToHTML } from "@/lib/pdf/render-cv-html";
import { htmlToPdfBuffer } from "@/lib/pdf/html-to-pdf";
import type { CVTheme } from "@/lib/cv-themes";

interface RouteParams {
  params: {
    id: string;
  };
}



const sanitizeFilename = (name: string | null | undefined, fallback = "CV") => {
  const base = (name || fallback).trim() || fallback;
  return base.replace(/[^a-z0-9\-_.]+/gi, "_");
};

function isLikelyTheme(value: unknown): value is CVTheme {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.colors === "object" &&
    candidate.colors !== null
  );
}

function parseCustomTheme(themeData: unknown): CVTheme | null {
  if (!themeData) return null;

  const candidate = (() => {
    if (typeof themeData === "string") {
      try {
        return JSON.parse(themeData) as unknown;
      } catch (error) {
        console.warn("export: Failed to parse themeData JSON", error);
        return null;
      }
    }
    if (typeof themeData === "object") {
      return themeData;
    }
    return null;
  })();

  if (candidate && isLikelyTheme(candidate)) {
    return candidate;
  }
  return null;
}

function guessMimeType(filename?: string) {
  const ext = filename ? path.extname(filename).toLowerCase() : "";
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".gif") return "image/gif";
  if (ext === ".webp") return "image/webp";
  return "image/png";
}

async function loadProfileImage(profileImage?: string | null) {
  if (!profileImage) return null;

  // Local file under public
  const cleanPath = profileImage.startsWith("/") ? profileImage.slice(1) : profileImage;
  const localPath = path.join(process.cwd(), "public", cleanPath);
  try {
    const data = await fs.readFile(localPath);
    return { data, filename: path.basename(cleanPath) };
  } catch {
    /* ignore and try remote fetch */
  }

  // Remote fetch fallback
  try {
    const res = await fetch(profileImage);
    if (!res.ok) return null;
    const arrayBuf = await res.arrayBuffer();
    return { data: Buffer.from(arrayBuf), filename: path.basename(new URL(profileImage).pathname) || "photo" };
  } catch {
    return null;
  }
}

async function buildThemedHTML(cv: any, req: NextRequest, overrideImagePath?: string) {
  let profileImageUrl = overrideImagePath || cv.profileImage;
  if (!overrideImagePath && profileImageUrl?.startsWith("/uploads/")) {
    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    profileImageUrl = `${protocol}://${host}${profileImageUrl}`;
  }

  const cvWithAbsoluteImage = {
    ...cv,
    profileImage: profileImageUrl,
  };

  const customTheme = parseCustomTheme(cvWithAbsoluteImage?.themeData);

  return renderCVToHTML(cvWithAbsoluteImage, {
    themeId: cvWithAbsoluteImage.theme,
    layoutId: cvWithAbsoluteImage.layout,
    customTheme: customTheme ?? undefined,
  });
}

async function exportToPDF(cv: any, req: NextRequest) {
  const html = await buildThemedHTML(cv, req);
  const pdfBuffer = await htmlToPdfBuffer(html);
  const filename = sanitizeFilename(cv.title, "CV");

  return new NextResponse(pdfBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}

async function exportHTMLBundle(cv: any, req: NextRequest) {
  const filename = sanitizeFilename(cv.title, "CV");
  const image = await loadProfileImage(cv.profileImage);
  const imagePath = image ? `./assets/${image.filename}` : cv.profileImage;
  const html = await buildThemedHTML(cv, req, imagePath);

  const zip = new JSZip();
  zip.file("index.html", html);
  if (image) {
    zip.folder("assets")?.file(image.filename, image.data);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

  return new NextResponse(zipBuffer as unknown as BodyInit, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${filename}-html.zip"`,
      "Cache-Control": "no-store",
    },
  });
}

async function exportToWord(cv: any) {
  const filename = sanitizeFilename(cv.title, "CV");

  // Return HTML page with instructions for Word export
  const instructionsHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Word Export Instructions - ${filename}</title>
        <style>
            body {
                font-family: -apple-system, BlinkMacSystemSystem, 'Segoe UI', Roboto, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                line-height: 1.6;
                color: #333;
            }
            .container {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            h1 {
                color: #2563eb;
                margin-bottom: 20px;
                text-align: center;
            }
            .steps {
                background: white;
                border-radius: 6px;
                padding: 20px;
                margin: 20px 0;
                border-left: 4px solid #2563eb;
            }
            .step-number {
                display: inline-block;
                background: #2563eb;
                color: white;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                text-align: center;
                line-height: 24px;
                font-weight: bold;
                margin-right: 10px;
            }
            .export-button {
                display: inline-block;
                background: #2563eb;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: 500;
                margin: 10px 0;
                transition: background 0.2s;
            }
            .export-button:hover {
                background: #1d4ed8;
            }
            .note {
                background: #fef3c7;
                border: 1px solid #f59e0b;
                border-radius: 4px;
                padding: 12px;
                margin: 15px 0;
                color: #92400e;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>📄 Export to Microsoft Word</h1>

            <p>To export your CV to Microsoft Word format, follow these steps:</p>

            <div class="steps">
                <div style="margin-bottom: 15px;">
                    <span class="step-number">1</span>
                    <strong>Export as PDF first</strong>
                </div>
                <a href="/api/cvs/${cv.id}/export?format=pdf" class="export-button" target="_blank">
                    📄 Download PDF
                </a>

                <div style="margin: 20px 0 15px 0;">
                    <span class="step-number">2</span>
                    <strong>Open PDF in Microsoft Word</strong>
                </div>
                <p>Right-click on the downloaded PDF file and select "Open with" → "Microsoft Word"</p>

                <div style="margin: 15px 0;">
                    <span class="step-number">3</span>
                    <strong>Save as Word Document</strong>
                </div>
                <p>In Word, go to File → Save As and choose ".docx" format</p>
            </div>

            <div class="note">
                <strong>💡 Tip:</strong> This method preserves all formatting and allows full editing in Microsoft Word.
            </div>

            <p style="text-align: center; margin-top: 30px;">
                <a href="javascript:window.close()" style="color: #6b7280; text-decoration: none;">Close this window</a>
            </p>
        </div>
    </body>
    </html>
  `;

  return new NextResponse(instructionsHtml, {
    headers: {
      "Content-Type": "text/html",
      "Cache-Control": "no-store",
    },
  });
}



export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const shareId = req.nextUrl.searchParams.get("shareId");

    let cv: any;
    let isSharedAccess = false;

    if (shareId) {
      // Public access via share link
      const share = await prisma.cVShare.findUnique({
        where: { id: shareId },
        include: { cv: true },
      });

      if (!share || !share.isActive || !share.allowDownload) {
        return NextResponse.json({ error: "Download not allowed" }, { status: 403 });
      }

      // Check expiration
      if (share.expiresAt && new Date() > share.expiresAt) {
        return NextResponse.json({ error: "Share expired" }, { status: 403 });
      }

      cv = await prisma.cV.findUnique({
        where: { id: params.id },
        include: {
          education: { orderBy: { order: "asc" } },
          experience: { orderBy: { order: "asc" } },
          publications: { orderBy: { order: "asc" } },
          skills: { orderBy: { order: "asc" } },
          certifications: { orderBy: { order: "asc" } },
          awards: { orderBy: { order: "asc" } },
          languages: { orderBy: { order: "asc" } },
          projects: { orderBy: { order: "asc" } },
          references: { orderBy: { order: "asc" } },
          customSections: { orderBy: { order: "asc" } },
          contactInfo: { orderBy: { order: "asc" } },
        },
      });

      if (!cv || cv.id !== share.cvId) {
        return NextResponse.json({ error: "CV not found" }, { status: 404 });
      }

      // Increment download count
      await prisma.cVShare.update({
        where: { id: shareId },
        data: { downloadCount: { increment: 1 } },
      });
    } else {
      // Authenticated access
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

      cv = await prisma.cV.findFirst({
        where: { id: params.id, userId: user.id },
        include: {
          education: { orderBy: { order: "asc" } },
          experience: { orderBy: { order: "asc" } },
          publications: { orderBy: { order: "asc" } },
          skills: { orderBy: { order: "asc" } },
          certifications: { orderBy: { order: "asc" } },
          awards: { orderBy: { order: "asc" } },
          languages: { orderBy: { order: "asc" } },
          projects: { orderBy: { order: "asc" } },
          references: { orderBy: { order: "asc" } },
          customSections: { orderBy: { order: "asc" } },
          contactInfo: { orderBy: { order: "asc" } },
        },
      });

      if (!cv) {
        return NextResponse.json({ error: "CV not found" }, { status: 404 });
      }
    }

    const format = req.nextUrl.searchParams.get("format")?.toLowerCase() || "pdf";

    switch (format) {
      case "pdf":
        return await exportToPDF(cv, req);
      case "html":
        return await exportHTMLBundle(cv, req);
      case "doc":
      case "docx":
      case "word":
        return await exportToWord(cv);
      default:
        return NextResponse.json({ error: "Unsupported format" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error exporting CV:", error);
    return NextResponse.json({ error: "Failed to export CV" }, { status: 500 });
  }
}
