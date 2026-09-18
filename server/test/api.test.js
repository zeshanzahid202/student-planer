import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import app from '../src/server.js';
import { getDb } from '../src/db/db.js';

describe('AI Student Study Planner Full API Suite', () => {
  let server;
  let baseUrl;
  let token;
  let testEmail;
  let testCourseId;
  let testTaskId;

  before(async () => {
    await getDb();
    const PORT = 5991;
    server = app.listen(PORT);
    baseUrl = `http://localhost:${PORT}/api`;
  });

  after(() => {
    if (server) server.close();
  });

  test('1. Health Check Endpoint', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'ok');
  });

  test('2. User Registration & Auth Token Generation', async () => {
    testEmail = `test_student_${Date.now()}@university.edu`;
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Jordan Lee',
        email: testEmail,
        password: 'SecurePassword123'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.ok(data.token);
    assert.strictEqual(data.user.email, testEmail);
    token = data.token;
  });

  test('3. Authenticated Profile Fetch (/auth/me)', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.user.name, 'Jordan Lee');
  });

  test('4. Create and Fetch Courses', async () => {
    const createRes = await fetch(`${baseUrl}/courses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: 'Artificial Intelligence & Ethics',
        code: 'CS450',
        instructor: 'Dr. Russell',
        color: '#6366f1',
        credits: 4,
        grade_target: 'A+'
      })
    });
    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    assert.strictEqual(createData.course.name, 'Artificial Intelligence & Ethics');
    testCourseId = createData.course.id;

    const listRes = await fetch(`${baseUrl}/courses`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(listData.courses.length >= 1);
  });

  test('5. Create and Fetch Tasks', async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);

    const createRes = await fetch(`${baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        course_id: testCourseId,
        title: 'Heuristic Search Algorithm Implementation',
        description: 'Implement A* and minimax algorithms with alpha-beta pruning',
        due_date: tomorrow.toISOString().split('T')[0],
        priority: 'high',
        estimated_minutes: 120
      })
    });
    assert.strictEqual(createRes.status, 201);
    const createData = await createRes.json();
    assert.strictEqual(createData.task.title, 'Heuristic Search Algorithm Implementation');
    testTaskId = createData.task.id;

    const listRes = await fetch(`${baseUrl}/tasks`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(listRes.status, 200);
    const listData = await listRes.json();
    assert.ok(listData.tasks.length >= 1);
  });

  test('6. Log Study Session for Task', async () => {
    const res = await fetch(`${baseUrl}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        course_id: testCourseId,
        task_id: testTaskId,
        duration_minutes: 45,
        notes: 'Constructed state evaluation function and unit tests.'
      })
    });
    assert.strictEqual(res.status, 201);
    const data = await res.json();
    assert.strictEqual(data.session.duration_minutes, 45);
  });

  test('7. AI Study Plan Generation (/planner/generate)', async () => {
    const res = await fetch(`${baseUrl}/planner/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        dailyGoalHours: 4.5,
        studyPreference: 'afternoon',
        intensity: 'balanced'
      })
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.plan);
    assert.strictEqual(data.plan.schedule.length, 7);
    assert.ok(data.plan.total_planned_hours > 0);
  });

  test('8. Study Analytics Computation (/analytics)', async () => {
    const res = await fetch(`${baseUrl}/analytics`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.ok(data.total_study_minutes >= 45);
    assert.ok(data.total_tasks >= 1);
    assert.strictEqual(data.study_streak, 1);
  });
});
