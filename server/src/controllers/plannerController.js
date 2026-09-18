import { queryAll, queryOne, runQuery } from '../db/db.js';
import { generateSmartStudyPlan } from '../services/aiPlannerService.js';

export async function generatePlan(req, res) {
  try {
    const userId = req.user.id;
    const { dailyGoalHours, studyPreference, intensity } = req.body;

    const user = await queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    const courses = await queryAll('SELECT * FROM courses WHERE user_id = ?', [userId]);
    const tasks = await queryAll(
      `SELECT t.*, c.name as course_name, c.color as course_color
       FROM tasks t
       LEFT JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = ?`,
      [userId]
    );

    const goal = dailyGoalHours !== undefined ? parseFloat(dailyGoalHours) : (user.daily_study_goal_hours || 4);

    const planData = await generateSmartStudyPlan({
      courses,
      tasks,
      dailyGoalHours: goal,
      studyPreference: studyPreference || 'evening',
      intensity: intensity || 'balanced'
    });

    // Save as current active plan
    await runQuery('UPDATE study_plans SET is_active = 0 WHERE user_id = ?', [userId]);

    const startDate = planData.schedule[0].date;
    const endDate = planData.schedule[planData.schedule.length - 1].date;

    const saved = await runQuery(
      `INSERT INTO study_plans (user_id, title, start_date, end_date, target_hours_per_day, plan_json, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [
        userId,
        planData.title,
        startDate,
        endDate,
        goal,
        JSON.stringify(planData)
      ]
    );

    res.json({
      message: 'AI Study Plan generated successfully',
      planId: saved.lastInsertRowid,
      plan: planData
    });
  } catch (error) {
    console.error('Generate plan error:', error);
    res.status(500).json({ error: 'Failed to generate study plan.' });
  }
}

export async function getCurrentPlan(req, res) {
  try {
    const userId = req.user.id;
    const planRow = await queryOne(
      'SELECT * FROM study_plans WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC',
      [userId]
    );

    if (!planRow) {
      return res.json({ plan: null });
    }

    const plan = JSON.parse(planRow.plan_json);
    res.json({ plan, planId: planRow.id, createdAt: planRow.created_at });
  } catch (error) {
    console.error('Get current plan error:', error);
    res.status(500).json({ error: 'Failed to retrieve study plan.' });
  }
}

export async function updateSessionStatus(req, res) {
  try {
    const userId = req.user.id;
    const { sessionId, completed } = req.body;

    const planRow = await queryOne(
      'SELECT * FROM study_plans WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC',
      [userId]
    );

    if (!planRow) {
      return res.status(404).json({ error: 'No active plan found.' });
    }

    const plan = JSON.parse(planRow.plan_json);
    
    // Find and update session status in schedule
    let found = false;
    for (const day of plan.schedule) {
      for (const session of day.sessions) {
        if (session.id === sessionId) {
          session.completed = completed;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    await runQuery(
      'UPDATE study_plans SET plan_json = ? WHERE id = ? AND user_id = ?',
      [JSON.stringify(plan), planRow.id, userId]
    );

    res.json({ message: 'Session status updated', plan });
  } catch (error) {
    console.error('Update session status error:', error);
    res.status(500).json({ error: 'Failed to update session status.' });
  }
}
