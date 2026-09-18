import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, runQuery } from '../db/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config.js';

export async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await queryOne('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await runQuery(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name.trim(), normalizedEmail, hashedPassword]
    );

    const userId = result.lastInsertRowid;
    const user = await queryOne(
      'SELECT id, name, email, daily_study_goal_hours, theme, created_at FROM users WHERE id = ?',
      [userId]
    );

    // Create default sample course and task for a great onboarding experience
    const courseRes = await runQuery(
      'INSERT INTO courses (user_id, name, code, instructor, color, credits, grade_target) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, 'Introduction to Computer Science', 'CS101', 'Dr. Turing', '#6366f1', 4, 'A']
    );
    const courseId = courseRes.lastInsertRowid;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    await runQuery(
      'INSERT INTO tasks (user_id, course_id, title, description, due_date, priority, status, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, courseId, 'Complete Lab Assignment 1', 'Write recursive tree traversal algorithm in Python', tomorrow.toISOString().split('T')[0], 'high', 'pending', 90]
    );

    await runQuery(
      'INSERT INTO tasks (user_id, course_id, title, description, due_date, priority, status, estimated_minutes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, courseId, 'Midterm Exam Preparation', 'Review Chapters 1-4 lecture notes and problem sets', nextWeek.toISOString().split('T')[0], 'medium', 'pending', 120]
    );

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'Account created successfully',
      user,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register account.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await queryOne('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      daily_study_goal_hours: user.daily_study_goal_hours,
      theme: user.theme,
      created_at: user.created_at
    };

    res.json({
      message: 'Login successful',
      user: safeUser,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Failed to log in.' });
  }
}

export async function getMe(req, res) {
  res.json({ user: req.user });
}

export async function updateProfile(req, res) {
  try {
    const { name, daily_study_goal_hours, theme } = req.body;
    const userId = req.user.id;

    const current = await queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    const updatedName = name !== undefined ? name.trim() : current.name;
    const updatedGoal = daily_study_goal_hours !== undefined ? parseFloat(daily_study_goal_hours) : current.daily_study_goal_hours;
    const updatedTheme = theme !== undefined ? theme : current.theme;

    await runQuery(
      'UPDATE users SET name = ?, daily_study_goal_hours = ?, theme = ? WHERE id = ?',
      [updatedName, updatedGoal, updatedTheme, userId]
    );

    const user = await queryOne(
      'SELECT id, name, email, daily_study_goal_hours, theme, created_at FROM users WHERE id = ?',
      [userId]
    );

    res.json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
}
