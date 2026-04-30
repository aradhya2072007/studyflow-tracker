import { useState, useEffect, useRef, useCallback } from 'react';
import { EXAMS, NOTIFICATION_MESSAGES } from '../data/studyData';

const HOUR_MS = 60 * 60 * 1000;
const MIN_MS = 60 * 1000;

function getMinutesUntil(timeStr) {
  const now = new Date();
  const [rawTime, ampm] = timeStr.split(' ');
  let [h, m] = rawTime.split(':').map(Number);
  if (ampm === 'PM' && h !== 12) h += 12;
  if (ampm === 'AM' && h === 12) h = 0;
  const target = new Date();
  target.setHours(h, m || 0, 0, 0);
  return Math.floor((target - now) / MIN_MS);
}

export const useNotifications = (getDaysUntilExam) => {
  const [permission, setPermission] = useState(Notification?.permission || 'default');
  const [enabled, setEnabled] = useState(() => JSON.parse(localStorage.getItem('notif_enabled') || 'false'));
  const [waterInterval, setWaterInterval] = useState(60); // minutes
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [toasts, setToasts] = useState([]);
  const swRef = useRef(null);
  const scheduledRef = useRef(new Set());

  // Register SW
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(reg => { swRef.current = reg; });
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const enable = useCallback(async () => {
    const p = await requestPermission();
    if (p === 'granted') {
      setEnabled(true);
      localStorage.setItem('notif_enabled', 'true');
      showToast('✅ Notifications enabled! Coach mode active.', 'success');
    }
  }, [requestPermission]);

  const disable = useCallback(() => {
    setEnabled(false);
    localStorage.setItem('notif_enabled', 'false');
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 5000);
  }, []);

  const sendNotification = useCallback((title, body, tag) => {
    if (!enabled) return;
    if (permission === 'granted') {
      new Notification(title, { body, tag, icon: '/icon-192.png' });
    }
    showToast(`${title}: ${body}`, 'info');
  }, [enabled, permission, showToast]);

  // Schedule daily reminders
  useEffect(() => {
    if (!enabled) return;
    const scheduleOnce = (key, timeStr, title, body) => {
      if (scheduledRef.current.has(key)) return;
      const mins = getMinutesUntil(timeStr);
      if (mins > 0 && mins < 1440) {
        scheduledRef.current.add(key);
        setTimeout(() => {
          sendNotification(title, body, key);
          scheduledRef.current.delete(key);
        }, mins * MIN_MS);
      }
    };

    scheduleOnce('dsa-start', '11:25 AM', '🔒 DSA Deep Work', NOTIFICATION_MESSAGES.dsaStart);
    scheduleOnce('lunch', '1:00 PM', '🍱 Lunch Break', NOTIFICATION_MESSAGES.lunch);
    scheduleOnce('maths-start', '4:00 PM', '📐 Maths Session', NOTIFICATION_MESSAGES.mathsStart);
    scheduleOnce('snack', '6:00 PM', '🍎 Snack Break', NOTIFICATION_MESSAGES.snack);

    // Exam countdowns
    EXAMS.forEach(exam => {
      const days = getDaysUntilExam(exam.id);
      if (days > 0 && days <= 7) {
        scheduleOnce(`exam-${exam.id}`, '9:00 AM', '📅 Exam Alert', NOTIFICATION_MESSAGES.examCountdown(exam.shortName, days));
      }
    });
  }, [enabled, sendNotification, getDaysUntilExam]);

  // Water reminder every N minutes
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      sendNotification('💧 Water Reminder', NOTIFICATION_MESSAGES.water, 'water');
    }, waterInterval * MIN_MS);
    return () => clearInterval(interval);
  }, [enabled, waterInterval, sendNotification]);

  // Meditation every hour (on the hour + 30 min)
  useEffect(() => {
    if (!enabled) return;
    const interval = setInterval(() => {
      sendNotification('🧘 Mini Meditation', NOTIFICATION_MESSAGES.meditation, 'meditation');
    }, HOUR_MS);
    return () => clearInterval(interval);
  }, [enabled, sendNotification]);

  // Inactivity alert (10 min of no tracked activity)
  useEffect(() => {
    if (!enabled) return;
    const check = setInterval(() => {
      if (Date.now() - lastActivity > 10 * MIN_MS) {
        sendNotification('⚡ Focus Alert', NOTIFICATION_MESSAGES.inactive, 'inactive');
        setLastActivity(Date.now()); // reset so it doesn't spam
      }
    }, 5 * MIN_MS);
    return () => clearInterval(check);
  }, [enabled, lastActivity, sendNotification]);

  const trackActivity = useCallback(() => setLastActivity(Date.now()), []);

  return {
    permission, enabled, waterInterval, toasts,
    setWaterInterval, enable, disable, sendNotification, showToast, trackActivity,
  };
};
