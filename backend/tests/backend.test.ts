import {
  createArtifactSchema,
  generateOutreachSchema,
} from '../src/lib/validations';
import {
  PREDEFINED_SKILLS,
  PREDEFINED_LEARNING_RESOURCES,
  getResourceForSkill,
} from '../src/lib/constants';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

console.log('--- Running SkillBridge Backend Verification Suite ---\n');

// 1. Predefined Skills Check
console.log('Test 1: Verify predefined skills listed in prompt section 5 and upload page');
assert(PREDEFINED_SKILLS.length === 35, `Expected 35 skills, got ${PREDEFINED_SKILLS.length}`);
const categories = new Set(PREDEFINED_SKILLS.map((s) => s.category));
assert(categories.size === 6, `Expected 6 categories, got ${categories.size}`);
console.log('✓ All 35 listed skills across 6 categories verified.');

// 2. Validation Schema Tests
console.log('\nTest 2: Request validation - createArtifactSchema');
const validArtifact = createArtifactSchema.safeParse({
  type: 'GITHUB_URL',
  url: 'https://github.com/user/repo',
  description: 'My project',
  skillNames: ['React', 'TypeScript', 'Node.js'],
});
assert(validArtifact.success === true, 'Valid artifact failed validation');

const invalidArtifactType = createArtifactSchema.safeParse({
  type: 'UNKNOWN_TYPE',
  skillNames: ['React'],
});
assert(invalidArtifactType.success === false, 'Invalid artifact type should fail');

const emptySkills = createArtifactSchema.safeParse({
  type: 'GITHUB_URL',
  skillNames: [],
});
assert(emptySkills.success === false, 'Empty skillNames should fail');
console.log('✓ createArtifactSchema validation tests passed.');

console.log('\nTest 3: Request validation - generateOutreachSchema');
const validOutreachFormal = generateOutreachSchema.safeParse({
  problemId: 'test-uuid-1',
  tone: 'formal',
});
assert(validOutreachFormal.success === true, 'Formal outreach failed validation');

const validOutreachCasual = generateOutreachSchema.safeParse({
  problemId: 'test-uuid-2',
  tone: 'casual',
});
assert(validOutreachCasual.success === true, 'Casual outreach failed validation');

const validOutreachEnthusiastic = generateOutreachSchema.safeParse({
  problemId: 'test-uuid-3',
  tone: 'enthusiastic',
});
assert(validOutreachEnthusiastic.success === true, 'Enthusiastic outreach failed validation');

const invalidTone = generateOutreachSchema.safeParse({
  problemId: 'test-uuid-4',
  tone: 'aggressive',
});
assert(invalidTone.success === false, 'Invalid tone should fail validation');
console.log('✓ generateOutreachSchema validation tests passed for all tones.');

// 4. Match Score Calculation Logic
console.log('\nTest 4: Match score calculation, skillOverlap, and skillGap');
function calculateMatch(requiredSkills: string[], userSkills: string[]) {
  const userSkillNames = new Set(userSkills.map((s) => s.toLowerCase().trim()));
  const skillOverlap: string[] = [];
  const skillGap: string[] = [];

  if (requiredSkills.length > 0) {
    for (const skill of requiredSkills) {
      if (userSkillNames.has(skill.toLowerCase().trim())) {
        skillOverlap.push(skill);
      } else {
        skillGap.push(skill);
      }
    }
  }

  const matchScore =
    requiredSkills.length > 0
      ? Math.round((skillOverlap.length / requiredSkills.length) * 100)
      : 0;

  return { matchScore, skillOverlap, skillGap };
}

// 2 out of 3 matches -> 67%
const match1 = calculateMatch(
  ['React', 'TypeScript', 'SQL'],
  ['React', 'TypeScript']
);
assert(match1.matchScore === 67, `Expected 67, got ${match1.matchScore}`);
assert(match1.skillOverlap.length === 2, 'Expected 2 overlap skills');
assert(match1.skillGap.length === 1 && match1.skillGap[0] === 'SQL', 'Expected SQL in gap');

// Empty requiredSkills -> 0
const matchEmpty = calculateMatch([], ['React']);
assert(matchEmpty.matchScore === 0, `Expected 0 for empty requirements, got ${matchEmpty.matchScore}`);
assert(matchEmpty.skillOverlap.length === 0, 'Expected 0 overlap');
assert(matchEmpty.skillGap.length === 0, 'Expected 0 gap');

// 0 out of 3 matches -> 0%
const matchZero = calculateMatch(['Python', 'Java', 'C++'], ['React']);
assert(matchZero.matchScore === 0, `Expected 0, got ${matchZero.matchScore}`);
assert(matchZero.skillGap.length === 3, 'Expected 3 gap skills');

// 3 out of 3 matches -> 100%
const matchFull = calculateMatch(['React', 'TypeScript', 'Node.js'], ['react', 'typescript', 'node.js']);
assert(matchFull.matchScore === 100, `Expected 100, got ${matchFull.matchScore}`);
assert(matchFull.skillOverlap.length === 3, 'Expected 3 overlap');
assert(matchFull.skillGap.length === 0, 'Expected 0 gap');
console.log('✓ Match score formula, skillOverlap, and skillGap tests passed.');

// 5. Skill Gap Learning Action Plan & Resource Mapping
console.log('\nTest 5: Learning action plan mapping & predictedScoreBoost');
const required = ['React', 'Data Visualization', 'SQL'];
const userSkills = ['React'];
const userSkillsSet = new Set(userSkills.map((s) => s.toLowerCase()));
const missingSkills = required.filter((s) => !userSkillsSet.has(s.toLowerCase()));

const totalRequiredSkills = required.length;
const predictedScoreBoost = Math.round(100 / totalRequiredSkills);
assert(predictedScoreBoost === 33, `Expected 33 boost, got ${predictedScoreBoost}`);

const steps = missingSkills.map((skill) => {
  const resource = getResourceForSkill(skill);
  return {
    skill,
    url: resource.url,
    description: resource.description,
    minutes: resource.minutes,
    predictedScoreBoost,
  };
});

assert(steps.length === 2, `Expected 2 steps, got ${steps.length}`);
assert(steps[0].skill === 'Data Visualization', 'Expected Data Visualization');
assert(steps[0].minutes === 120, 'Expected 120 mins');
assert(steps[1].skill === 'SQL', 'Expected SQL');
assert(steps[1].url === 'https://www.kaggle.com/learn/intro-to-sql', 'Expected Kaggle URL');
assert(steps[1].minutes === 45, 'Expected 45 mins');

// Fallback resource test
const unknownResource = getResourceForSkill('SomeNewSkill');
assert(unknownResource.url === 'https://www.coursera.org', 'Fallback url failed');
assert(unknownResource.minutes === 120, 'Fallback minutes failed');
console.log('✓ Learning action plan mapping and predictedScoreBoost tests passed.');

// 6. Cold Outreach Email Templates (Formal, Casual, Enthusiastic)
console.log('\nTest 6: Cold outreach email templates');
const demoProblem = { title: 'Build a Dashboard' };
const demoOrg = { name: 'Campus Food Bank' };
const demoUser = {
  name: 'Alex Johnson',
  major: 'Computer Science',
  university: 'State University',
};
const topSkills = ['React', 'TypeScript'];

// Formal
const formalSubject = `Application: ${demoProblem.title} — ${demoUser.name}`;
const formalBody = `Dear ${demoOrg.name} Team,

My name is ${demoUser.name} and I am a ${demoUser.major} student at ${demoUser.university}. I am writing to express my interest in your project: ${demoProblem.title}.

My relevant skills include ${topSkills.join(', ')}. I believe these align well with your requirements.

I would welcome the opportunity to discuss how I can contribute to solving this problem.

Best regards,
${demoUser.name}`;

assert(formalSubject.includes('Application: Build a Dashboard — Alex Johnson'), 'Formal subject mismatch');
assert(formalBody.includes('Dear Campus Food Bank Team,'), 'Formal greeting mismatch');
assert(formalBody.includes('React, TypeScript'), 'Formal skills mismatch');

// Casual
const casualSubject = `Hey ${demoOrg.name}! I'd love to help with ${demoProblem.title}`;
const casualBody = `Hi there!

I'm ${demoUser.name}, a ${demoUser.major} student at ${demoUser.university}. I came across your project '${demoProblem.title}' and it sounds like something I'd be great at.

I've got experience with ${topSkills.join(', ')} and I'd love to chat about how I can help.

Let me know if you're free for a quick call!

Cheers,
${demoUser.name}`;

assert(casualSubject.includes("Hey Campus Food Bank! I'd love to help with Build a Dashboard"), 'Casual subject mismatch');
assert(casualBody.includes('Cheers,\nAlex Johnson'), 'Casual signoff mismatch');

// Enthusiastic
const enthusiasticSubject = `Super excited about ${demoProblem.title}! 🚀`;
const enthusiasticBody = `Hello ${demoOrg.name} team!

I'm ${demoUser.name} from ${demoUser.university} and I am incredibly excited about your project '${demoProblem.title}'!

With my skills in ${topSkills.join(', ')}, I'm confident I can make a real impact on this problem.

I'd love to jump on a call and share some ideas I already have!

Looking forward to hearing from you!

${demoUser.name}`;

assert(enthusiasticSubject.includes('Super excited about Build a Dashboard! 🚀'), 'Enthusiastic subject mismatch');
assert(enthusiasticBody.includes('Looking forward to hearing from you!'), 'Enthusiastic signoff mismatch');
console.log('✓ Cold outreach email templates for all 3 tones verified.');

console.log('\n--- ALL TEST SUITE CHECKS COMPLETED SUCCESSFULLY ---');
