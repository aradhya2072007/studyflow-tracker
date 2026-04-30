import React from 'react';
import { usePomodoro } from '../hooks/usePomodoro';
import { POMODORO_PRESETS } from '../data/studyData';

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const MODE_COLORS = { work: '#7c3aed', shortBreak: '#10b981', longBreak: '#3b82f6' };
const MODE_LABEL = { work: '🎯 Focus Time', shortBreak: '☕ Short Break', longBreak: '🌿 Long Break' };

export default function FocusMode({ getSuggestedTopic, addStudyHours, updateTopicStatus }) {
  const suggestion = getSuggestedTopic();

  const { isRunning, mode, timeLeft, sessions, settings, progress, toggleTimer, resetTimer, switchMode, updateSettings, formatTime } = usePomodoro(addStudyHours);

  const strokeOffset = CIRCUMFERENCE * (1 - progress);
  const modeColor = MODE_COLORS[mode];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">🎯 Focus Mode</h1>
          <p className="page-subtitle">Deep work sessions with Pomodoro timer · Stay in the zone</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Pomodoro Timer */}
        <div className="card" style={{ textAlign: 'center' }}>
          <div className="card-title" style={{ textAlign: 'left' }}>⏱️ Pomodoro Timer</div>

          <div className="pomo-mode-tabs">
            {Object.entries(MODE_LABEL).map(([m, label]) => (
              <button key={m} className={`pomo-mode-tab ${mode === m ? 'active' : ''}`} onClick={() => switchMode(m)}>
                {label}
              </button>
            ))}
          </div>

          <div className="pomodoro-ring">
            <svg width={200} height={200} className="pomodoro-svg">
              <circle className="pomodoro-track" cx={100} cy={100} r={RADIUS} strokeWidth={8} />
              <circle
                className="pomodoro-fill"
                cx={100} cy={100} r={RADIUS} strokeWidth={8}
                stroke={modeColor}
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div className="pomodoro-time" style={{ color: modeColor }}>{formatTime(timeLeft)}</div>
          </div>

          <div className="pomodoro-mode-label">{MODE_LABEL[mode]}</div>

          <div className="pomo-controls">
            <button className="pomo-btn pomo-btn-secondary" onClick={resetTimer}>↺ Reset</button>
            <button
              className="pomo-btn pomo-btn-primary"
              style={{ background: isRunning ? '#374151' : modeColor }}
              onClick={toggleTimer}
            >
              {isRunning ? '⏸ Pause' : '▶ Start'}
            </button>
          </div>

          <div className="pomo-sessions">
            Sessions completed today: {sessions} · {sessions >= 4 ? '🏆 Great work!' : `${4 - sessions} until long break`}
          </div>
          <div className="session-dots" style={{ justifyContent: 'center', marginTop: 8 }}>
            {[0,1,2,3].map(i => <div key={i} className={`session-dot ${i < sessions % 4 ? '' : 'empty'}`} />)}
          </div>

          {/* Presets */}
          <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <div className="card-title" style={{ textAlign: 'left', marginBottom: 10 }}>Timer Settings</div>
            
            {/* Custom Range Inputs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20, textAlign: 'left' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Focus Duration</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: MODE_COLORS.work }}>{settings.work}m</span>
                </div>
                <input 
                  type="range" min="1" max="120" step="1" 
                  value={settings.work} 
                  onChange={(e) => updateSettings({ ...settings, work: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: MODE_COLORS.work }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Short Break</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: MODE_COLORS.shortBreak }}>{settings.shortBreak}m</span>
                </div>
                <input 
                  type="range" min="1" max="30" step="1" 
                  value={settings.shortBreak} 
                  onChange={(e) => updateSettings({ ...settings, shortBreak: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: MODE_COLORS.shortBreak }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>Long Break</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: MODE_COLORS.longBreak }}>{settings.longBreak}m</span>
                </div>
                <input 
                  type="range" min="5" max="60" step="1" 
                  value={settings.longBreak} 
                  onChange={(e) => updateSettings({ ...settings, longBreak: parseInt(e.target.value) })}
                  style={{ width: '100%', accentColor: MODE_COLORS.longBreak }}
                />
              </div>
            </div>

            <div className="card-title" style={{ textAlign: 'left', marginBottom: 10, fontSize: 11, opacity: 0.7 }}>Presets</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(POMODORO_PRESETS).map(([key, preset]) => (
                <button
                  key={key}
                  className="btn btn-ghost"
                  style={{ justifyContent: 'space-between', padding: '10px 14px', background: settings.work === preset.work ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                  onClick={() => updateSettings({ work: preset.work, shortBreak: preset.shortBreak, longBreak: preset.longBreak })}
                >
                  <span>{preset.label}</span>
                  <span style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>
                    {settings.work === preset.work ? '✓ Active' : ''}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Current Task Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {suggestion ? (
            <div className="suggestion-card">
              <div className="suggestion-label">📌 Current Task</div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12,
                background: `${suggestion.subject.color}15`, borderRadius: 12, padding: 14, border: `1px solid ${suggestion.subject.color}33`
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 14, background: `${suggestion.subject.color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22
                }}>{suggestion.subject.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: suggestion.subject.color }}>{suggestion.subject.shortName}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{suggestion.daysLeft} days to exam</div>
                </div>
              </div>
              <div className="suggestion-topic">{suggestion.topic.title}</div>
              <div className="suggestion-subject">Estimated: {suggestion.topic.estimatedHours}h · {suggestion.topic.difficulty}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  onClick={() => updateTopicStatus(suggestion.subject.id, suggestion.topic.id, 'in-progress')}
                >
                  ▶ Mark In Progress
                </button>
                <button
                  className="btn btn-ghost"
                  style={{ background: 'var(--success-soft)', borderColor: 'var(--success)', color: 'var(--success)' }}
                  onClick={() => updateTopicStatus(suggestion.subject.id, suggestion.topic.id, 'completed')}
                >
                  ✓ Done
                </button>
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' }}>All caught up!</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>You've completed all topics.</div>
            </div>
          )}

          {/* Focus Tips */}
          <div className="card">
            <div className="card-title">💡 Focus Tips</div>
            {[
              { icon: '📵', tip: 'Put your phone in another room' },
              { icon: '🎵', tip: 'Try lo-fi music or white noise' },
              { icon: '💧', tip: 'Keep water on your desk' },
              { icon: '📝', tip: 'Write your goal before starting' },
              { icon: '🪟', tip: 'Study near natural light if possible' },
            ].map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
                <span style={{ fontSize: 18 }}>{t.icon}</span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.tip}</span>
              </div>
            ))}
          </div>

          {/* Manual Hours Logger */}
          <div className="card">
            <div className="card-title">📊 Log Study Time</div>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
              Manually log hours studied (in addition to Pomodoro sessions)
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[0.5, 1, 1.5, 2].map(h => (
                <button
                  key={h}
                  className="btn btn-ghost"
                  style={{ flex: 1 }}
                  onClick={() => addStudyHours(h)}
                >
                  +{h}h
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
