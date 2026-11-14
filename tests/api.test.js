process.env.NODE_ENV = 'test';

import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';

let app;
let server;
const PORT = 5055;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

before(async () => {
  const mod = await import('../dist/server/index.js');
  app = mod.default;
  await new Promise((resolve) => {
    server = app.listen(PORT, '127.0.0.1', () => {
      resolve();
    });
  });
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    const res = await fetch(url, {
      ...options,
      headers
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.log(`[API Error ${res.status}] ${endpoint}:`, JSON.stringify(data));
    }
    return { status: res.status, ok: res.ok, data };
  } catch (err) {
    console.log(`[Network Error] ${endpoint}:`, err.message);
    throw err;
  }
}

describe('SkillPath AI Comprehensive Workflow Tests', () => {
  let authToken = '';
  let testUserId = '';

  // 1. Health Check
  test('GET /api/health should return ok status', async () => {
    const res = await apiRequest('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  // 2. Demo User Login
  test('POST /api/auth/login with valid demo account should return JWT and profile', async () => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'demo@skillpath.ai',
        password: 'Password123!'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.token, 'Should return a valid JWT token');
    assert.strictEqual(res.data.user.email, 'demo@skillpath.ai');
    assert.ok(res.data.profile, 'Should return user profile');
    authToken = res.data.token;
    testUserId = res.data.user.id;
  });

  // 3. User Registration
  test('POST /api/auth/register creates new account and initial profile', async () => {
    const testEmail = `student_${Date.now()}@test.edu`;
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Jordan Lee',
        email: testEmail,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        college: 'MIT',
        educationLevel: 'Undergraduate Student',
        termsAccepted: true
      })
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.user.name, 'Jordan Lee');
    assert.strictEqual(res.data.user.email, testEmail);
    assert.strictEqual(res.data.profile.completedOnboarding, false);
  });

  // 4. Invalid Login Rejection
  test('POST /api/auth/login with invalid password should fail with 401', async () => {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'demo@skillpath.ai',
        password: 'WrongPassword'
      })
    });
    assert.strictEqual(res.status, 401);
  });

  // 5. Authenticated Profile Retrieval
  test('GET /api/auth/me returns current user data', async () => {
    const res = await apiRequest('/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.user.id, testUserId);
  });

  // 6. Skill Inventory & Gap Analysis
  test('GET /api/skills and /api/skills/gap-analysis', async () => {
    const skillsRes = await apiRequest('/skills', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(skillsRes.status, 200);
    assert.ok(Array.isArray(skillsRes.data.skills));

    const gapRes = await apiRequest('/skills/gap-analysis', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(gapRes.status, 200);
    assert.ok(typeof gapRes.data.gapAnalysis.overallReadinessScore === 'number');
    assert.ok(Array.isArray(gapRes.data.gapAnalysis.gaps));
  });

  // 7. Add Skill and Update Level
  test('POST and PUT /api/skills', async () => {
    const addRes = await apiRequest('/skills', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        skillName: 'GraphQL_' + Date.now(),
        category: 'frameworks',
        proficiencyLevel: 2,
        evidence: 'Built schema queries in demo app'
      })
    });
    assert.strictEqual(addRes.status, 201);
    const skillId = addRes.data.skill.id;

    const updateRes = await apiRequest(`/skills/${skillId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        proficiencyLevel: 3
      })
    });
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateRes.data.skill.proficiencyLevel, 3);
  });

  // 8. Career Roles & Target Career Selection
  test('GET /api/careers and POST /api/careers/select-target', async () => {
    const careersRes = await apiRequest('/careers');
    assert.strictEqual(careersRes.status, 200);
    assert.ok(careersRes.data.careers.length >= 8);

    const switchRes = await apiRequest('/careers/select-target', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ roleId: 'role-fullstack' })
    });
    assert.strictEqual(switchRes.status, 200);
    assert.strictEqual(switchRes.data.targetRole.id, 'role-fullstack');
  });

  // 9. Learning Roadmap & Task Completion Toggle
  test('GET /api/roadmap and POST /api/roadmap/task/:id/toggle', async () => {
    const roadmapRes = await apiRequest('/roadmap', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(roadmapRes.status, 200);
    const roadmap = roadmapRes.data.roadmap;
    assert.ok(roadmap.phases.length > 0);

    const firstTask = roadmap.phases[0].tasks[0];
    const toggleRes = await apiRequest(`/roadmap/task/${firstTask.id}/toggle`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(toggleRes.status, 200);
    assert.strictEqual(typeof toggleRes.data.overallProgressPercentage, 'number');
  });

  // 10. Assessment Submission & Error Diagnosis
  test('POST /api/assessments/submit diagnoses answers and updates skill', async () => {
    const questionsRes = await apiRequest('/assessments/questions?topic=JavaScript', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(questionsRes.status, 200);
    assert.ok(questionsRes.data.questions.length > 0);

    const q = questionsRes.data.questions[0];
    const submitRes = await apiRequest('/assessments/submit', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        topic: 'JavaScript',
        difficulty: 'intermediate',
        userAnswers: [{ questionId: q.id, selectedOption: 1 }]
      })
    });
    assert.strictEqual(submitRes.status, 200);
    assert.ok(submitRes.data.diagnosis);
    assert.ok(submitRes.data.attempt);
    assert.ok(submitRes.data.skillUpdated);
  });

  // 11. AI Mentor Chat
  test('POST /api/mentor/chat returns context-aware response', async () => {
    const res = await apiRequest('/mentor/chat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        message: 'Explain closure in JS simply',
        mode: 'general'
      })
    });
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.assistantMessage.content.length > 20);
    assert.ok(Array.isArray(res.data.suggestedFollowUps));
  });

  // 12. Multi-Agent Orchestration & Activity Monitor
  test('GET /api/agents/activity and POST /api/agents/run', async () => {
    const actRes = await apiRequest('/agents/activity', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(actRes.status, 200);
    assert.ok(Array.isArray(actRes.data.executions));

    const runRes = await apiRequest('/agents/run', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({ agentName: 'Profile Analyzer Agent' })
    });
    assert.strictEqual(runRes.status, 200);
    assert.strictEqual(runRes.data.success, true);
  });

  // 13. Analytics Metrics
  test('GET /api/analytics returns radar and weekly data', async () => {
    const res = await apiRequest('/analytics', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.data.radarData));
    assert.ok(Array.isArray(res.data.weeklyActivity));
    assert.ok(res.data.metrics);
  });

  // 14. Projects Management
  test('Projects CRUD', async () => {
    const createRes = await apiRequest('/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        title: 'Realtime Code Collaboration',
        description: 'Collaborative code editor with WebSockets',
        skills: ['React', 'Node.js', 'WebSockets'],
        status: 'in_progress'
      })
    });
    assert.strictEqual(createRes.status, 201);
    const projId = createRes.data.project.id;

    const listRes = await apiRequest('/projects', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(listRes.status, 200);
    assert.ok(listRes.data.projects.some(p => p.id === projId));

    const delRes = await apiRequest(`/projects/${projId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(delRes.status, 200);
  });

  // 15. Verified Certificates
  test('GET and POST /api/certificates', async () => {
    const claimRes = await apiRequest('/certificates/claim', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: JSON.stringify({
        title: 'Full Stack Engineering Specialization',
        skillsCovered: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        gradePercentage: 96
      })
    });
    assert.strictEqual(claimRes.status, 201);
    assert.ok(claimRes.data.certificate.credentialId);
    assert.ok(claimRes.data.certificate.verificationHash);
  });

  // 16. Notifications
  test('GET and PUT /api/notifications', async () => {
    const listRes = await apiRequest('/notifications', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(listRes.status, 200);
    assert.ok(Array.isArray(listRes.data.notifications));

    const readAllRes = await apiRequest('/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(readAllRes.status, 200);
    assert.strictEqual(readAllRes.data.success, true);
  });
});
