import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';

const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000';

const MENU_OPTIONS = [
  { id: 'login_issue',   label: '🔐 Login Issue' },
  { id: 'order_issue',   label: '📦 Order Problem' },
  { id: 'seller_issue',  label: '🏪 Seller Dashboard' },
  { id: 'account_issue', label: '👤 Account Problem' },
  { id: 'technical_bug', label: '🐛 Technical Bug' },
  { id: 'other',         label: '💬 Other Query' },
  { id: 'new_ticket',    label: '🎫 Raise Ticket' },
  { id: 'human',         label: '👨‍💼 Human Support' },
];

const AssistantWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(
        "Hello! I'm your **StreamSales AI Assistant** 🤖\n\nHow can I help you today? Choose an option below or type your issue:",
        true
      );
    }
    if (isOpen) setUnread(0);
  }, [isOpen]);

  const addBotMessage = (text, showMenuAfter = false, extra = null) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'bot',
      text,
      showMenu: showMenuAfter,
      extra,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const addUserMessage = (text) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      role: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
  };

  const handleMenuClick = async (option) => {
    setShowMenu(false);
    addUserMessage(option.label);

    if (option.id === 'human') {
      addBotMessage(
        "👨‍💼 **Connecting to Human Support**\n\nA support agent will review your case shortly.\n\nIn the meantime, please describe your issue in detail below:",
        false
      );
      return;
    }

    if (option.id === 'new_ticket') {
      addBotMessage(
        "🎫 **Raise a Support Ticket**\n\nPlease describe your issue in detail and I'll classify it and create a ticket for you:",
        false
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/assistant/quick-resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: option.id, userId: user?._id || 'guest' }),
      });
      const data = await res.json();
      formatAndShowSolution(data, option.label);
    } catch {
      addBotMessage("⚠️ I'm having trouble connecting. Please type your issue and I'll help you.", true);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text || loading) return;

    setInputText('');
    setShowMenu(false);
    addUserMessage(text);
    setLoading(true);

    try {
      const res = await fetch(`${AI_SERVICE_URL}/api/assistant/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userId: user?._id || 'guest',
          sessionId: `session_${Date.now()}`,
        }),
      });
      const data = await res.json();
      formatAndShowSolution(data, null);
    } catch {
      addBotMessage(
        "⚠️ AI service is currently unavailable.\n\nYour issue has been noted. Please try again shortly or contact support directly.",
        true
      );
    } finally {
      setLoading(false);
    }
  };

  const formatAndShowSolution = (data, userQuery) => {
    const solution = data.solution;
    const routing = data.routing;
    const explain = data.explainability;
    const ticketId = data.ticketId;

    // Solution steps
    const stepsText = solution?.steps
      ? solution.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')
      : '';

    const mainText = solution?.greeting
      ? `${solution.greeting}\n\n${stepsText ? `**Steps to resolve:**\n${stepsText}` : ''}\n\n💡 ${solution.fallback || ''}`
      : data.message || 'Here is what I found.';

    addBotMessage(mainText, false, {
      ticketId,
      explain,
      routing,
      quickLinks: solution?.quick_links,
      status: data.status,
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setShowMenu(true);
    setInputText('');
  };

  // ── Styles ───────────────────────────────────────────────────────────────
  const floatBtnStyle = {
    position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
    width: '56px', height: '56px', borderRadius: '50%',
    background: 'var(--color-primary)',
    border: 'none', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', boxShadow: '0 4px 20px rgba(255,78,26,0.5)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  };

  const badgeStyle = {
    position: 'absolute', top: '-4px', right: '-4px',
    background: '#ef4444', color: '#fff',
    borderRadius: '50%', width: '20px', height: '20px',
    fontSize: '11px', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    border: '2px solid var(--color-bg)',
  };

  const popupStyle = {
    position: 'fixed', bottom: '92px', right: '24px', zIndex: 9998,
    width: '380px', height: '560px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    animation: 'fadeIn 0.2s ease',
  };

  const headerStyle = {
    padding: '16px 18px',
    background: 'var(--color-primary)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0,
  };

  const messagesStyle = {
    flex: 1, overflowY: 'auto', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  };

  const botBubbleStyle = {
    maxWidth: '88%', alignSelf: 'flex-start',
    background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: '4px 16px 16px 16px',
    padding: '10px 14px', fontSize: '13px', lineHeight: '1.6',
    color: 'var(--color-text)',
  };

  const userBubbleStyle = {
    maxWidth: '80%', alignSelf: 'flex-end',
    background: 'var(--color-primary)',
    borderRadius: '16px 4px 16px 16px',
    padding: '10px 14px', fontSize: '13px', lineHeight: '1.6',
    color: '#fff',
  };

  const menuBtnStyle = {
    padding: '7px 12px',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)', fontSize: '12px', fontWeight: '500',
    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
  };

  const inputRowStyle = {
    display: 'flex', gap: '8px', padding: '12px 14px',
    borderTop: '1px solid var(--color-border)',
    background: 'var(--color-surface)', flexShrink: 0,
  };

  const inputStyle = {
    flex: 1, padding: '9px 12px',
    background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)', fontSize: '13px',
    outline: 'none', resize: 'none',
  };

  const sendBtnStyle = {
    padding: '9px 14px',
    background: loading ? 'var(--color-surface-raised)' : 'var(--color-primary)',
    border: 'none', borderRadius: 'var(--radius-md)',
    color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
    fontSize: '16px', transition: 'background 0.15s',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  const renderText = (text) => {
    return text.split('\n').map((line, i) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return (
        <span key={i}>
          {parts.map((part, j) =>
            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
          )}
          {i < text.split('\n').length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <>
      {/* Floating Button */}
      <button
        style={floatBtnStyle}
        onClick={() => setIsOpen(!isOpen)}
        title="AI Support Assistant"
        onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 28px rgba(255,78,26,0.7)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,78,26,0.5)'; }}
      >
        {isOpen ? '✕' : '🤖'}
        {!isOpen && unread > 0 && <span style={badgeStyle}>{unread}</span>}
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div style={popupStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '14px', color: '#fff' }}>StreamSales AI</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
                  Online · Powered by NLP
                </div>
              </div>
            </div>
            <button onClick={resetChat} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', fontSize: '12px', padding: '4px 8px', borderRadius: 'var(--radius-sm)', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              New Chat
            </button>
          </div>

          {/* Messages */}
          <div style={messagesStyle}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '6px' }}>
                <div style={msg.role === 'user' ? userBubbleStyle : botBubbleStyle}>
                  {renderText(msg.text)}
                </div>

                {/* Menu buttons */}
                {msg.showMenu && showMenu && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', width: '100%', marginTop: '4px' }}>
                    {MENU_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        style={menuBtnStyle}
                        onClick={() => handleMenuClick(opt)}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text)'; }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* AI explainability card */}
                {msg.extra?.explain && (
                  <div style={{ background: 'rgba(255,78,26,0.06)', border: '1px solid rgba(255,78,26,0.2)', borderRadius: 'var(--radius-md)', padding: '10px 12px', fontSize: '11px', width: '100%', marginTop: '4px' }}>
                    <div style={{ fontWeight: '700', color: 'var(--color-primary)', marginBottom: '6px' }}>🧠 AI Analysis</div>
                    <div style={{ color: 'var(--color-text-secondary)', marginBottom: '3px' }}>
                      Category: <strong style={{ color: 'var(--color-text)' }}>{msg.extra.explain.predictedCategory}</strong>
                    </div>
                    <div style={{ color: 'var(--color-text-secondary)', marginBottom: '3px' }}>
                      Confidence: <strong style={{ color: msg.extra.explain.confidenceScore >= '85%' ? 'var(--color-success)' : 'var(--color-warning)' }}>{msg.extra.explain.confidenceScore}</strong>
                    </div>
                    {msg.extra.explain.importantWords?.length > 0 && (
                      <div style={{ color: 'var(--color-text-secondary)', marginBottom: '3px' }}>
                        Key words: <strong style={{ color: 'var(--color-text)' }}>{msg.extra.explain.importantWords.join(', ')}</strong>
                      </div>
                    )}
                    <div style={{ marginTop: '6px', padding: '5px 8px', background: msg.extra.routing?.requires_human ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', borderRadius: 'var(--radius-sm)', color: msg.extra.routing?.requires_human ? '#f59e0b' : '#22c55e', fontWeight: '600' }}>
                      {msg.extra.routing?.requires_human ? '👨‍💼 Escalated to Human Review' : '✅ Auto Resolved by AI'}
                    </div>
                    {msg.extra.ticketId && (
                      <div style={{ marginTop: '5px', color: 'var(--color-text-muted)' }}>
                        Ticket: <code style={{ color: 'var(--color-primary)' }}>{msg.extra.ticketId}</code>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>{msg.time}</div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div style={{ alignSelf: 'flex-start' }}>
                <div style={{ ...botBubbleStyle, display: 'flex', gap: '5px', alignItems: 'center', padding: '12px 16px' }}>
                  {[0, 1, 2].map(i => (
                    <span key={i} style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--color-text-muted)', display: 'inline-block', animation: `pulse 1.2s ease ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={inputRowStyle}>
            <textarea
              ref={inputRef}
              style={inputStyle}
              placeholder="Describe your issue..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button style={sendBtnStyle} onClick={handleSend} disabled={loading}>
              {loading ? (
                <span style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              ) : '➤'}
            </button>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', padding: '6px', fontSize: '10px', color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', background: 'var(--color-surface)', flexShrink: 0 }}>
            Powered by NLP · StreamSales AI v1.0
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantWidget;
