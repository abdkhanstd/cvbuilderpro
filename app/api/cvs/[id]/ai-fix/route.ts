import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/lib/ai-service";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

// POST /api/cvs/[id]/ai-fix - Apply AI suggestion to CV
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

    const body = await req.json();
    const { section, field, value, action, itemId } = body;

    // Get the CV
    const cv = await prisma.cV.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Get AI service instance
    const aiService = await AIService.create();

    // Handle different types of fixes
    switch (section.toLowerCase()) {
      case "summary":
      case "headline":
      case "personal":
        // Update main CV fields
        if (field === "summary" || section === "summary") {
          const newSummary = value || await generateImprovedContent(aiService, cv.summary || "", "summary");
          await prisma.cV.update({
            where: { id: params.id },
            data: { summary: newSummary },
          });
          return NextResponse.json({ success: true, field: "summary", value: newSummary });
        }
        if (field === "headline" || section === "headline") {
          const newHeadline = value || await generateImprovedContent(aiService, cv.headline || "", "headline");
          await prisma.cV.update({
            where: { id: params.id },
            data: { headline: newHeadline },
          });
          return NextResponse.json({ success: true, field: "headline", value: newHeadline });
        }
        break;

      case "experience":
        if (itemId) {
          const experience = await prisma.experience.findFirst({
            where: { id: itemId, cvId: params.id },
          });
          if (experience) {
            const newDescription = value || await generateImprovedContent(
              aiService,
              experience.description || "",
              "experience description",
              { position: experience.position, company: experience.company }
            );
            await prisma.experience.update({
              where: { id: itemId },
              data: { description: newDescription },
            });
            return NextResponse.json({ success: true, field: "experience", itemId, value: newDescription });
          }
        } else {
          // Get all experiences and improve them
          const experiences = await prisma.experience.findMany({
            where: { cvId: params.id },
          });
          for (const exp of experiences) {
            if (exp.description) {
              const improved = await generateImprovedContent(
                aiService,
                exp.description,
                "experience description",
                { position: exp.position, company: exp.company }
              );
              await prisma.experience.update({
                where: { id: exp.id },
                data: { description: improved },
              });
            }
          }
          return NextResponse.json({ success: true, field: "experience", message: "All experiences improved" });
        }
        break;

      case "skills":
        // Skills improvements typically involve adding missing skills
        if (action === "add" && value) {
          // Add new skills
          const skillsToAdd = Array.isArray(value) ? value : [value];
          for (const skillName of skillsToAdd) {
            await prisma.skill.create({
              data: {
                cvId: params.id,
                name: skillName,
                level: 70, // Default skill level (0-100)
              },
            });
          }
          return NextResponse.json({ success: true, field: "skills", added: skillsToAdd });
        }
        break;

      case "education":
        if (itemId) {
          const education = await prisma.education.findFirst({
            where: { id: itemId, cvId: params.id },
          });
          if (education) {
            const newDescription = value || await generateImprovedContent(
              aiService,
              education.description || "",
              "education description"
            );
            await prisma.education.update({
              where: { id: itemId },
              data: { description: newDescription },
            });
            return NextResponse.json({ success: true, field: "education", itemId, value: newDescription });
          }
        }
        break;

      case "projects":
        if (itemId) {
          const project = await prisma.project.findFirst({
            where: { id: itemId, cvId: params.id },
          });
          if (project) {
            const newDescription = value || await generateImprovedContent(
              aiService,
              project.description || "",
              "project description",
              { name: project.name }
            );
            await prisma.project.update({
              where: { id: itemId },
              data: { description: newDescription },
            });
            return NextResponse.json({ success: true, field: "projects", itemId, value: newDescription });
          }
        }
        break;

      default:
        // Generic improvement using the provided value
        if (value && field) {
          const updateData: Record<string, unknown> = {};
          updateData[field] = value;
          await prisma.cV.update({
            where: { id: params.id },
            data: updateData,
          });
          return NextResponse.json({ success: true, field, value });
        }
    }

    return NextResponse.json({ success: true, message: "Fix applied" });
  } catch (error) {
    console.error("AI fix error:", error);
    return NextResponse.json(
      { error: "Failed to apply fix" },
      { status: 500 }
    );
  }
}

async function generateImprovedContent(
  aiService: AIService | null,
  originalContent: string,
  contentType: string,
  context?: unknown
): Promise<string> {
  if (!aiService) {
    return originalContent;
  }

  const contextInfo = context
    ? `Context: ${JSON.stringify(context)}\n`
    : "";

  const prompt = `Improve this ${contentType} for a professional CV/resume. Make it more impactful, use action verbs, and add quantifiable achievements where appropriate. Keep the same general meaning but make it more professional and compelling.

${contextInfo}
Original text:
${originalContent}

Provide ONLY the improved text, no explanations or quotes.`;

  try {
    const response = await aiService.getResponse({
      messages: [
        { role: "system", content: "You are an expert CV writer. Improve the given text to be more professional and impactful. Respond only with the improved text." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      maxTokens: 2000, // Increased from 500 to 2000 for better text improvements
    });

    return response.content.trim();
  } catch (error) {
    console.error("Failed to generate improved content:", error);
    return originalContent;
  }
}
