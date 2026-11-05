export interface ProblemItem {
  id: string;
  title: string;
  description: string;
  organizationName: string;
  organizationType: string;
  matchScore: number;
  skillOverlap: string[];
  skillGap: string[];
  deadline: string | null;
  commitmentType: string;
  domainTags: string[];
  requiredSkills: string[];
}

export const INITIAL_PROBLEMS: ProblemItem[] = [
  {
    id: "demo-org-1",
    title: "Build a Dashboard for Campus Food Bank",
    description: "Our campus food bank needs a real-time dashboard to track inventory, predict demand, and reduce food waste by 20%. We have the data but no one to visualize it.",
    organizationName: "Campus Food Bank",
    organizationType: "NON_PROFIT",
    matchScore: 78,
    skillOverlap: ["React", "SQL"],
    skillGap: ["Data Visualization"],
    requiredSkills: ["React", "Data Visualization", "SQL"],
    deadline: "2025-08-01T00:00:00Z",
    commitmentType: "PART_TIME",
    domainTags: ["social-impact", "data", "community"],
  },
  {
    id: "demo-org-2",
    title: "Design a Mobile App for Student Mental Health",
    description: "We need a UX researcher and UI designer to create a mobile app that helps college students track their mental health and connect with campus counselors.",
    organizationName: "MindfulCampus Coalition",
    organizationType: "COMMUNITY_GROUP",
    matchScore: 65,
    skillOverlap: ["UI Design", "Figma"],
    skillGap: ["UX Research", "Prototyping"],
    requiredSkills: ["UI Design", "UX Research", "Figma", "Prototyping"],
    deadline: "2025-09-15T00:00:00Z",
    commitmentType: "INTERNSHIP",
    domainTags: ["health", "design", "mobile"],
  },
  {
    id: "demo-org-3",
    title: "Automate Grant Reporting for Local NGO",
    description: "Our NGO spends 15 hours per week manually compiling grant reports. We need a Python script that pulls data from our database and generates formatted PDF reports automatically.",
    organizationName: "Green Earth Trust",
    organizationType: "NGO",
    matchScore: 85,
    skillOverlap: ["Python", "SQL"],
    skillGap: ["Technical Writing"],
    requiredSkills: ["Python", "SQL", "Technical Writing"],
    deadline: "2025-07-20T00:00:00Z",
    commitmentType: "ONE_TIME",
    domainTags: ["automation", "nonprofit", "data"],
  },
];

// Global in-memory list for development server runtime
declare global {
  var __GLOBAL_PROBLEMS__: ProblemItem[] | undefined;
}

if (!global.__GLOBAL_PROBLEMS__) {
  global.__GLOBAL_PROBLEMS__ = [...INITIAL_PROBLEMS];
}

export function getProblems(): ProblemItem[] {
  return global.__GLOBAL_PROBLEMS__ || INITIAL_PROBLEMS;
}

export function addProblem(problem: Partial<ProblemItem>): ProblemItem {
  const list = getProblems();
  const id = problem.id || `problem-${Date.now()}`;
  const newItem: ProblemItem = {
    id,
    title: problem.title || "Untitled Problem",
    description: problem.description || "",
    organizationName: problem.organizationName || "Community Partner",
    organizationType: problem.organizationType || "NON_PROFIT",
    matchScore: problem.matchScore ?? 75,
    skillOverlap: problem.skillOverlap || (problem.requiredSkills ? [problem.requiredSkills[0]] : ["React"]),
    skillGap: problem.skillGap || (problem.requiredSkills && problem.requiredSkills.length > 1 ? problem.requiredSkills.slice(1) : []),
    deadline: problem.deadline || null,
    commitmentType: problem.commitmentType || "PART_TIME",
    domainTags: problem.domainTags || ["general"],
    requiredSkills: problem.requiredSkills || ["React"],
  };
  list.unshift(newItem);
  return newItem;
}
