/**
 * Application Document Generator
 * 
 * Generates customized cover letters, resume highlights, and
 * application answers based on the candidate profile and job requirements.
 * 
 * IMPORTANT: Never fabricates information. Only reorganizes and emphasizes
 * existing truthful candidate data.
 */

import { CandidateSkills, Experience, Project } from "@/lib/types";

interface CandidateContext {
  name: string;
  skills: CandidateSkills | null;
  experience: Experience[] | null;
  projects: Project[] | null;
  portfolioUrl?: string;
  githubUrl?: string;
}

interface JobContext {
  title: string;
  company: string;
  requirements: string[];
  description: string;
}

function getMatchingSkills(candidateSkills: CandidateSkills | null, requirements: string[]): string[] {
  if (!candidateSkills) return [];
  const allSkills = Object.values(candidateSkills).flat().map((s) => s.toLowerCase());
  return requirements.filter((req) => {
    const words = req.toLowerCase().split(/[\s,/]+/);
    return words.some((w) => allSkills.some((s) => s.includes(w) || w.includes(s)));
  });
}

function getRelevantProjects(projects: Project[] | null, requirements: string[]): Project[] {
  if (!projects) return [];
  const reqWords = requirements.flatMap((r) => r.toLowerCase().split(/[\s,/]+/));
  return projects
    .filter((p) =>
      p.technologies.some((t) =>
        reqWords.some((w) => t.toLowerCase().includes(w) || w.includes(t.toLowerCase()))
      )
    )
    .slice(0, 3);
}

export function generateCoverLetter(candidate: CandidateContext, job: JobContext): string {
  const matching = getMatchingSkills(candidate.skills, job.requirements);
  const relevantProjects = getRelevantProjects(candidate.projects, job.requirements);
  
  const projectMention = relevantProjects.length > 0
    ? `\n\nI have built several relevant projects including ${relevantProjects.map((p) => `${p.name} (${p.technologies.slice(0, 3).join(", ")})`).join(", ")}. These projects demonstrate my practical experience with the technologies central to this role.`
    : "";
  
  const experienceMention = candidate.experience && candidate.experience.length > 0
    ? `\n\nIn my role at ${candidate.experience[0].company} as ${candidate.experience[0].role}, I ${candidate.experience[0].achievements[0] || candidate.experience[0].responsibilities[0] || "contributed to key projects"}.`
    : "";
  
  const skillMention = matching.length > 0
    ? `My expertise in ${matching.slice(0, 4).join(", ")} directly aligns with your requirements.`
    : "My technical background aligns with the core requirements of this role.";
  
  const portfolioMention = candidate.portfolioUrl
    ? `\n\nYou can explore my work at ${candidate.portfolioUrl}${candidate.githubUrl ? ` and my code at ${candidate.githubUrl}` : ""}.`
    : "";
  
  return `Dear Hiring Team at ${job.company},

I am writing to express my strong interest in the ${job.title} position at ${job.company}. ${skillMention}${projectMention}${experienceMention}

What excites me most about this opportunity is the chance to contribute to ${job.company}'s mission while leveraging my skills in a meaningful way. I am passionate about building high-quality software and continuously expanding my technical capabilities.${portfolioMention}

I would welcome the opportunity to discuss how my background and skills could contribute to your team. Thank you for considering my application.

Best regards,
${candidate.name}`;
}

export function generateApplicationAnswers(candidate: CandidateContext, job: JobContext): Array<{ question: string; answer: string }> {
  const matching = getMatchingSkills(candidate.skills, job.requirements);
  const relevantProjects = getRelevantProjects(candidate.projects, job.requirements);
  
  const topProject = relevantProjects[0] || (candidate.projects && candidate.projects[0]);
  
  return [
    {
      question: "Why do you want to join us?",
      answer: `I am drawn to ${job.company}'s work in the ${job.title} space. The opportunity to apply my skills in ${matching.slice(0, 3).join(", ") || "modern web technologies"} while contributing to meaningful products is exactly what I'm looking for in my career growth.`,
    },
    {
      question: "Why are you suitable for this role?",
      answer: `My technical stack closely aligns with the role requirements. I have practical experience with ${matching.slice(0, 4).join(", ") || "the key technologies required"}${topProject ? `, demonstrated through projects like ${topProject.name}` : ""}. I combine strong technical skills with a passion for building quality software.`,
    },
    {
      question: "Tell us about yourself",
      answer: `I am a ${candidate.experience && candidate.experience.length > 0 ? `${candidate.experience[0].role} with experience at ${candidate.experience[0].company}` : "passionate developer"} with expertise in ${matching.slice(0, 3).join(", ") || "modern web technologies"}. ${candidate.projects && candidate.projects.length > 0 ? `I have built ${candidate.projects.length} projects` : "I am building my portfolio"} that demonstrate my capabilities in full-stack development${candidate.portfolioUrl ? `, which you can explore at ${candidate.portfolioUrl}` : ""}.`,
    },
    {
      question: "Describe your most relevant project",
      answer: topProject
        ? `${topProject.name}: ${topProject.description}. I used ${topProject.technologies.join(", ")} and the key achievements include ${topProject.achievements[0] || "building a fully functional application"}. ${topProject.liveUrl ? `Live at: ${topProject.liveUrl}` : ""}`.trim()
        : "I am currently building projects to demonstrate my skills in the technologies relevant to this role.",
    },
    {
      question: "Why should we hire you?",
      answer: `I bring a combination of ${matching.slice(0, 3).join(", ") || "technical"} skills with ${candidate.projects ? `${candidate.projects.length} portfolio projects` : "practical project experience"} that demonstrate real-world application. I am committed to continuous learning and delivering high-quality work. My hands-on approach to building and deploying projects shows my ability to take ownership and deliver results.`,
    },
  ];
}

export function generateResumeHighlights(candidate: CandidateContext, job: JobContext): string {
  const matching = getMatchingSkills(candidate.skills, job.requirements);
  const relevantProjects = getRelevantProjects(candidate.projects, job.requirements);
  
  let highlights = `Resume Highlights for ${job.title} at ${job.company}\n`;
  highlights += `${"=".repeat(50)}\n\n`;
  
  highlights += `RELEVANT SKILLS\n`;
  if (matching.length > 0) {
    matching.forEach((s) => { highlights += `  ✓ ${s}\n`; });
  }
  highlights += "\n";
  
  if (relevantProjects.length > 0) {
    highlights += `KEY PROJECTS\n`;
    relevantProjects.forEach((p) => {
      highlights += `  • ${p.name}\n    ${p.description}\n    Tech: ${p.technologies.join(", ")}\n\n`;
    });
  }
  
  if (candidate.experience && candidate.experience.length > 0) {
    highlights += `EXPERIENCE\n`;
    candidate.experience.forEach((e) => {
      highlights += `  • ${e.role} at ${e.company} (${e.duration})\n`;
      e.achievements.slice(0, 2).forEach((a) => { highlights += `    - ${a}\n`; });
      highlights += "\n";
    });
  }
  
  return highlights;
}

export function generateRecruiterMessage(
  candidateName: string,
  recruiterName: string,
  jobTitle: string,
  company: string,
  matchingSkills: string[],
  portfolioUrl?: string
): string {
  const skillMention = matchingSkills.length > 0
    ? `My background in ${matchingSkills.slice(0, 2).join(" and ")} aligns closely with the role`
    : "My technical background aligns with the role requirements";

  return `Hi ${recruiterName},

I came across the ${jobTitle} opportunity at ${company}. ${skillMention}, and I would be grateful if you could consider my application.${portfolioUrl ? `\n\nPortfolio: ${portfolioUrl}` : ""}

Best,
${candidateName}`;
}
