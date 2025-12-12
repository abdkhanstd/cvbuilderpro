import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/themes - Get all custom themes for the current user
export async function GET() {
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

    const customThemes = await prisma.customTheme.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

  return NextResponse.json({ themes: customThemes });
  } catch (error) {
    console.error("Error fetching custom themes:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom themes" },
      { status: 500 }
    );
  }
}

// POST /api/themes - Create a new custom theme
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { name, description, themeData } = body;

    if (!name || !themeData) {
      return NextResponse.json(
        { error: "Name and theme data are required" },
        { status: 400 }
      );
    }

    const customTheme = await prisma.customTheme.create({
      data: {
        userId: user.id,
        name,
        description: description || null,
        themeData: JSON.stringify(themeData),
      },
    });

    return NextResponse.json(customTheme, { status: 201 });
  } catch (error) {
    console.error("Error creating custom theme:", error);
    return NextResponse.json(
      { error: "Failed to create custom theme" },
      { status: 500 }
    );
  }
}
