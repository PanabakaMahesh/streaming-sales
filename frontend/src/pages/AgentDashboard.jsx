import React, { useState, useEffect } from 'react';

const AI_SERVICE_URL = process.env.REACT_APP_AI_SERVICE_URL || 'http://localhost:8000';

const STATUS_COLORS = {
  'Auto Resolved':        { color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  'Pending Human Review': { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'Resolved':             { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  'Closed':               { color: '#8b8b99', bg: 'rgba(139,139,153,0.12)' },
};

const AgentDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [reviewForm, setReviewForm] = useState({ action: 'approve', finalResponse: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [queueRes, statsRes] = await Promise.all([
        fetch(`${AI_SERVICE_URL}/api/assistant/tickets/queue/human`),
        fetch(`${AI_SERVICE_URL}/api/assistant/stats`),
      ]);
      const queueData = await queueRes.json();
      const statsData = await statsRes.json();
      setQueue(queueData.queue || []);
      setStats(statsData);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
    setReviewForm({
      action: 'approve',
      finalResponse: ticket.suggestedSolution || '',
      feedback: '',
    });
    setSuccessMsg('');
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.finalResponse.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`${AI_SERVICE_URL}/api/assistant/tickets/${selectedTicket.ticketId}/review`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: 'agent_1', ...reviewForm }),
      });
      setSuccessMsg('✅ Review submitted successfully.');
      setSelectedTicket(null);
      fetchData();
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  const s = {
    page: { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' },
    card: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px' },
    statCard: { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '20px', textAlign: 'center' },
    grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' },
    layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', alignItems: 'start' },
    ticketRow: (selected) => ({ padding: '14px', borderRadius: 'var(--radius-md)', cursor: 'pointer', border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`, background: selected ? 'var(--color-primary-bg)' : 'var(--color-surface-raised)', marginBottom: '8px', transition: 'all 0.15s' }),
    badge: (status) => ({ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: '11px', fontWeight: '700', color: STATUS_COLORS[status]?.color || '#8b8b99', background: STATUS_COLORS[status]?.bg || 'transparent', border: `1px solid ${STATUS_COLORS[status]?.color || '#8b8b99'}30` }),
    textarea: { width: '100%', padding: '10px 14px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: '13px', minHeight: '100px', resize: 'vertical', fontFamily: 'var(--font-body)', lineHeight: '1.6' },
    btn: (color) => ({ padding: '9px 18px', borderRadius: 'var(--radius-md)', border: 'none', background: color, color: '#fff', fontWeight: '600', fontSize: '13px', cursor: 'pointer', transition: 'opacity 0.15s' }),
    selectStyle: { padding: '8px 12px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: '13px', width: '100%', marginBottom: '10px' },
  };

  return (
    <div style={s.page}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '26px', marginBottom: '6px' }}>
        🎫 Support Agent Dashboard
      </h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '28px' }}>
        Review AI-escalated tickets and provide human responses.
      </p>

      {/* Stats */}
      {stats && (
        <div style={s.grid4}>
          {[
            { label: 'Total Tickets', value: stats.total, color: 'var(--color-text)' },
            { label: 'Auto Resolved', value: stats.autoResolved, color: '#22c55e' },
            { label: 'Pending Review', value: stats.pendingHumanReview, color: '#f59e0b' },
            { label: 'Automation Rate', value: stats.automationRate, color: 'var(--color-primary)' },
          ].map(item => (
            <div key={item.label} style={s.statCard}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px', color: item.color }}>{item.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--color-success)', marginBottom: '16px', fontSize: '14px' }}>
          {successMsg}
        </div>
      )}

      <div style={s.layout}>
        {/* Queue */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '17px' }}>
              Pending Review Queue
              {queue.length > 0 && <span style={{ marginLeft: '8px', background: '#f59e0b', color: '#fff', borderRadius: 'var(--radius-full)', padding: '2px 8px', fontSize: '12px' }}>{queue.length}</span>}
            </h2>
            <button onClick={fetchData} style={{ background: 'none', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '5px 12px', color: 'var(--color-text-secondary)', cursor: 'pointer', fontSize: '12px' }}>↻ Refresh</button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading queue...</div>
          ) : queue.length === 0 ? (
            <div style={{ ...s.card, textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>✅</div>
              <p style={{ color: 'var(--color-text-muted)' }}>No tickets pending review.</p>
            </div>
          ) : (
            queue.map(ticket => (
              <div key={ticket.ticketId} style={s.ticketRow(selectedTicket?.ticketId === ticket.ticketId)} onClick={() => handleSelectTicket(ticket)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <code style={{ fontSize: '11px', color: 'var(--color-primary)' }}>{ticket.ticketId}</code>
                  <span style={s.badge(ticket.status)}>{ticket.status}</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {ticket.ticketText}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  <span>Category: <strong style={{ color: 'var(--color-text)' }}>{ticket.predictedLabel || ticket.predictedCategory}</strong></span>
                  <span>Confidence: <strong style={{ color: ticket.confidenceScore < 0.85 ? '#f59e0b' : '#22c55e' }}>{(ticket.confidenceScore * 100).toFixed(0)}%</strong></span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  {new Date(ticket.createdAt).toLocaleString('en-IN')}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Review Panel */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '17px', marginBottom: '14px' }}>Review Panel</h2>
          {!selectedTicket ? (
            <div style={{ ...s.card, textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>👈</div>
              <p style={{ color: 'var(--color-text-muted)' }}>Select a ticket from the queue to review it.</p>
            </div>
          ) : (
            <div style={s.card}>
              {/* Ticket Info */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <code style={{ fontSize: '12px', color: 'var(--color-primary)', fontWeight: '700' }}>{selectedTicket.ticketId}</code>
                  <span style={s.badge(selectedTicket.status)}>{selectedTicket.status}</span>
                </div>
                <div style={{ padding: '12px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', fontSize: '13px', marginBottom: '12px', lineHeight: '1.6' }}>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', marginBottom: '4px', fontWeight: '600', textTransform: 'uppercase' }}>User Message</div>
                  {selectedTicket.ticketText}
                </div>

                {/* AI Explainability */}
                <div style={{ padding: '12px', background: 'rgba(255,78,26,0.05)', border: '1px solid rgba(255,78,26,0.2)', borderRadius: 'var(--radius-md)', fontSize: '12px', marginBottom: '12px' }}>
                  <div style={{ fontWeight: '700', color: 'var(--color-primary)', marginBottom: '8px' }}>🧠 AI Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', color: 'var(--color-text-secondary)' }}>
                    <span>Category: <strong style={{ color: 'var(--color-text)' }}>{selectedTicket.predictedLabel || selectedTicket.predictedCategory}</strong></span>
                    <span>Confidence: <strong style={{ color: selectedTicket.confidenceScore < 0.85 ? '#f59e0b' : '#22c55e' }}>{(selectedTicket.confidenceScore * 100).toFixed(1)}%</strong></span>
                    {selectedTicket.importantKeywords?.length > 0 && (
                      <span style={{ gridColumn: '1/-1' }}>Key words: <strong style={{ color: 'var(--color-text)' }}>{selectedTicket.importantKeywords.join(', ')}</strong></span>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Form */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Your Action
                </label>
                <select value={reviewForm.action} onChange={e => setReviewForm(p => ({ ...p, action: e.target.value }))} style={s.selectStyle}>
                  <option value="approve">✅ Approve AI Solution</option>
                  <option value="edit">✏️ Edit AI Solution</option>
                  <option value="manual">✍️ Write Manual Response</option>
                </select>

                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                  Final Response to User
                </label>
                <textarea
                  style={s.textarea}
                  value={reviewForm.finalResponse}
                  onChange={e => setReviewForm(p => ({ ...p, finalResponse: e.target.value }))}
                  placeholder="Type your response to the user..."
                />

                <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-text-secondary)', display: 'block', margin: '10px 0 6px', textTransform: 'uppercase' }}>
                  Internal Feedback (for AI retraining)
                </label>
                <textarea
                  style={{ ...s.textarea, minHeight: '60px' }}
                  value={reviewForm.feedback}
                  onChange={e => setReviewForm(p => ({ ...p, feedback: e.target.value }))}
                  placeholder="Was the AI classification correct? Any notes..."
                />

                <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
                  <button
                    style={s.btn('var(--color-primary)')}
                    onClick={handleSubmitReview}
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : '📤 Submit Review'}
                  </button>
                  <button style={s.btn('var(--color-surface-raised)')} onClick={() => setSelectedTicket(null)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentDashboard;
