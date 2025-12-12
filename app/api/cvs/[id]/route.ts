import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/cvs/[id] - Get a specific CV
export async function GET(req: NextRequest, { params }: RouteParams) {
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
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    return NextResponse.json(cv);
  } catch (error) {
    console.error("Error fetching CV:", error);
    return NextResponse.json(
      { error: "Failed to fetch CV" },
      { status: 500 }
    );
  }
}

// PATCH /api/cvs/[id] - Update a CV
export async function PATCH(req: NextRequest, { params }: RouteParams) {
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

    const body = await req.json();
    const { title, template, isPublic, ...cvData } = body;

    // Update CV basic fields
    const updateData: any = {};
    if (title) updateData.title = title;
    if (template) updateData.template = template;
    if (typeof isPublic === "boolean") updateData.isPublic = isPublic;
    
    // Update personal info fields
    if (cvData.fullName !== undefined) updateData.fullName = cvData.fullName;
    if (cvData.email !== undefined) updateData.email = cvData.email;
    if (cvData.phone !== undefined) updateData.phone = cvData.phone;
    if (cvData.location !== undefined) updateData.location = cvData.location;
    if (cvData.website !== undefined) updateData.website = cvData.website;
    if (cvData.summary !== undefined) updateData.summary = cvData.summary;
    if (cvData.profileImage !== undefined) updateData.profileImage = cvData.profileImage;

    const updatedCV = await prisma.cV.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedCV);
  } catch (error) {
    console.error("Error updating CV:", error);
    return NextResponse.json(
      { error: "Failed to update CV" },
      { status: 500 }
    );
  }
}

// DELETE /api/cvs/[id] - Delete a CV
export async function DELETE(req: NextRequest, { params }: RouteParams) {
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

    await prisma.cV.delete({
      where: { id: params.id },
    });

    // Log activity
    await prisma.userActivity.create({
      data: {
        userId: user.id,
        action: "CV_DELETED",
        metadata: JSON.stringify({ cvId: cv.id, title: cv.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting CV:", error);
    return NextResponse.json(
      { error: "Failed to delete CV" },
      { status: 500 }
    );
  }
}
