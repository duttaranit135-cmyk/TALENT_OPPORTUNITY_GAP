import { NextRequest } from 'next/server';
import { POST as createArtifact } from '../src/app/api/artifacts/route';
import { GET as listProblems } from '../src/app/api/problems/route';
import { GET as getProblem } from '../src/app/api/problems/[id]/route';
import { GET as getActionPlan } from '../src/app/api/matches/[problemId]/action-plan/route';
import { POST as generateOutreach } from '../src/app/api/outreach/generate/route';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runRouteTests() {
  console.log('--- Testing API Route Authorization & Guardrails ---\n');

  // Test 1: POST /api/artifacts without auth
  const req1 = new NextRequest('http://localhost:3000/api/artifacts', {
    method: 'POST',
    body: JSON.stringify({
      type: 'GITHUB_URL',
      url: 'https://github.com/test/repo',
      skillNames: ['React'],
    }),
  });
  const res1 = await createArtifact(req1);
  const data1 = await res1.json();
  console.log(`POST /api/artifacts status: ${res1.status}, body:`, data1);
  assert(res1.status === 401, `Expected 401, got ${res1.status}`);

  // Test 2: GET /api/problems without auth
  const req2 = new NextRequest('http://localhost:3000/api/problems', {
    method: 'GET',
  });
  const res2 = await listProblems(req2);
  const data2 = await res2.json();
  console.log(`GET /api/problems status: ${res2.status}, body:`, data2);
  assert(res2.status === 401, `Expected 401, got ${res2.status}`);

  // Test 3: GET /api/problems/[id] without auth
  const req3 = new NextRequest('http://localhost:3000/api/problems/some-id', {
    method: 'GET',
  });
  const res3 = await getProblem(req3, { params: { id: 'some-id' } });
  const data3 = await res3.json();
  console.log(`GET /api/problems/[id] status: ${res3.status}, body:`, data3);
  assert(res3.status === 401, `Expected 401, got ${res3.status}`);

  // Test 4: GET /api/matches/[problemId]/action-plan without auth
  const req4 = new NextRequest('http://localhost:3000/api/matches/some-id/action-plan', {
    method: 'GET',
  });
  const res4 = await getActionPlan(req4, { params: { problemId: 'some-id' } });
  const data4 = await res4.json();
  console.log(`GET /api/matches/[problemId]/action-plan status: ${res4.status}, body:`, data4);
  assert(res4.status === 401, `Expected 401, got ${res4.status}`);

  // Test 5: POST /api/outreach/generate without auth
  const req5 = new NextRequest('http://localhost:3000/api/outreach/generate', {
    method: 'POST',
    body: JSON.stringify({
      problemId: 'some-id',
      tone: 'formal',
    }),
  });
  const res5 = await generateOutreach(req5);
  const data5 = await res5.json();
  console.log(`POST /api/outreach/generate status: ${res5.status}, body:`, data5);
  assert(res5.status === 401, `Expected 401, got ${res5.status}`);

  console.log('\n✓ All 5 API endpoints correctly reject unauthenticated requests with HTTP 401.');
}

runRouteTests().catch((e) => {
  console.error('Route test failed:', e);
  process.exit(1);
});

