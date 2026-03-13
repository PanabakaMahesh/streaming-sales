import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import OrderStatusBadge from '../components/common/OrderStatusBadge';

const BuyerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0 });

  useEffect(() => {
    (async () => {
      try {
        const res = await ordersAPI.getBuyerOrders({ limit: 5 });
        setOrders(res.data.data.orders);
        setPagination(res.data.data.pagination);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' };
  const greetStyle = {
    fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px', marginBottom: '4px',
  };
  const cardStyle = {
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)', padding: '24px',
  };
  const statGridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', margin: '28px 0' };
  const statCardStyle = { ...cardStyle, textAlign: 'center' };
  const statNumStyle = { fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '32px', color: 'var(--color-primary)' };
  const statLabelStyle = { fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' };

  const tableStyle = { width: '100%', borderCollapse: 'collapse' };
  const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' };
  const tdStyle = { padding: '14px', fontSize: '14px', borderBottom: '1px solid var(--color-border)' };

  return (
    <div style={containerStyle}>
      <h1 style={greetStyle}>Hello, {user?.name} 👋</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Welcome to your buyer dashboard</p>

      <div style={statGridStyle}>
        <div style={statCardStyle}>
          <div style={statNumStyle}>{pagination.total}</div>
          <div style={statLabelStyle}>Total Orders</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumStyle}>{orders.filter(o => o.status === 'Delivered').length}</div>
          <div style={statLabelStyle}>Delivered</div>
        </div>
        <div style={statCardStyle}>
          <div style={statNumStyle}>{orders.filter(o => ['Placed','Processing','Shipped'].includes(o.status)).length}</div>
          <div style={statLabelStyle}>Active Orders</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '18px' }}>Recent Orders</h2>
        <Link to="/buyer/orders" style={{ fontSize: '13px', color: 'var(--color-primary)', fontWeight: '600' }}>View all →</Link>
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: 'var(--color-text-muted)' }}>No orders yet.</p>
            <Link to="/products" style={{ color: 'var(--color-primary)', fontWeight: '600', marginTop: '8px', display: 'inline-block' }}>
              Browse Marketplace →
            </Link>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={tdStyle}>{order.productId?.name || 'Product'}</td>
                  <td style={tdStyle}>{order.quantity}</td>
                  <td style={{ ...tdStyle, color: 'var(--color-primary)', fontWeight: '600' }}>
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td style={tdStyle}><OrderStatusBadge status={order.status} /></td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <Link
          to="/products"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', background: 'var(--color-primary)', color: '#fff',
            borderRadius: 'var(--radius-md)', fontWeight: '600', fontSize: '14px', textDecoration: 'none',
          }}
        >
          🛒 Browse Marketplace
        </Link>
      </div>
    </div>
  );
};

export default BuyerDashboard;
