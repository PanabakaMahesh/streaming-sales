import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
  const { user, isSeller, isBuyer } = useAuth();

  const heroStyle = {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 24px',
    position: 'relative',
    overflow: 'hidden',
  };

  const bgGlowStyle = {
    position: 'absolute',
    top: '20%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '600px',
    height: '600px',
    background: 'radial-gradient(ellipse, rgba(255,78,26,0.12) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  };

  const contentStyle = { position: 'relative', zIndex: 1, maxWidth: '800px' };

  const tagStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 16px',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--color-border)',
    background: 'var(--color-surface)',
    fontSize: '13px',
    color: 'var(--color-text-secondary)',
    marginBottom: '28px',
  };

  const liveDotStyle = {
    width: '8px',
    height: '8px',
    background: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'livePulse 1.5s infinite',
  };

  const h1Style = {
    fontFamily: 'var(--font-display)',
    fontWeight: '800',
    fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
    lineHeight: '1.1',
    marginBottom: '24px',
    letterSpacing: '-0.02em',
  };

  const accentStyle = {
    color: 'var(--color-primary)',
    display: 'block',
  };

  const subStyle = {
    fontSize: '18px',
    color: 'var(--color-text-secondary)',
    maxWidth: '520px',
    margin: '0 auto 40px',
    lineHeight: '1.7',
  };

  const ctaRowStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: '60px',
  };

  const primaryBtnStyle = {
    padding: '14px 32px',
    background: 'var(--color-primary)',
    color: '#fff',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    fontSize: '15px',
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  };

  const secondaryBtnStyle = {
    padding: '14px 32px',
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    borderRadius: 'var(--radius-md)',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    fontSize: '15px',
    textDecoration: 'none',
    border: '1px solid var(--color-border)',
    transition: 'all 0.15s ease',
  };

  const statsStyle = {
    display: 'flex',
    gap: '48px',
    justifyContent: 'center',
    flexWrap: 'wrap',
  };

  const statStyle = {
    textAlign: 'center',
  };

  const statNumStyle = {
    fontFamily: 'var(--font-display)',
    fontWeight: '800',
    fontSize: '28px',
    color: 'var(--color-text)',
  };

  const statLabelStyle = {
    fontSize: '13px',
    color: 'var(--color-text-muted)',
    marginTop: '4px',
  };

  const featuresStyle = {
    padding: '80px 24px',
    maxWidth: '1100px',
    margin: '0 auto',
  };

  const featureGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '20px',
    marginTop: '48px',
  };

  const featureCardStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px',
    transition: 'border-color 0.2s',
  };

  const iconBoxStyle = {
    width: '48px',
    height: '48px',
    background: 'var(--color-primary-bg)',
    border: '1px solid rgba(255,78,26,0.2)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    marginBottom: '16px',
  };

  const features = [
    { icon: '📹', title: 'Live Stream Selling', desc: 'Sell products directly during your live streams. No technical setup required.' },
    { icon: '🛒', title: 'Instant Marketplace', desc: 'Your products appear in the marketplace automatically. Reach buyers 24/7.' },
    { icon: '📦', title: 'Order Management', desc: 'Track and manage all your orders from a single, clean dashboard.' },
    { icon: '🔒', title: 'Secure & Simple', desc: 'JWT-secured accounts with role-based access. Buyers and sellers stay separate.' },
    { icon: '📈', title: 'Built to Scale', desc: 'Architecture ready for payments, AI recommendations, and analytics.' },
    { icon: '💬', title: 'Real-time Ready', desc: 'Streaming infrastructure designed for WebRTC, LiveKit, and Agora integration.' },
  ];

  return (
    <div>
      {/* Hero */}
      <section style={heroStyle}>
        <div style={bgGlowStyle} />
        <div style={contentStyle}>
          <div style={tagStyle}>
            <span style={liveDotStyle} />
            Live Commerce Platform for Independent Sellers
          </div>
          <h1 style={h1Style}>
            Sell Live.
            <span style={accentStyle}>Grow Fast.</span>
          </h1>
          <p style={subStyle}>
            The e-commerce platform built for creators and small sellers who sell through YouTube and social media. Go live, sell products, manage orders — all in one place.
          </p>
          <div style={ctaRowStyle}>
            {user ? (
              <>
                {isBuyer && <Link to="/buyer/dashboard" style={primaryBtnStyle}>Go to Dashboard</Link>}
                {isSeller && <Link to="/seller/dashboard" style={primaryBtnStyle}>Seller Dashboard</Link>}
                <Link to="/products" style={secondaryBtnStyle}>Browse Marketplace</Link>
              </>
            ) : (
              <>
                <Link to="/register" style={primaryBtnStyle}>Start Selling Free</Link>
                <Link to="/products" style={secondaryBtnStyle}>Browse Products</Link>
              </>
            )}
          </div>
          <div style={statsStyle}>
            {[
              { num: '100%', label: 'Free to Start' },
              { num: 'Live', label: 'Stream Support' },
              { num: 'Zero', label: 'Commission (Beta)' },
            ].map((s) => (
              <div key={s.label} style={statStyle}>
                <div style={statNumStyle}>{s.num}</div>
                <div style={statLabelStyle}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={featuresStyle}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '12px' }}>
            Everything you need to sell online
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '16px' }}>
            Built for the way small sellers actually work.
          </p>
        </div>
        <div style={featureGridStyle}>
          {features.map((f) => (
            <div
              key={f.title}
              style={featureCardStyle}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--color-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
            >
              <div style={iconBoxStyle}>{f.icon}</div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '16px', marginBottom: '8px' }}>{f.title}</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', lineHeight: '1.6' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
