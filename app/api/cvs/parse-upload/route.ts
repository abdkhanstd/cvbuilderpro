import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AIService } from "@/lib/ai-service";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

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

    // Get AI settings from admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!adminUser) {
      return NextResponse.json(
        { error: "No admin settings configured" },
        { status: 500 }
      );
    }

    const aiSettings = await prisma.aISettings.findUnique({
      where: { userId: adminUser.id },
    });

    if (!aiSettings || !aiSettings.aiSuggestionsEnabled) {
      return NextResponse.json(
        { error: "AI suggestions are not enabled" },
        { status: 403 }
      );
    }

    // Parse the uploaded file
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    console.log("📁 File uploaded:", file.name, "Type:", file.type, "Size:", file.size);

    // Get AI service instance
    const aiService = await AIService.create();

    if (!aiService) {
      return NextResponse.json(
        { error: "AI suggestions are not enabled. Please configure AI in admin settings." },
        { status: 400 }
      );
    }

    // Use AI to parse the CV - prefer native PDF support if available
    let parsedCV: Record<string, unknown> = {};

    // Extract text from file
    let cvText = "";
    let isPDF = false;

    if (file.type === "application/pdf") {
      isPDF = true;
      console.log("📄 Processing PDF file");
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const pdfData = await pdfParse(fileBuffer);
      cvText = pdfData.text;

      console.log("📄 PDF text length:", cvText.length, "characters");
    } else {
      console.log("📄 Processing DOCX file");
      const fileBuffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      cvText = result.value;
    }

    if (!cvText || cvText.trim().length < 50) {
      return NextResponse.json(
        { error: "Could not extract meaningful text from the document" },
        { status: 400 }
      );
    }

    console.log("📄 Extracted text length:", cvText.length, "characters");

    // Use centralized AI service to parse the CV
    const prompt = buildParsePrompt(cvText, isPDF);
    const response = await aiService.getResponse({
      messages: [
        { role: "system", content: "You are an expert CV parser. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      maxTokens: 4000, // Reverted to original limit for reliable parsing
      truncateForLocal: false, // Don't truncate for local models
    });

    // Log which provider was actually used
    console.log("🤖 AI parsing completed with provider:", response.provider, "model:", response.model);

    // Clean the response content to extract JSON from markdown code blocks
    let cleanContent = response.content.trim();
    
    // Remove markdown code blocks if present
    if (cleanContent.startsWith('```json')) {
      cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleanContent.startsWith('```')) {
      cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Try to find and extract the largest valid JSON object
    const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanContent = jsonMatch[0];
    }
    
    // Try to fix common JSON truncation issues
    cleanContent = cleanContent.trim();
    
    // If the content ends with incomplete structures, try to complete them
    let braceCount = 0;
    let bracketCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < cleanContent.length; i++) {
      const char = cleanContent[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (inString) continue;
      
      if (char === '{') braceCount++;
      else if (char === '}') braceCount--;
      else if (char === '[') bracketCount++;
      else if (char === ']') bracketCount--;
    }
    
    // Close unclosed braces and brackets
    while (braceCount > 0) {
      cleanContent += '}';
      braceCount--;
    }
    while (bracketCount > 0) {
      cleanContent += ']';
      bracketCount--;
    }
    
    // If still in a string, close it
    if (inString) {
      cleanContent += '"';
    }

    try {
      parsedCV = JSON.parse(cleanContent);
    } catch (parseError) {
      console.warn("Initial JSON parse failed, trying to extract valid JSON subset:", parseError);
      
      // Try to find the last complete JSON object by searching backwards
      const lines = cleanContent.split('\n');
        for (let i = lines.length - 1; i >= 0; i--) {
          const partialContent = lines.slice(0, i + 1).join('\n');
          try {
            parsedCV = JSON.parse(partialContent);
            console.log("Successfully parsed partial JSON from", i + 1, "lines");
            break;
          } catch {
            // Continue trying with fewer lines
          }
        }      // If still no luck, try to find any valid JSON object within the response
      if (!parsedCV) {
        const jsonObjects = cleanContent.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
        if (jsonObjects) {
          for (const obj of jsonObjects.reverse()) { // Try largest objects first
            try {
              parsedCV = JSON.parse(obj);
              console.log("Successfully parsed JSON object of length", obj.length);
              break;
            } catch {
              // Continue trying
            }
          }
        }
      }
      
      if (!parsedCV) {
        throw new Error(`Failed to parse JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
      }
    }

    console.log("✅ Successfully parsed CV data");
    console.log("📊 Parsed data summary:", {
      fullName: parsedCV.fullName,
      email: parsedCV.email,
      educationCount: (parsedCV.education as unknown[])?.length || 0,
      experienceCount: (parsedCV.experience as unknown[])?.length || 0,
      projectsCount: (parsedCV.projects as unknown[])?.length || 0,
      skillsCount: (parsedCV.skills as unknown[])?.length || 0,
      publicationsCount: (parsedCV.publications as unknown[])?.length || 0,
      certificationsCount: (parsedCV.certifications as unknown[])?.length || 0,
      otherSectionsCount: (parsedCV.otherSections as unknown[])?.length || 0,
      otherSectionTitles: (parsedCV.otherSections as Record<string, unknown>[])?.map((s: Record<string, unknown>) => s.sectionTitle as string).join(", ") || "none",
    });

    return NextResponse.json({ parsedData: parsedCV });
  } catch (error) {
    console.error("Error parsing CV upload:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to parse CV" },
      { status: 500 }
    );
  }
}

function buildParsePrompt(cvText: string, isPDF: boolean = false): string {
  return `Extract and structure the following CV/resume into JSON format. Extract EVERYTHING.

CRITICAL INSTRUCTIONS:
1. Return ONLY a valid JSON object
2. Do NOT wrap in markdown code blocks
3. Extract ALL sections from the CV
4. For unknown sections, add them to "otherSections"

KNOWN SECTIONS: personalInfo, education, experience, skills, projects, certifications, languages, publications, awards
UNKNOWN SECTIONS: Add to "otherSections" array (Patents, Books, Funding, etc.)

Schema:
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "experience": [{"title": "Job", "company": "Company", "location": "City", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "isCurrent": false, "description": "Desc"}],
  "education": [{"degree": "Degree", "field": "Field", "school": "Institution Full Name", "location": "City", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "grade": "Grade"}],
  "skills": [{"name": "Skill", "category": "Category"}],
  "projects": [{"name": "Project", "description": "Desc", "role": "Role", "technologies": "Tech"}],
  "certifications": [{"name": "Cert", "issuer": "Org", "date": "YYYY-MM-DD"}],
  "languages": [{"name": "Language", "proficiency": "Level"}],
  "publications": [{"title": "Title", "authors": "Authors", "venue": "Venue", "year": "YYYY"}],
  "awards": [{"title": "Award", "issuer": "Org", "date": "YYYY-MM-DD"}],
  "otherSections": [{"sectionTitle": "Patents", "items": ["Patent 1 details", "Patent 2 details"]}]
}

CV Text:
---
${cvText.substring(0, isPDF ? 4000 : 6000)}
---

Respond with ONLY the JSON object:`;
}