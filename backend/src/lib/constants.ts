export type SkillCategoryType =
  | 'PROGRAMMING'
  | 'DESIGN'
  | 'RESEARCH'
  | 'COMMUNICATION'
  | 'DATA'
  | 'OTHER';

export interface PredefinedSkill {
  name: string;
  category: SkillCategoryType;
}

export const PREDEFINED_SKILLS: PredefinedSkill[] = [
  // PROGRAMMING (10)
  { name: 'Python', category: 'PROGRAMMING' },
  { name: 'JavaScript', category: 'PROGRAMMING' },
  { name: 'TypeScript', category: 'PROGRAMMING' },
  { name: 'Java', category: 'PROGRAMMING' },
  { name: 'C++', category: 'PROGRAMMING' },
  { name: 'React', category: 'PROGRAMMING' },
  { name: 'Node.js', category: 'PROGRAMMING' },
  { name: 'SQL', category: 'PROGRAMMING' },
  { name: 'HTML/CSS', category: 'PROGRAMMING' },
  { name: 'Git', category: 'PROGRAMMING' },

  // DESIGN (5)
  { name: 'UI Design', category: 'DESIGN' },
  { name: 'UX Research', category: 'DESIGN' },
  { name: 'Figma', category: 'DESIGN' },
  { name: 'Graphic Design', category: 'DESIGN' },
  { name: 'Prototyping', category: 'DESIGN' },

  // RESEARCH (5)
  { name: 'Data Analysis', category: 'RESEARCH' },
  { name: 'Literature Review', category: 'RESEARCH' },
  { name: 'Survey Design', category: 'RESEARCH' },
  { name: 'Statistical Modeling', category: 'RESEARCH' },
  { name: 'Academic Writing', category: 'RESEARCH' },

  // COMMUNICATION (5)
  { name: 'Public Speaking', category: 'COMMUNICATION' },
  { name: 'Technical Writing', category: 'COMMUNICATION' },
  { name: 'Project Management', category: 'COMMUNICATION' },
  { name: 'Team Leadership', category: 'COMMUNICATION' },
  { name: 'Presentation', category: 'COMMUNICATION' },

  // DATA (5)
  { name: 'Machine Learning', category: 'DATA' },
  { name: 'Data Visualization', category: 'DATA' },
  { name: 'Excel', category: 'DATA' },
  { name: 'Pandas', category: 'DATA' },
  { name: 'Tableau', category: 'DATA' },

  // OTHER (5)
  { name: 'Event Planning', category: 'OTHER' },
  { name: 'Social Media', category: 'OTHER' },
  { name: 'Video Editing', category: 'OTHER' },
  { name: 'Photography', category: 'OTHER' },
  { name: 'Fundraising', category: 'OTHER' },
];

export interface LearningResource {
  url: string;
  description: string;
  minutes: number;
}

export const PREDEFINED_LEARNING_RESOURCES: Record<string, LearningResource> = {
  Python: {
    url: 'https://www.kaggle.com/learn/python',
    description: 'Kaggle Python micro-course',
    minutes: 300,
  },
  JavaScript: {
    url: 'https://javascript.info',
    description: 'The Modern JavaScript Tutorial',
    minutes: 600,
  },
  TypeScript: {
    url: 'https://www.typescriptlang.org/docs/handbook',
    description: 'Official TypeScript Handbook',
    minutes: 240,
  },
  React: {
    url: 'https://react.dev/learn',
    description: 'Official React tutorial',
    minutes: 300,
  },
  'Node.js': {
    url: 'https://nodejs.org/en/learn',
    description: 'Node.js official guides',
    minutes: 240,
  },
  SQL: {
    url: 'https://www.kaggle.com/learn/intro-to-sql',
    description: 'Kaggle Intro to SQL',
    minutes: 45,
  },
  'Data Visualization': {
    url: 'https://observablehq.com/tutorials',
    description: 'Observable tutorials',
    minutes: 120,
  },
  Figma: {
    url: 'https://www.figma.com/resources/learn-design',
    description: 'Figma Learn Design',
    minutes: 90,
  },
  'Machine Learning': {
    url: 'https://www.kaggle.com/learn/intro-to-machine-learning',
    description: 'Kaggle Intro to ML',
    minutes: 180,
  },
  'Data Analysis': {
    url: 'https://www.kaggle.com/learn/pandas',
    description: 'Kaggle Pandas course',
    minutes: 240,
  },
  Git: {
    url: 'https://learngitbranching.js.org',
    description: 'Learn Git Branching interactive',
    minutes: 60,
  },
  Pandas: {
    url: 'https://www.kaggle.com/learn/pandas',
    description: 'Kaggle Pandas course',
    minutes: 240,
  },
  Tableau: {
    url: 'https://www.tableau.com/learn/training',
    description: 'Tableau free training',
    minutes: 180,
  },
  'UI Design': {
    url: 'https://www.figma.com/resources/learn-design',
    description: 'Figma design basics',
    minutes: 120,
  },
  'UX Research': {
    url: 'https://www.nngroup.com/articles/ux-research',
    description: 'NN/g UX Research guide',
    minutes: 90,
  },
  'Project Management': {
    url: 'https://www.coursera.org/learn/project-management',
    description: 'Coursera PM fundamentals',
    minutes: 300,
  },
  'Technical Writing': {
    url: 'https://developers.google.com/tech-writing',
    description: 'Google Tech Writing course',
    minutes: 120,
  },
  'Public Speaking': {
    url: 'https://www.toastmasters.org',
    description: 'Toastmasters resources',
    minutes: 60,
  },
  Excel: {
    url: 'https://exceljet.net/lessons',
    description: 'ExcelJet free lessons',
    minutes: 120,
  },
  'HTML/CSS': {
    url: 'https://www.freecodecamp.org/learn/responsive-web-design',
    description: 'freeCodeCamp HTML/CSS',
    minutes: 300,
  },
};

export function getResourceForSkill(skillName: string): LearningResource {
  const resource = PREDEFINED_LEARNING_RESOURCES[skillName];
  if (resource) {
    return resource;
  }
  return {
    url: 'https://www.coursera.org',
    description: `Search for ${skillName} on Coursera`,
    minutes: 120,
  };
}

