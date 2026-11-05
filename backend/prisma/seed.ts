import { PrismaClient, SkillCategory, OrgType, CommitmentType, ProblemStatus } from '@prisma/client';

const prisma = new PrismaClient();

const PREDEFINED_SKILLS = [
  // PROGRAMMING (10)
  { name: 'Python', category: SkillCategory.PROGRAMMING },
  { name: 'JavaScript', category: SkillCategory.PROGRAMMING },
  { name: 'TypeScript', category: SkillCategory.PROGRAMMING },
  { name: 'Java', category: SkillCategory.PROGRAMMING },
  { name: 'C++', category: SkillCategory.PROGRAMMING },
  { name: 'React', category: SkillCategory.PROGRAMMING },
  { name: 'Node.js', category: SkillCategory.PROGRAMMING },
  { name: 'SQL', category: SkillCategory.PROGRAMMING },
  { name: 'HTML/CSS', category: SkillCategory.PROGRAMMING },
  { name: 'Git', category: SkillCategory.PROGRAMMING },

  // DESIGN (5)
  { name: 'UI Design', category: SkillCategory.DESIGN },
  { name: 'UX Research', category: SkillCategory.DESIGN },
  { name: 'Figma', category: SkillCategory.DESIGN },
  { name: 'Graphic Design', category: SkillCategory.DESIGN },
  { name: 'Prototyping', category: SkillCategory.DESIGN },

  // RESEARCH (5)
  { name: 'Data Analysis', category: SkillCategory.RESEARCH },
  { name: 'Literature Review', category: SkillCategory.RESEARCH },
  { name: 'Survey Design', category: SkillCategory.RESEARCH },
  { name: 'Statistical Modeling', category: SkillCategory.RESEARCH },
  { name: 'Academic Writing', category: SkillCategory.RESEARCH },

  // COMMUNICATION (5)
  { name: 'Public Speaking', category: SkillCategory.COMMUNICATION },
  { name: 'Technical Writing', category: SkillCategory.COMMUNICATION },
  { name: 'Project Management', category: SkillCategory.COMMUNICATION },
  { name: 'Team Leadership', category: SkillCategory.COMMUNICATION },
  { name: 'Presentation', category: SkillCategory.COMMUNICATION },

  // DATA (5)
  { name: 'Machine Learning', category: SkillCategory.DATA },
  { name: 'Data Visualization', category: SkillCategory.DATA },
  { name: 'Excel', category: SkillCategory.DATA },
  { name: 'Pandas', category: SkillCategory.DATA },
  { name: 'Tableau', category: SkillCategory.DATA },

  // OTHER (5)
  { name: 'Event Planning', category: SkillCategory.OTHER },
  { name: 'Social Media', category: SkillCategory.OTHER },
  { name: 'Video Editing', category: SkillCategory.OTHER },
  { name: 'Photography', category: SkillCategory.OTHER },
  { name: 'Fundraising', category: SkillCategory.OTHER },
];

const DEMO_ORGS = [
  {
    id: 'demo-org-1',
    name: 'Campus Food Bank',
    type: OrgType.NGO,
    description: 'Student-led community food pantry reducing campus hunger.',
  },
  {
    id: 'demo-org-2',
    name: 'MindWell Health',
    type: OrgType.STARTUP,
    description: 'Mental health tech startup focused on collegiate wellness.',
  },
  {
    id: 'demo-org-3',
    name: 'GreenEarth Action',
    type: OrgType.NGO,
    description: 'Grassroots environmental and social impact nonprofit.',
  },
];

const DEMO_PROBLEMS = [
  {
    id: 'demo-prob-1',
    organizationId: 'demo-org-1',
    title: 'Build a Dashboard for Campus Food Bank',
    description:
      'Our campus food bank needs a real-time dashboard to track inventory, predict demand, and reduce food waste by 20%. We have the data but no one to visualize it.',
    requiredSkills: ['React', 'Data Visualization', 'SQL'],
    deadline: new Date('2025-08-01T00:00:00Z'),
    commitmentType: CommitmentType.PART_TIME,
    domainTags: ['social-impact', 'data'],
    status: ProblemStatus.OPEN,
  },
  {
    id: 'demo-prob-2',
    organizationId: 'demo-org-2',
    title: 'Design a Mobile App for Student Mental Health',
    description:
      'We need a UX researcher and UI designer to create a mobile app that helps college students track their mental health and connect with campus counselors.',
    requiredSkills: ['UI Design', 'UX Research', 'Figma', 'Prototyping'],
    deadline: new Date('2025-09-15T00:00:00Z'),
    commitmentType: CommitmentType.INTERNSHIP,
    domainTags: ['health', 'design'],
    status: ProblemStatus.OPEN,
  },
  {
    id: 'demo-prob-3',
    organizationId: 'demo-org-3',
    title: 'Automate Grant Reporting for Local NGO',
    description:
      'Our NGO spends 15 hours per week manually compiling grant reports. We need a Python script that pulls data from our database and generates formatted PDF reports automatically.',
    requiredSkills: ['Python', 'SQL', 'Technical Writing'],
    deadline: new Date('2025-07-20T00:00:00Z'),
    commitmentType: CommitmentType.ONE_TIME,
    domainTags: ['automation', 'nonprofit'],
    status: ProblemStatus.OPEN,
  },
];

async function main() {
  console.log(`Seeding ${PREDEFINED_SKILLS.length} predefined skills...`);

  for (const skill of PREDEFINED_SKILLS) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: { category: skill.category },
      create: {
        name: skill.name,
        category: skill.category,
      },
    });
  }
  console.log(`Successfully seeded ${PREDEFINED_SKILLS.length} skills.`);

  console.log('Seeding demo organizations...');
  for (const org of DEMO_ORGS) {
    await prisma.organization.upsert({
      where: { id: org.id },
      update: { name: org.name, type: org.type, description: org.description },
      create: org,
    });
  }

  console.log('Seeding demo problems...');
  for (const prob of DEMO_PROBLEMS) {
    await prisma.problem.upsert({
      where: { id: prob.id },
      update: {
        title: prob.title,
        description: prob.description,
        requiredSkills: prob.requiredSkills,
        deadline: prob.deadline,
        commitmentType: prob.commitmentType,
        domainTags: prob.domainTags,
        status: prob.status,
      },
      create: prob,
    });
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

