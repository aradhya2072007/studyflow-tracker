import { useState, useEffect, useRef, useCallback } from 'react';

export const usePomodoro = (onSessionComplete) => {
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' | 'shortBreak' | 'longBreak'
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [sessions, setSessions] = useState(0);
  const [settings, setSettings] = useState({ work: 25, shortBreak: 5, longBreak: 15 });
  const intervalRef = useRef(null);

  const getModeDuration = useCallback((m, s) => {
    if (m === 'work') return s.work * 60;
    if (m === 'shortBreak') return s.shortBreak * 60;
    return s.longBreak * 60;
  }, []);

  useEffect(() => {
    setTimeLeft(getModeDuration(mode, settings));
  }, [mode, settings, getModeDuration]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setIsRunning(false);
            handleSessionEnd();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleSessionEnd = () => {
    if (mode === 'work') {
      const newSessions = sessions + 1;
      setSessions(newSessions);
      if (onSessionComplete) onSessionComplete(settings.work / 60);
      // After 4 work sessions, take long break
      if (newSessions % 4 === 0) {
        setMode('longBreak');
      } else {
        setMode('shortBreak');
      }
    } else {
      setMode('work');
    }
  };

  const toggleTimer = () => setIsRunning((prev) => !prev);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getModeDuration(mode, settings));
  };
  const switchMode = (newMode) => {
    setIsRunning(false);
    setMode(newMode);
  };
  const updateSettings = (newSettings) => {
    setIsRunning(false);
    setSettings(newSettings);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const progress = 1 - timeLeft / getModeDuration(mode, settings);

  return {
    isRunning,
    mode,
    timeLeft,
    sessions,
    settings,
    progress,
    toggleTimer,
    resetTimer,
    switchMode,
    updateSettings,
    formatTime,
  };
};
