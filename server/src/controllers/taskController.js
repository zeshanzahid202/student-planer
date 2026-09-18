import { queryAll, queryOne, runQuery } from '../db/db.js';

export async function getTasks(req, res) {
  try {
    const userId = req.user.id;
    const { course_id, status, priority } = req.query;

    let sql = `
      SELECT t.*, c.name as course_name, c.color as course_color, c.code as course_code
      FROM tasks t
      LEFT JOIN courses c ON t.course_id = c.id
      WHERE t.user_id = ?
    `;
    const params = [userId];

    if (course_id) {
      sql += ' AND t.course_id = ?';
      params.push(course_id);
    }
    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }
    if (priority) {
      sql += ' AND t.priority = ?';
      params.push(priority);
    }

    sql += ' ORDER BY t.due_date ASC, t.priority DESC';

    const tasks = await queryAll(sql, params);
    res.json({ tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
}

export async function createTask(req, res) {
  try {
    const userId = req.user.id;
    const { course_id, title, description, due_date, priority, estimated_minutes } = req.body;

    if (!title || !due_date) {
      return res.status(400).json({ error: 'Title and due date are required.' });
    }

    const result = await runQuery(
      `INSERT INTO tasks (user_id, course_id, title, description, due_date, priority, status, estimated_minutes)
       VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [
        userId,
        course_id ? parseInt(course_id) : null,
        title.trim(),
        description ? description.trim() : '',
        due_date,
        priority || 'medium',
        estimated_minutes ? parseInt(estimated_minutes) : 60
      ]
    );

    const task = await queryOne(
      `SELECT t.*, c.name as course_name, c.color as course_color, c.code as course_code
       FROM tasks t
       LEFT JOIN courses c ON t.course_id = c.id
       WHERE t.id = ?`,
      [result.lastInsertRowid]
    );

    res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Failed to create task.' });
  }
}

export async function updateTask(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { course_id, title, description, due_date, priority, status, estimated_minutes, actual_minutes } = req.body;

    const existing = await queryOne('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await runQuery(
      `UPDATE tasks
       SET course_id = ?, title = ?, description = ?, due_date = ?, priority = ?, status = ?, estimated_minutes = ?, actual_minutes = ?
       WHERE id = ? AND user_id = ?`,
      [
        course_id !== undefined ? (course_id ? parseInt(course_id) : null) : existing.course_id,
        title !== undefined ? title.trim() : existing.title,
        description !== undefined ? description.trim() : existing.description,
        due_date !== undefined ? due_date : existing.due_date,
        priority !== undefined ? priority : existing.priority,
        status !== undefined ? status : existing.status,
        estimated_minutes !== undefined ? parseInt(estimated_minutes) : existing.estimated_minutes,
        actual_minutes !== undefined ? parseInt(actual_minutes) : existing.actual_minutes,
        id,
        userId
      ]
    );

    const updated = await queryOne(
      `SELECT t.*, c.name as course_name, c.color as course_color, c.code as course_code
       FROM tasks t
       LEFT JOIN courses c ON t.course_id = c.id
       WHERE t.id = ?`,
      [id]
    );

    res.json({ message: 'Task updated successfully', task: updated });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({ error: 'Failed to update task.' });
  }
}

export async function deleteTask(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await queryOne('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await runQuery('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
}
