import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI, ordersAPI, sellersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import OrderStatusBadge from '../components/common/OrderStatusBadge';

const SellerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, ordersRes, productsRes] = await Promise.all([
          sellersAPI.getMyProfile(),
          ordersAPI.getSellerOrders({ limit: 5 }),
          productsAPI.getMyProducts({ limit: 1 }),
        ]);
        setProfile(profileRes.data.data.profile);
        const orders = ordersRes.data.data.orders;
        setRecentOrders(orders);
        const revenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
        setStats({
          products: productsRes.data.data.pagination?.total || 0,
          orders: ordersRes.data.data.pagination?.total || 0,
          revenue,
        });
      } catch {
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px' };
  const statGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', margin: '28px 0' };
  const statCardStyle = { ...cardStyle, textAlign: 'center' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse' };
  const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' };
  const tdStyle = { padding: '14px', fontSize: '14px', borderBottom: '1px solid var(--color-border)' };
  const quickLinksStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '24px' };
  const qlStyle = (color) => ({
    padding: '16px 20px', borderRadius: 'var(--radius-md)',
    background: `${color}15`, border: `1px solid ${color}30`,
    color, fontWeight: '600', fontSize: '14px', textDecoration: 'none',
    display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.15s',
  });

  return (
    <div style={containerStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px' }}>
            {profile?.storeName || user?.name}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>Seller Dashboard</p>
        </div>
        <Link to="/seller/streams" style={{
          padding: '10px 20px', background: 'var(--color-primary)', color: '#fff',
          borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: '14px', textDecoration: 'none',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          ▶ Go Live
        </Link>
      </div>

      <div style={statGridStyle}>
        {[
          { num: stats.products, label: 'Products Listed' },
          { num: stats.orders, label: 'Total Orders' },
          { num: `₹${stats.revenue.toLocaleString('en-IN')}`, label: 'Revenue (Session)' },
        ].map((s) => (
          <div key={s.label} style={statCardStyle}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px', color: 'var(--color-primary)' }}>{s.num}</div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px' }}>Recent Orders</h2>
        <Link to="/seller/orders" style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600' }}>View all →</Link>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : recentOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: 'var(--color-text-muted)' }}>No orders yet.</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Buyer</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id}>
                  <td style={tdStyle}>{order.productId?.name || 'Product'}</td>
                  <td style={tdStyle}>{order.buyerId?.name}</td>
                  <td style={tdStyle}>{order.quantity}</td>
                  <td style={{ ...tdStyle, color: 'var(--color-primary)', fontWeight: '600' }}>
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td style={tdStyle}><OrderStatusBadge status={order.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={quickLinksStyle}>
        <Link to="/seller/products" style={qlStyle('var(--color-primary)')}>📦 Manage Products</Link>
        <Link to="/seller/orders" style={qlStyle('#8b5cf6')}>📋 Manage Orders</Link>
        <Link to="/seller/streams" style={qlStyle('#22c55e')}>📹 Stream Manager</Link>
        <Link to="/seller/profile" style={qlStyle('#f59e0b')}>🏪 Edit Store</Link>
      </div>
    </div>
  );
};

export default SellerDashboard;
