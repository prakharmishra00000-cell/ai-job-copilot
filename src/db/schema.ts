import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  boolean,
  uuid,
  real,
  pgEnum,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────
export const applicationStatusEnum = pgEnum("application_status", [
  "discovered",
  "reviewed",
  "ready_to_apply",
  "application_started",
  "applied",
  "application_failed",
  "needs_user_action",
  "withdrawn",
  "application_confirmed",
  "recruiter_contacted",
  "recruiter_responded",
  "assessment_received",
  "interview_requested",
  "interview_scheduled",
  "rejected",
  "offer",
  "no_response",
]);

export const automationModeEnum = pgEnum("automation_mode", [
  "manual",
  "assisted",
  "autonomous",
]);

export const jobSourceStatusEnum = pgEnum("job_source_status", [
  "connected",
  "disconnected",
  "error",
  "assisted_only",
]);

export const workerStatusEnum = pgEnum("worker_status", [
  "idle",
  "running",
  "completed",
  "failed",
  "cancelled",
]);

export const responseTypeEnum = pgEnum("response_type", [
  "application_confirmation",
  "recruiter_response",
  "interview_invitation",
  "assessment",
  "rejection",
  "offer",
  "info_request",
  "unknown",
]);

// ─── Users ────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Candidate Profiles ───────────────────────────────────────────────
export const candidateProfiles = pgTable("candidate_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  resumeUrl: text("resume_url"),
  portfolioUrl: text("portfolio_url"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  personalInfo: jsonb("personal_info").$type<{
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  }>(),
  skills: jsonb("skills").$type<{
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
  }>(),
  experience: jsonb("experience").$type<
    Array<{
      company: string;
      role: string;
      duration: string;
      responsibilities: string[];
      achievements: string[];
    }>
  >(),
  education: jsonb("education").$type<
    Array<{
      degree: string;
      university: string;
      graduationYear: string;
      coursework: string[];
    }>
  >(),
  projects: jsonb("projects").$type<
    Array<{
      name: string;
      description: string;
      technologies: string[];
      role: string;
      complexity: string;
      achievements: string[];
      liveUrl?: string;
      githubUrl?: string;
    }>
  >(),
  certifications: jsonb("certifications").$type<string[]>(),
  portfolioAnalysis: jsonb("portfolio_analysis").$type<{
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
  }>(),
  preferences: jsonb("preferences").$type<{
    targetRoles: string[];
    locations: string[];
    workMode: string[];
    salaryMin: number;
    salaryCurrency: string;
    experienceLevel: string;
    employmentTypes: string[];
    industries: string[];
    technologies: string[];
  }>(),
  inferredRoles: jsonb("inferred_roles").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Job Sources ──────────────────────────────────────────────────────
export const jobSources = pgTable("job_sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  status: jobSourceStatusEnum("status").default("disconnected").notNull(),
  supportsAutoApply: boolean("supports_auto_apply").default(false).notNull(),
  supportsMessaging: boolean("supports_messaging").default(false).notNull(),
  apiConfig: jsonb("api_config"),
  lastSyncAt: timestamp("last_sync_at"),
  jobCount: integer("job_count").default(0).notNull(),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Jobs ─────────────────────────────────────────────────────────────
export const jobs = pgTable("jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: uuid("source_id").references(() => jobSources.id),
  sourceName: text("source_name").notNull(),
  externalJobId: text("external_job_id"),
  title: text("title").notNull(),
  company: text("company").notNull(),
  companyLogo: text("company_logo"),
  location: text("location"),
  workMode: text("work_mode"),
  salary: text("salary"),
  salaryMin: integer("salary_min"),
  salaryMax: integer("salary_max"),
  salaryCurrency: text("salary_currency"),
  experienceLevel: text("experience_level"),
  employmentType: text("employment_type"),
  description: text("description"),
  responsibilities: jsonb("responsibilities").$type<string[]>(),
  requirements: jsonb("requirements").$type<string[]>(),
  preferredSkills: jsonb("preferred_skills").$type<string[]>(),
  benefits: jsonb("benefits").$type<string[]>(),
  applicationProcess: text("application_process"),
  url: text("url").notNull(),
  companyUrl: text("company_url"),
  applicationUrl: text("application_url"),
  postedAt: timestamp("posted_at"),
  expiresAt: timestamp("expires_at"),
  isVerified: boolean("is_verified").default(false).notNull(),
  safetyScore: integer("safety_score"),
  safetyWarnings: jsonb("safety_warnings").$type<string[]>(),
  isDuplicate: boolean("is_duplicate").default(false).notNull(),
  duplicateOfId: uuid("duplicate_of_id"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Job Scores ───────────────────────────────────────────────────────
export const jobScores = pgTable("job_scores", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .references(() => jobs.id)
    .notNull(),
  candidateId: uuid("candidate_id")
    .references(() => candidateProfiles.id)
    .notNull(),
  fitScore: real("fit_score").notNull(),
  shortlistProbability: real("shortlist_probability").notNull(),
  confidence: text("confidence").notNull(),
  skillsMatch: real("skills_match"),
  experienceMatch: real("experience_match"),
  educationMatch: real("education_match"),
  projectRelevance: real("project_relevance"),
  locationMatch: real("location_match"),
  technologyMatch: real("technology_match"),
  roleMatch: real("role_match"),
  salaryMatch: real("salary_match"),
  strengths: jsonb("strengths").$type<string[]>(),
  missingRequirements: jsonb("missing_requirements").$type<string[]>(),
  explanation: text("explanation"),
  category: text("category"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Applications ─────────────────────────────────────────────────────
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .references(() => candidateProfiles.id)
    .notNull(),
  jobId: uuid("job_id")
    .references(() => jobs.id)
    .notNull(),
  status: applicationStatusEnum("status").default("discovered").notNull(),
  appliedAt: timestamp("applied_at"),
  applicationUrl: text("application_url"),
  confirmationId: text("confirmation_id"),
  resumeVersion: text("resume_version"),
  coverLetter: text("cover_letter"),
  applicationAnswers: jsonb("application_answers").$type<
    Array<{ question: string; answer: string }>
  >(),
  mode: text("mode"),
  failureReason: text("failure_reason"),
  lastUpdatedAt: timestamp("last_updated_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Messages ─────────────────────────────────────────────────────────
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id").references(() => applications.id),
  candidateId: uuid("candidate_id")
    .references(() => candidateProfiles.id)
    .notNull(),
  recipient: text("recipient"),
  recipientName: text("recipient_name"),
  message: text("message").notNull(),
  platform: text("platform"),
  status: text("status").default("draft").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Responses ────────────────────────────────────────────────────────
export const responses = pgTable("responses", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .references(() => applications.id)
    .notNull(),
  type: responseTypeEnum("type").notNull(),
  content: text("content"),
  classification: text("classification"),
  confidence: real("confidence"),
  receivedAt: timestamp("received_at").defaultNow().notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Automation Config ────────────────────────────────────────────────
export const automationConfig = pgTable("automation_config", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .references(() => candidateProfiles.id)
    .notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  mode: automationModeEnum("mode").default("assisted").notNull(),
  scanFrequency: text("scan_frequency").default("30min").notNull(),
  maxApplicationsPerDay: integer("max_applications_per_day")
    .default(10)
    .notNull(),
  maxApplicationsPerHour: integer("max_applications_per_hour")
    .default(3)
    .notNull(),
  minFitScore: integer("min_fit_score").default(85).notNull(),
  minShortlistProbability: integer("min_shortlist_probability")
    .default(70)
    .notNull(),
  autoApplyEnabled: boolean("auto_apply_enabled").default(false).notNull(),
  recruiterOutreachEnabled: boolean("recruiter_outreach_enabled")
    .default(false)
    .notNull(),
  maxRecruiterMessagesPerDay: integer("max_recruiter_messages_per_day")
    .default(10)
    .notNull(),
  requireApproval: text("require_approval").default("always").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Automation Jobs ──────────────────────────────────────────────────
export const automationJobs = pgTable("automation_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  candidateId: uuid("candidate_id")
    .references(() => candidateProfiles.id)
    .notNull(),
  taskType: text("task_type").notNull(),
  status: workerStatusEnum("status").default("idle").notNull(),
  result: jsonb("result"),
  error: text("error"),
  scheduledAt: timestamp("scheduled_at").defaultNow().notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ─── Activity Logs ────────────────────────────────────────────────────
export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id),
  candidateId: uuid("candidate_id").references(() => candidateProfiles.id),
  action: text("action").notNull(),
  details: text("details"),
  platform: text("platform"),
  result: text("result"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// ─── Notifications ────────────────────────────────────────────────────
export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
