import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: {
    id: string;
  };
}

// Helper function to parse dates (handles ISO, YYYY-MM, YYYY-MM-DD)
const parseDate = (dateStr: any): Date | null => {
  if (!dateStr) return null;
  try {
    const str = String(dateStr).trim();
    if (str === '' || str === 'null' || str === 'undefined') return null;
    
    // If it's already an ISO string, just parse it
    if (str.includes('T')) {
      const date = new Date(str);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle YYYY-MM format
    if (str.match(/^\d{4}-\d{2}$/)) {
      const date = new Date(str + "-01");
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle YYYY-MM-DD format
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(str);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Handle YYYY format
    if (str.match(/^\d{4}$/)) {
      const date = new Date(str + "-01-01");
      return isNaN(date.getTime()) ? null : date;
    }
    
    // Otherwise try parsing as-is
    const date = new Date(str);
    return isNaN(date.getTime()) ? null : date;
  } catch (e) {
    console.error("Error parsing date:", dateStr, e);
    return null;
  }
};

// POST /api/cvs/[id]/save - Save all CV sections
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    console.log("=== CV Save Request Started ===");
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      console.error("Unauthorized: No session email");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error("User not found:", session.user.email);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const cv = await prisma.cV.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!cv) {
      console.error("CV not found:", params.id);
      return NextResponse.json({ error: "CV not found" }, { status: 404 });
    }

    const body = await req.json();
    console.log("CV save request body keys:", Object.keys(body));
    console.log("Profile Image in body:", body.profileImage ? 'present' : 'missing');

    // Update CV basic info - only include fields that exist in the schema
    const updateData: any = {};
    const allowedFields = [
      'fullName',
      'email',
      'phone',
      'location',
      'website',
      'linkedin',
      'github',
      'summary',
      'profileImage',
      'hIndex',
      'totalCitations',
      'i10Index',
      'template',
      'category',
      'title',
  'headline',
      'theme',
      'layout',
      'themeConfig',
      'themeData',
      'sectionOrder',
      'citationStyle',
      'showNumbering',
      'numberingStyle',
      'publicationsGroupBy',
      'publicationsSortBy',
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        // Serialize themeData and sectionOrder if they're objects
        const value = body[field];
        const shouldStoreAsJson = field === 'themeData' || field === 'sectionOrder' || field === 'themeConfig';

        if (value === null || value === undefined || value === 'null') {
          updateData[field] = null;
        } else if (shouldStoreAsJson && typeof value === 'object') {
          updateData[field] = JSON.stringify(value);
        } else if (field === 'email' && Array.isArray(value)) {
          // Handle multiple emails as comma-separated string
          updateData[field] = value.join(', ');
        } else {
          updateData[field] = value;
        }
      }
    }

    // Only update CV if there are fields to update
    if (Object.keys(updateData).length > 0) {
      try {
        console.log("Updating CV with data:", updateData);
        await prisma.cV.update({
          where: { id: params.id },
          data: updateData,
        });
        console.log("CV basic info updated successfully");
      } catch (error) {
        console.error("Error updating CV basic info:", error);
        // Re-throw the error instead of swallowing it
        throw error;
      }
    }

    // Save Education
    if (body.education && Array.isArray(body.education)) {
      console.log("Saving education entries:", body.education.length);
      console.log("Education data received:", JSON.stringify(body.education, null, 2));
      
      // Delete existing education entries
      await prisma.education.deleteMany({
        where: { cvId: params.id },
      });

      // Create new entries
      if (body.education.length > 0) {
        try {
          // Filter out entries with missing required fields
          const validEducation = body.education.filter((edu: any, index: number) => {
            const hasInstitution = edu.institution && String(edu.institution).trim() !== '';
            const hasDegree = edu.degree && String(edu.degree).trim() !== '';
            const start = parseDate(edu.startDate);
            if (!hasInstitution || !hasDegree || !start) {
              console.log(`Skipping education entry ${index}: missing required fields (institution: ${hasInstitution}, degree: ${hasDegree}, startDate: ${Boolean(start)})`);
            }
            return hasInstitution && hasDegree && Boolean(start);
          });

          console.log(`Valid education entries after filtering: ${validEducation.length} out of ${body.education.length}`);

          if (validEducation.length > 0) {
            const educationData = validEducation.map((edu: any, index: number) => {
              const start = parseDate(edu.startDate)!;
              const end = !edu.current ? parseDate(edu.endDate) : null;
              return {
                cvId: params.id,
                institution: String(edu.institution).trim(),
                degree: String(edu.degree).trim(),
                field: edu.field ? String(edu.field).trim() : null,
                location: edu.location ? String(edu.location).trim() : null,
                startDate: start,
                endDate: end,
                current: edu.current === true,
                gpa: edu.gpa ? String(edu.gpa).trim() : null,
                description: edu.description ? String(edu.description).trim() : null,
                order: edu.order !== undefined ? edu.order : index,
              };
            });

            console.log("Creating education entries:", educationData.length);
            await prisma.education.createMany({
              data: educationData,
            });
            console.log("✅ Education saved successfully");
          }
        } catch (error) {
          console.error("❌ Error saving education:", error);
          console.error("Error details:", error instanceof Error ? error.message : String(error));
          throw new Error(`Failed to save education: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Save Experience
    if (body.experience && Array.isArray(body.experience)) {
      console.log("Saving experience entries:", body.experience.length);
      await prisma.experience.deleteMany({
        where: { cvId: params.id },
      });

      if (body.experience.length > 0) {
        try {
          // Filter out entries with missing required fields
          const validExperience = body.experience.filter((exp: any) => {
            const hasCompany = exp.company && String(exp.company).trim() !== '';
            const hasPosition = exp.position && String(exp.position).trim() !== '';
            return hasCompany && hasPosition;
          });

          console.log(`Valid experience entries after filtering: ${validExperience.length} out of ${body.experience.length}`);

          if (validExperience.length > 0) {
            const experienceData = validExperience.map((exp: any, index: number) => ({
              cvId: params.id,
              company: String(exp.company).trim(),
              position: String(exp.position).trim(),
              location: exp.location ? String(exp.location).trim() : null,
              startDate: parseDate(exp.startDate),
              endDate: !exp.current ? parseDate(exp.endDate) : null,
              current: exp.current === true,
              description: exp.description ? String(exp.description).trim() : null,
              achievements: exp.achievements ? String(exp.achievements).trim() : null,
              order: exp.order !== undefined ? exp.order : index,
              // Note: employmentType is sent from UI but not in schema, so we ignore it
            }));

            console.log("Creating experience entries:", experienceData.length);
            console.log("Experience data sample:", experienceData[0]);
            await prisma.experience.createMany({
              data: experienceData,
            });
            console.log("✅ Experience saved successfully");
          }
        } catch (error) {
          console.error("❌ Error saving experience:", error);
          throw new Error(`Failed to save experience: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Save Publications
    if (body.publications && Array.isArray(body.publications)) {
      console.log("📚 Saving publications, count:", body.publications.length);
      console.log("📚 First publication sample:", body.publications[0]);
      
      await prisma.publication.deleteMany({
        where: { cvId: params.id },
      });

      if (body.publications.length > 0) {
        // Filter out entries with missing required fields
        const validPublications = body.publications.filter((pub: any, index: number) => {
          const hasTitle = pub.title && pub.title.trim() !== '';
          
          if (!hasTitle) {
            console.log(`Skipping publication entry ${index}: missing required fields (title: ${hasTitle})`);
            return false;
          }
          return true;
        });

        console.log(`Valid publication entries after filtering: ${validPublications.length} out of ${body.publications.length}`);

        if (validPublications.length === 0) {
          console.log("No valid publication entries to save");
        } else {
          await prisma.publication.createMany({
            data: validPublications.map((pub: any, index: number) => {
              // Parse year safely
              let yearValue = new Date().getFullYear();
              if (pub.year) {
                const parsed = parseInt(String(pub.year));
                if (!isNaN(parsed) && parsed > 1900 && parsed <= new Date().getFullYear() + 10) {
                  yearValue = parsed;
                }
              }
              
              return {
                cvId: params.id,
                type: pub.type || "JOURNAL",
                title: pub.title?.trim() || "",
                authors: pub.authors?.trim() || null,
                journal: pub.journal?.trim() || null,
                conference: pub.conference?.trim() || null,
                year: yearValue,
                volume: pub.volume?.trim() || null,
                issue: pub.issue?.trim() || null,
                pages: pub.pages?.trim() || null,
                doi: pub.doi?.trim() || null,
                url: pub.url?.trim() || null,
                abstract: pub.abstract?.trim() || null,
                citations: pub.citations ? parseInt(pub.citations) : null,
                impactFactor: pub.impactFactor ? parseFloat(pub.impactFactor) : null,
                jcrZone: pub.jcrZone?.trim() || null,
                casZone: pub.casZone?.trim() || null,
                scholarId: pub.scholarId?.trim() || null,
                order: pub.order !== undefined ? pub.order : index,
              };
            }),
          });
        }
      }
    }

    // Save Skills
    if (body.skills && Array.isArray(body.skills)) {
      await prisma.skill.deleteMany({
        where: { cvId: params.id },
      });

      if (body.skills.length > 0) {
        // Filter out entries with missing required fields
        const validSkills = body.skills.filter((skill: any, index: number) => {
          const hasName = skill.name && skill.name.trim() !== '';
          
          if (!hasName) {
            console.log(`Skipping skill entry ${index}: missing required fields (name: ${hasName})`);
            return false;
          }
          return true;
        });

        console.log(`Valid skill entries after filtering: ${validSkills.length} out of ${body.skills.length}`);

        if (validSkills.length === 0) {
          console.log("No valid skill entries to save");
        } else {
          await prisma.skill.createMany({
            data: validSkills.map((skill: any, index: number) => {
              // Convert level to integer (1-5) or null
              let level = null;
              if (skill.level) {
                if (typeof skill.level === 'string') {
                  const levelMap: any = { 'BEGINNER': 1, 'INTERMEDIATE': 2, 'ADVANCED': 3, 'EXPERT': 4 };
                  level = levelMap[skill.level] || parseInt(skill.level) || null;
                } else if (typeof skill.level === 'number') {
                  level = skill.level;
                }
              }
              
              return {
                cvId: params.id,
                name: skill.name?.trim() || "",
                category: skill.category?.trim() || null,
                level: level,
                order: skill.order !== undefined ? skill.order : index,
              };
            }),
          });
        }
      }
    }

    // Save Projects
    if (body.projects && Array.isArray(body.projects)) {
      await prisma.project.deleteMany({
        where: { cvId: params.id },
      });

      if (body.projects.length > 0) {
        // Filter out entries with missing required fields
        const validProjects = body.projects.filter((proj: any, index: number) => {
          const hasName = proj.name && proj.name.trim() !== '';
          
          if (!hasName) {
            console.log(`Skipping project entry ${index}: missing required fields (name: ${hasName})`);
            return false;
          }
          return true;
        });

        console.log(`Valid project entries after filtering: ${validProjects.length} out of ${body.projects.length}`);

        if (validProjects.length === 0) {
          console.log("No valid project entries to save");
        } else {
          await prisma.project.createMany({
            data: validProjects.map((proj: any, index: number) => ({
            cvId: params.id,
            name: proj.name?.trim() || "",
            description: proj.description?.trim() || null,
            role: proj.role?.trim() || null,
            technologies: proj.technologies?.trim() || null,
            startDate: parseDate(proj.startDate),
            endDate: parseDate(proj.endDate),
            url: proj.url?.trim() || null,
            order: proj.order !== undefined ? proj.order : index,
          })),
        });
        }
      }
    }

    // Save Certifications
    if (body.certifications && Array.isArray(body.certifications)) {
      console.log("=== Saving Certifications ===");
      console.log(`Received ${body.certifications.length} certification entries`);
      
      await prisma.certification.deleteMany({
        where: { cvId: params.id },
      });

      if (body.certifications.length > 0) {
        // Filter out entries with missing required fields
        const validCertifications = body.certifications.filter((cert: any, index: number) => {
          const hasName = cert.name && cert.name.trim() !== '';
          const hasIssuer = cert.issuer && cert.issuer.trim() !== '';
          
          console.log(`Certification ${index}:`, {
            name: cert.name,
            issuer: cert.issuer,
            hasName,
            hasIssuer
          });
          
          if (!hasName || !hasIssuer) {
            console.log(`❌ Skipping certification entry ${index}: missing required fields (name: ${hasName}, issuer: ${hasIssuer})`);
            return false;
          }
          return true;
        });

        console.log(`Valid certification entries after filtering: ${validCertifications.length} out of ${body.certifications.length}`);

        if (validCertifications.length === 0) {
          console.log("⚠️ No valid certification entries to save");
        } else {
          await prisma.certification.createMany({
            data: validCertifications.map((cert: any, index: number) => ({
            cvId: params.id,
            name: cert.name?.trim() || "",
            issuer: cert.issuer?.trim() || "",
            issueDate: parseDate(cert.issueDate) || new Date(),
            expiryDate: parseDate(cert.expiryDate),
            credentialId: cert.credentialId?.trim() || null,
            credentialUrl: cert.credentialUrl?.trim() || null,
            order: cert.order !== undefined ? cert.order : index,
          })),
        });
          console.log(`✅ Saved ${validCertifications.length} certifications`);
        }
      }
    }

    // Save Awards
    if (body.awards && Array.isArray(body.awards)) {
      console.log("=== Saving Awards ===");
      console.log(`Received ${body.awards.length} award entries`);
      
      const validAwards = body.awards.filter((award: any, index: number) => {
        const hasTitle = award.title && award.title.trim() !== '';
        const hasIssuer = award.issuer && award.issuer.trim() !== '';
        const hasDate = award.date && (typeof award.date === 'string' ? award.date.trim() !== '' : true);
        
        console.log(`Award ${index}:`, {
          title: award.title,
          issuer: award.issuer,
          date: award.date,
          hasTitle,
          hasIssuer,
          hasDate
        });
        
        if (!hasTitle || !hasIssuer || !hasDate) {
          console.log(`❌ Skipping award entry ${index}: missing required fields (title: ${hasTitle}, issuer: ${hasIssuer}, date: ${hasDate})`);
          return false;
        }
        return true;
      });

      console.log(`Valid awards entries after filtering: ${validAwards.length} out of ${body.awards.length}`);

      if (validAwards.length > 0) {
        await prisma.award.deleteMany({
          where: { cvId: params.id },
        });

        await prisma.award.createMany({
          data: validAwards.map((award: any, index: number) => ({
            cvId: params.id,
            title: award.title.trim(),
            issuer: award.issuer.trim(),
            date: parseDate(award.date) || new Date(),
            description: award.description?.trim() || null,
            order: award.order !== undefined ? award.order : index,
          })),
        });
        console.log(`✅ Saved ${validAwards.length} awards`);
      } else {
        console.log("⚠️ No valid award entries to save");
      }
    }

    // Save Languages
    if (body.languages && Array.isArray(body.languages)) {
      console.log(`Received ${body.languages.length} language entries:`, JSON.stringify(body.languages, null, 2));
      
      const validLanguages = body.languages.filter((lang: any, index: number) => {
        const hasName = lang.name && lang.name.trim() !== '';
        const hasProficiency = lang.proficiency && typeof lang.proficiency === 'string' && lang.proficiency.trim() !== '';
        
        console.log(`Language ${index}:`, {
          name: lang.name,
          proficiency: lang.proficiency,
          hasName,
          hasProficiency,
          proficiencyType: typeof lang.proficiency
        });
        
        if (!hasName || !hasProficiency) {
          console.log(`Skipping language entry ${index}: missing required fields (name: ${hasName}, proficiency: ${hasProficiency})`);
          return false;
        }
        return true;
      });

      console.log(`Valid languages entries after filtering: ${validLanguages.length} out of ${body.languages.length}`);

      if (validLanguages.length > 0) {
        await prisma.language.deleteMany({
          where: { cvId: params.id },
        });

        await prisma.language.createMany({
          data: validLanguages.map((lang: any, index: number) => ({
            cvId: params.id,
            name: lang.name.trim(),
            proficiency: lang.proficiency.trim(),
            order: lang.order !== undefined ? lang.order : index,
          })),
        });
      }
    }

    // Save References
    if (body.references && Array.isArray(body.references)) {
      const validReferences = body.references.filter((ref: any, index: number) => {
        const hasName = ref.name && ref.name.trim() !== '';
        const hasPosition = (ref.position && ref.position.trim() !== '') || (ref.title && ref.title.trim() !== '');
        const hasOrganization = (ref.organization && ref.organization.trim() !== '') || (ref.company && ref.company.trim() !== '');
        
        if (!hasName || !hasPosition || !hasOrganization) {
          console.log(`Skipping reference entry ${index}: missing required fields (name: ${hasName}, position/title: ${hasPosition}, organization/company: ${hasOrganization})`);
          return false;
        }
        return true;
      });

      console.log(`Valid references entries after filtering: ${validReferences.length} out of ${body.references.length}`);

      if (validReferences.length > 0) {
        await prisma.reference.deleteMany({
          where: { cvId: params.id },
        });

        await prisma.reference.createMany({
          data: validReferences.map((ref: any, index: number) => ({
            cvId: params.id,
            name: ref.name.trim(),
            position: ref.position?.trim() || ref.title?.trim() || "",
            organization: ref.organization?.trim() || ref.company?.trim() || "",
            email: ref.email?.trim() || "",
            phone: ref.phone?.trim() || null,
            relationship: ref.relationship?.trim() || null,
            order: ref.order !== undefined ? ref.order : index,
          })),
        });
      }
    }

    // Save Custom Sections
    if (body.customSections && Array.isArray(body.customSections)) {
      const validCustomSections = body.customSections.filter((section: any, index: number) => {
        if (!section.title?.trim() || !section.content?.trim()) {
          console.log(`Skipping custom section entry ${index}: missing required fields (title: "${section.title}", content: "${section.content}")`);
          return false;
        }
        return true;
      });

      console.log(`Valid custom sections entries after filtering: ${validCustomSections.length} out of ${body.customSections.length}`);

      if (validCustomSections.length > 0) {
        await prisma.customSection.deleteMany({
          where: { cvId: params.id },
        });

        await prisma.customSection.createMany({
          data: validCustomSections.map((section: any, index: number) => {
            // Handle both HTML (rich text) and plain text content
            const content = typeof section.content === 'string' 
              ? section.content.trim() 
              : '';
            
            return {
              cvId: params.id,
              title: section.title.trim(),
              content: content,
              order: section.order !== undefined ? section.order : index,
            };
          }),
        });
      }
    }

    // Save References
    if (body.references && Array.isArray(body.references)) {
      console.log("Saving references entries:", body.references.length);
      
      await prisma.reference.deleteMany({
        where: { cvId: params.id },
      });

      if (body.references.length > 0) {
        try {
          // Filter out entries with missing required fields (name is required)
          const validReferences = body.references.filter((ref: any) => {
            const hasName = ref.name && String(ref.name).trim() !== '';
            return hasName;
          });

          console.log(`Valid reference entries after filtering: ${validReferences.length} out of ${body.references.length}`);

          if (validReferences.length > 0) {
            const referencesData = validReferences.map((ref: any, index: number) => ({
              cvId: params.id,
              name: String(ref.name).trim(),
              position: ref.position ? String(ref.position).trim() : null,
              organization: ref.organization ? String(ref.organization).trim() : null,
              email: ref.email ? String(ref.email).trim() : null,
              phone: ref.phone ? String(ref.phone).trim() : null,
              relationship: ref.relationship ? String(ref.relationship).trim() : null,
              order: ref.order !== undefined ? ref.order : index,
            }));

            console.log("Creating reference entries:", referencesData.length);
            await prisma.reference.createMany({
              data: referencesData,
            });
            console.log("✅ References saved successfully");
          }
        } catch (error) {
          console.error("❌ Error saving references:", error);
          throw new Error(`Failed to save references: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // Save Custom Sections
    if (body.customSections && Array.isArray(body.customSections)) {
      const validCustomSections = body.customSections.filter((section: any, index: number) => {
        if (!section.title?.trim()) {
          console.log(`Skipping custom section entry ${index}: missing title`);
          return false;
        }
        return true;
      });

      console.log(`Valid custom sections entries after filtering: ${validCustomSections.length} out of ${body.customSections.length}`);

      if (validCustomSections.length > 0) {
        await prisma.customSection.deleteMany({
          where: { cvId: params.id },
        });

        await prisma.customSection.createMany({
          data: validCustomSections.map((section: any, index: number) => {
            const content = section.content && typeof section.content === 'string' 
              ? section.content.trim() 
              : '';
            
            return {
              cvId: params.id,
              title: section.title.trim(),
              content: content,
              order: section.order !== undefined ? section.order : index,
            };
          }),
        });
        console.log("✅ Custom sections saved successfully");
      }
    }

    // Save Contact Info
    if (Array.isArray(body.contactInfo)) {
      try {
        const validContactInfo = body.contactInfo.filter((contact: any, index: number) => {
          const hasType = contact?.type && String(contact.type).trim() !== "";
          const hasValue = contact?.value && String(contact.value).trim() !== "";

          if (!hasType || !hasValue) {
            console.log(
              `Skipping contact info entry ${index}: missing required fields (type: ${hasType}, value: ${hasValue})`
            );
            return false;
          }
          return true;
        });

        console.log(
          `Valid contact info entries after filtering: ${validContactInfo.length} out of ${body.contactInfo.length}`
        );

        await prisma.contactInfo.deleteMany({
          where: { cvId: params.id },
        });

        if (validContactInfo.length > 0) {
          await prisma.contactInfo.createMany({
            data: validContactInfo.map((contact: any, index: number) => ({
              cvId: params.id,
              type: String(contact.type).trim(),
              value: String(contact.value).trim(),
              label:
                contact.label && String(contact.label).trim() !== ""
                  ? String(contact.label).trim()
                  : null,
              isPrimary: contact.isPrimary === true,
              order: (() => {
                if (contact.order === undefined || contact.order === null) {
                  return index;
                }
                const parsed = Number(contact.order);
                return Number.isFinite(parsed) ? parsed : index;
              })(),
            })),
          });
          console.log("✅ Contact info saved successfully");
        } else {
          console.log("ℹ️ No valid contact info entries to save; existing entries cleared");
        }
      } catch (error) {
        console.error("❌ Error saving contact info:", error);
        throw new Error(
          `Failed to save contact information: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    }

    // Return updated CV with all data
    const updatedCV = await prisma.cV.findFirst({
      where: { id: params.id },
      include: {
        education: { orderBy: { order: "asc" } },
        experience: { orderBy: { order: "asc" } },
        publications: { orderBy: { order: "asc" } },
        skills: { orderBy: { order: "asc" } },
        projects: { orderBy: { order: "asc" } },
        certifications: { orderBy: { order: "asc" } },
        awards: { orderBy: { order: "asc" } },
        languages: { orderBy: { order: "asc" } },
        references: { orderBy: { order: "asc" } },
        customSections: { orderBy: { order: "asc" } },
        contactInfo: { orderBy: { order: "asc" } },
      },
    });

    return NextResponse.json(updatedCV);
  } catch (error) {
    console.error("=== CV Save Error ===");
    console.error("Error details:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: "Failed to save CV", 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
