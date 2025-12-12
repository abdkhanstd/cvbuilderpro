import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const { id } = await params;
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

    const theme = await prisma.customTheme.findUnique({
      where: { id: id },
    });

    if (!theme || theme.userId !== user.id) {
      return NextResponse.json({ error: "Theme not found" }, { status: 404 });
    }

    await prisma.customTheme.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting custom theme:", error);
    return NextResponse.json(
      { error: "Failed to delete custom theme" },
      { status: 500 }
    );
  }
}
