import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AIService } from "@/lib/ai-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { profile: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get AI service instance
    const aiService = await AIService.create();

    if (!aiService) {
      return NextResponse.json(
        { error: "AI suggestions are not enabled or configured" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { section, context, field, currentValue } = body;

    // Enhance context with user profile data
    const enhancedContext = {
      ...context,
      userProfile: {
        name: user.name,
        location: user.profile?.location,
        bio: user.profile?.bio,
        linkedin: user.profile?.linkedin,
        github: user.profile?.github,
        googleScholar: user.profile?.googleScholar,
      }
    };

    const prompt = buildPrompt(section, enhancedContext, field, currentValue);

    const response = await aiService.getResponse({
      messages: [
        {
          role: "system",
          content: "You are a professional CV writing assistant. Provide concise, professional, and impactful suggestions for CV content. Keep responses brief and focused.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 2000, // Increased from 500 to 2000 for more detailed suggestions
      temperature: 0.7,
    });

    return NextResponse.json({ suggestion: response.content });
  } catch (error) {
    console.error("Error generating AI suggestion:", error);
    return NextResponse.json(
      { error: "Failed to generate AI suggestion" },
      { status: 500 }
    );
  }
}

function buildPrompt(
  section: string,
  context: unknown,
  field: string,
  currentValue: string
): string {
  const ctx = context as Record<string, unknown>;
  let prompt = "";
  
  // Extract user profile from context
  const userProfile = ctx.userProfile as Record<string, unknown> || {};
  const profileContext = userProfile.bio || userProfile.location || userProfile.name 
    ? `\n\nUSER PROFILE:
- Name: ${userProfile.name || 'Not provided'}
- Location: ${userProfile.location || 'Not provided'}
- Bio: ${userProfile.bio || 'Not provided'}
- LinkedIn: ${userProfile.linkedin ? 'Available' : 'Not provided'}
- GitHub: ${userProfile.github ? 'Available' : 'Not provided'}
- Google Scholar: ${userProfile.googleScholar ? 'Available' : 'Not provided'}`
    : '';

  switch (section) {
    case "personal":
      if (field === "summary") {
        prompt = `INSTRUCTION: Improve this CV professional summary. Keep it concise and factual.
CURRENT: "${currentValue}"
CONTEXT: ${JSON.stringify(ctx)}${profileContext}

RULES:
- Write ONLY 2-3 sentences
- Be specific and factual (NO exaggeration or made-up numbers)
- Focus on actual skills and experience mentioned in the context
- Consider user's location, background, and profile information
- NO marketing language like "spearheaded", "pioneering", "revolutionary"
- NO bullet points or formatting - just plain text
- Output ONLY the improved text, nothing else`;
      }
      break;

    case "experience":
      if (field === "description") {
        prompt = `INSTRUCTION: Improve this job description. Be concise and professional.
ROLE: "${ctx.position as string}" at "${ctx.company as string}"${profileContext}
CURRENT: "${currentValue}"
LOCATION: "${(ctx.location as string) || 'Not specified'}"

RULES:
- Write 2-3 concise achievement-focused bullet points
- Use action verbs and specific outcomes
- Be factual based on the provided context
- Consider the user's background and profile
- NO exaggeration or made-up metrics
- Output ONLY the bullet points, nothing else`;
      }
      break;

    case "education":
      if (field === "description") {
        prompt = `INSTRUCTION: Improve this education description. Keep it relevant and concise.
DEGREE: "${ctx.degree as string}" at "${ctx.institution as string}"${profileContext}
CURRENT: "${currentValue}"
LOCATION: "${(ctx.location as string) || 'Not specified'}"

RULES:
- Mention relevant coursework, projects, or achievements
- Include GPA if notable (>3.5)
- Consider alignment with user's career direction
- Keep to 2-3 bullet points max
- Be specific and factual
- Output ONLY the improved text, nothing else`;
      }
      break;

    case "skills":
      prompt = `INSTRUCTION: Suggest relevant skills based on context.
CONTEXT: ${JSON.stringify(ctx)}${profileContext}

RULES:
- Suggest 3-5 relevant technical or professional skills
- Base suggestions on user's background and profile
- Match industry standards for their field
- Be specific (e.g., "React 18" not just "React")
- Output ONLY a comma-separated list, nothing else`;
      break;

    case "publications":
      if (field === "description") {
        prompt = `INSTRUCTION: Write a brief description for this publication.
TITLE: "${ctx.title as string}"
AUTHORS: "${ctx.authors as string}"${profileContext}
CURRENT: "${currentValue}"

RULES:
- 1-2 sentences maximum
- Explain the key contribution or finding
- Use accessible language
- Consider the user's research focus
- Output ONLY the description, nothing else`;
      }
      break;

    default:
      prompt = `INSTRUCTION: Improve this ${section} ${field}.
CURRENT: "${currentValue}"
CONTEXT: ${JSON.stringify(ctx)}${profileContext}

RULES:
- Be professional and concise
- Base suggestions on provided context and user profile
- Be factual and specific
- Output ONLY the improved text, nothing else`;
  }

  return prompt;
}
