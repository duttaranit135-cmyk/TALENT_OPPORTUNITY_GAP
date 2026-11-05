import { NextRequest } from 'next/server';
import { POST as createArtifact } from '../src/app/api/artifacts/route';
import { GET as listProblems } from '../src/app/api/problems/route';
import { GET as getProblem } from '../src/app/api/problems/[id]/route';
import { GET as getActionPlan } from '../src/app/api/matches/[problemId]/action-plan/route';
import { POST as generateOutreach } from '../src/app/api/outreach/generate/route';
import { setMockUserForTesting } from '../src/lib/auth';
import prisma from '../src/lib/prisma';

const db = prisma as any;
(process.env as any).NODE_ENV = 'test';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runLogicTests() {
  console.log('--- Testing API Endpoint Logic with Mocked Auth & DB Operations ---\n');

  const mockUser = {
    id: 'student-uuid-123',
    email: 'student@example.com',
    name: 'Jane Doe',
    role: 'STUDENT' as const,
    university: 'MIT',
    major: 'Computer Science',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Mock getAuthenticatedUser to return mockUser
  setMockUserForTesting({
    user: mockUser,
    supabaseUserId: mockUser.id,
  });

  // Test 1: Invalid request body for POST /api/artifacts
  console.log('Test 1: POST /api/artifacts with invalid body');
  const badReq = new NextRequest('http://localhost:3000/api/artifacts', {
    method: 'POST',
    body: JSON.stringify({ type: 'INVALID_TYPE', skillNames: [] }),
  });
  const badRes = await createArtifact(badReq);
  const badData = await badRes.json();
  console.log(`Bad artifact request status: ${badRes.status}`, badData);
  assert(badRes.status === 400, 'Expected 400 for invalid body');

  // Test 2: Invalid tone for POST /api/outreach/generate
  console.log('\nTest 2: POST /api/outreach/generate with invalid tone');
  const badToneReq = new NextRequest('http://localhost:3000/api/outreach/generate', {
    method: 'POST',
    body: JSON.stringify({ problemId: 'some-id', tone: 'invalid-tone' }),
  });
  const badToneRes = await generateOutreach(badToneReq);
  const badToneData = await badToneRes.json();
  console.log(`Bad tone request status: ${badToneRes.status}`, badToneData);
  assert(badToneRes.status === 400, 'Expected 400 for invalid tone');

  // Test 3: Missing record for GET /api/problems/[id]
  console.log('\nTest 3: GET /api/problems/[id] for missing problem');
  db.problem.findUnique = async () => null as any;
  const notFoundReq = new NextRequest('http://localhost:3000/api/problems/missing-id', {
    method: 'GET',
  });
  const notFoundRes = await getProblem(notFoundReq, { params: { id: 'missing-id' } });
  const notFoundData = await notFoundRes.json();
  console.log(`Missing problem status: ${notFoundRes.status}`, notFoundData);
  assert(notFoundRes.status === 404, 'Expected 404 for missing problem');

  // Test 4: Missing record for GET /api/matches/[problemId]/action-plan
  console.log('\nTest 4: GET /api/matches/[problemId]/action-plan for missing problem');
  const notFoundPlanReq = new NextRequest('http://localhost:3000/api/matches/missing-id/action-plan', {
    method: 'GET',
  });
  const notFoundPlanRes = await getActionPlan(notFoundPlanReq, { params: { problemId: 'missing-id' } });
  const notFoundPlanData = await notFoundPlanRes.json();
  console.log(`Missing plan status: ${notFoundPlanRes.status}`, notFoundPlanData);
  assert(notFoundPlanRes.status === 404, 'Expected 404 for missing plan');

  // Test 5: Successful GET /api/problems/[id] with calculations
  console.log('\nTest 5: GET /api/problems/[id] with calculations');
  const mockProblem = {
    id: 'prob-1',
    title: 'Build a Dashboard',
    description: 'Dashboard for food bank',
    organizationId: 'org-1',
    organization: {
      id: 'org-1',
      name: 'Campus Food Bank',
      type: 'NGO' as const,
      description: 'NGO description',
      website: 'https://example.org',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    requiredSkills: ['React', 'Data Visualization', 'SQL'],
    domainTags: ['social-impact'],
    deadline: new Date('2025-08-01T00:00:00Z'),
    commitmentType: 'PART_TIME' as const,
    status: 'OPEN' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  db.problem.findUnique = async () => mockProblem as any;
  db.skillProof.findMany = async () => [
    {
      id: 'proof-1',
      userId: mockUser.id,
      skillId: 's-1',
      skill: { id: 's-1', name: 'React', category: 'PROGRAMMING' },
      confidenceScore: 80,
      source: 'SELF_REPORTED',
    },
    {
      id: 'proof-2',
      userId: mockUser.id,
      skillId: 's-2',
      skill: { id: 's-2', name: 'SQL', category: 'PROGRAMMING' },
      confidenceScore: 80,
      source: 'SELF_REPORTED',
    },
  ] as any;
  db.match.upsert = async () => ({} as any);

  const getProbReq = new NextRequest('http://localhost:3000/api/problems/prob-1', {
    method: 'GET',
  });
  const getProbRes = await getProblem(getProbReq, { params: { id: 'prob-1' } });
  const getProbData = await getProbRes.json();
  console.log('Single problem response:', getProbData);
  assert(getProbRes.status === 200, 'Expected 200 for single problem');
  assert(getProbData.match.matchScore === 67, `Expected 67% match, got ${getProbData.match.matchScore}`);
  assert(getProbData.match.skillOverlap.length === 2, 'Expected 2 skill overlap');
  assert(getProbData.match.skillGap[0] === 'Data Visualization', 'Expected Data Visualization in gap');

  // Test 6: Successful Action Plan GET /api/matches/[problemId]/action-plan
  console.log('\nTest 6: GET /api/matches/[problemId]/action-plan calculation');
  const planReq = new NextRequest('http://localhost:3000/api/matches/prob-1/action-plan', {
    method: 'GET',
  });
  const planRes = await getActionPlan(planReq, { params: { problemId: 'prob-1' } });
  const planData = await planRes.json();
  console.log('Action plan response:', planData);
  assert(planRes.status === 200, 'Expected 200 for action plan');
  assert(planData.steps.length === 1, 'Expected 1 missing skill step');
  assert(planData.steps[0].skill === 'Data Visualization', 'Expected Data Visualization step');
  assert(planData.steps[0].predictedScoreBoost === 33, `Expected 33 boost, got ${planData.steps[0].predictedScoreBoost}`);

  // Test 7: Successful Outreach Generation POST /api/outreach/generate
  console.log('\nTest 7: POST /api/outreach/generate');
  db.outreachDraft.create = async ({ data }: any) => ({
    id: 'draft-1',
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  for (const tone of ['formal', 'casual', 'enthusiastic'] as const) {
    const outreachReq = new NextRequest('http://localhost:3000/api/outreach/generate', {
      method: 'POST',
      body: JSON.stringify({ problemId: 'prob-1', tone }),
    });
    const outreachRes = await generateOutreach(outreachReq);
    const outreachData = await outreachRes.json();
    console.log(`Generated outreach draft (${tone}):`, {
      subjectLine: outreachData.subjectLine,
      previewBody: outreachData.body.substring(0, 50) + '...',
    });
    assert(outreachRes.status === 201, 'Expected 201 for draft creation');
    assert(outreachData.subjectLine.length > 0, 'Expected subject line');
    assert(outreachData.body.length > 0, 'Expected body');
  }

  // Test 8: List Problems GET /api/problems
  console.log('\nTest 8: GET /api/problems sorting and match scores');
  const mockProblem2 = {
    ...mockProblem,
    id: 'prob-2',
    title: 'Mobile App',
    requiredSkills: ['UI Design', 'Figma'], // 0 matches for our user (user has React, SQL)
  };
  db.problem.findMany = async () => [mockProblem2, mockProblem] as any;
  const listReq = new NextRequest('http://localhost:3000/api/problems', {
    method: 'GET',
  });
  const listRes = await listProblems(listReq);
  const listData = await listRes.json();
  console.log(`Problems listed: ${listData.length}`);
  assert(listRes.status === 200, 'Expected 200 for list problems');
  assert(listData[0].id === 'prob-1', 'Expected prob-1 (67% match) first due to descending sorting');
  assert(listData[0].matchScore === 67, 'Expected 67% match for prob-1');
  assert(listData[1].id === 'prob-2', 'Expected prob-2 (0% match) second');
  assert(listData[1].matchScore === 0, 'Expected 0% match for prob-2');

  // Test 9: Create artifact with transaction & skill proofs
  console.log('\nTest 9: POST /api/artifacts with valid skills & transaction');
  db.skill.findMany = async () => [
    { id: 's-1', name: 'React', category: 'PROGRAMMING' },
    { id: 's-2', name: 'TypeScript', category: 'PROGRAMMING' },
  ] as any;

  let createdArtifact: any = null;
  let createdProofs: any[] = [];
  db.$transaction = async (cb: any) => {
    return cb({
      artifact: {
        create: async ({ data }: any) => {
          createdArtifact = { id: 'art-1', ...data };
          return createdArtifact;
        },
      },
      skillProof: {
        upsert: async ({ create }: any) => {
          createdProofs.push(create);
          return create;
        },
      },
    });
  };

  const createReq = new NextRequest('http://localhost:3000/api/artifacts', {
    method: 'POST',
    body: JSON.stringify({
      type: 'GITHUB_URL',
      url: 'https://github.com/janedoe/my-repo',
      description: 'My portfolio project',
      skillNames: ['React', 'TypeScript'],
    }),
  });
  const createRes = await createArtifact(createReq);
  const createData = await createRes.json();
  console.log('Created artifact response:', createData);
  assert(createRes.status === 201, 'Expected 201 for artifact creation');
  assert(createData.artifact.id === 'art-1', 'Expected artifact id art-1');
  assert(createData.skills.length === 2, 'Expected 2 skills returned');
  assert(createdProofs.length === 2, 'Expected 2 skill proofs created in transaction');
  assert(createdProofs[0].confidenceScore === 80, 'Expected confidenceScore 80');
  assert(createdProofs[0].source === 'SELF_REPORTED', 'Expected source SELF_REPORTED');
  assert(createdProofs[0].userId === mockUser.id, 'Expected user id to match authenticated user');

  console.log('\n✓ All API logic and edge cases successfully verified!');
}

runLogicTests().catch((e) => {
  console.error('Logic test failed:', e);
  process.exit(1);
});
