import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { url } = body;

    if (!url || !url.includes("scholar.google.com/citations?user=")) {
      return NextResponse.json(
        { error: "Invalid Google Scholar URL" },
        { status: 400 }
      );
    }

    // Extract user ID from URL
    const userIdMatch = url.match(/user=([^&]+)/);
    if (!userIdMatch) {
      return NextResponse.json(
        { error: "Could not extract user ID from URL" },
        { status: 400 }
      );
    }

    const userId = userIdMatch[1];

    // Fetch the Google Scholar profile page
    const profileUrl = `https://scholar.google.com/citations?user=${userId}&hl=en`;
    
    const fetchOptions: RequestInit = {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    };

    const response = await fetch(profileUrl, fetchOptions);

    if (!response.ok) {
      throw new Error("Failed to fetch Google Scholar profile");
    }

    const html = await response.text();

    // Extract profile information
    const profile = extractProfileInfo(html);

    // Fetch publications
    const publicationsUrl = `https://scholar.google.com/citations?user=${userId}&hl=en&cstart=0&pagesize=100`;
    const pubResponse = await fetch(publicationsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const pubHtml = await pubResponse.text();
    const publications = extractPublications(pubHtml);

    return NextResponse.json({
      profile,
      publications,
    });
  } catch (error) {
    console.error("Error importing from Google Scholar:", error);
    return NextResponse.json(
      { error: "Failed to import from Google Scholar. The profile may be private or the URL is incorrect." },
      { status: 500 }
    );
  }
}

function extractProfileInfo(html: string): {
  name: string;
  hIndex: number;
  totalCitations: number;
  i10Index?: number;
} {
  // Extract name
  const nameMatch = html.match(/<div[^>]*id="gsc_prf_in"[^>]*>([^<]+)<\/div>/);
  const name = nameMatch ? nameMatch[1].trim() : "";

  // Extract h-index
  const hIndexMatch = html.match(/<td[^>]*class="gsc_rsb_std"[^>]*>(\d+)<\/td>/);
  const hIndex = hIndexMatch ? parseInt(hIndexMatch[1]) : 0;

  // Extract total citations
  const citationsMatch = html.match(/<td[^>]*class="gsc_rsb_std"[^>]*>(\d+)<\/td>/g);
  const totalCitations = citationsMatch && citationsMatch.length > 0 
    ? parseInt(citationsMatch[0].match(/(\d+)/)?.[1] || "0") 
    : 0;

  // Extract i10-index (appears after h-index in the metrics table)
  const i10IndexMatch = citationsMatch && citationsMatch.length > 2 
    ? parseInt(citationsMatch[2].match(/(\d+)/)?.[1] || "0") 
    : 0;

  return {
    name,
    hIndex,
    totalCitations,
    i10Index: i10IndexMatch,
  };
}

function extractPublications(html: string): any[] {
  const publications: any[] = [];
  
  // Match publication rows
  const pubRegex = /<tr[^>]*class="gsc_a_tr"[^>]*>(.*?)<\/tr>/gs;
  const matches = html.matchAll(pubRegex);

  for (const match of matches) {
    const rowHtml = match[1];
    
    // Extract title
    const titleMatch = rowHtml.match(/<a[^>]*class="gsc_a_at"[^>]*>([^<]+)<\/a>/);
    const title = titleMatch ? titleMatch[1].trim() : "";

    // Extract authors
    const authorsMatch = rowHtml.match(/<div[^>]*class="gs_gray"[^>]*>([^<]+)<\/div>/);
    const authors = authorsMatch ? authorsMatch[1].trim() : "";

    // Extract journal/venue (second gs_gray div)
    const journalMatches = rowHtml.match(/<div[^>]*class="gs_gray"[^>]*>([^<]+)<\/div>/g);
    const journal = journalMatches && journalMatches.length > 1 
      ? journalMatches[1].replace(/<[^>]*>/g, "").trim() 
      : "";

    // Extract year
    const yearMatch = rowHtml.match(/<span[^>]*class="gsc_a_h gsc_a_hc gs_ibl"[^>]*>(\d{4})<\/span>/);
    const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

    // Extract citations count
    const citationsMatch = rowHtml.match(/<a[^>]*class="gsc_a_ac gs_ibl"[^>]*>(\d+)<\/a>/);
    const citations = citationsMatch ? parseInt(citationsMatch[1]) : 0;

    if (title) {
      publications.push({
        type: "JOURNAL",
        title,
        authors,
        journal: journal || undefined,
        year,
        citations: citations || undefined,
        order: publications.length,
      });
    }
  }

  return publications;
}
