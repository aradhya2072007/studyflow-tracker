import React, { useState } from 'react';
import { EXAMS } from '../data/studyData';

const EXAM_DATES = new Set(EXAMS.map(e => e.date));

function getExamForDate(dateStr) {
  return EXAMS.find(e => e.date === dateStr);
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarView({ subjects }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = today.toISOString().split('T')[0];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">📅 Calendar View</h1>
          <p className="page-subtitle">Exam dates and study sessions at a glance</p>
        </div>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Calendar */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={prevMonth}>←</button>
            <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text-primary)' }}>
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <button className="btn btn-ghost" style={{ padding: '8px 12px' }} onClick={nextMonth}>→</button>
          </div>

          <div className="calendar-grid">
            {WEEKDAYS.map(d => <div key={d} className="cal-header">{d}</div>)}
            {days.map((day, idx) => {
              if (!day) return <div key={`e-${idx}`} />;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const exam = getExamForDate(dateStr);
              const isToday = dateStr === todayStr;

              return (
                <div
                  key={dateStr}
                  className={`cal-day ${isToday ? 'today' : ''} ${exam ? 'has-exam' : ''}`}
                  style={exam ? { background: exam.color, borderColor: exam.color } : {}}
                  title={exam ? exam.name : ''}
                >
                  <span>{day}</span>
                  {exam && <div className="cal-exam-dot" style={{ background: 'white' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Exam Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="card-title" style={{ marginBottom: 4 }}>📋 Exam Schedule</div>
          {EXAMS.map(exam => {
            const examDate = new Date(exam.date);
            const daysLeft = Math.ceil((examDate - today) / (1000 * 60 * 60 * 24));
            const isPast = daysLeft < 0;
            const isUrgent = daysLeft >= 0 && daysLeft <= 3;

            return (
              <div key={exam.id} className="card fade-in" style={{
                border: isUrgent ? `1px solid ${exam.color}` : undefined,
                background: isUrgent ? `${exam.color}0d` : undefined,
              }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, background: `${exam.color}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0
                  }}>{exam.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{exam.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      📅 {examDate.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>⏰ {exam.time}</div>
                  </div>
                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: isPast ? 'var(--success)' : isUrgent ? 'var(--danger)' : exam.color }}>
                      {isPast ? '✓' : daysLeft}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
                      {isPast ? 'DONE' : 'DAYS'}
                    </div>
                  </div>
                </div>
                {isUrgent && !isPast && (
                  <div style={{ marginTop: 10, padding: '8px 12px', background: 'var(--danger-soft)', borderRadius: 8, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
                    ⚠️ Exam in {daysLeft} day{daysLeft !== 1 ? 's' : ''}! Switch to revision mode.
                  </div>
                )}
              </div>
            );
          })}

          {/* Legend */}
          <div className="card">
            <div className="card-title">Legend</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {EXAMS.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 4, background: e.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{e.shortName} Exam</span>
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 14, height: 14, borderRadius: 4, background: 'var(--accent-soft)', border: '1px solid var(--accent)', flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
