import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// POST /api/cvs/[id]/duplicate - Duplicate a CV
export async function POST(req: NextRequest, { params }: RouteParams) {
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

    const originalCV = await prisma.cV.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        education: true,
        experience: true,
        publications: true,
        skills: true,
        certifications: true,
        awards: true,
        languages: true,
        projects: true,
        references: true,
        customSections: true,
        socialLinks: true,
      },
    });

    if (!originalCV) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Create duplicate CV
    const duplicateCV = await prisma.cV.create({
      data: {
        userId: user.id,
        title: `${originalCV.title} (Copy)`,
        template: originalCV.template,
        isPublic: false,
        viewCount: 0,
        downloadCount: 0,
        // content field doesn't exist in CV model
      },
    });

    // Duplicate all related data
    if (originalCV.education.length > 0) {
      await prisma.education.createMany({
        data: originalCV.education.map((edu) => ({
          cvId: duplicateCV.id,
          institution: edu.institution,
          degree: edu.degree,
          field: edu.field,
          startDate: edu.startDate,
          endDate: edu.endDate,
          current: edu.current,
          gpa: edu.gpa, // Use gpa instead of grade
          description: edu.description,
          location: edu.location,
        })),
      });
    }

    if (originalCV.experience.length > 0) {
      await prisma.experience.createMany({
        data: originalCV.experience.map((exp) => ({
          cvId: duplicateCV.id,
          company: exp.company,
          position: exp.position,
          startDate: exp.startDate,
          endDate: exp.endDate,
          current: exp.current,
          description: exp.description,
          location: exp.location,
          // employmentType field doesn't exist
        })),
      });
    }

    if (originalCV.skills.length > 0) {
      await prisma.skill.createMany({
        data: originalCV.skills.map((skill) => ({
          cvId: duplicateCV.id,
          name: skill.name,
          category: skill.category,
          level: skill.level,
          order: skill.order,
        })),
      });
    }

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        action: "CV_DUPLICATED",
        metadata: JSON.stringify({
          originalId: originalCV.id,
          duplicateId: duplicateCV.id,
          title: originalCV.title,
        }),
      },
    });

    return NextResponse.json(duplicateCV, { status: 201 });
  } catch (error) {
    console.error("Error duplicating CV:", error);
    return NextResponse.json(
      { error: "Failed to duplicate CV" },
      { status: 500 }
    );
  }
}
