import React, { useState, useEffect } from 'react';
import { streamsAPI } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const SellerStreamsPage = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [activeStreamInfo, setActiveStreamInfo] = useState(null);

  const fetchStreams = async () => {
    setLoading(true);
    try {
      const res = await streamsAPI.getMyStreams();
      setStreams(res.data.data.streams);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStreams(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await streamsAPI.create(form);
      const stream = res.data.data.stream;
      setStreams(prev => [stream, ...prev]);
      setShowForm(false);
      setForm({ title: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create stream.');
    } finally {
      setCreating(false);
    }
  };

  const handleStart = async (streamId) => {
    try {
      const res = await streamsAPI.start(streamId);
      setActiveStreamInfo(res.data.data);
      fetchStreams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start stream.');
    }
  };

  const handleStop = async (streamId) => {
    try {
      await streamsAPI.stop(streamId);
      setActiveStreamInfo(null);
      fetchStreams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to stop stream.');
    }
  };

  const containerStyle = { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px' };
  const streamCardStyle = { ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' };
  const liveBadgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: '#fff', fontSize: '11px', fontWeight: '700' };
  const offlineBadgeStyle = { ...liveBadgeStyle, background: 'var(--color-surface-raised)', color: 'var(--color-text-muted)' };
  const dotStyle = { width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: 'livePulse 1.5s infinite' };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '26px' }}>Stream Manager</h1>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ New Stream'}</Button>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--color-error)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

      {activeStreamInfo && (
        <div style={{ ...cardStyle, border: '1px solid var(--color-primary)', marginBottom: '20px', background: 'rgba(255,78,26,0.04)' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', color: 'var(--color-primary)', marginBottom: '14px' }}>🔴 You are LIVE!</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
            <div>
              <div style={{ color: 'var(--color-text-muted)', marginBottom: '3px' }}>RTMP URL</div>
              <code style={{ background: 'var(--color-surface-raised)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px', display: 'block', wordBreak: 'break-all' }}>
                {activeStreamInfo.rtmpUrl}
              </code>
            </div>
            <div>
              <div style={{ color: 'var(--color-text-muted)', marginBottom: '3px' }}>Stream Key</div>
              <code style={{ background: 'var(--color-surface-raised)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', fontSize: '12px', display: 'block', wordBreak: 'break-all' }}>
                {activeStreamInfo.streamKey}
              </code>
            </div>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '10px' }}>
            ⚠️ Use these in OBS or similar streaming software. Full streaming provider integration coming in Phase 2.
          </p>
        </div>
      )}

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '24px', animation: 'fadeIn 0.2s ease' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '20px' }}>Create Stream Session</h2>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Input label="Stream Title" name="title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required placeholder="What are you selling today?" />
            <Input label="Description (optional)" name="description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of today's stream..." />
            <Button type="submit" loading={creating}>Create Stream</Button>
          </form>
        </div>
      )}

      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px', marginBottom: '16px' }}>
        Recent Streams
      </h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading...</div>
      ) : streams.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📹</div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>No streams yet. Create your first one!</p>
          <Button onClick={() => setShowForm(true)}>Create Stream</Button>
        </div>
      ) : (
        streams.map((stream) => (
          <div key={stream._id} style={streamCardStyle}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px' }}>{stream.title}</h3>
                {stream.isLive
                  ? <span style={liveBadgeStyle}><span style={dotStyle} />LIVE</span>
                  : <span style={offlineBadgeStyle}>Offline</span>
                }
              </div>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                Created {new Date(stream.createdAt).toLocaleDateString('en-IN')}
                {stream.startedAt && ` · Started ${new Date(stream.startedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {!stream.isLive ? (
                <Button size="sm" onClick={() => handleStart(stream._id)}>▶ Go Live</Button>
              ) : (
                <Button size="sm" variant="danger" onClick={() => handleStop(stream._id)}>■ End Stream</Button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SellerStreamsPage;
