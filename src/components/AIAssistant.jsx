import React, { useState } from 'react';
import { STUDY_ORDER } from '../data/studyData';

const TOPIC_SUMMARIES = {
  'maths-1': 'Counting: multiplication principle, permutations nPr = n!/(n-r)!, combinations nCr = n!/(r!(n-r)!). Key: order matters in permutations, not in combinations.',
  'maths-2': 'Conditional probability P(A|B) = P(A∩B)/P(B). Bayes: P(A|B) = P(B|A)·P(A)/P(B). Used for updating beliefs with new evidence.',
  'maths-3': 'PMF: P(X=x) for discrete. PDF: f(x) for continuous, integrate to get probability. CDF: F(x) = P(X≤x). All probabilities must sum/integrate to 1.',
  'maths-4': 'E[X] = Σx·P(x). Var(X) = E[X²] - (E[X])². SD = √Var. Linearity: E[aX+b] = aE[X]+b.',
  'maths-5': 'Bernoulli: single trial, p=success. Binomial: n independent Bernoulli trials, P(X=k) = C(n,k)p^k(1-p)^(n-k). E=np, Var=np(1-p).',
  'maths-6': 'Poisson: P(X=k) = λ^k·e^-λ/k!, E=Var=λ. Geometric: P(X=k) = (1-p)^(k-1)·p, models waiting time to first success.',
  'maths-7': 'Normal: bell curve, N(μ,σ²). 68-95-99.7 rule. Exponential: P(X>x) = e^(-λx), memoryless property.',
  'maths-8': 'CLT: X̄ → N(μ, σ²/n) as n→∞. Sample mean, variance, standard error = σ/√n. Foundation of statistical inference.',
  'ai-1': 'AI = simulation of human intelligence. LLMs = transformers trained on massive text data. Key concepts: tokens, context window, temperature.',
  'ai-2': 'RCIO: Role, Context, Instruction, Output. Good prompts = specific, contextual, clear format. Chain-of-thought improves reasoning.',
  'ai-3': 'Agents = AI that can take actions. Workflows = sequence of AI + tool calls. ReAct pattern: Reason → Act → Observe loop.',
  'ai-4': 'APIs: REST endpoints, JSON responses, authentication tokens. HuggingFace: model hub, Inference API, transformers library.',
  'ai-5': 'RAG: Retrieve relevant docs → Augment prompt → Generate response. Reduces hallucinations. Needs vector DB + embedding model.',
  'ai-6': 'HITL: human verifies/corrects AI decisions at key steps. Critical for high-stakes tasks. Reduces errors, builds trust.',
  'dsa-1': 'if/elif/else for branching. for loops iterate sequences. while loops repeat until condition false. break/continue control flow.',
  'dsa-2': 'Nested loops = loop inside loop. Time: O(n²) typically. Use for matrix ops, pattern printing, comparing all pairs.',
  'dsa-3': 'Lists: dynamic arrays, indexing O(1), append O(1). Strings: immutable sequences. Slicing: lst[start:stop:step].',
  'dsa-4': 'Brute force = try all possibilities. O(n²) or worse. Time complexity: O(1)<O(log n)<O(n)<O(n log n)<O(n²)<O(2ⁿ).',
  'dsa-5': 'Bubble: O(n²). Selection: O(n²). Insertion: O(n²) worst, O(n) best. QuickSort: O(n log n) avg. Know which is stable.',
  'dsa-6': 'Requires SORTED array. Compare mid, go left if smaller, right if bigger. O(log n). Template: lo=0, hi=n-1, mid=(lo+hi)//2.',
  'dsa-7': 'Base case + recursive call. Call stack builds up. Common: factorial, fibonacci, tree traversal. Beware stack overflow.',
  'dsa-8': 'Classes, objects, inheritance, encapsulation, polymorphism. __init__, self. Method overriding. Abstract classes.',
  'dsa-9': 'Stack: LIFO, push/pop O(1). Queue: FIFO, enqueue/dequeue O(1). Stack apps: undo, parentheses. Queue apps: BFS, scheduling.',
  'dsa-10': 'Divide array in half, sort each, merge. O(n log n) always. Stable sort. Extra O(n) space. Key: two-pointer merge step.',
  'dsa-11': 'Nodes with next pointer. Head pointer. Insert/delete O(1) with pointer. Traverse O(n). No random access. Doubly: prev+next.',
  'dsa-12': 'Nodes with left/right child. BST: left<root<right, search O(log n) avg. Traversals: inorder(sorted), preorder, postorder.',
  'wap-1': 'Types: string, number, boolean, null, undefined, object, symbol. Operators: +,-,*,/,%, ==, ===, &&, ||, !.',
  'wap-2': 'function declaration vs expression vs arrow. Scope: var(function), let/const(block). Closures = function + outer scope.',
  'wap-3': 'Arrays: push, pop, slice, splice, map, filter, reduce. Objects: key-value pairs, dot/bracket notation, destructuring.',
  'wap-4': 'HOFs take/return functions. map(), filter(), reduce(). Functional programming style. Compose, curry.',
  'wap-5': 'JS is single-threaded. Async avoids blocking. Promises: pending/fulfilled/rejected. async/await syntax. fetch() returns Promise.',
  'wap-6': 'JSX = JS + XML. Components = functions returning JSX. Props = read-only inputs. One root element or Fragment.',
  'wap-7': 'useState: local state. useEffect: side effects, runs after render. Props flow down. Events: onClick, onChange. Controlled components.',
};

function WeakAreaCard({ area }) {
  const urgency = area.daysLeft <= 3 ? 'danger' : area.daysLeft <= 7 ? 'warning' : 'green';
  const colors = { danger: 'var(--danger)', warning: 'var(--warning)', green: 'var(--success)' };

  return (
    <div className="card fade-in" style={{ border: `1px solid ${colors[urgency]}33`, background: `${colors[urgency]}08` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, background: `${area.subject.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18
        }}>{area.subject.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: area.subject.color }}>{area.subject.shortName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {area.notStartedCount} not started · {area.inProgressCount} in progress
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: colors[urgency] }}>{area.daysLeft}</div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>DAYS</div>
        </div>
      </div>
    </div>
  );
}

export default function AIAssistant({ subjects, getWeakAreas, getDaysUntilExam, getSubjectProgress }) {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [summary, setSummary] = useState('');
  const [activeTab, setActiveTab] = useState('weakAreas');
  const weakAreas = getWeakAreas();

  const handleGetSummary = () => {
    if (!selectedTopic) return;
    const text = TOPIC_SUMMARIES[selectedTopic] || 'Summary not available for this topic yet. Focus on your textbook and notes!';
    setSummary(text);
  };

  const allTopics = Object.values(subjects).flatMap(s =>
    s.topics.map(t => ({ ...t, subjectName: s.shortName, subjectId: s.id, subjectColor: s.color }))
  );

  const revisableTopics = Object.values(subjects).flatMap(s => {
    const daysLeft = getDaysUntilExam(s.id);
    if (daysLeft > 5) return [];
    return s.topics.filter(t => t.status === 'completed').map(t => ({ ...t, subjectName: s.shortName, daysLeft }));
  });

  return (
    <div className="fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">✨ AI Assistant</h1>
          <p className="page-subtitle">Smart insights, topic summaries & revision suggestions</p>
        </div>
        <div className="tabs">
          {[['weakAreas','🔍 Weak Areas'], ['summaries','📝 Summaries'], ['revision','🔄 Revision']].map(([id,label]) => (
            <button key={id} className={`tab-btn ${activeTab === id ? 'active' : ''}`} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>
      </div>

      {activeTab === 'weakAreas' && (
        <div className="fade-in">
          <div className="ai-card" style={{ marginBottom: 20 }}>
            <div className="ai-tag">✨ AI Analysis</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>
              Subjects Needing Attention
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Based on exam proximity and topic completion, here are your priority areas. Focus on these first to maximize your score.
            </div>
          </div>
          {weakAreas.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>No weak areas detected!</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>All subjects look great. Keep it up!</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {weakAreas.map((area, i) => <WeakAreaCard key={i} area={area} />)}
            </div>
          )}

          {/* Smart Warnings */}
          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-title">🧠 Smart Recommendations</div>
            {STUDY_ORDER.map(sid => {
              const s = subjects[sid];
              const days = getDaysUntilExam(sid);
              const progress = getSubjectProgress(sid);
              const pending = s.topics.filter(t => t.status !== 'completed').length;

              let msg = '';
              if (days <= 2 && progress < 80) msg = `⚠️ Critical: Only ${days} day(s) left for ${s.shortName}! Switch to full revision mode immediately.`;
              else if (days <= 5 && pending > 3) msg = `📌 ${s.shortName} has ${pending} topics left with ${days} days — study 2+ topics/day.`;
              else if (progress === 100) msg = `✅ ${s.shortName} is complete! Use remaining time for revision.`;
              else msg = `📚 ${s.shortName}: ${pending} topics pending. ${days} days available — on track.`;

              return (
                <div key={sid} style={{ padding: '10px 0', borderBottom: sid !== 'wap' ? '1px solid var(--border)' : 'none', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {msg}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'summaries' && (
        <div className="fade-in">
          <div className="ai-card" style={{ marginBottom: 20 }}>
            <div className="ai-tag">✨ Quick Summary</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Generate Topic Summary</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Select a topic to get a concise summary for quick revision.</div>
          </div>
          <div className="card">
            <div className="card-title">Select Topic</div>
            <select
              value={selectedTopic}
              onChange={e => { setSelectedTopic(e.target.value); setSummary(''); }}
              style={{
                width: '100%', padding: '12px 14px', background: 'var(--bg-secondary)',
                color: 'var(--text-primary)', border: '1px solid var(--border)', borderRadius: 10,
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 12,
              }}
            >
              <option value="">-- Choose a topic --</option>
              {Object.values(subjects).map(s => (
                <optgroup key={s.id} label={`${s.icon} ${s.shortName}`}>
                  {s.topics.map(t => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleGetSummary} disabled={!selectedTopic} style={{ width: '100%' }}>
              ✨ Generate Summary
            </button>
            {summary && (
              <div style={{
                marginTop: 16, padding: 16, background: 'var(--accent-soft)', border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: 12, fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.7,
              }}>
                <div style={{ fontWeight: 700, marginBottom: 8, color: 'var(--accent)' }}>📋 Summary</div>
                {summary}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'revision' && (
        <div className="fade-in">
          <div className="ai-card" style={{ marginBottom: 20 }}>
            <div className="ai-tag">✨ Revision Mode</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8, color: 'var(--text-primary)' }}>Topics to Revise</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Completed topics for upcoming exams that you should revise now.</div>
          </div>
          {revisableTopics.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📚</div>
              <div style={{ fontWeight: 700, fontSize: 18 }}>No revision topics yet</div>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Complete some topics first, then come back to revise them before your exams.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {revisableTopics.map((t, i) => (
                <div key={i} className="card fade-in" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{ fontSize: 20 }}>🔄</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>{t.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t.subjectName} · {t.daysLeft} days to exam</div>
                  </div>
                  <span className="badge badge-purple">Revise</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
