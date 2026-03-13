import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

const EMPTY_FORM = { name: '', description: '', price: '', quantity: '', category: '', images: '' };

const SellerProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsAPI.getMyProducts();
      setProducts(res.data.data.products);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    const payload = {
      ...form,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    try {
      if (editingId) {
        await productsAPI.update(editingId, payload);
        setSuccess('Product updated!');
      } else {
        await productsAPI.create(payload);
        setSuccess('Product created!');
      }
      setShowForm(false);
      setForm(EMPTY_FORM);
      setEditingId(null);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      quantity: product.quantity,
      category: product.category || '',
      images: product.images?.join(', ') || '',
    });
    setEditingId(product._id);
    setShowForm(true);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productsAPI.delete(id);
      setSuccess('Product deleted.');
      fetchProducts();
    } catch {
      setError('Failed to delete.');
    }
  };

  const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse' };
  const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' };
  const tdStyle = { padding: '14px', fontSize: '14px', borderBottom: '1px solid var(--color-border)' };
  const formGridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' };
  const textareaStyle = { width: '100%', padding: '10px 14px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: '14px', minHeight: '100px', resize: 'vertical', fontFamily: 'var(--font-body)' };

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '26px' }}>My Products</h1>
        <Button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm(EMPTY_FORM); setError(''); }}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </Button>
      </div>

      {success && <div style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--color-success)', marginBottom: '16px', fontSize: '14px' }}>{success}</div>}
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--color-error)', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

      {showForm && (
        <div style={{ ...cardStyle, marginBottom: '24px', animation: 'fadeIn 0.2s ease' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', marginBottom: '20px' }}>
            {editingId ? 'Edit Product' : 'New Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div style={formGridStyle}>
              <Input label="Product Name" name="name" value={form.name} onChange={handleChange} required placeholder="e.g. Handmade Necklace" />
              <Input label="Category" name="category" value={form.category} onChange={handleChange} placeholder="e.g. Fashion, Electronics" />
              <Input label="Price (₹)" type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" />
              <Input label="Stock Quantity" type="number" name="quantity" value={form.quantity} onChange={handleChange} required min="0" />
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '6px' }}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} style={textareaStyle} required placeholder="Describe your product..." />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <Input label="Image URLs (comma separated)" name="images" value={form.images} onChange={handleChange} placeholder="https://img1.jpg, https://img2.jpg" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <Button type="submit" loading={saving}>{editingId ? 'Update Product' : 'Create Product'}</Button>
              <Button variant="secondary" onClick={() => { setShowForm(false); setEditingId(null); }}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading products...</div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📦</div>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px' }}>No products yet.</p>
            <Button onClick={() => setShowForm(true)}>Add Your First Product</Button>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td style={tdStyle}>{p.name}</td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>{p.category || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--color-primary)', fontWeight: '600' }}>₹{p.price?.toLocaleString('en-IN')}</td>
                  <td style={{ ...tdStyle, color: p.quantity > 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: '600' }}>{p.quantity}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(p)}>Edit</Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(p._id)}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SellerProductsPage;
