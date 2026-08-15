/**
 * Candidate Analyzer
 * 
 * Parses resume/portfolio text to extract structured candidate information.
 * In production, this would use an LLM (OpenAI, Gemini, etc.) for 
 * intelligent extraction. This implementation uses pattern matching
 * as a fallback when no AI provider is configured.
 */

import { CandidateSkills, PortfolioAnalysis } from "@/lib/types";

const KNOWN_SKILLS: Record<string, string[]> = {
  programmingLanguages: ["JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust", "Ruby", "PHP", "Swift", "Kotlin", "Dart", "R", "Scala", "Perl"],
  frameworks: ["React", "Next.js", "Vue.js", "Angular", "Svelte", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "Laravel", "Ruby on Rails", ".NET", "Flutter", "React Native"],
  frontend: ["HTML", "CSS", "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Sass", "SCSS", "Styled Components", "Framer Motion"],
  backend: ["Node.js", "Express.js", "Fastify", "Hono", "tRPC", "GraphQL", "REST API", "WebSocket", "gRPC", "Microservices"],
  databases: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "Firebase", "Supabase", "DynamoDB", "Cassandra", "Neo4j"],
  cloud: ["AWS", "GCP", "Azure", "Vercel", "Netlify", "Heroku", "DigitalOcean", "Cloudflare", "Railway"],
  aiml: ["OpenAI API", "GPT", "LangChain", "TensorFlow", "PyTorch", "Scikit-learn", "Hugging Face", "Gemini", "Claude API", "Stable Diffusion", "Computer Vision", "NLP"],
  apis: ["REST", "GraphQL", "WebSocket", "OAuth", "JWT", "Stripe API", "Twilio", "SendGrid"],
  devops: ["Docker", "Kubernetes", "CI/CD", "GitHub Actions", "Jenkins", "Terraform", "Ansible", "Nginx"],
  tools: ["Git", "GitHub", "VS Code", "Figma", "Jira", "Notion", "Postman", "Linux", "Webpack", "Vite"],
  softSkills: ["Communication", "Leadership", "Problem Solving", "Teamwork", "Time Management", "Adaptability", "Critical Thinking"],
};

export function extractSkillsFromText(text: string): CandidateSkills {
  const lower = text.toLowerCase();
  const skills: CandidateSkills = {};
  
  for (const [category, skillList] of Object.entries(KNOWN_SKILLS)) {
    const found = skillList.filter((skill) => {
      const skillLower = skill.toLowerCase();
      // Check for the skill name with word boundaries
      const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      return regex.test(lower) || lower.includes(skillLower);
    });
    if (found.length > 0) {
      (skills as Record<string, string[]>)[category] = found;
    }
  }
  
  return skills;
}

export function analyzePortfolio(
  skills: CandidateSkills,
  projectCount: number,
  experienceCount: number,
  hasDeployedProjects: boolean
): PortfolioAnalysis {
  const allSkills = Object.values(skills).flat();
  const totalSkillCount = allSkills.length;
  
  const frontendSkills = [...(skills.frontend || []), ...(skills.frameworks || []).filter((f) =>
    ["React", "Next.js", "Vue.js", "Angular", "Svelte"].includes(f)
  )];
  const backendSkills = [...(skills.backend || []), ...(skills.frameworks || []).filter((f) =>
    ["Express", "NestJS", "Django", "Flask", "FastAPI"].includes(f)
  )];
  
  const frontend = Math.min(Math.round((frontendSkills.length / 5) * 100), 98);
  const backend = Math.min(Math.round((backendSkills.length / 4) * 100), 98);
  const aiIntegration = Math.min(Math.round(((skills.aiml || []).length / 3) * 100), 98);
  const uiux = frontendSkills.length > 2 ? 84 : frontendSkills.length > 0 ? 65 : 40;
  const projects = Math.min(Math.round((projectCount / 5) * 100), 98);
  const professionalPresentation = experienceCount > 0 ? 82 : projectCount > 3 ? 75 : 60;
  const recruiterReadiness = totalSkillCount > 10 ? 87 : totalSkillCount > 5 ? 72 : 55;
  
  const overallScore = Math.round(
    frontend * 0.2 + backend * 0.15 + aiIntegration * 0.15 +
    uiux * 0.1 + projects * 0.15 + professionalPresentation * 0.1 +
    recruiterReadiness * 0.15
  );
  
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const recommendations: string[] = [];
  
  if (frontend > 70) strengths.push("Strong frontend development skills");
  if (backend > 70) strengths.push("Solid backend capabilities");
  if (aiIntegration > 60) strengths.push("AI/ML integration experience");
  if (projectCount > 3) strengths.push("Multiple portfolio projects");
  if (hasDeployedProjects) strengths.push("Deployed production projects");
  if (totalSkillCount > 15) strengths.push("Diverse technology stack");
  
  if (experienceCount === 0) weaknesses.push("Limited professional experience");
  if ((skills.cloud || []).length === 0) weaknesses.push("No cloud platform experience listed");
  if ((skills.devops || []).length === 0) weaknesses.push("Missing DevOps/CI-CD skills");
  if (projectCount < 3) weaknesses.push("Could benefit from more portfolio projects");
  if (!hasDeployedProjects) weaknesses.push("No deployed/live projects mentioned");
  
  if (experienceCount === 0) recommendations.push("Consider contributing to open-source projects to build professional credibility");
  if ((skills.cloud || []).length === 0) recommendations.push("Adding AWS/GCP experience would strengthen cloud-related applications");
  if (projectCount < 5) recommendations.push("Building 1-2 more production-grade projects could improve portfolio strength");
  if (aiIntegration < 50) recommendations.push("Adding AI/LLM integration projects would open more opportunities in the AI space");
  
  return {
    overallScore: Math.min(overallScore, 98),
    frontend,
    backend,
    aiIntegration,
    uiux,
    projects,
    professionalPresentation,
    recruiterReadiness,
    strengths: strengths.length > 0 ? strengths : ["Building foundational skills"],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["Continue developing expertise"],
    recommendations: recommendations.length > 0 ? recommendations : ["Keep building projects and gaining experience"],
  };
}

export function inferRoles(skills: CandidateSkills): string[] {
  const roles: string[] = [];
  const allSkills = Object.values(skills).flat().map((s) => s.toLowerCase());
  
  const hasReact = allSkills.some((s) => s.includes("react"));
  const hasNode = allSkills.some((s) => s.includes("node"));
  const hasAI = allSkills.some((s) => ["openai", "gpt", "langchain", "tensorflow", "pytorch", "ai", "ml"].some((k) => s.includes(k)));
  const hasPython = allSkills.some((s) => s.includes("python"));
  const hasCloud = allSkills.some((s) => ["aws", "gcp", "azure"].some((k) => s.includes(k)));
  const hasDevOps = allSkills.some((s) => ["docker", "kubernetes", "ci/cd", "terraform"].some((k) => s.includes(k)));
  
  if (hasReact && hasNode) roles.push("Full Stack Developer");
  if (hasReact) roles.push("Frontend Developer", "React Developer");
  if (hasNode) roles.push("Backend Developer", "Node.js Developer");
  if (hasAI) roles.push("AI/ML Engineer", "AI Full Stack Developer");
  if (hasAI && hasReact) roles.push("AI Application Developer");
  if (hasPython) roles.push("Python Developer");
  if (hasCloud) roles.push("Cloud Engineer");
  if (hasDevOps) roles.push("DevOps Engineer");
  if (hasReact && hasAI) roles.push("Software Engineer - AI Products");
  
  return [...new Set(roles)].slice(0, 8);
}
