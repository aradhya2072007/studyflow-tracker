import React, { useState, useRef, useEffect } from 'react';

const DEFAULT_KEY = '';

const MODES = [
  { id: 'doubt',    icon: '❓', label: 'Ask Doubt',      color: '#7c3aed', prefix: 'Answer this briefly and clearly: ' },
  { id: 'simple',   icon: '🧒', label: 'Explain Simply', color: '#059669', prefix: 'Explain this in the simplest way for a beginner, use an analogy: ' },
  { id: 'deep',     icon: '🔬', label: 'Deep Dive',      color: '#dc2626', prefix: 'Give a detailed step-by-step explanation with examples: ' },
  { id: 'practice', icon: '📝', label: 'Practice',       color: '#d97706', prefix: 'Generate 3 practice questions with answers about: ' },
];

// FOAI-specific modes
const FOAI_EXTRA = [
  { id: 'prompt',  icon: '✍️', label: 'Gen Prompt',    prefix: 'Generate an example prompt using RCIO framework for: ' },
  { id: 'usecase', icon: '🌍', label: 'Use Case',      prefix: 'Give a real-world use case with example for: ' },
  { id: 'quiz',    icon: '🧠', label: 'Test Me',       prefix: 'Quiz me on this topic with 3 MCQs and answers: ' },
];

const SYSTEM_PROMPT = (topic, subject) => {
  const isAI = subject?.toLowerCase().includes('ai') || subject === 'AI';
  return `You are a focused, concise study coach helping a student prepare for their end-semester exam.
Current subject: ${subject || 'General'}
Current topic: ${topic || 'General'}
${isAI ? '\nFor AI/FOAI topics: use simple language, real-world examples, mini exercises.' : ''}
${subject === 'DSA' ? '\nFor DSA: focus on code logic, time complexity, and step-by-step problem solving.' : ''}
${subject === 'Maths' ? '\nFor Maths: use formulas, worked examples, and memory tricks.' : ''}
Rules:
- Keep responses SHORT unless asked for deep dive
- Use bullet points and numbered lists
- Be encouraging and direct
- No unnecessary filler text`;
};

export default function FloatingAI({ currentTopic, currentSubject }) {
  const [open, setOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('openai_key') || DEFAULT_KEY);
  const [keyInput, setKeyInput] = useState('');
  const [showKeySetup, setShowKeySetup] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: `👋 Hi! I'm your ChatGPT study buddy.\n\nI can help with ${currentSubject || 'any subject'} — ask a doubt, get explanations, or practice questions!` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('doubt');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isAISubject = currentSubject === 'AI';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && !apiKey) setShowKeySetup(true);
    // Pre-save default key
    if (DEFAULT_KEY && !localStorage.getItem('openai_key')) {
      localStorage.setItem('openai_key', DEFAULT_KEY);
    }
  }, [open, apiKey]);

  const saveKey = () => {
    if (!keyInput.trim().startsWith('sk-')) {
      alert('Please enter a valid OpenAI API key (starts with sk-)');
      return;
    }
    localStorage.setItem('openai_key', keyInput.trim());
    setApiKey(keyInput.trim());
    setShowKeySetup(false);
    setMessages(prev => [...prev, { role: 'ai', text: '✅ Connected! Ask me anything about your studies.' }]);
  };

  const send = async (textOverride) => {
    const text = textOverride || input;
    if (!text.trim() || loading) return;
    if (!apiKey) { setShowKeySetup(true); return; }

    const selectedMode = MODES.find(m => m.id === mode) || MODES[0];
    const fullQuery = selectedMode.prefix + text;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT(currentTopic, currentSubject) },
            ...messages.slice(-6).map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
            { role: 'user', content: fullQuery },
          ],
          max_tokens: mode === 'deep' || mode === 'practice' ? 700 : 350,
          temperature: 0.6,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.choices?.[0]?.message?.content || 'No response.';
      setMessages(prev => [...prev, { role: 'ai', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `⚠️ Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const quickAction = (modeId, topic) => {
    setMode(modeId);
    const t = topic || currentTopic;
    if (t) {
      const m = [...MODES, ...FOAI_EXTRA].find(x => x.id === modeId);
      if (m) {
        setMessages(prev => [...prev, { role: 'user', text: `${m.icon} ${m.label}: ${t}` }]);
        setLoading(true);
        // directly call without setting input
        const fullQuery = m.prefix + t;
        if (!apiKey) { setShowKeySetup(true); setLoading(false); return; }
        fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT(currentTopic, currentSubject) },
              { role: 'user', content: fullQuery },
            ],
            max_tokens: modeId === 'deep' || modeId === 'practice' ? 700 : 400,
            temperature: 0.6,
          }),
        }).then(r => r.json()).then(data => {
          if (data.error) throw new Error(data.error.message);
          setMessages(prev => [...prev, { role: 'ai', text: data.choices?.[0]?.message?.content || '...' }]);
        }).catch(err => {
          setMessages(prev => [...prev, { role: 'ai', text: `⚠️ ${err.message}` }]);
        }).finally(() => setLoading(false));
      }
    }
  };

  const clearChat = () => setMessages([{ role: 'ai', text: `Fresh start! 🚀 What are you studying now?` }]);

  return (
    <>
      {/* Panel */}
      {open && (
        <div className="chat-panel fade-in">

          {/* Header */}
          <div className="chat-header">
            <div style={{ width: 34, height: 34, borderRadius: 10, background: 'linear-gradient(135deg,#10a37f,#1a7f64)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>ChatGPT Study Buddy</div>
              <div style={{ fontSize: 11, color: apiKey ? '#10a37f' : 'var(--warning)', fontWeight: 600 }}>
                {apiKey ? `✅ Connected · ${currentSubject || 'Ready'}` : '⚠️ API key needed'}
              </div>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text3)', padding: 4 }} onClick={clearChat} title="Clear chat">🗑</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text3)', padding: 4 }} onClick={() => setShowKeySetup(true)} title="Settings">⚙️</button>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, color: 'var(--text3)', padding: 4 }} onClick={() => setOpen(false)}>✕</button>
          </div>

          {/* API Key Setup */}
          {showKeySetup && (
            <div style={{ padding: 16, borderBottom: '1px solid var(--border)', background: 'rgba(16,163,127,.06)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: '#10a37f', marginBottom: 6 }}>🔑 Connect ChatGPT</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 }}>
                Enter your OpenAI API key. Saved locally, never sent anywhere else.
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" style={{ color: '#10a37f', marginLeft: 4, fontSize: 11 }}>Get key →</a>
              </div>
              <input
                type="password" placeholder="sk-..." value={keyInput}
                onChange={e => setKeyInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && saveKey()}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid var(--border)', background: 'rgba(255,255,255,.7)', fontSize: 13, fontFamily: 'inherit', marginBottom: 8, outline: 'none' }}
                autoFocus
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={saveKey} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10a37f,#1a7f64)', color: 'white', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>Save & Connect</button>
                {apiKey && <button onClick={() => setShowKeySetup(false)} style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13 }}>Cancel</button>}
              </div>
            </div>
          )}

          {/* Context pill */}
          {currentTopic && !showKeySetup && (
            <div style={{ padding: '6px 14px 0' }}>
              <span style={{ fontSize: 11, background: 'var(--accent-soft)', color: 'var(--accent)', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                📌 {currentSubject}: {currentTopic}
              </span>
            </div>
          )}

          {/* Mode selector */}
          {!showKeySetup && (
            <div style={{ padding: '8px 14px 0', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {MODES.map(m => (
                <button key={m.id} onClick={() => setMode(m.id)} style={{ fontSize: 11, fontWeight: 600, padding: '5px 10px', borderRadius: 8, border: `1px solid ${mode === m.id ? m.color : 'var(--border)'}`, background: mode === m.id ? `${m.color}18` : 'var(--glass2)', color: mode === m.id ? m.color : 'var(--text3)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {!showKeySetup && (
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`chat-msg ${m.role}`} style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>{m.text}</div>
              ))}
              {loading && (
                <div className="chat-msg ai thinking" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ display: 'inline-block', animation: 'fadeIn .5s ease infinite alternate' }}>●</span>
                  <span style={{ display: 'inline-block', animation: 'fadeIn .5s ease .2s infinite alternate' }}>●</span>
                  <span style={{ display: 'inline-block', animation: 'fadeIn .5s ease .4s infinite alternate' }}>●</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Quick actions for current topic */}
          {!showKeySetup && currentTopic && (
            <div style={{ padding: '4px 14px 8px', display: 'flex', gap: 5, flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
              {[...MODES, ...(isAISubject ? FOAI_EXTRA : [])].map(m => (
                <button key={m.id} onClick={() => quickAction(m.id, currentTopic)} style={{ fontSize: 11, padding: '4px 9px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--glass2)', color: 'var(--text2)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
                  onMouseOver={e => { e.target.style.background = `${m.color}15`; e.target.style.color = m.color; e.target.style.borderColor = m.color; }}
                  onMouseOut={e => { e.target.style.background = 'var(--glass2)'; e.target.style.color = 'var(--text2)'; e.target.style.borderColor = 'var(--border)'; }}>
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          {!showKeySetup && (
            <div className="chat-input-row">
              <textarea
                ref={inputRef}
                className="chat-input"
                rows={1}
                placeholder={`Ask about ${currentTopic || 'anything'}...`}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              />
              <button className="chat-send-btn" onClick={() => send()} disabled={loading}
                style={{ background: 'linear-gradient(135deg,#10a37f,#1a7f64)' }}>
                ➤
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Button */}
      <button
        className="floating-btn"
        style={{ right: 24, background: open ? '#1a7f64' : 'linear-gradient(135deg,#10a37f,#1a7f64)', color: 'white', boxShadow: '0 4px 20px rgba(16,163,127,.45)', fontSize: 22 }}
        onClick={() => setOpen(o => !o)}
        title="ChatGPT Study Buddy"
      >
        {open ? '✕' : '🤖'}
      </button>
    </>
  );
}
