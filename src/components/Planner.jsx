import React, { useState } from 'react';
import { EXAMS, STUDY_PHASES, DAILY_SCHEDULE, SUBJECTS } from '../data/studyData';

// DSA topics ordered by difficulty (easy → medium → hard)
const DSA_ORDERED = [
  'dsa-1','dsa-2','dsa-3','dsa-4','dsa-5','dsa-6','dsa-7','dsa-8','dsa-9','dsa-10','dsa-11','dsa-12'
];

// Maths topics in order
const MATHS_ORDERED = [
  'maths-1','maths-2','maths-3','maths-4','maths-5','maths-6','maths-7','maths-8'
];

// Generate phase-aware daily plan (DSA-first, unique topics per day)
function generateSmartPlan(subjects) {
  const today = new Date();
  const plans = [];

  // Get pending topics per subject
  const pending = {
    dsa: DSA_ORDERED.map(id => subjects.dsa?.topics.find(t => t.id === id)).filter(t => t && t.status !== 'completed'),
    maths: MATHS_ORDERED.map(id => subjects.maths?.topics.find(t => t.id === id)).filter(t => t && t.status !== 'completed'),
    ai: (subjects.ai?.topics || []).filter(t => t.status !== 'completed'),
    wap: (subjects.wap?.topics || []).filter(t => t.status !== 'completed'),
  };

  let dsaIdx = 0;
  let mathsIdx = 0;
  let aiIdx = 0;
  let wapIdx = 0;

  for (let dayOffset = 0; dayOffset < 15; dayOffset++) {
    const date = new Date(today);
    date.setDate(today.getDate() + dayOffset);
    const dateStr = date.toISOString().split('T')[0];
    const dayLabel = date.toLocaleDateString('en', { weekday: 'long', month: 'short', day: 'numeric' });
    const isToday = dayOffset === 0;

    const examDate = EXAMS.find(e => e.date === dateStr);
    if (examDate) {
      plans.push({ date: dateStr, dayLabel, isToday, isExamDay: true, exam: examDate, sessions: [] });
      continue;
    }

    const sessions = [];

    // Determine phase for this date
    const phase = STUDY_PHASES.find(p => dateStr >= p.dateRange[0] && dateStr <= p.dateRange[1]);

    // Phase 1 (Apr 30 – May 5): DSA morning + Maths afternoon
    if (!phase || phase.id === 'phase1') {
      // DSA: 2 topics per day
      const dsaToday = [];
      for (let i = 0; i < 2 && dsaIdx < pending.dsa.length; i++) {
        dsaToday.push(pending.dsa[dsaIdx++]);
      }
      if (dsaToday.length > 0) {
        sessions.push({ subject: subjects.dsa, topics: dsaToday, block: '11:30 AM – 3:00 PM', blockLabel: '🔒 DSA Deep Work', hours: 4.5, locked: true });
      }
      // Maths: 1–2 topics
      const mathsToday = [];
      for (let i = 0; i < 2 && mathsIdx < pending.maths.length; i++) {
        mathsToday.push(pending.maths[mathsIdx++]);
      }
      if (mathsToday.length > 0) {
        sessions.push({ subject: subjects.maths, topics: mathsToday, block: '4:00 PM – 8:00 PM', blockLabel: 'Maths Focus', hours: 4 });
      }
    }

    // Phase 2 (May 7): AI intensive
    else if (phase.id === 'phase2') {
      const aiToday = [];
      for (let i = 0; i < 4 && aiIdx < pending.ai.length; i++) {
        aiToday.push(pending.ai[aiIdx++]);
      }
      if (aiToday.length > 0) {
        sessions.push({ subject: subjects.ai, topics: aiToday, block: 'All Day', blockLabel: '🤖 AI Intensive', hours: 8 });
      }
    }

    // Phase 3 (May 9–11): DSA intensive
    else if (phase.id === 'phase3') {
      const dsaToday = [];
      for (let i = 0; i < 2 && dsaIdx < pending.dsa.length; i++) {
        dsaToday.push(pending.dsa[dsaIdx++]);
      }
      if (dsaToday.length > 0) {
        sessions.push({ subject: subjects.dsa, topics: dsaToday, block: '11:30 AM – 4:00 PM', blockLabel: '🔒 DSA Intensive', hours: 4.5, locked: true });
      }
      // Remaining DSA revision
      sessions.push({ subject: subjects.dsa, topics: [], block: '4:00 PM – 7:00 PM', blockLabel: 'DSA Practice Problems', hours: 3, isPractice: true });
    }

    // Phase 4 (May 13): WAP
    else if (phase.id === 'phase4') {
      const wapToday = [];
      for (let i = 0; i < 4 && wapIdx < pending.wap.length; i++) {
        wapToday.push(pending.wap[wapIdx++]);
      }
      if (wapToday.length > 0) {
        sessions.push({ subject: subjects.wap, topics: wapToday, block: 'All Day', blockLabel: '🌐 WAP Quick Prep', hours: 8 });
      }
    }

    // Gap days (May 6 revision, May 12 revision)
    else {
      sessions.push({ subject: subjects.dsa, topics: [], block: 'All Day', blockLabel: '📖 Light Revision Only', hours: 3, isPractice: true });
    }

    plans.push({ date: dateStr, dayLabel, isToday, isExamDay: false, sessions });
  }
  return plans;
}

function SessionBlock({ session, updateTopicStatus }) {
  const s = session.subject;
  if (!s) return null;
  return (
    <div style={{
      borderRadius: 14, marginBottom: 10, overflow: 'hidden',
      border: `1.5px solid ${session.locked ? `${s.color}55` : `${s.color}22`}`,
      background: session.locked ? `${s.color}0d` : `${s.color}06`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: session.topics.length > 0 ? `1px solid ${s.color}18` : 'none' }}>
        <span style={{ fontSize: 16 }}>{s.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: s.color }}>{session.blockLabel}</div>
          <div style={{ fontSize: 11, color: 'var(--text3)' }}>{session.block} · {session.hours}h</div>
        </div>
        {session.locked && <span style={{ fontSize: 10, fontWeight: 800, color: s.color, background: `${s.color}20`, padding: '2px 8px', borderRadius: 5, textTransform: 'uppercase' }}>Locked</span>}
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>{session.hours}h</span>
      </div>
      {session.isPractice && (
        <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' }}>
          Practice problems, past questions, revision exercises
        </div>
      )}
      {session.topics.map(topic => (
        <div key={topic.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: `1px solid ${s.color}10` }}>
          <button
            onClick={() => updateTopicStatus(s.id, topic.id, topic.status === 'completed' ? 'not-started' : topic.status === 'not-started' ? 'in-progress' : 'completed')}
            style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${topic.status === 'completed' ? '#059669' : s.color}`, background: topic.status === 'completed' ? '#059669' : topic.status === 'in-progress' ? `${s.color}30` : 'transparent', color: topic.status === 'completed' ? 'white' : s.color, cursor: 'pointer', flexShrink: 0, fontSize: 10, fontWeight: 700 }}>
            {topic.status === 'completed' ? '✓' : topic.status === 'in-progress' ? '◐' : ''}
          </button>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text)', textDecoration: topic.status === 'completed' ? 'line-through' : 'none', opacity: topic.status === 'completed' ? .55 : 1 }}>
            {topic.title}
          </span>
          <span className={`badge difficulty-${topic.difficulty?.toLowerCase()}`}>{topic.difficulty}</span>
          <span style={{ fontSize: 11, color: 'var(--text3)', minWidth: 28, textAlign: 'right' }}>{topic.estimatedHours}h</span>
        </div>
      ))}
    </div>
  );
}

function DayCard({ plan, isExpanded, onToggle, updateTopicStatus }) {
  const totalHours = plan.sessions.reduce((s, x) => s + x.hours, 0);
  if (plan.isExamDay) {
    return (
      <div style={{ marginBottom: 10, borderRadius: 16, padding: '14px 18px', background: `${plan.exam.color}12`, border: `2px solid ${plan.exam.color}44`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 24 }}>🎓</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: plan.exam.color }}>{plan.exam.shortName} EXAM DAY</div>
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>{plan.dayLabel} · {plan.exam.time}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ marginBottom: 10, borderRadius: 18, overflow: 'hidden', border: plan.isToday ? '2px solid rgba(124,58,237,.5)' : '1px solid var(--border)', background: plan.isToday ? 'rgba(124,58,237,.05)' : 'var(--glass)', backdropFilter: 'blur(12px)', boxShadow: plan.isToday ? '0 4px 24px rgba(124,58,237,.15)' : 'var(--shadow)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', cursor: 'pointer' }} onClick={onToggle}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {plan.isToday && <span style={{ fontSize: 10, fontWeight: 800, background: 'var(--accent)', color: 'white', padding: '2px 8px', borderRadius: 6 }}>TODAY</span>}
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text)' }}>{plan.dayLabel}</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 3 }}>
            {plan.sessions.length} block{plan.sessions.length !== 1 ? 's' : ''} · {totalHours}h planned
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {plan.sessions.map((s, i) => s.subject && (
            <span key={i} style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: `${s.subject.color}18`, color: s.subject.color }}>
              {s.subject.shortName}
            </span>
          ))}
        </div>
        <span style={{ color: 'var(--text3)', fontSize: 18, marginLeft: 4 }}>{isExpanded ? '▾' : '▸'}</span>
      </div>
      {isExpanded && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ height: 12 }} />
          {plan.sessions.map((session, i) => <SessionBlock key={i} session={session} updateTopicStatus={updateTopicStatus} />)}
        </div>
      )}
    </div>
  );
}

export default function Planner({ subjects, updateTopicStatus, getDaysUntilExam }) {
  const [expandedDay, setExpandedDay] = useState(0);
  const [view, setView] = useState('plan');
  const plans = generateSmartPlan(subjects);

  const dsaTotal = subjects.dsa?.topics.length || 1;
  const dsaDone = subjects.dsa?.topics.filter(t => t.status === 'completed').length || 0;
  const dsaGap = dsaTotal - dsaDone;

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Smart Study Engine</h1>
          <p className="page-subtitle">DSA-first · Unique topics each day · Phase-locked schedule</p>
        </div>
        <div className="tabs">
          {[['plan', '📅 Day-by-Day'], ['schedule', '⏰ Daily Blocks'], ['phases', '🗺️ Phases']].map(([id, label]) => (
            <button key={id} className={`tab-btn ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>{label}</button>
          ))}
        </div>
      </div>

      {/* Coach Banner */}
      <div style={{ background: 'linear-gradient(135deg,rgba(220,38,38,.12),rgba(124,58,237,.08))', border: '1.5px solid rgba(220,38,38,.3)', borderRadius: 16, padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <span style={{ fontSize: 26 }}>🏋️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text)' }}>Coach Mode · DSA is Priority #1 · Unique Topics Daily</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3 }}>
            DSA: {dsaDone}/{dsaTotal} done · {dsaGap} topics remaining · Maths exam in {getDaysUntilExam('maths')} days
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {['dsa','maths','ai','wap'].map((sid, i) => {
            const s = subjects[sid];
            const done = s?.topics.filter(t => t.status === 'completed').length || 0;
            const total = s?.topics.length || 1;
            const pct = Math.round(done/total*100);
            return (
              <div key={sid} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: s?.color }}>{pct}%</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 600 }}>{s?.shortName}</div>
              </div>
            );
          })}
        </div>
      </div>

      {view === 'plan' && (
        <div className="fade-in">
          {plans.map((plan, i) => (
            <DayCard key={plan.date} plan={plan} isExpanded={expandedDay === i} onToggle={() => setExpandedDay(expandedDay === i ? -1 : i)} updateTopicStatus={updateTopicStatus} />
          ))}
        </div>
      )}

      {view === 'schedule' && (
        <div className="card fade-in">
          <div className="card-title">⏰ Fixed Daily Schedule (Mon–Fri)</div>
          {DAILY_SCHEDULE.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '11px 14px', borderRadius: 12, marginBottom: 7, background: item.type === 'break' ? 'rgba(0,0,0,.04)' : item.subject === 'dsa' ? 'rgba(220,38,38,.07)' : 'rgba(124,58,237,.07)', border: `1px solid ${item.type === 'break' ? 'rgba(0,0,0,.06)' : item.subject === 'dsa' ? 'rgba(220,38,38,.2)' : 'rgba(124,58,237,.18)'}` }}>
              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--text3)', minWidth: 70 }}>{item.time}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: item.type === 'break' ? 'var(--text2)' : item.subject === 'dsa' ? '#dc2626' : '#7c3aed' }}>{item.label}</span>
              <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: item.type === 'break' ? 'rgba(0,0,0,.06)' : item.subject === 'dsa' ? 'rgba(220,38,38,.12)' : 'rgba(124,58,237,.12)', color: item.type === 'break' ? 'var(--text3)' : item.subject === 'dsa' ? '#dc2626' : '#7c3aed' }}>
                {item.type === 'break' ? 'BREAK' : item.subject?.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {view === 'phases' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {STUDY_PHASES.map(phase => (
            <div key={phase.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: phase.color }} />
                <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)' }}>{phase.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text3)', marginLeft: 'auto' }}>{new Date(phase.dateRange[0]).toLocaleDateString('en',{month:'short',day:'numeric'})} – {new Date(phase.dateRange[1]).toLocaleDateString('en',{month:'short',day:'numeric'})}</span>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {phase.focus.map(sid => <span key={sid} style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6, background: `${subjects[sid]?.color}20`, color: subjects[sid]?.color }}>🎯 {subjects[sid]?.shortName}</span>)}
                {phase.deprioritized.map(sid => <span key={sid} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, background: 'rgba(0,0,0,.05)', color: 'var(--text3)' }}>↓ {subjects[sid]?.shortName}</span>)}
              </div>
            </div>
          ))}
          {EXAMS.map(e => (
            <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 14, border: `1px solid ${e.color}33`, background: `${e.color}08` }}>
              <span style={{ fontSize: 20 }}>🎓</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: e.color }}>{e.shortName} EXAM</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{new Date(e.date).toLocaleDateString('en',{weekday:'long',month:'long',day:'numeric'})} · {e.time}</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 20, color: e.color }}>{getDaysUntilExam(e.id)}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', fontWeight: 600 }}>days</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
