import React from 'react';
import { EXAMS } from '../data/studyData';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'planner', label: 'Study Planner', icon: '📋' },
  { id: 'subjects', label: 'Subjects & Topics', icon: '📚' },
  { id: 'focus', label: 'Focus Mode', icon: '🎯' },
  { id: 'calendar', label: 'Calendar', icon: '📅' },
  { id: 'ai', label: 'AI Assistant', icon: '✨' },
];

export default function Sidebar({ activePage, setActivePage, theme, toggleTheme }) {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">📖</div>
          <div>
            <div className="logo-text">StudyFlow</div>
            <div className="logo-sub">End-Sem Tracker</div>
          </div>
        </div>
      </div>

      <div className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}

        <div className="nav-section-label" style={{ marginTop: 16 }}>Exams</div>
        {EXAMS.map(exam => (
          <div key={exam.id} className="nav-item" style={{ cursor: 'default', padding: '8px 20px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: exam.color, flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{exam.shortName}</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
              {new Date(exam.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}
      </div>

      <div className="sidebar-bottom">
        <button className="theme-toggle-btn" onClick={toggleTheme}>
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
          {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>
    </nav>
  );
}
