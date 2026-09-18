import { queryAll, queryOne, runQuery } from '../db/db.js';

export async function getSessions(req, res) {
  try {
    const userId = req.user.id;
    const sessions = await queryAll(
      `SELECT s.*, c.name as course_name, c.color as course_color, t.title as task_title
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN tasks t ON s.task_id = t.id
       WHERE s.user_id = ?
       ORDER BY s.session_date DESC, s.created_at DESC`,
      [userId]
    );
    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch study sessions.' });
  }
}

export async function createSession(req, res) {
  try {
    const userId = req.user.id;
    const { course_id, task_id, duration_minutes, notes, session_date } = req.body;

    if (!duration_minutes || duration_minutes <= 0) {
      return res.status(400).json({ error: 'Valid duration in minutes is required.' });
    }

    const todayDate = session_date || new Date().toISOString().split('T')[0];

    const result = await runQuery(
      `INSERT INTO study_sessions (user_id, course_id, task_id, duration_minutes, notes, session_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        course_id ? parseInt(course_id) : null,
        task_id ? parseInt(task_id) : null,
        parseInt(duration_minutes),
        notes ? notes.trim() : '',
        todayDate
      ]
    );

    // If associated with a task, increment actual_minutes on that task
    if (task_id) {
      await runQuery(
        `UPDATE tasks 
         SET actual_minutes = COALESCE(actual_minutes, 0) + ? 
         WHERE id = ? AND user_id = ?`,
        [parseInt(duration_minutes), parseInt(task_id), userId]
      );
    }

    const session = await queryOne(
      `SELECT s.*, c.name as course_name, c.color as course_color, t.title as task_title
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.id
       LEFT JOIN tasks t ON s.task_id = t.id
       WHERE s.id = ?`,
      [result.lastInsertRowid]
    );

    res.status(201).json({ message: 'Study session logged successfully', session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to log study session.' });
  }
}

export async function deleteSession(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await queryOne('SELECT * FROM study_sessions WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Study session not found.' });
    }

    await runQuery('DELETE FROM study_sessions WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Study session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete study session.' });
  }
}
