import { useState, useEffect, useCallback } from 'react';
import { SUBJECTS, EXAMS, STUDY_ORDER } from '../data/studyData';

const STORAGE_KEY = 'studyTracker_v3';
const STREAK_KEY = 'studyTracker_streak';
const HOURS_KEY = 'studyTracker_hours';

const initializeTopics = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fall through
    }
  }
  // Deep-clone subjects from data
  const initial = {};
  Object.keys(SUBJECTS).forEach((sid) => {
    initial[sid] = {
      ...SUBJECTS[sid],
      topics: SUBJECTS[sid].topics.map((t) => ({ ...t })),
    };
  });
  return initial;
};

const initializeStreak = () => {
  const saved = localStorage.getItem(STREAK_KEY);
  if (saved) return JSON.parse(saved);
  return { currentStreak: 0, longestStreak: 0, lastStudyDate: null, studiedToday: false };
};

const initializeHours = () => {
  const saved = localStorage.getItem(HOURS_KEY);
  if (saved) return JSON.parse(saved);
  return { daily: {}, total: 0 };
};

export const useStudyData = () => {
  const [subjects, setSubjects] = useState(initializeTopics);
  const [streakData, setStreakData] = useState(initializeStreak);
  const [hoursData, setHoursData] = useState(initializeHours);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Persist subjects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
  }, [subjects]);

  // Persist streak
  useEffect(() => {
    localStorage.setItem(STREAK_KEY, JSON.stringify(streakData));
  }, [streakData]);

  // Persist hours
  useEffect(() => {
    localStorage.setItem(HOURS_KEY, JSON.stringify(hoursData));
  }, [hoursData]);

  // Persist theme
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const updateTopicStatus = useCallback((subjectId, topicId, newStatus) => {
    setSubjects((prev) => {
      const updated = { ...prev };
      updated[subjectId] = {
        ...updated[subjectId],
        topics: updated[subjectId].topics.map((t) =>
          t.id === topicId ? { ...t, status: newStatus } : t
        ),
      };
      return updated;
    });

    // Update streak when completing a topic
    if (newStatus === 'completed') {
      updateStreak();
    }
  }, []);

  const updateStreak = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setStreakData((prev) => {
      const lastDate = prev.lastStudyDate;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = prev.currentStreak;
      if (lastDate === today) {
        // Already studied today
        return { ...prev, studiedToday: true };
      } else if (lastDate === yesterdayStr) {
        newStreak += 1;
      } else if (lastDate !== today) {
        newStreak = 1;
      }

      return {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, prev.longestStreak),
        lastStudyDate: today,
        studiedToday: true,
      };
    });
  }, []);

  const addStudyHours = useCallback((hours) => {
    const today = new Date().toISOString().split('T')[0];
    setHoursData((prev) => {
      const dailyHours = prev.daily[today] || 0;
      return {
        daily: { ...prev.daily, [today]: dailyHours + hours },
        total: prev.total + hours,
      };
    });
    updateStreak();
  }, [updateStreak]);

  // Computed values
  const getSubjectProgress = useCallback((subjectId) => {
    const subject = subjects[subjectId];
    if (!subject) return 0;
    const total = subject.topics.length;
    const completed = subject.topics.filter((t) => t.status === 'completed').length;
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [subjects]);

  const getOverallProgress = useCallback(() => {
    let total = 0;
    let completed = 0;
    Object.values(subjects).forEach((s) => {
      total += s.topics.length;
      completed += s.topics.filter((t) => t.status === 'completed').length;
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  }, [subjects]);

  const getDaysUntilExam = useCallback((examId) => {
    const exam = EXAMS.find((e) => e.id === examId);
    if (!exam) return Infinity;
    const examDate = new Date(exam.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    examDate.setHours(0, 0, 0, 0);
    return Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
  }, []);

  const getSuggestedTopic = useCallback(() => {
    // Find next uncompleted topic based on priority order
    for (const subjectId of STUDY_ORDER) {
      const subject = subjects[subjectId];
      const daysLeft = getDaysUntilExam(subjectId);
      if (daysLeft <= 0) continue;

      const nextTopic = subject.topics.find(
        (t) => t.status === 'not-started' || t.status === 'in-progress'
      );
      if (nextTopic) return { subject, topic: nextTopic, daysLeft };
    }
    return null;
  }, [subjects, getDaysUntilExam]);

  const getWeakAreas = useCallback(() => {
    const weak = [];
    STUDY_ORDER.forEach((subjectId) => {
      const subject = subjects[subjectId];
      const notStarted = subject.topics.filter((t) => t.status === 'not-started');
      const inProgress = subject.topics.filter((t) => t.status === 'in-progress');
      if (notStarted.length > 0 || inProgress.length > 0) {
        weak.push({
          subject,
          notStartedCount: notStarted.length,
          inProgressCount: inProgress.length,
          daysLeft: getDaysUntilExam(subjectId),
        });
      }
    });
    return weak;
  }, [subjects, getDaysUntilExam]);

  const isScheduleBehind = useCallback(() => {
    // Simple heuristic: check if progress is proportional to days passed
    const warnings = [];
    STUDY_ORDER.forEach((subjectId) => {
      const daysLeft = getDaysUntilExam(subjectId);
      const progress = getSubjectProgress(subjectId);
      if (daysLeft <= 3 && progress < 60) {
        warnings.push({ subjectId, daysLeft, progress });
      }
      if (daysLeft <= 1 && progress < 90) {
        warnings.push({ subjectId, daysLeft, progress });
      }
    });
    return warnings;
  }, [getDaysUntilExam, getSubjectProgress]);

  const getTodayHours = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return hoursData.daily[today] || 0;
  }, [hoursData]);

  const getWeeklyStats = useCallback(() => {
    const stats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      stats.push({
        date: dateStr,
        label: date.toLocaleDateString('en', { weekday: 'short' }),
        hours: hoursData.daily[dateStr] || 0,
      });
    }
    return stats;
  }, [hoursData]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const resetAllProgress = useCallback(() => {
    const reset = {};
    Object.keys(SUBJECTS).forEach((sid) => {
      reset[sid] = {
        ...SUBJECTS[sid],
        topics: SUBJECTS[sid].topics.map((t) => ({ ...t, status: 'not-started' })),
      };
    });
    setSubjects(reset);
  }, []);

  return {
    subjects,
    streakData,
    hoursData,
    theme,
    toggleTheme,
    updateTopicStatus,
    addStudyHours,
    getSubjectProgress,
    getOverallProgress,
    getDaysUntilExam,
    getSuggestedTopic,
    getWeakAreas,
    isScheduleBehind,
    getTodayHours,
    getWeeklyStats,
    resetAllProgress,
  };
};
