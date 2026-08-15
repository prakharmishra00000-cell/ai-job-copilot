/**
 * AI Provider - Google Gemini Integration
 * 
 * Uses Google's Gemini API for all AI features.
 * Free tier available at: https://aistudio.google.com/apikey
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  error?: { message: string };
}

export async function callGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn("No Gemini API key found, using fallback logic");
    return "";
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    const data: GeminiResponse = await response.json();
    
    if (data.error) {
      console.error("Gemini API error:", data.error.message);
      return "";
    }

    return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  } catch (error) {
    console.error("Gemini API call failed:", error);
    return "";
  }
}

export async function analyzeResumeWithAI(resumeText: string): Promise<{
  skills: string[];
  experience: string[];
  education: string[];
  suggestedRoles: string[];
}> {
  const prompt = `Analyze this resume and extract information in JSON format:
${resumeText}

Return ONLY valid JSON with these fields:
{
  "skills": ["skill1", "skill2"],
  "experience": ["job1", "job2"],
  "education": ["degree1"],
  "suggestedRoles": ["role1", "role2"]
}`;

  const result = await callGemini(prompt);
  
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback
  }
  
  return { skills: [], experience: [], education: [], suggestedRoles: [] };
}

export async function generateCoverLetterWithAI(
  candidateName: string,
  jobTitle: string,
  company: string,
  skills: string[],
  jobDescription: string
): Promise<string> {
  const prompt = `Write a professional cover letter for:
- Candidate: ${candidateName}
- Position: ${jobTitle} at ${company}
- Key Skills: ${skills.join(", ")}
- Job Description: ${jobDescription.slice(0, 500)}

Keep it concise (3 paragraphs), professional, and personalized. Do not use generic templates.`;

  const result = await callGemini(prompt);
  return result || `Dear Hiring Team at ${company},

I am writing to express my strong interest in the ${jobTitle} position. With my expertise in ${skills.slice(0, 3).join(", ")}, I believe I would be a valuable addition to your team.

My background aligns well with the requirements of this role, and I am excited about the opportunity to contribute to ${company}'s mission.

Thank you for considering my application.

Best regards,
${candidateName}`;
}

export async function scoreJobMatchWithAI(
  candidateSkills: string[],
  candidateExperience: string,
  jobRequirements: string[],
  jobDescription: string
): Promise<{ score: number; reasoning: string }> {
  const prompt = `Rate the job match (0-100) for:
Candidate Skills: ${candidateSkills.join(", ")}
Candidate Experience: ${candidateExperience}
Job Requirements: ${jobRequirements.join(", ")}
Job Description: ${jobDescription.slice(0, 300)}

Return JSON only: {"score": 85, "reasoning": "explanation"}`;

  const result = await callGemini(prompt);
  
  try {
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback
  }
  
  // Fallback scoring
  const matchedSkills = jobRequirements.filter(req =>
    candidateSkills.some(skill => 
      skill.toLowerCase().includes(req.toLowerCase()) ||
      req.toLowerCase().includes(skill.toLowerCase())
    )
  );
  const score = Math.round((matchedSkills.length / Math.max(jobRequirements.length, 1)) * 100);
  
  return { score: Math.min(score + 30, 95), reasoning: "Based on skill matching" };
}
