import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const AI_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000';

const DEFAULT_MENU = [
  { id: 'login_issue',   label: '🔐 Login Issue' },
  { id: 'order_issue',   label: '📦 Order Problem' },
  { id: 'seller_issue',  label: '🏪 Seller Dashboard' },
  { id: 'account_issue', label: '👤 Account Problem' },
  { id: 'technical_bug', label: '🐛 Technical Bug' },
  { id: 'product_issue', label: '📦 Product Issue' },
  { id: 'general_query', label: '💬 General Question' },
  { id: 'raise_ticket',  label: '🎫 Raise Ticket' },
  { id: 'human',         label: '👨‍💼 Human Support' },
];

const AssistantWidget = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0) {
      addBot({
        type: 'menu',
        message: "Hello! 👋 Welcome to **StreamSales AI Support**.\n\nHow can I assist you today? Choose an option or type your issue:",
        menu: DEFAULT_MENU,
        showMenu: true,
      });
    }
    if (open) setUnread(0);
  }, [open]);

  const addBot = (data) => {
    setMessages(p => [...p, {
      id: Date.now() + Math.random(),
      role: 'bot',
      ...data,
      menu: data.menu || DEFAULT_MENU,
      showMenu: true, // ALWAYS show menu after bot message (Step 1)
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const addUser = (text) => {
    setMessages(p => [...p, {
      id: Date.now() + Math.random(),
      role: 'user', text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  // Step 2: Main Menu button handler
  const handleMainMenu = async () => {
    addUser('🏠 Main Menu');
    setLoading(true);
    try {
      const res = await fetch(`${AI_URL}/api/assistant/menu`);
      const data = await res.json();
      addBot(data);
    } catch {
      addBot({ type: 'menu', message: "Here's the main menu 👇", menu: DEFAULT_MENU });
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = async (opt) => {
    addUser(opt.label);
    setLoading(true);
    try {
      const res = await fetch(`${AI_URL}/api/assistant/quick-resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: opt.id, userId: user?._id || 'guest' }),
      });
      const data = await res.json();
      addBot(data);
    } catch {
      addBot({ type: 'menu', message: '⚠️ Connection issue. Please try again.', menu: DEFAULT_MENU });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    addUser(text);
    setLoading(true);
    try {
      const res = await fetch(`${AI_URL}/api/assistant/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userId: user?._id || 'guest', sessionId: `s_${Date.now()}` }),
      });
      const data = await res.json();
      addBot({ ...data, showMenu: true }); // always show menu
    } catch {
      addBot({ type: 'fallback', message: "⚠️ AI service unavailable. Please try again.", menu: DEFAULT_MENU });
    } finally {
      setLoading(false);
    }
  };

  const checkTicketResponse = async (ticketId) => {
    setLoading(true);
    try {
      const res = await fetch(`${AI_URL}/api/assistant/check-response`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, userId: user?._id || 'guest' }),
      });
      const data = await res.json();
      addBot({ ...data, showMenu: true });
    } catch {
      addBot({ type: 'waiting', message: 'Could not check. Please try again.', menu: DEFAULT_MENU });
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([]);
    setInput('');
    setTimeout(() => addBot({
      type: 'menu',
      message: "Hello! 👋 How can I help you today?",
      menu: DEFAULT_MENU,
    }), 50);
  };

  const bold = (text) =>
    text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });

  const getTypeColor = (type) => {
    switch (type) {
      case 'human_escalation': return { border: 'rgba(245,158,11,0.3)', bg: 'rgba(245,158,11,0.06)', dot: '#f59e0b' };
      case 'flow': return { border: 'rgba(59,130,246,0.3)', bg: 'rgba(59,130,246,0.06)', dot: '#3b82f6' };
      case 'ai_response': return { border: 'rgba(34,197,94,0.3)', bg: 'rgba(34,197,94,0.06)', dot: '#22c55e' };
      default: return { border: 'var(--color-border)', bg: 'var(--color-surface-raised)', dot: 'var(--color-primary)' };
    }
  };

  const S = {
    btn: { position: 'fixed', bottom: 24, right: 24, zIndex: 9999, width: 56, height: 56, borderRadius: '50%', background: 'var(--color-primary)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 4px 20px rgba(255,78,26,0.5)', transition: 'transform .2s, box-shadow .2s' },
    badge: { position: 'absolute', top: -4, right: -4, background: '#ef4444', color: '#fff', borderRadius: '50%', width: 20, height: 20, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--color-bg)' },
    popup: { position: 'fixed', bottom: 92, right: 24, zIndex: 9998, width: 385, height: 600, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden', animation: 'fadeIn .2s ease' },
    header: { padding: '12px 14px', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
    msgs: { flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 },
    botBubble: (type) => ({ maxWidth: '92%', alignSelf: 'flex-start', background: getTypeColor(type).bg, border: `1px solid ${getTypeColor(type).border}`, borderRadius: '4px 14px 14px 14px', padding: '10px 13px', fontSize: 13, lineHeight: 1.6 }),
    userBubble: { maxWidth: '80%', alignSelf: 'flex-end', background: 'var(--color-primary)', borderRadius: '14px 4px 14px 14px', padding: '9px 13px', fontSize: 13, lineHeight: 1.6, color: '#fff' },
    typeTag: (type, color) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: color.dot, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }),
    menuGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, width: '100%', marginTop: 6 },
    menuBtn: { padding: '6px 10px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: 11, fontWeight: 500, cursor: 'pointer', textAlign: 'left', transition: 'all .15s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    mainMenuBtn: { width: '100%', marginTop: 6, padding: '7px', background: 'var(--color-primary-bg)', border: '1px solid rgba(255,78,26,0.3)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 },
    inputRow: { display: 'flex', gap: 6, padding: '9px 11px', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 },
    textarea: { flex: 1, padding: '8px 11px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: 13, outline: 'none', resize: 'none' },
    sendBtn: { padding: '8px 13px', background: loading ? 'var(--color-surface-raised)' : 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    explainCard: { background: 'rgba(255,78,26,0.05)', border: '1px solid rgba(255,78,26,0.15)', borderRadius: 'var(--radius-md)', padding: '8px 10px', fontSize: 11, marginTop: 6 },
    checkBtn: { width: '100%', marginTop: 6, padding: '7px', background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 'var(--radius-md)', color: '#3b82f6', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 },
  };

  const TYPE_LABELS = {
    'ai_response': '✅ AI Response',
    'human_escalation': '👨‍💼 Human Support',
    'flow': '📋 Guide',
    'menu': '📋 Menu',
    'goodbye': '👋 Goodbye',
    'waiting': '⏳ Status',
    'human_response': '👨‍💼 Agent Reply',
    'fallback': '🤔 Clarification',
  };

  return (
    <>
      {/* Floating button */}
      <button style={S.btn} onClick={() => setOpen(!open)} title="AI Support"
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,78,26,.7)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,78,26,.5)'; }}
      >
        {open ? '✕' : '🤖'}
        {!open && unread > 0 && <span style={S.badge}>{unread}</span>}
      </button>

      {open && (
        <div style={S.popup}>
          {/* Header */}
          <div style={S.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'rgba(255,255,255,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>🤖</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff' }}>StreamSales AI v4</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,.8)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} /> Online · Hybrid NLP
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleMainMenu} style={{ background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 11, padding: '4px 8px', borderRadius: 6, fontWeight: 600 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.25)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
              >🏠 Menu</button>
              <button onClick={resetChat} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.8)', cursor: 'pointer', fontSize: 11, padding: '4px 8px', borderRadius: 6 }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >New</button>
            </div>
          </div>

          {/* Messages */}
          <div style={S.msgs}>
            {messages.map((msg, msgIdx) => {
              const isLastBot = msg.role === 'bot' &&
                msgIdx === messages.map((m, i) => m.role === 'bot' ? i : -1).filter(i => i >= 0).slice(-1)[0];
              const typeColor = getTypeColor(msg.type);

              return (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: 3 }}>

                  {/* Message bubble */}
                  {msg.role === 'user' ? (
                    <div style={S.userBubble}>{msg.text}</div>
                  ) : (
                    <div style={S.botBubble(msg.type)}>
                      {msg.type && msg.type !== 'menu' && (
                        <div style={S.typeTag(msg.type, typeColor)}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: typeColor.dot, display: 'inline-block' }} />
                          {TYPE_LABELS[msg.type] || msg.type}
                        </div>
                      )}
                      {msg.message && bold(msg.message)}
                    </div>
                  )}

                  {/* Persistent menu — shown after EVERY bot message (Step 1, 10) */}
                  {msg.role === 'bot' && isLastBot && !loading && (
                    <>
                      {/* Menu grid */}
                      <div style={S.menuGrid}>
                        {(msg.menu || DEFAULT_MENU).map(opt => (
                          <button key={opt.id} style={S.menuBtn}
                            onClick={() => handleMenuClick(opt)}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; e.currentTarget.style.background = 'var(--color-primary-bg)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; e.currentTarget.style.background = 'var(--color-surface)'; }}
                          >{opt.label}</button>
                        ))}
                      </div>

                      {/* Main Menu button — always visible (Step 2) */}
                      <button style={S.mainMenuBtn} onClick={handleMainMenu}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-bg)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--color-primary-bg)'}
                      >🏠 Main Menu</button>

                      {/* AI explainability */}
                      {msg.explainability && msg.type === 'ai_response' && (
                        <div style={S.explainCard}>
                          <div style={{ fontWeight: 700, color: 'var(--color-primary)', marginBottom: 4 }}>🧠 AI Analysis</div>
                          <div style={{ color: 'var(--color-text-secondary)', marginBottom: 1 }}>
                            Category: <strong style={{ color: 'var(--color-text)' }}>{msg.explainability.predicted_category || msg.explainability.predictedCategory}</strong>
                          </div>
                          <div style={{ color: 'var(--color-text-secondary)' }}>
                            Confidence: <strong style={{ color: '#22c55e' }}>{msg.explainability.confidence_score || msg.explainability.confidenceScore}</strong>
                          </div>
                          {msg.ticketId && <div style={{ marginTop: 3, fontSize: 10, color: 'var(--color-text-muted)' }}>Ticket: <code style={{ color: 'var(--color-primary)' }}>{msg.ticketId}</code></div>}
                        </div>
                      )}

                      {/* Escalation info + check button */}
                      {msg.type === 'human_escalation' && msg.ticketId && (
                        <button style={S.checkBtn} onClick={() => checkTicketResponse(msg.ticketId)}>
                          🔍 Check if Agent Replied
                        </button>
                      )}
                    </>
                  )}

                  <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{msg.time}</div>
                </div>
              );
            })}

            {loading && (
              <div style={{ alignSelf: 'flex-start' }}>
                <div style={{ ...S.botBubble('menu'), display: 'flex', gap: 5, alignItems: 'center', padding: '10px 14px' }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--color-text-muted)', display: 'inline-block', animation: `pulse 1.2s ease ${i*0.2}s infinite` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={S.inputRow}>
            <textarea style={S.textarea} placeholder="Type your question or issue..."
              value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              rows={1} ref={inputRef}
            />
            <button style={S.sendBtn} onClick={handleSend} disabled={loading}>
              {loading
                ? <span style={{ width: 13, height: 13, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin .7s linear infinite' }} />
                : '➤'}
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: 4, fontSize: 10, color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>
            StreamSales AI v4 · Rule-based + NLP Hybrid
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantWidget;
