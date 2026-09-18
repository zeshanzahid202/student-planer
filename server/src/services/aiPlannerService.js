/**
 * AI Study Planner Service
 * Generates an intelligent, balanced 7-day study timetable.
 * Uses realistic heuristics based on deadlines, priorities, and course weights.
 */

const STUDY_STRATEGIES = [
  "Use the Pomodoro Technique: 25 min deep work, 5 min active break.",
  "Practice Active Recall: test yourself without looking at notes.",
  "Apply the Feynman Technique: explain key concepts in simple terms.",
  "Spaced Repetition: review hardest topics first before new material.",
  "Interleaved Practice: switch between related problem sets to improve retention."
];

export async function generateSmartStudyPlan({ courses, tasks, dailyGoalHours = 4, studyPreference = 'evening', intensity = 'balanced' }) {
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const targetMinutesPerDay = Math.round(dailyGoalHours * 60);

  // Time slot configurations
  const slotPresets = {
    morning: ['08:00 - 09:30', '09:45 - 11:15', '11:30 - 12:30'],
    afternoon: ['13:30 - 15:00', '15:15 - 16:45', '17:00 - 18:00'],
    evening: ['18:30 - 20:00', '20:15 - 21:45', '22:00 - 23:00'],
    flexible: ['09:30 - 11:00', '14:30 - 16:00', '19:30 - 21:00']
  };

  const defaultSlots = slotPresets[studyPreference] || slotPresets.flexible;

  // Filter pending tasks
  const pendingTasks = tasks.filter(t => t.status !== 'completed');

  // Sort tasks by urgency (due_date ASC) and priority (high > medium > low)
  const priorityWeights = { high: 3, medium: 2, low: 1 };
  const sortedTasks = [...pendingTasks].sort((a, b) => {
    const dateA = new Date(a.due_date).getTime();
    const dateB = new Date(b.due_date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return (priorityWeights[b.priority] || 2) - (priorityWeights[a.priority] || 2);
  });

  const weeklySchedule = [];
  const today = new Date();

  // Distribute workload over 7 days
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    const dateStr = currentDate.toISOString().split('T')[0];
    const dayName = daysOfWeek[currentDate.getDay()];

    const daySessions = [];
    let dayMinutesAllocated = 0;

    // Pick top urgent tasks for today
    const taskIndex = i % (sortedTasks.length || 1);
    const primaryTask = sortedTasks[taskIndex];
    const secondaryTask = sortedTasks[(taskIndex + 1) % (sortedTasks.length || 1)];

    // Session 1 (Deep Work block)
    if (primaryTask) {
      const duration = Math.min(90, targetMinutesPerDay - dayMinutesAllocated);
      if (duration >= 30) {
        daySessions.push({
          id: `session-${i}-1`,
          time_slot: defaultSlots[0] || '09:00 - 10:30',
          course_name: primaryTask.course_name || 'General Studies',
          course_color: primaryTask.course_color || '#6366f1',
          task_title: primaryTask.title,
          type: 'Deep Focus & Problem Solving',
          duration_minutes: duration,
          priority: primaryTask.priority || 'high',
          completed: false
        });
        dayMinutesAllocated += duration;
      }
    } else if (courses.length > 0) {
      const course = courses[i % courses.length];
      daySessions.push({
        id: `session-${i}-1`,
        time_slot: defaultSlots[0] || '09:00 - 10:30',
        course_name: course.name,
        course_color: course.color,
        task_title: `Core Module Review (${course.code || 'Unit'})`,
        type: 'Lecture Review & Flashcards',
        duration_minutes: 90,
        priority: 'medium',
        completed: false
      });
      dayMinutesAllocated += 90;
    }

    // Session 2 (Practice / Secondary Task block)
    if (dayMinutesAllocated < targetMinutesPerDay) {
      const remaining = targetMinutesPerDay - dayMinutesAllocated;
      const duration = Math.min(60, remaining);
      if (secondaryTask && secondaryTask !== primaryTask) {
        daySessions.push({
          id: `session-${i}-2`,
          time_slot: defaultSlots[1] || '14:00 - 15:00',
          course_name: secondaryTask.course_name || 'General Studies',
          course_color: secondaryTask.course_color || '#10b981',
          task_title: secondaryTask.title,
          type: 'Practice Questions & Exercises',
          duration_minutes: duration,
          priority: secondaryTask.priority || 'medium',
          completed: false
        });
        dayMinutesAllocated += duration;
      } else if (courses.length > 1) {
        const altCourse = courses[(i + 1) % courses.length];
        daySessions.push({
          id: `session-${i}-2`,
          time_slot: defaultSlots[1] || '14:00 - 15:00',
          course_name: altCourse.name,
          course_color: altCourse.color,
          task_title: `Practice Problem Set & Notes`,
          type: 'Concept Reinforcement',
          duration_minutes: duration,
          priority: 'medium',
          completed: false
        });
        dayMinutesAllocated += duration;
      }
    }

    // Session 3 (Quick Revision / Active Recall)
    if (dayMinutesAllocated < targetMinutesPerDay && targetMinutesPerDay >= 180) {
      const remaining = targetMinutesPerDay - dayMinutesAllocated;
      daySessions.push({
        id: `session-${i}-3`,
        time_slot: defaultSlots[2] || '19:30 - 20:15',
        course_name: primaryTask?.course_name || courses[0]?.name || 'Study Sync',
        course_color: primaryTask?.course_color || '#f59e0b',
        task_title: 'Active Recall & Self-Quiz',
        type: 'Spaced Repetition Review',
        duration_minutes: Math.min(45, remaining),
        priority: 'low',
        completed: false
      });
      dayMinutesAllocated += Math.min(45, remaining);
    }

    weeklySchedule.push({
      day: dayName,
      date: dateStr,
      is_today: i === 0,
      total_minutes: dayMinutesAllocated,
      focus_tip: STUDY_STRATEGIES[i % STUDY_STRATEGIES.length],
      sessions: daySessions
    });
  }

  return {
    title: `Smart 7-Day Study Masterplan (${intensity.toUpperCase()})`,
    generated_at: new Date().toISOString(),
    total_planned_hours: Number((weeklySchedule.reduce((acc, d) => acc + d.total_minutes, 0) / 60).toFixed(1)),
    target_hours_per_day: dailyGoalHours,
    schedule: weeklySchedule,
    summary: {
      urgent_tasks_covered: Math.min(sortedTasks.length, 7),
      courses_active: courses.length,
      recommended_breaks: "5 minutes every 25 minutes, 20 minutes after 90 minutes"
    }
  };
}
