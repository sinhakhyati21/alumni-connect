// Static skill -> learning resource mapping. No AI call needed here —
// deliberately rule-based for speed and reliability.
export const skillRoadmap: Record<string, { resource: string; url: string }> = {
  "react": { resource: "React official docs (react.dev)", url: "https://react.dev" },
  "node.js": { resource: "Node.js official guides", url: "https://nodejs.org/en/docs" },
  "typescript": { resource: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html" },
  "python": { resource: "Python official tutorial", url: "https://docs.python.org/3/tutorial/" },
  "sql": { resource: "SQLBolt interactive lessons", url: "https://sqlbolt.com" },
  "system design": { resource: "System Design Primer (GitHub)", url: "https://github.com/donnemartin/system-design-primer" },
  "aws": { resource: "AWS Skill Builder free courses", url: "https://skillbuilder.aws" },
  "docker": { resource: "Docker official get-started guide", url: "https://docs.docker.com/get-started/" },
  "git": { resource: "Pro Git book (free)", url: "https://git-scm.com/book/en/v2" },
  "data structures": { resource: "NeetCode DSA roadmap", url: "https://neetcode.io/roadmap" },
  "machine learning": { resource: "Google's Machine Learning Crash Course", url: "https://developers.google.com/machine-learning/crash-course" },
  "leadership": { resource: "Coursera: Leadership skills courses", url: "https://www.coursera.org/courses?query=leadership" },
};

export function getRoadmapFor(skills: string[]): { skill: string; resource: string; url: string }[] {
  return skills
    .map((skill) => {
      const key = skill.toLowerCase().trim();
      const match = skillRoadmap[key];
      return match ? { skill, resource: match.resource, url: match.url } : null;
    })
    .filter((x): x is { skill: string; resource: string; url: string } => x !== null);
}