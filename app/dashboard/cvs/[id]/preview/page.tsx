import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CVPreviewWrapper } from "@/components/cv/cv-preview-wrapper";
import { PreviewHeader } from "@/components/cv/preview-header";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function PreviewCVPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect("/auth/login");
  }

  const cv = await prisma.cV.findFirst({
    where: {
      id: params.id,
      userId: user.id,
    },
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
      socialLinks: { orderBy: { order: "asc" } },
    },
  });

  if (!cv) {
    redirect("/dashboard/cvs");
  }

  // Update view count
  await prisma.cV.update({
    where: { id: params.id },
    data: {
      viewCount: cv.viewCount + 1,
      lastViewedAt: new Date(),
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <CVPreviewWrapper cv={cv} />
    </div>
  );
}
