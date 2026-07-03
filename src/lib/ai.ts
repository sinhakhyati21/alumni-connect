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