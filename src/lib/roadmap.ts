// Static skill -> learning resource mapping. No AI call needed here —
// deliberately rule-based for speed and reliability.
export const skillRoadmap: Record<
  string,
  { resource: string; url: string; certification?: string; projectIdea?: string }
> = {
  "react": {
    resource: "React official docs (react.dev)",
    url: "https://react.dev",
    certification: "Meta Front-End Developer (Coursera)",
    projectIdea: "Build a small dashboard with routing, forms, and API data fetching",
  },
  "node.js": {
    resource: "Node.js official guides",
    url: "https://nodejs.org/en/docs",
    certification: "OpenJS Node.js Application Developer (JSNAD)",
    projectIdea: "Build a REST API with auth, a database, and rate limiting",
  },
  "typescript": {
    resource: "TypeScript Handbook",
    url: "https://www.typescriptlang.org/docs/handbook/intro.html",
    projectIdea: "Migrate a small JS project to strict-mode TypeScript",
  },
  "python": {
    resource: "Python official tutorial",
    url: "https://docs.python.org/3/tutorial/",
    certification: "PCEP – Certified Entry-Level Python Programmer",
    projectIdea: "Build a CLI tool that automates a repetitive task",
  },
  "sql": {
    resource: "SQLBolt interactive lessons",
    url: "https://sqlbolt.com",
    projectIdea: "Design a normalized schema and write queries for a sample dataset",
  },
  "system design": {
    resource: "System Design Primer (GitHub)",
    url: "https://github.com/donnemartin/system-design-primer",
    projectIdea: "Design and diagram a URL shortener or rate limiter at scale",
  },
  "aws": {
    resource: "AWS Skill Builder free courses",
    url: "https://skillbuilder.aws",
    certification: "AWS Certified Cloud Practitioner",
    projectIdea: "Deploy a small app using EC2 + S3 + a managed database",
  },
  "docker": {
    resource: "Docker official get-started guide",
    url: "https://docs.docker.com/get-started/",
    certification: "Docker Certified Associate",
    projectIdea: "Containerize an existing project with a multi-stage Dockerfile",
  },
  "git": {
    resource: "Pro Git book (free)",
    url: "https://git-scm.com/book/en/v2",
    projectIdea: "Practice rebasing, resolving conflicts, and writing clean commit history on a side project",
  },
  "data structures": {
    resource: "NeetCode DSA roadmap",
    url: "https://neetcode.io/roadmap",
    projectIdea: "Implement a small library of core data structures from scratch",
  },
  "machine learning": {
    resource: "Google's Machine Learning Crash Course",
    url: "https://developers.google.com/machine-learning/crash-course",
    certification: "TensorFlow Developer Certificate",
    projectIdea: "Train and evaluate a classifier on a public dataset (e.g. Kaggle)",
  },
  "leadership": {
    resource: "Coursera: Leadership skills courses",
    url: "https://www.coursera.org/courses?query=leadership",
    projectIdea: "Lead a small team project end-to-end and document decisions made",
  },
};

export interface RoadmapEntry {
  skill: string;
  resource: string;
  url: string;
  certification?: string;
  projectIdea?: string;
}

export function getRoadmapFor(skills: string[]): RoadmapEntry[] {
  return skills.reduce<RoadmapEntry[]>((acc, skill) => {
    const key = skill.toLowerCase().trim();
    const match = skillRoadmap[key];
    if (match) {
      acc.push({
        skill,
        resource: match.resource,
        url: match.url,
        certification: match.certification,
        projectIdea: match.projectIdea,
      });
    }
    return acc;
  }, []);
}