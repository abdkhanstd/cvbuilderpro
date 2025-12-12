import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CVPreview } from "@/components/cv/cv-preview";
import { DownloadButton } from "@/components/cv/download-button";
import { Eye } from "lucide-react";

interface SharePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  try {
    // Find the share
    const share = await prisma.cVShare.findUnique({
      where: { shareToken: id },
      include: {
        cv: {
          include: {
            education: { orderBy: { startDate: "desc" } },
            experience: { orderBy: { startDate: "desc" } },
            publications: { orderBy: { year: "desc" } },
            skills: { orderBy: { order: "asc" } },
            certifications: { orderBy: { issueDate: "desc" } },
            awards: { orderBy: { date: "desc" } },
            languages: { orderBy: { order: "asc" } },
            projects: { orderBy: { startDate: "desc" } },
            references: { orderBy: { order: "asc" } },
            customSections: { orderBy: { order: "asc" } },
            socialLinks: { orderBy: { order: "asc" } },
            contactInfo: { orderBy: { order: "asc" } },
          },
        },
        attachedCvs: {
          include: {
            cv: {
              select: {
                id: true,
                title: true,
                fullName: true,
                headline: true,
                profileImage: true,
              },
            },
          },
        },
      },
    });

    if (!share || !share.isActive) {
      notFound();
    }

    // Check if share has expired
    if (share.expiresAt && new Date() > share.expiresAt) {
      notFound();
    }

    // Get base URL from admin settings
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });
    
    let baseUrl = "http://localhost:3000";
    if (adminUser) {
      const adminSettings = await prisma.aISettings.findUnique({
        where: { userId: adminUser.id },
      });
      baseUrl = (adminSettings as any)?.baseUrl || 
               (typeof process !== "undefined" && process.env.NEXT_PUBLIC_BASE_URL) || 
               "http://localhost:3000";
    }    // Increment view count
    await prisma.cVShare.update({
      where: { id: share.id },
      data: { viewCount: { increment: 1 } },
    });

    const cv = share.cv;

    // Serialize the CV data for the client component
    const serializedCV = {
      ...cv,
      createdAt: cv.createdAt.toISOString(),
      updatedAt: cv.updatedAt.toISOString(),
      education: cv.education.map((e) => ({
        ...e,
        startDate: e.startDate ? e.startDate.toISOString() : null,
        endDate: e.endDate ? e.endDate.toISOString() : null,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
      experience: cv.experience.map((e) => ({
        ...e,
        startDate: e.startDate ? e.startDate.toISOString() : null,
        endDate: e.endDate ? e.endDate.toISOString() : null,
        createdAt: e.createdAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
      })),
      publications: cv.publications.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      skills: cv.skills.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      certifications: cv.certifications.map((c) => ({
        ...c,
        issueDate: c.issueDate.toISOString(),
        expiryDate: c.expiryDate?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      awards: cv.awards.map((a) => ({
        ...a,
        date: a.date.toISOString(),
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      languages: cv.languages.map((l) => ({
        ...l,
        createdAt: l.createdAt.toISOString(),
        updatedAt: l.updatedAt.toISOString(),
      })),
      projects: cv.projects.map((p) => ({
        ...p,
        startDate: p.startDate ? p.startDate.toISOString() : null,
        endDate: p.endDate ? p.endDate.toISOString() : null,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
      references: cv.references.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      customSections: cv.customSections.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
      socialLinks: cv.socialLinks.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
        updatedAt: s.updatedAt.toISOString(),
      })),
      contactInfo: cv.contactInfo.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      })),
    };

    // Get theme data
    let theme = null;
    if (cv.themeData) {
      try {
        theme = JSON.parse(cv.themeData);
      } catch (error) {
        console.error("Error parsing theme data:", error);
      }
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Eye className="h-6 w-6 text-gray-400" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    {cv.title || `${cv.fullName || "CV"}'s Resume`}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Shared CV • {share.viewCount} views
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {(share as any).allowDownload && (
                  <DownloadButton cvId={cv.id} shareId={share.id} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CV Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <CVPreview cv={serializedCV} customTheme={theme} />
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 mt-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-sm text-gray-600 text-center">
              This CV was shared using CV Builder. Create your own professional CV at{" "}
              <a
                href={baseUrl}
                className="text-blue-600 hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                {new URL(baseUrl).hostname}
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading shared CV:", error);
    notFound();
  }
}

export async function generateMetadata({ params }: SharePageProps) {
  try {
    const share = await prisma.cVShare.findUnique({
      where: { id: params.id },
      include: {
        cv: {
          select: {
            title: true,
            fullName: true,
            headline: true,
            summary: true,
          },
        },
      },
    });

    if (!share || !share.isActive) {
      return {
        title: "CV Not Found",
      };
    }

    const cv = share.cv;
    const title = cv.title || `${cv.fullName || "Professional"}'s Resume`;
    const description = cv.headline || cv.summary?.slice(0, 160) || "Professional CV shared via CV Builder";

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
      },
    };
  } catch (error) {
    return {
      title: "Shared CV",
    };
  }
}