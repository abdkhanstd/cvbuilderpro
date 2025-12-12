import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/lib/ai-service";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

// POST /api/cvs/[id]/ai-review - Get AI suggestions for CV
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

    // Get the CV
    const cv = await prisma.cV.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        education: true,
        experience: true,
        skills: true,
        publications: true,
        projects: true,
        certifications: true,
        awards: true,
        languages: true,
        references: true,
      },
    });

    if (!cv) {
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    // Get AI service instance
    const aiService = await AIService.create();

    if (!aiService) {
      return NextResponse.json(
        { error: "AI suggestions are not enabled. Please configure AI in admin settings." },
        { status: 400 }
      );
    }

    // Build CV summary for AI analysis
    const cvSummary = buildCVSummary(cv);

    // Get AI suggestions
    const response = await aiService.getResponse({
      messages: [
        { role: "system", content: "You are an expert CV reviewer. Always respond with valid JSON only." },
        { role: "user", content: buildAIPrompt(cvSummary) },
      ],
      temperature: 0.7,
      maxTokens: 15000, // Increased from 2000 to 15000 for much more detailed reviews
    });

    // Clean the response content to remove markdown code blocks if present
    let cleanContent = response.content.trim();
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\w*\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to find and extract JSON
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }

    let suggestions;
    try {
      suggestions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.warn("AI review JSON parse failed, trying fallback:", parseError);
      
      // Try to find any valid JSON object within the response
      const jsonObjects = cleanContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
      if (jsonObjects) {
        for (const obj of jsonObjects.reverse()) {
          try {
            suggestions = JSON.parse(obj);
            console.log("Successfully parsed JSON object from AI review");
            break;
          } catch {
            // Continue trying
          }
        }
      }
      
      if (!suggestions) {
        throw new Error(`Failed to parse JSON response from AI review: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("AI review error:", error);
    return NextResponse.json(
      { error: "Failed to get AI suggestions" },
      { status: 500 }
    );
  }
}

function buildCVSummary(cv: Record<string, unknown>): string {
  const sections = [];

  // Personal info
  sections.push(`Name: ${(cv.fullName as string) || "Not provided"}`);
  sections.push(`Headline: ${(cv.headline as string) || "Not provided"}`);
  sections.push(`Summary: ${(cv.summary as string) || "Not provided"}`);
  sections.push(`Email: ${(cv.email as string) || "Not provided"}`);
  sections.push(`Phone: ${(cv.phone as string) || "Not provided"}`);
  sections.push(`Location: ${(cv.location as string) || "Not provided"}`);

  // Experience
  if ((cv.experience as unknown[])?.length > 0) {
    sections.push("\n--- EXPERIENCE ---");
    (cv.experience as Record<string, unknown>[]).forEach((exp: Record<string, unknown>) => {
      sections.push(`- ${(exp.position as string)} at ${(exp.company as string)} (${(exp.startDate as string) || ""} - ${(exp.endDate as string) || "Present"})`);
      if (exp.description) sections.push(`  ${(exp.description as string).substring(0, 200)}...`);
    });
  } else {
    sections.push("\n--- EXPERIENCE ---\nNo experience entries");
  }

  // Education
  if ((cv.education as unknown[])?.length > 0) {
    sections.push("\n--- EDUCATION ---");
    (cv.education as Record<string, unknown>[]).forEach((edu: Record<string, unknown>) => {
      sections.push(`- ${(edu.degree as string)} ${(edu.field as string) ? `in ${edu.field as string}` : ""} from ${(edu.institution as string)}`);
    });
  } else {
    sections.push("\n--- EDUCATION ---\nNo education entries");
  }

  // Skills
  if ((cv.skills as unknown[])?.length > 0) {
    sections.push("\n--- SKILLS ---");
    const skillNames = (cv.skills as Record<string, unknown>[]).map((s: Record<string, unknown>) => s.name as string).join(", ");
    sections.push(skillNames);
  } else {
    sections.push("\n--- SKILLS ---\nNo skills listed");
  }

  // Projects
  if ((cv.projects as unknown[])?.length > 0) {
    sections.push("\n--- PROJECTS ---");
    (cv.projects as Record<string, unknown>[]).forEach((proj: Record<string, unknown>) => {
      sections.push(`- ${(proj.name as string)}: ${(proj.description as string)?.substring(0, 100) || "No description"}`);
    });
  }

  // Note: Publications are excluded from AI review as they are academic records

  // Certifications
  if ((cv.certifications as unknown[])?.length > 0) {
    sections.push("\n--- CERTIFICATIONS ---");
    (cv.certifications as Record<string, unknown>[]).forEach((cert: Record<string, unknown>) => {
      sections.push(`- ${(cert.name as string)} from ${(cert.issuer as string)}`);
    });
  }

  return sections.join("\n");
}

function buildAIPrompt(cvSummary: string): string {
  const prompt = `You are an expert CV/resume reviewer. Analyze this CV and provide specific, actionable suggestions for improvement.

CV Content:
${cvSummary}

Please provide your analysis in the following JSON format:
{
  "overallScore": <number 1-100>,
  "summary": "<brief overall assessment>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "improvements": [
    {
      "section": "<section name: Summary, Headline, Experience, Education, Skills, Projects, etc.>",
      "field": "<specific field if applicable: summary, headline, description>",
      "issue": "<what's wrong or missing>",
      "suggestion": "<specific improvement description>",
      "replacementText": "<the actual improved text to replace the original - provide full replacement content>",
      "priority": "<high|medium|low>"
    }
  ],
  "missingElements": ["<missing element 1>", ...],
  "industryTips": ["<tip 1>", "<tip 2>", ...],
  "suggestedSkills": ["<skill to add 1>", "<skill to add 2>", ...]
}

IMPORTANT: 
- For each improvement, provide a "replacementText" that can directly replace the original content. Make it professional, impactful, and use action verbs with quantifiable achievements.
- DO NOT provide suggestions for Publications - they are academic records and should not be modified.

Focus on:
1. Content completeness (missing sections, empty fields)
2. Professional language and clarity
3. Quantifiable achievements
4. Keywords and ATS optimization
5. Overall structure and flow

Respond ONLY with valid JSON, no additional text.`;
  
  return prompt;
}
