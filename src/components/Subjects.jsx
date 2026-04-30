import React, { useState } from 'react';

const STATUS_CYCLE = { 'not-started': 'in-progress', 'in-progress': 'completed', 'completed': 'not-started' };
const STATUS_ICON = { 'not-started': '', 'in-progress': '◐', 'completed': '✓' };
const STATUS_LABEL = { 'not-started': 'Not Started', 'in-progress': 'In Progress', 'completed': 'Completed' };

function TopicRow({ topic, color, onStatusChange }) {
  return (
    <div className={`topic-item ${topic.status}`}>
      <button
        className={`topic-status-btn ${topic.status}`}
        style={topic.status === 'in-progress' ? { borderColor: 'var(--warning)' } : {}}
        onClick={() => onStatusChange(topic.id, STATUS_CYCLE[topic.status])}
        title={`Click to mark as ${STATUS_CYCLE[topic.status]}`}
      >
        {STATUS_ICON[topic.status]}
      </button>
      <span className="topic-title" style={{ textDecoration: topic.status === 'completed' ? 'line-through' : 'none' }}>
        {topic.title}
      </span>
      <span className={`topic-difficulty difficulty-${topic.difficulty.toLowerCase()}`}>
        {topic.difficulty}
      </span>
      <span style={{ fontSize: 12, color: 'var(--text-muted)', minWidth: 36, textAlign: 'right' }}>
        {topic.estimatedHours}h
      </span>
      <select
        value={topic.status}
        onChange={e => onStatusChange(topic.id, e.target.value)}
        style={{
          background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border)',
          borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <option value="not-started">Not Started</option>
        <option value="in-progress">In Progress</option>
        <option value="completed">Completed</option>
      </select>
    </div>
  );
}

function SubjectPanel({ subject, progress, updateTopicStatus }) {
  const [expanded, setExpanded] = useState(true);
  const completed = subject.topics.filter(t => t.status === 'completed').length;
  const inProgress = subject.topics.filter(t => t.status === 'in-progress').length;
  const notStarted = subject.topics.filter(t => t.status === 'not-started').length;

  return (
    <div className="subject-card fade-in" style={{ marginBottom: 16 }}>
      <div className="subject-card-header" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div className="subject-icon-wrap" style={{ background: `${subject.color}22`, color: subject.color }}>
          {subject.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div className="subject-name">{subject.name}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <span className={`badge ${subject.priority === 'High' ? 'badge-red' : 'badge-yellow'}`}>
              {subject.priority} Priority
            </span>
            <span className="badge badge-green">✓ {completed}</span>
            {inProgress > 0 && <span className="badge badge-yellow">◐ {inProgress}</span>}
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>○ {notStarted} left</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: subject.color }}>{progress}%</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{expanded ? '▾' : '▸'}</div>
        </div>
      </div>

      <div className="subject-card-body" style={{ paddingTop: 0 }}>
        <div className="progress-bar-wrap" style={{ marginBottom: expanded ? 16 : 0 }}>
          <div className="progress-bar-fill" style={{ width: `${progress}%`, background: subject.gradient || subject.color }} />
        </div>

        {expanded && subject.topics.map(topic => (
          <TopicRow
            key={topic.id}
            topic={topic}
            color={subject.color}
            onStatusChange={(tid, status) => updateTopicStatus(subject.id, tid, status)}
          />
        ))}
      </div>
    </div>
  );
}

export default function Subjects({ subjects, getSubjectProgress, updateTopicStatus }) {
  const [filter, setFilter] = useState('all');

  const filteredSubjects = Object.values(subjects).filter(s => {
    if (filter === 'all') return true;
    if (filter === 'pending') return getSubjectProgress(s.id) < 100;
    if (filter === 'completed') return getSubjectProgress(s.id) === 100;
    return true;
  });

  const totalTopics = Object.values(subjects).reduce((sum, s) => sum + s.topics.length, 0);
  const doneTopics = Object.values(subjects).reduce((sum, s) => sum + s.topics.filter(t => t.status === 'completed').length, 0);

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📚 Subjects & Topics</h1>
          <p className="page-subtitle">{doneTopics} / {totalTopics} topics completed · Click status to cycle through states</p>
        </div>
        <div className="tabs">
          {['all', 'pending', 'completed'].map(f => (
            <button key={f} className={`tab-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filteredSubjects.map(subject => (
        <SubjectPanel
          key={subject.id}
          subject={subject}
          progress={getSubjectProgress(subject.id)}
          updateTopicStatus={updateTopicStatus}
        />
      ))}
    </div>
  );
}
