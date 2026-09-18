import { queryAll, queryOne } from '../db/db.js';

export async function getAnalytics(req, res) {
  try {
    const userId = req.user.id;

    // Total tasks count & completion
    const taskStats = await queryOne(
      `SELECT 
        COUNT(*) as total_tasks,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
        SUM(CASE WHEN priority = 'high' AND status != 'completed' THEN 1 ELSE 0 END) as high_priority_tasks
       FROM tasks WHERE user_id = ?`,
      [userId]
    );

    // Total study minutes logged
    const sessionStats = await queryOne(
      `SELECT 
        COALESCE(SUM(duration_minutes), 0) as total_study_minutes,
        COUNT(*) as total_sessions
       FROM study_sessions WHERE user_id = ?`,
      [userId]
    );

    // Upcoming urgent tasks (due in next 7 days)
    const today = new Date().toISOString().split('T')[0];
    const next7Days = new Date();
    next7Days.setDate(next7Days.getDate() + 7);
    const next7DaysStr = next7Days.toISOString().split('T')[0];

    const upcomingTasks = await queryAll(
      `SELECT t.*, c.name as course_name, c.color as course_color
       FROM tasks t
       LEFT JOIN courses c ON t.course_id = c.id
       WHERE t.user_id = ? AND t.status != 'completed' AND t.due_date BETWEEN ? AND ?
       ORDER BY t.due_date ASC`,
      [userId, today, next7DaysStr]
    );

    // Study minutes by course
    const courseBreakdown = await queryAll(
      `SELECT c.id, c.name, c.color, c.code,
        COALESCE(SUM(s.duration_minutes), 0) as total_minutes
       FROM courses c
       LEFT JOIN study_sessions s ON s.course_id = c.id AND s.user_id = ?
       WHERE c.user_id = ?
       GROUP BY c.id`,
      [userId, userId]
    );

    // Last 7 days daily study activity
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });

      const dayRow = await queryOne(
        `SELECT COALESCE(SUM(duration_minutes), 0) as minutes 
         FROM study_sessions 
         WHERE user_id = ? AND session_date = ?`,
        [userId, dateStr]
      );

      dailyActivity.push({
        date: dateStr,
        day: dayLabel,
        minutes: dayRow ? dayRow.minutes : 0,
        hours: Number(((dayRow ? dayRow.minutes : 0) / 60).toFixed(1))
      });
    }

    // Calculate streak (consecutive days with at least 1 study session)
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const check = await queryOne(
        `SELECT COUNT(*) as count FROM study_sessions WHERE user_id = ? AND session_date = ?`,
        [userId, dateStr]
      );
      if (check && check.count > 0) {
        streak++;
      } else if (i > 0) {
        // Break if missing a day in the past (allow today to be 0 yet)
        break;
      }
    }

    const totalMinutes = sessionStats.total_study_minutes || 0;
    const totalHours = Number((totalMinutes / 60).toFixed(1));
    const totalTasks = taskStats.total_tasks || 0;
    const completedTasks = taskStats.completed_tasks || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.json({
      total_study_hours: totalHours,
      total_study_minutes: totalMinutes,
      total_sessions: sessionStats.total_sessions || 0,
      total_tasks: totalTasks,
      completed_tasks: completedTasks,
      pending_tasks: taskStats.pending_tasks || 0,
      high_priority_tasks: taskStats.high_priority_tasks || 0,
      completion_rate: completionRate,
      study_streak: streak,
      upcoming_deadlines: upcomingTasks,
      course_breakdown: courseBreakdown,
      weekly_activity: dailyActivity,
      daily_goal_hours: req.user.daily_study_goal_hours || 4.0
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to compute analytics.' });
  }
}
