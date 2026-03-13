import React, { useState, useEffect } from 'react';
import { productsAPI } from '../services/api';
import ProductCard from '../components/common/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Food', 'Beauty', 'Home', 'Sports', 'Books', 'General'];

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [pagination, setPagination] = useState({ total: 0, pages: 1, page: 1 });
  const [error, setError] = useState('');

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 20 };
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      const res = await productsAPI.getAll(params);
      setProducts(res.data.data.products);
      setPagination(res.data.data.pagination);
    } catch {
      setError('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [category]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const headerStyle = {
    background: 'var(--color-surface)',
    borderBottom: '1px solid var(--color-border)',
    padding: '32px 24px',
  };

  const innerStyle = { maxWidth: '1200px', margin: '0 auto' };

  const searchBarStyle = {
    display: 'flex',
    gap: '10px',
    marginTop: '20px',
    maxWidth: '540px',
  };

  const searchInputStyle = {
    flex: 1,
    padding: '10px 16px',
    background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)',
    fontSize: '14px',
  };

  const searchBtnStyle = {
    padding: '10px 20px',
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  };

  const catRowStyle = {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '16px',
  };

  const catBtnStyle = (active) => ({
    padding: '5px 14px',
    borderRadius: 'var(--radius-full)',
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    background: active ? 'var(--color-primary-bg)' : 'transparent',
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
    cursor: 'pointer',
    transition: 'all 0.15s',
  });

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '20px',
    padding: '32px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const skeletonStyle = {
    background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    height: '290px',
    animation: 'pulse 1.5s infinite',
  };

  return (
    <div>
      <div style={headerStyle}>
        <div style={innerStyle}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px' }}>
            Marketplace
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', fontSize: '15px' }}>
            {pagination.total} products from independent sellers
          </p>
          <form onSubmit={handleSearch} style={searchBarStyle}>
            <input
              style={searchInputStyle}
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button type="submit" style={searchBtnStyle}>Search</button>
          </form>
          <div style={catRowStyle}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                style={catBtnStyle(category === cat || (cat === 'All' && !category))}
                onClick={() => setCategory(cat === 'All' ? '' : cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={gridStyle}>
        {loading ? (
          Array(8).fill(0).map((_, i) => <div key={i} style={skeletonStyle} />)
        ) : error ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--color-error)', padding: '40px' }}>
            {error}
          </div>
        ) : products.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔍</div>
            <p style={{ color: 'var(--color-text-secondary)' }}>No products found.</p>
          </div>
        ) : (
          products.map((p) => <ProductCard key={p._id} product={p} />)
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '0 24px 40px' }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
            <button
              key={pg}
              onClick={() => fetchProducts(pg)}
              style={{
                width: '36px', height: '36px',
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${pg === pagination.page ? 'var(--color-primary)' : 'var(--color-border)'}`,
                background: pg === pagination.page ? 'var(--color-primary)' : 'transparent',
                color: pg === pagination.page ? '#fff' : 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              {pg}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
