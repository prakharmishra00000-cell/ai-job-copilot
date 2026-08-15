// Core domain types
export interface CandidateSkills {
  programmingLanguages?: string[];
  frameworks?: string[];
  frontend?: string[];
  backend?: string[];
  databases?: string[];
  cloud?: string[];
  aiml?: string[];
  apis?: string[];
  devops?: string[];
  tools?: string[];
  softSkills?: string[];
}

export interface PersonalInfo {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface Experience {
  company: string;
  role: string;
  duration: string;
  responsibilities: string[];
  achievements: string[];
}

export interface Education {
  degree: string;
  university: string;
  graduationYear: string;
  coursework: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  role: string;
  complexity: string;
  achievements: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface PortfolioAnalysis {
  overallScore: number;
  frontend: number;
  backend: number;
  aiIntegration: number;
  uiux: number;
  projects: number;
  professionalPresentation: number;
  recruiterReadiness: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface CandidatePreferences {
  targetRoles: string[];
  locations: string[];
  workMode: string[];
  salaryMin: number;
  salaryCurrency: string;
  experienceLevel: string;
  employmentTypes: string[];
  industries: string[];
  technologies: string[];
}

export interface JobSearchParams {
  role?: string;
  location?: string;
  experience?: string;
  employmentType?: string;
  workMode?: string;
  salaryMin?: number;
  keywords?: string[];
}

export interface JobResult {
  externalJobId: string;
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  workMode?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  experienceLevel?: string;
  employmentType?: string;
  description?: string;
  responsibilities?: string[];
  requirements?: string[];
  preferredSkills?: string[];
  benefits?: string[];
  applicationProcess?: string;
  url: string;
  companyUrl?: string;
  applicationUrl?: string;
  postedAt?: Date;
  expiresAt?: Date;
  sourceName: string;
}

export interface FitScoreBreakdown {
  fitScore: number;
  shortlistProbability: number;
  confidence: "high" | "medium" | "low";
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  projectRelevance: number;
  locationMatch: number;
  technologyMatch: number;
  roleMatch: number;
  salaryMatch: number;
  strengths: string[];
  missingRequirements: string[];
  explanation: string;
  category: "apply_immediately" | "strong_match" | "possible_match" | "low_match";
}

export interface ApplicationDocument {
  resumeVersion: string;
  coverLetter: string;
  applicationAnswers: Array<{ question: string; answer: string }>;
}

export interface AutomationSettings {
  isActive: boolean;
  mode: "manual" | "assisted" | "autonomous";
  scanFrequency: string;
  maxApplicationsPerDay: number;
  maxApplicationsPerHour: number;
  minFitScore: number;
  minShortlistProbability: number;
  autoApplyEnabled: boolean;
  recruiterOutreachEnabled: boolean;
  maxRecruiterMessagesPerDay: number;
  requireApproval: string;
}

export type ApplicationStatus =
  | "discovered"
  | "reviewed"
  | "ready_to_apply"
  | "application_started"
  | "applied"
  | "application_failed"
  | "needs_user_action"
  | "withdrawn"
  | "application_confirmed"
  | "recruiter_contacted"
  | "recruiter_responded"
  | "assessment_received"
  | "interview_requested"
  | "interview_scheduled"
  | "rejected"
  | "offer"
  | "no_response";

export interface DashboardStats {
  totalJobsFound: number;
  highlyRelevant: number;
  totalApplications: number;
  totalResponses: number;
  interviews: number;
  offers: number;
  applicationsThisWeek: number;
  responseRate: number;
  interviewRate: number;
  avgFitScore: number;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
}
