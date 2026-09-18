import { queryAll, queryOne, runQuery } from '../db/db.js';

export async function getCourses(req, res) {
  try {
    const userId = req.user.id;
    const courses = await queryAll(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM tasks t WHERE t.course_id = c.id) as total_tasks,
        (SELECT COUNT(*) FROM tasks t WHERE t.course_id = c.id AND t.status = 'completed') as completed_tasks
       FROM courses c 
       WHERE c.user_id = ? 
       ORDER BY c.created_at DESC`,
      [userId]
    );
    res.json({ courses });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
}

export async function createCourse(req, res) {
  try {
    const userId = req.user.id;
    const { name, code, instructor, color, credits, grade_target } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Course name is required.' });
    }

    const result = await runQuery(
      `INSERT INTO courses (user_id, name, code, instructor, color, credits, grade_target)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        code ? code.trim() : '',
        instructor ? instructor.trim() : '',
        color || '#6366f1',
        credits ? parseInt(credits) : 3,
        grade_target || 'A'
      ]
    );

    const course = await queryOne('SELECT * FROM courses WHERE id = ?', [result.lastInsertRowid]);
    res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({ error: 'Failed to create course.' });
  }
}

export async function updateCourse(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { name, code, instructor, color, credits, grade_target } = req.body;

    const existing = await queryOne('SELECT * FROM courses WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    await runQuery(
      `UPDATE courses 
       SET name = ?, code = ?, instructor = ?, color = ?, credits = ?, grade_target = ?
       WHERE id = ? AND user_id = ?`,
      [
        name !== undefined ? name.trim() : existing.name,
        code !== undefined ? code.trim() : existing.code,
        instructor !== undefined ? instructor.trim() : existing.instructor,
        color !== undefined ? color : existing.color,
        credits !== undefined ? parseInt(credits) : existing.credits,
        grade_target !== undefined ? grade_target : existing.grade_target,
        id,
        userId
      ]
    );

    const updated = await queryOne('SELECT * FROM courses WHERE id = ?', [id]);
    res.json({ message: 'Course updated successfully', course: updated });
  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({ error: 'Failed to update course.' });
  }
}

export async function deleteCourse(req, res) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const existing = await queryOne('SELECT * FROM courses WHERE id = ? AND user_id = ?', [id, userId]);
    if (!existing) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    await runQuery('DELETE FROM courses WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ error: 'Failed to delete course.' });
  }
}
