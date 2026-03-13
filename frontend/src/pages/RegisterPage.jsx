import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'buyer' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      navigate(user.role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = {
    minHeight: 'calc(100vh - 64px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
  };

  const cardStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-xl)',
    padding: '40px',
    width: '100%',
    maxWidth: '440px',
    animation: 'fadeIn 0.3s ease',
  };

  const roleTabsStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    padding: '4px',
    background: 'var(--color-surface-raised)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '24px',
  };

  const roleTabStyle = (active) => ({
    padding: '10px',
    borderRadius: 'calc(var(--radius-md) - 2px)',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'var(--font-body)',
    fontWeight: '600',
    fontSize: '13px',
    transition: 'all 0.15s ease',
    background: active ? 'var(--color-primary)' : 'transparent',
    color: active ? '#fff' : 'var(--color-text-secondary)',
  });

  const errorStyle = {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 'var(--radius-md)',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--color-error)',
    marginBottom: '16px',
  };

  const hintStyle = {
    background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 14px',
    fontSize: '12px',
    color: 'var(--color-text-muted)',
    marginTop: '4px',
    lineHeight: '1.6',
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '26px', marginBottom: '6px' }}>
          Create account
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', marginBottom: '28px' }}>
          Join StreamSales today
        </p>

        {/* Role Selector */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontWeight: '500', marginBottom: '8px' }}>
            I want to...
          </div>
          <div style={roleTabsStyle}>
            <button style={roleTabStyle(form.role === 'buyer')} onClick={() => setForm(p => ({ ...p, role: 'buyer' }))}>
              🛒 Buy Products
            </button>
            <button style={roleTabStyle(form.role === 'seller')} onClick={() => setForm(p => ({ ...p, role: 'seller' }))}>
              📦 Sell Products
            </button>
          </div>
          {form.role === 'seller' && (
            <div style={hintStyle}>
              A seller profile will be automatically created. You can update your store name and details after registration.
            </div>
          )}
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Full Name"
            name="name"
            placeholder="Your name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />
          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Min. 6 characters"
            value={form.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            hint="At least 6 characters"
          />
          <Button type="submit" fullWidth loading={loading} size="lg" style={{ marginTop: '8px' }}>
            Create Account
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--color-text-muted)', marginTop: '24px' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
