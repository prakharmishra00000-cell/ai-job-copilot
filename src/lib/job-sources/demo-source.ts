/**
 * DemoJobSource — Clearly labeled DEMO DATA source.
 * 
 * In a production deployment, this would be replaced by real API integrations
 * (LinkedIn, Indeed, etc.). For demonstration purposes, this generates
 * realistic-looking job data that is clearly marked as demo/sample data.
 * 
 * IMPORTANT: All data from this source is labeled "DEMO DATA" 
 * and is not from real job postings.
 */

import { JobSourceAdapter } from "./adapter";
import { JobResult, JobSearchParams } from "@/lib/types";
import { v4 as uuidv4 } from "uuid";

const DEMO_COMPANIES = [
  { name: "TechNova Solutions", industry: "AI/ML" },
  { name: "CloudScale Inc.", industry: "Cloud" },
  { name: "DataPulse Analytics", industry: "Data" },
  { name: "NeuralWorks AI", industry: "AI/ML" },
  { name: "PixelForge Studios", industry: "Design" },
  { name: "GreenByte Technologies", industry: "Sustainability" },
  { name: "QuantumLeap Software", industry: "Enterprise" },
  { name: "SwiftBuild Labs", industry: "DevTools" },
  { name: "BrainBridge AI", industry: "AI/ML" },
  { name: "FutureStack Corp", industry: "SaaS" },
  { name: "InnovateTech Hub", industry: "Startup" },
  { name: "CyberShield Security", industry: "Security" },
];

const DEMO_LOCATIONS = [
  "Bangalore, India",
  "Mumbai, India",
  "Delhi NCR, India",
  "Hyderabad, India",
  "Pune, India",
  "Chennai, India",
  "Remote - India",
  "Remote - Worldwide",
  "San Francisco, USA",
  "New York, USA",
  "London, UK",
  "Singapore",
];

const DEMO_ROLES: Record<string, { title: string; requirements: string[]; responsibilities: string[]; skills: string[] }[]> = {
  default: [
    {
      title: "AI Full Stack Developer",
      requirements: ["React/Next.js proficiency", "Node.js experience", "AI/ML API integration", "RESTful API design", "Database management"],
      responsibilities: ["Build AI-powered web applications", "Integrate LLM APIs", "Design responsive UIs", "Optimize application performance", "Write clean, maintainable code"],
      skills: ["React", "Next.js", "Node.js", "Python", "OpenAI API", "PostgreSQL", "TypeScript"],
    },
    {
      title: "Full Stack Developer",
      requirements: ["3+ years web development", "React ecosystem expertise", "Backend API development", "Database design", "CI/CD knowledge"],
      responsibilities: ["Develop full-stack features", "Code review and mentorship", "System architecture design", "Database optimization", "DevOps collaboration"],
      skills: ["React", "Node.js", "TypeScript", "PostgreSQL", "Docker", "AWS"],
    },
    {
      title: "Frontend Developer",
      requirements: ["React/Vue proficiency", "CSS/Tailwind expertise", "State management", "Testing experience", "Accessibility knowledge"],
      responsibilities: ["Build responsive UIs", "Implement design systems", "Optimize web performance", "Write unit tests", "Collaborate with designers"],
      skills: ["React", "TypeScript", "Tailwind CSS", "Jest", "Figma"],
    },
    {
      title: "Backend Developer",
      requirements: ["Node.js/Python expertise", "API design", "Database management", "Cloud services", "Security best practices"],
      responsibilities: ["Design RESTful APIs", "Database schema design", "Microservices architecture", "Performance optimization", "Security implementation"],
      skills: ["Node.js", "Python", "PostgreSQL", "Redis", "Docker", "AWS"],
    },
    {
      title: "AI/ML Engineer",
      requirements: ["ML framework expertise", "Python proficiency", "Data pipeline experience", "Model deployment", "Statistics knowledge"],
      responsibilities: ["Develop ML models", "Data preprocessing", "Model training and evaluation", "Production deployment", "A/B testing"],
      skills: ["Python", "TensorFlow", "PyTorch", "Scikit-learn", "AWS SageMaker"],
    },
    {
      title: "Software Engineer - AI Products",
      requirements: ["Strong programming fundamentals", "AI/ML understanding", "System design skills", "Communication skills", "Agile experience"],
      responsibilities: ["Build AI product features", "Integrate ML models", "API development", "Performance monitoring", "Documentation"],
      skills: ["Python", "JavaScript", "React", "FastAPI", "Docker"],
    },
    {
      title: "DevOps Engineer",
      requirements: ["CI/CD pipeline experience", "Cloud platforms (AWS/GCP)", "Container orchestration", "IaC tools", "Monitoring solutions"],
      responsibilities: ["Manage cloud infrastructure", "Automate deployments", "Monitor system health", "Security compliance", "Cost optimization"],
      skills: ["AWS", "Kubernetes", "Terraform", "Docker", "Jenkins", "Prometheus"],
    },
    {
      title: "React Developer",
      requirements: ["2+ years React experience", "TypeScript proficiency", "State management", "Testing frameworks", "REST/GraphQL"],
      responsibilities: ["Build React components", "State management implementation", "API integration", "Performance optimization", "Code review"],
      skills: ["React", "TypeScript", "Redux", "GraphQL", "Jest", "Cypress"],
    },
  ],
};

function getTimeAgo(minutesAgo: number): Date {
  return new Date(Date.now() - minutesAgo * 60 * 1000);
}

function generateSalary(level: string): { salary: string; min: number; max: number } {
  const ranges: Record<string, { min: number; max: number }> = {
    fresher: { min: 400000, max: 800000 },
    junior: { min: 600000, max: 1200000 },
    mid: { min: 1000000, max: 2000000 },
    senior: { min: 1800000, max: 3500000 },
  };
  const range = ranges[level] || ranges.junior;
  return {
    salary: `₹${(range.min / 100000).toFixed(0)}–${(range.max / 100000).toFixed(0)} LPA`,
    min: range.min,
    max: range.max,
  };
}

export class DemoJobSource implements JobSourceAdapter {
  sourceName = "demo";
  displayName = "Demo Source (Sample Data)";
  supportsAutoApply = false;
  supportsMessaging = false;

  async searchJobs(params: JobSearchParams): Promise<JobResult[]> {
    // Simulate API latency
    await new Promise((r) => setTimeout(r, 200));

    const roles = DEMO_ROLES.default;
    const results: JobResult[] = [];

    for (let i = 0; i < roles.length; i++) {
      const role = roles[i];
      const company = DEMO_COMPANIES[i % DEMO_COMPANIES.length];
      const location = DEMO_LOCATIONS[i % DEMO_LOCATIONS.length];
      const workModes = ["Remote", "Hybrid", "On-site"];
      const experienceLevels = ["Fresher", "0-1 years", "1-3 years", "2-5 years"];
      const employmentTypes = ["Full-time", "Internship", "Contract"];
      const salaryInfo = generateSalary(i < 3 ? "fresher" : i < 6 ? "junior" : "mid");
      const minutesAgo = Math.floor(Math.random() * 4320); // up to 3 days

      // Filter by role keyword if provided
      if (params.role) {
        const roleKeywords = params.role.toLowerCase().split(/\s+/);
        const titleLower = role.title.toLowerCase();
        const hasMatch = roleKeywords.some((k) => titleLower.includes(k));
        if (!hasMatch && roleKeywords.length > 1) continue;
      }

      results.push({
        externalJobId: `demo-${uuidv4().slice(0, 8)}`,
        title: role.title,
        company: company.name,
        location,
        workMode: workModes[i % workModes.length],
        salary: salaryInfo.salary,
        salaryMin: salaryInfo.min,
        salaryMax: salaryInfo.max,
        salaryCurrency: "INR",
        experienceLevel: experienceLevels[i % experienceLevels.length],
        employmentType: employmentTypes[i % employmentTypes.length],
        description: `[DEMO DATA] ${company.name} is looking for a ${role.title} to join our growing team. This is a sample job posting for demonstration purposes. In production, this would contain the actual job description from the source platform.`,
        responsibilities: role.responsibilities,
        requirements: role.requirements,
        preferredSkills: role.skills,
        benefits: ["Health Insurance", "Flexible Hours", "Learning Budget", "Remote Work Options"],
        applicationProcess: "Assisted Application Mode — Complete application on original platform",
        url: `https://example.com/demo-job/${i}`,
        companyUrl: `https://example.com/company/${company.name.toLowerCase().replace(/\s+/g, "-")}`,
        applicationUrl: `https://example.com/apply/${i}`,
        postedAt: getTimeAgo(minutesAgo),
        sourceName: "demo",
      });
    }

    return results;
  }

  async getJobDetails(jobId: string): Promise<JobResult | null> {
    const results = await this.searchJobs({});
    return results.find((j) => j.externalJobId === jobId) || null;
  }

  getOriginalUrl(jobId: string): string {
    return `https://example.com/demo-job/${jobId}`;
  }

  async checkApplicationStatus(): Promise<string | null> {
    return null;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}
