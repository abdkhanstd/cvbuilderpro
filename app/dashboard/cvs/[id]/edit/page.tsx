import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CVEditor } from "@/components/cv/cv-editor";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function EditCVPage({ params }: PageProps) {
  try {
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
        contactInfo: { orderBy: { order: "asc" } },
      },
    });

    if (!cv) {
      redirect("/dashboard/cvs");
    }

    // Get user profile for pre-filling data
    const profile = await prisma.userProfile.findUnique({
      where: { userId: user.id },
    });

    console.log('🔍 Edit page - CV profileImage:', cv.profileImage);
    console.log('🔍 Edit page - Profile profileImage:', profile?.profileImage);

    // If CV doesn't have a profile image but user profile does, copy it to CV
    if (!cv.profileImage && profile?.profileImage) {
      console.log('✅ Auto-syncing profile photo to CV...');
      await prisma.cV.update({
        where: { id: params.id },
        data: { profileImage: profile.profileImage },
      });
      cv.profileImage = profile.profileImage; // Update the in-memory object
      console.log('✅ Photo synced:', profile.profileImage.substring(0, 50) + '...');
    }

    if (!cv.fullName && user.name) {
      cv.fullName = user.name;
    }
    if (!cv.email && user.email) {
      cv.email = user.email;
    }
    if (!cv.phone && profile?.phone) {
      cv.phone = profile.phone;
    }
    if (!cv.location && profile?.location) {
      cv.location = profile.location;
    }
    if (!cv.website && profile?.website) {
      cv.website = profile.website;
    }
    if (!cv.linkedin && profile?.linkedin) {
      cv.linkedin = profile.linkedin;
    }
    if (!cv.github && profile?.github) {
      cv.github = profile.github;
    }
    if ((cv.hIndex === null || cv.hIndex === undefined) && typeof profile?.hIndex === "number") {
      cv.hIndex = profile.hIndex;
    }
    if ((cv.totalCitations === null || cv.totalCitations === undefined) && typeof profile?.totalCitations === "number") {
      cv.totalCitations = profile.totalCitations;
    }
    if (!cv.summary || !cv.summary.trim()) {
      if (profile?.bio) {
        cv.summary = profile.bio;
      }
    }

    const normalizedContactInfo = Array.isArray(cv.contactInfo)
      ? cv.contactInfo.map((contact: any, index: number) => ({
          ...contact,
          order: contact?.order ?? index,
        }))
      : [];

    const existingContactKeys = new Set(
      normalizedContactInfo
        .map((contact: any) => {
          const type = typeof contact?.type === "string" ? contact.type.toLowerCase() : "";
          const value = typeof contact?.value === "string" ? contact.value.toLowerCase() : "";
          return type && value ? `${type}|${value}` : null;
        })
        .filter(Boolean) as string[]
    );

    const ensureContact = (
      type: string,
      value?: string | null,
      label?: string | null,
      preferPrimary = false
    ) => {
      if (!value) return;
      const trimmedValue = value.trim();
      if (!trimmedValue) return;
      const normalizedType = type.toLowerCase();
      const lowerValue = trimmedValue.toLowerCase();
      const key = `${normalizedType}|${lowerValue}`;

      if (existingContactKeys.has(key)) {
        if (preferPrimary && !normalizedContactInfo.some((entry: any) => entry.isPrimary)) {
          const existingEntry = normalizedContactInfo.find((entry: any) => {
            const entryType = typeof entry?.type === "string" ? entry.type.toLowerCase() : "";
            const entryValue = typeof entry?.value === "string" ? entry.value.toLowerCase() : "";
            return entryType === normalizedType && entryValue === lowerValue;
          });
          if (existingEntry) {
            existingEntry.isPrimary = true;
          }
        }
        return;
      }

      const hasSameType = normalizedContactInfo.some((entry: any) => {
        const entryType = typeof entry?.type === "string" ? entry.type.toLowerCase() : "";
        return entryType === normalizedType;
      });
      if (hasSameType && normalizedType !== "email") {
        return;
      }

      const timestamp = new Date();
      const hasPrimary = normalizedContactInfo.some((entry: any) => entry.isPrimary);
      normalizedContactInfo.push({
        id: `profile-${normalizedType}-${normalizedContactInfo.length}`,
        cvId: cv.id,
        type,
        value: trimmedValue,
        label: label ?? null,
        isPrimary: preferPrimary && !hasPrimary,
        order: normalizedContactInfo.length,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      existingContactKeys.add(key);
    };

    ensureContact("email", cv.email || user.email, "Email", true);
    ensureContact("phone", cv.phone || profile?.phone, "Phone");
    ensureContact("website", cv.website || profile?.website, "Website");
    ensureContact("linkedin", cv.linkedin || profile?.linkedin, "LinkedIn");
    ensureContact("github", cv.github || profile?.github, "GitHub");
    ensureContact("googleScholar", profile?.googleScholar, "Google Scholar");
    ensureContact("orcid", profile?.orcid, "ORCID");
    ensureContact("researchGate", profile?.researchGate, "ResearchGate");
    ensureContact("twitter", profile?.twitter, "Twitter");

    if (!normalizedContactInfo.some((entry: any) => entry.isPrimary) && normalizedContactInfo.length > 0) {
      normalizedContactInfo[0].isPrimary = true;
    }

    cv.contactInfo = normalizedContactInfo.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));

    const cvAny = cv as any;

    // Serialize CV data to ensure dates are converted to strings
    const serializedCV = {
    ...cvAny,
    profileImage: cvAny.profileImage || profile?.profileImage || user.image || null, // Fallback to profile/user image
    headline: cvAny.headline || null,
    createdAt: cvAny.createdAt.toISOString(),
    updatedAt: cvAny.updatedAt.toISOString(),
    deletedAt: cvAny.deletedAt?.toISOString() || null,
    lastViewedAt: cvAny.lastViewedAt?.toISOString() || null,
    sectionOrder: cvAny.sectionOrder ? JSON.parse(cvAny.sectionOrder) : null,
    themeData: cvAny.themeData ? JSON.parse(cvAny.themeData) : null, // Parse theme data from JSON
    education: cvAny.education.map((e: any) => ({
      ...e,
      startDate: e.startDate?.toISOString() || null,
      endDate: e.endDate?.toISOString() || null,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
    experience: cvAny.experience.map((e: any) => ({
      ...e,
      startDate: e.startDate?.toISOString() || null,
      endDate: e.endDate?.toISOString() || null,
      createdAt: e.createdAt.toISOString(),
      updatedAt: e.updatedAt.toISOString(),
    })),
    publications: cvAny.publications.map((p: any) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    skills: cvAny.skills.map((s: any) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    certifications: cvAny.certifications.map((c: any) => ({
      ...c,
      issueDate: c.issueDate?.toISOString() || null,
      expiryDate: c.expiryDate?.toISOString() || null,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    awards: cvAny.awards.map((a: any) => ({
      ...a,
      date: a.date?.toISOString() || null,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    languages: cvAny.languages.map((l: any) => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
      updatedAt: l.updatedAt.toISOString(),
    })),
    projects: cvAny.projects.map((p: any) => ({
      ...p,
      startDate: p.startDate?.toISOString() || null,
      endDate: p.endDate?.toISOString() || null,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    })),
    references: cvAny.references.map((r: any) => ({
      ...r,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    customSections: cvAny.customSections.map((c: any) => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
    socialLinks: cvAny.socialLinks.map((s: any) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    contactInfo: (cvAny.contactInfo || []).map((c: any, index: number) => {
      const createdAt = c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt || new Date().toISOString();
      const updatedAt = c.updatedAt instanceof Date ? c.updatedAt.toISOString() : c.updatedAt || createdAt;
      return {
        ...c,
        order: c.order ?? index,
        createdAt,
        updatedAt,
      };
    }),
  };

  const serializedProfile = profile ? {
    ...profile,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  } : null;

  return <CVEditor cv={serializedCV} profile={serializedProfile} />;
  } catch (error) {
    console.error("Error loading CV editor:", error);
    redirect("/dashboard/cvs");
  }
}
