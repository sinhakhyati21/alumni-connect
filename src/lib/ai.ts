const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface AlumniCandidate {
  _id: string;
  name: string;
  company?: string;
  jobRole?: string;
  industry?: string;
  skills?: string[];
  contributionPoints: number;
  referralSuccessRate: number;
}

interface StudentProfile {
  department?: string;
  skills?: string[];
}

interface RankedResult {
  id: string;
  score: number;
  reason: string;
}

export async function rankAlumniWithAI(
  student: StudentProfile,
  candidates: AlumniCandidate[]
): Promise<RankedResult[]> {
  if (candidates.length === 0) return [];

  const prompt = `You are ranking alumni profiles for a student searching for career connections.

Student profile:
- Department: ${student.department ?? "unknown"}
- Skills: ${(student.skills ?? []).join(", ") || "none listed"}

Candidate alumni (JSON):
${JSON.stringify(
  candidates.map((c) => ({
    id: c._id,
    name: c.name,
    company: c.company,
    jobRole: c.jobRole,
    industry: c.industry,
    skills: c.skills,
    contributionPoints: c.contributionPoints,
    referralSuccessRate: c.referralSuccessRate,
  })),
  null,
  2
)}

Rank these alumni from most to least relevant for this student, considering skill overlap,
industry/role relevance to the student's likely career path, and how helpful they've been
historically (contributionPoints, referralSuccessRate).

Respond with ONLY a JSON array, no other text, in this exact format:
[{ "id": "...", "score": 0-100, "reason": "one short sentence" }, ...]
Include every candidate id exactly once, ordered best match first.`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "[]";

  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned) as RankedResult[];
}

export async function generateReferralMessage(params: {
  studentName: string;
  studentDepartment?: string;
  studentSkills?: string[];
  resumeText?: string;
  alumniName: string;
  company: string;
  role: string;
}): Promise<string> {
  const prompt = `Write a short, professional referral request message from a student to a college alumnus.

Student: ${params.studentName}${params.studentDepartment ? `, ${params.studentDepartment}` : ""}
Student skills: ${(params.studentSkills ?? []).join(", ") || "not specified"}
${params.resumeText ? `Resume summary context: ${params.resumeText.slice(0, 1500)}` : ""}

Alumni: ${params.alumniName}
Company: ${params.company}
Role being requested: ${params.role}

Write a concise (under 120 words), polite, specific message the student can send to request a referral. Mention 1-2 relevant skills or experiences naturally. Don't use generic filler like "I hope this finds you well." End with a clear, low-pressure ask. Return ONLY the message text, no preamble, no quotation marks around it.`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}

export async function generateFollowUpMessage(params: {
  studentName: string;
  alumniName: string;
  company: string;
  role: string;
  daysSinceRequest: number;
}): Promise<string> {
  const prompt = `Write a short, polite follow-up message from a student to an alumnus who hasn't responded to a referral request yet.

Student: ${params.studentName}
Alumni: ${params.alumniName}
Company: ${params.company}
Role: ${params.role}
Days since the original request: ${params.daysSinceRequest}

Write a brief (under 80 words), low-pressure follow-up. Acknowledge they're likely busy, gently re-state the ask, and make it easy to say no or redirect. Don't be pushy or guilt-trippy. Return ONLY the message text, no preamble, no quotation marks.`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content ?? "").trim();
}


const GEMINI_MODEL = "gemini-3.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

interface ResumeAnalysis {
  atsScore: number;
  missingKeywords: string[];
  improvementSuggestions: string[];
}

export async function analyzeResumeWithAI(resumeText: string): Promise<ResumeAnalysis> {
  const prompt = `You are an ATS (Applicant Tracking System) resume analyzer for students applying to tech/general industry roles.

Resume text:
${resumeText.slice(0, 6000)}

Analyze this resume and return:
1. An ATS compatibility score from 0-100 (based on formatting clarity, use of standard section headers, quantified achievements, and keyword density)
2. A list of important keywords/skills that seem to be missing given the resume's apparent target field (max 8)
3. A list of specific, actionable improvement suggestions (max 5)`;

  const res = await fetch(`${GEMINI_API_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            atsScore: { type: "integer" },
            missingKeywords: { type: "array", items: { type: "string" } },
            improvementSuggestions: { type: "array", items: { type: "string" } },
          },
          required: ["atsScore", "missingKeywords", "improvementSuggestions"],
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
  return JSON.parse(text) as ResumeAnalysis;
}
export async function generateInterviewQuestions(params: {
  resumeText?: string;
  company: string;
  role: string;
  requiredSkills: string[];
}): Promise<
  { question: string; options: string[]; correctIndex: number; topic: string }[]
> {
  const prompt = `You are creating a technical knowledge quiz to help a student prepare for a job interview.

Target company: ${params.company}
Target role: ${params.role}
Required skills for the role: ${params.requiredSkills.join(", ")}

Generate 5 multiple-choice questions testing practical knowledge of these skills, at a level appropriate for this role. Each question should have exactly 4 options, only one correct.

Respond with ONLY a JSON array in this exact format, no other text:
[{ "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "topic": "the specific skill/topic this question tests" }, ...]`;

  const res = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    throw new Error(`Groq API error: ${res.status}`);
  }

  const data = await res.json();
  const raw = data.choices?.[0]?.message?.content ?? "[]";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}