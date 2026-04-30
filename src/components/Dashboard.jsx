import React, { useMemo } from 'react';
import { EXAMS, MOTIVATIONAL_QUOTES } from '../data/studyData';

function CountdownCard({ exam, getDaysUntilExam }) {
  const days = getDaysUntilExam(exam.id);
  const urgency = days <= 1 ? 'var(--danger)' : days <= 3 ? 'var(--warning)' : exam.color;

  return (
    <div className="exam-countdown fade-in">
      <div className="exam-color-bar" style={{ background: exam.color }} />
      <div>
        <div className="exam-name">{exam.shortName}</div>
        <div className="exam-date">
          {new Date(exam.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
          {' · '}{exam.time}
        </div>
      </div>
      <div className="exam-days" style={{ marginLeft: 'auto' }}>
        <div className="exam-days-num" style={{ color: urgency }}>{days <= 0 ? '✓' : days}</div>
        <div className="exam-days-label">{days <= 0 ? 'DONE' : 'DAYS'}</div>
      </div>
    </div>
  );
}

function SubjectProgressCard({ subject, progress, color }) {
  return (
    <div className="stat-card fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${color}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, color
          }}>{subject.icon}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{subject.shortName}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{subject.priority} Priority</div>
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color }}>{progress}%</div>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-bar-fill" style={{ width: `${progress}%`, background: color }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
        {subject.topics.filter(t => t.status === 'completed').length} / {subject.topics.length} topics done
      </div>
    </div>
  );
}

export default function Dashboard({ subjects, getSubjectProgress, getOverallProgress, getDaysUntilExam, getSuggestedTopic, getWeakAreas, isScheduleBehind, getTodayHours, getWeeklyStats, streakData, setActivePage }) {
  const quote = useMemo(() => MOTIVATIONAL_QUOTES[Math.floor(Date.now() / 86400000) % MOTIVATIONAL_QUOTES.length], []);
  const suggestion = getSuggestedTopic();
  const warnings = isScheduleBehind();
  const weeklyStats = getWeeklyStats();
  const maxHours = Math.max(...weeklyStats.map(d => d.hours), 1);
  const todayHours = getTodayHours();
  const overallProgress = getOverallProgress();

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard 🎓</h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setActivePage('focus')}>🎯 Focus Mode</button>
          <button className="btn btn-ghost" onClick={() => setActivePage('planner')}>📋 View Planner</button>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="warning-banner">
          <span className="w-icon">⚠️</span>
          <div className="warning-text">
            You are behind schedule! {warnings.map(w => `${w.subjectId.toUpperCase()} exam in ${w.daysLeft} days with ${w.progress}% done`).join(' · ')}
          </div>
        </div>
      )}

      {/* Top Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        <div className="stat-card fade-in">
          <div className="stat-card-icon" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>🔥</div>
          <div className="stat-card-label">Study Streak</div>
          <div className="stat-card-value" style={{ color: 'var(--accent)' }}>{streakData.currentStreak}</div>
          <div className="stat-card-sub">Best: {streakData.longestStreak} days</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-icon" style={{ background: 'var(--success-soft)', color: 'var(--success)' }}>📊</div>
          <div className="stat-card-label">Overall Progress</div>
          <div className="stat-card-value" style={{ color: 'var(--success)' }}>{overallProgress}%</div>
          <div className="stat-card-sub">Across all subjects</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-icon" style={{ background: 'var(--warning-soft)', color: 'var(--warning)' }}>⏱️</div>
          <div className="stat-card-label">Today's Hours</div>
          <div className="stat-card-value" style={{ color: 'var(--warning)' }}>{todayHours.toFixed(1)}</div>
          <div className="stat-card-sub">Goal: 6 hours</div>
        </div>
        <div className="stat-card fade-in">
          <div className="stat-card-icon" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>📅</div>
          <div className="stat-card-label">Next Exam</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--danger)' }}>
            {Math.min(...EXAMS.map(e => getDaysUntilExam(e.id)).filter(d => d > 0))} days
          </div>
          <div className="stat-card-sub">
            {EXAMS.find(e => getDaysUntilExam(e.id) === Math.min(...EXAMS.map(x => getDaysUntilExam(x.id)).filter(d => d > 0)))?.shortName}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 20 }}>
        {/* Exam Countdowns */}
        <div className="card">
          <div className="card-title">📅 Exam Countdown</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {EXAMS.map(exam => <CountdownCard key={exam.id} exam={exam} getDaysUntilExam={getDaysUntilExam} />)}
          </div>
        </div>

        {/* Suggested Next Topic */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {suggestion && (
            <div className="suggestion-card">
              <div className="suggestion-label">✨ Study Next</div>
              <div className="suggestion-topic">{suggestion.topic.title}</div>
              <div className="suggestion-subject">{suggestion.subject.shortName} · {suggestion.daysLeft} days left · Est. {suggestion.topic.estimatedHours}h</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => setActivePage('focus')}>🎯 Start Focusing</button>
                <button className="btn btn-ghost" onClick={() => setActivePage('subjects')}>View Topic</button>
              </div>
            </div>
          )}

          {/* Quote */}
          <div className="quote-card">
            <div className="quote-mark">"</div>
            <div className="quote-text">{quote.text}</div>
            <div className="quote-author">— {quote.author}</div>
          </div>
        </div>
      </div>

      {/* Subject Progress */}
      <div style={{ marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 12 }}>📚 Subject Progress</div>
        <div className="grid-2">
          {Object.values(subjects).map(subject => (
            <SubjectProgressCard
              key={subject.id}
              subject={subject}
              progress={getSubjectProgress(subject.id)}
              color={subject.color}
            />
          ))}
        </div>
      </div>

      {/* Weekly Study Chart */}
      <div className="card">
        <div className="card-title">📈 Weekly Study Hours</div>
        <div className="weekly-bars">
          {weeklyStats.map((day, i) => (
            <div key={i} className="weekly-bar-col">
              <div className="weekly-bar-val">{day.hours > 0 ? day.hours.toFixed(1) : ''}</div>
              <div className="weekly-bar-wrap">
                <div
                  className="weekly-bar"
                  style={{
                    height: `${(day.hours / maxHours) * 100}%`,
                    background: day.date === new Date().toISOString().split('T')[0]
                      ? 'linear-gradient(180deg, var(--accent), #a855f7)'
                      : 'var(--border)',
                  }}
                />
              </div>
              <div className="weekly-bar-label">{day.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
