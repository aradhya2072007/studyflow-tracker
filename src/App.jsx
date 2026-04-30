import React, { useState, useEffect } from 'react';
import './index.css';
import './futuristic.css';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Planner from './components/Planner';
import Subjects from './components/Subjects';
import FocusMode from './components/FocusMode';
import CalendarView from './components/CalendarView';
import AIAssistant from './components/AIAssistant';
import FloatingAI from './components/FloatingAI';
import SpotifyPlayer from './components/SpotifyPlayer';
import ToastContainer from './components/ToastContainer';
import ParticleBackground from './components/ParticleBackground';
import { useStudyData } from './hooks/useStudyData';
import { useNotifications } from './hooks/useNotifications';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  const {
    subjects, streakData, hoursData, theme, toggleTheme,
    updateTopicStatus, addStudyHours,
    getSubjectProgress, getOverallProgress, getDaysUntilExam,
    getSuggestedTopic, getWeakAreas, isScheduleBehind,
    getTodayHours, getWeeklyStats,
  } = useStudyData();

  const {
    permission, enabled, waterInterval, toasts,
    setWaterInterval, enable, disable, showToast, trackActivity,
  } = useNotifications(getDaysUntilExam);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.style.background = theme === 'dark' ? '#0f172a' : '#FFF8F0';
  }, [theme]);

  // Track user activity for inactivity alerts
  useEffect(() => {
    const events = ['click', 'keydown', 'scroll'];
    events.forEach(e => window.addEventListener(e, trackActivity, { passive: true }));
    return () => events.forEach(e => window.removeEventListener(e, trackActivity));
  }, [trackActivity]);

  const suggestion = getSuggestedTopic();
  const currentTopic = suggestion?.topic?.title || '';
  const currentSubject = suggestion?.subject?.shortName || '';

  const sharedProps = {
    subjects, streakData, hoursData,
    updateTopicStatus, addStudyHours,
    getSubjectProgress, getOverallProgress, getDaysUntilExam,
    getSuggestedTopic, getWeakAreas, isScheduleBehind,
    getTodayHours, getWeeklyStats,
    setActivePage, theme, toggleTheme,
  };

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard {...sharedProps} />;
      case 'planner': return <Planner   {...sharedProps} />;
      case 'subjects': return <Subjects  {...sharedProps} />;
      case 'focus': return <FocusMode {...sharedProps} />;
      case 'calendar': return <CalendarView {...sharedProps} />;
      case 'ai': return <AIAssistant {...sharedProps} />;
      default: return <Dashboard {...sharedProps} />;
    }
  };

  return (
    <>
      <ParticleBackground focusMode={activePage === 'focus'} />
      <div className="app-layout">
        <Sidebar activePage={activePage} setActivePage={setActivePage} theme={theme} toggleTheme={toggleTheme} />
        <div className="main-content">{renderPage()}</div>
      </div>

      {/* Notification Settings Panel */}
      {showNotifPanel && (
        <div className="modal-overlay" onClick={() => setShowNotifPanel(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-title">🔔 Notification Settings</div>
            <div className="modal-sub">Coach reminders, water breaks, exam countdown alerts.</div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)', marginBottom: 14 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>Study Reminders</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>DSA 11:30, Maths 4:00, Lunch, Snack, Exam alerts</div>
              </div>
              <button className={`btn ${enabled ? 'btn-danger' : 'btn-primary'}`} style={{ padding: '8px 16px' }} onClick={enabled ? disable : enable}>
                {enabled ? 'Disable' : 'Enable'}
              </button>
            </div>

            {enabled && (
              <>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 8 }}>💧 Water Reminder Frequency</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[30, 45, 60, 90].map(m => (
                      <button key={m} className={`btn ${waterInterval === m ? 'btn-primary' : 'btn-ghost'}`} style={{ flex: 1, padding: '8px' }} onClick={() => setWaterInterval(m)}>
                        {m}m
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: 12, background: 'var(--success-soft)', border: '1px solid rgba(5,150,105,.2)' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)' }}>✅ Active Reminders</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6, lineHeight: 1.7 }}>
                    🔒 DSA Deep Work @ 11:25 AM<br />
                    🍱 Lunch @ 1:00 PM<br />
                    📐 Maths Session @ 4:00 PM<br />
                    🍎 Snack @ 6:00 PM<br />
                    💧 Water every {waterInterval} minutes<br />
                    🧘 Meditation every 60 minutes<br />
                    ⚡ Inactivity alert after 10 min
                  </div>
                </div>
              </>
            )}

            {permission === 'denied' && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--danger-soft)', border: '1px solid rgba(220,38,38,.2)', fontSize: 12, color: 'var(--danger)' }}>
                ⚠️ Notifications blocked in browser. Go to Site Settings to allow.
              </div>
            )}

            <button className="btn btn-ghost" style={{ width: '100%', marginTop: 14 }} onClick={() => setShowNotifPanel(false)}>Close</button>
          </div>
        </div>
      )}

      {/* Floating notification bell */}
      <button
        className="floating-btn"
        style={{
          right: 88, bottom: 24,
          background: enabled ? 'linear-gradient(135deg,#059669,#10b981)' : 'white',
          color: enabled ? 'white' : 'var(--text2)',
          border: enabled ? 'none' : '2px solid var(--border)',
          boxShadow: enabled ? '0 4px 20px rgba(5,150,105,.4)' : 'var(--shadow)',
          fontSize: 18,
        }}
        onClick={() => setShowNotifPanel(true)}
        title="Notification Settings"
      >
        🔔
      </button>

      <FloatingAI currentTopic={currentTopic} currentSubject={currentSubject} />
      <SpotifyPlayer />
      <ToastContainer toasts={toasts} />
    </>
  );
}
