import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { streamsAPI } from '../services/api';

const StreamsPage = () => {
  const [streams, setStreams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await streamsAPI.getLive();
        setStreams(res.data.data.streams);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const containerStyle = { maxWidth: '1200px', margin: '0 auto', padding: '40px 24px' };
  const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '28px' };
  const cardStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer' };
  const liveBadgeStyle = { display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'var(--color-primary)', color: '#fff', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' };
  const dotStyle = { width: '6px', height: '6px', borderRadius: '50%', background: '#fff', animation: 'livePulse 1.5s infinite' };

  const thumbnailStyle = {
    width: '100%', aspectRatio: '16/9', background: 'linear-gradient(135deg, #1e1e22 0%, #2a1a2e 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px', position: 'relative',
  };

  const skeletonStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', height: '240px', animation: 'pulse 1.5s infinite' };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px' }}>Live Now</h1>
        <span style={liveBadgeStyle}><span style={dotStyle} />LIVE</span>
      </div>
      <p style={{ color: 'var(--color-text-secondary)', marginTop: '6px' }}>
        {streams.length} streams currently live
      </p>

      <div style={gridStyle}>
        {loading ? (
          Array(6).fill(0).map((_, i) => <div key={i} style={skeletonStyle} />)
        ) : streams.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📡</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '8px' }}>No live streams right now</h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '15px' }}>Check back later or follow your favourite sellers.</p>
          </div>
        ) : (
          streams.map((stream) => (
            <Link
              key={stream._id}
              to={`/stream/${stream._id}`}
              style={{ ...cardStyle, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={thumbnailStyle}>
                {stream.thumbnailURL
                  ? <img src={stream.thumbnailURL} alt={stream.title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                  : '📹'
                }
                <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                  <span style={liveBadgeStyle}><span style={dotStyle} />LIVE</span>
                </div>
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '12px', color: '#fff' }}>
                  👁 {stream.viewerCount || 0}
                </div>
              </div>
              <div style={{ padding: '16px' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '15px', marginBottom: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {stream.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
                  by {stream.sellerId?.name || 'Seller'}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default StreamsPage;
