import React, { useState, useEffect } from 'react';
import { sellersAPI } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const SellerProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ storeName: '', description: '', profileImage: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await sellersAPI.getMyProfile();
        const p = res.data.data.profile;
        setProfile(p);
        setForm({ storeName: p.storeName || '', description: p.description || '', profileImage: p.profileImage || '' });
      } catch {
        setError('Failed to load profile.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await sellersAPI.updateProfile(form);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const containerStyle = { maxWidth: '680px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-xl)', padding: '36px' };
  const textareaStyle = { width: '100%', padding: '10px 14px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: '14px', minHeight: '120px', resize: 'vertical', fontFamily: 'var(--font-body)' };
  const avatarStyle = { width: '80px', height: '80px', borderRadius: '50%', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px', marginBottom: '20px' };

  if (loading) return <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-text-muted)' }}>Loading...</div>;

  return (
    <div style={containerStyle}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '26px', marginBottom: '28px' }}>
        Store Profile
      </h1>

      <div style={cardStyle}>
        <div style={avatarStyle}>
          {form.storeName?.charAt(0).toUpperCase() || 'S'}
        </div>

        {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--color-success)', marginBottom: '16px', fontSize: '14px' }}>{success}</div>}
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--color-error)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <Input label="Store Name" name="storeName" value={form.storeName} onChange={handleChange} required placeholder="Your store name" />
          <div>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Store Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} style={textareaStyle} placeholder="Tell buyers about your store..." />
          </div>
          <Input label="Profile Image URL" name="profileImage" value={form.profileImage} onChange={handleChange} placeholder="https://..." hint="Paste a direct image URL" />

          {profile && (
            <div style={{ padding: '14px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', fontSize: '13px', color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <span>Products: <strong style={{ color: 'var(--color-text)' }}>{profile.totalProducts}</strong></span>
                <span>Verified: <strong style={{ color: profile.isVerified ? 'var(--color-success)' : 'var(--color-text-muted)' }}>{profile.isVerified ? 'Yes ✓' : 'No'}</strong></span>
                <span>Member since: <strong style={{ color: 'var(--color-text)' }}>{new Date(profile.createdAt).toLocaleDateString('en-IN')}</strong></span>
              </div>
            </div>
          )}

          <Button type="submit" loading={saving} size="lg">Save Changes</Button>
        </form>
      </div>
    </div>
  );
};

export default SellerProfilePage;
