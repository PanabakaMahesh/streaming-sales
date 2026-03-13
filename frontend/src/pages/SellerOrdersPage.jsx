import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import OrderStatusBadge from '../components/common/OrderStatusBadge';
import Button from '../components/common/Button';

const STATUSES = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const SellerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [updating, setUpdating] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersAPI.getSellerOrders({ status: filterStatus || undefined, limit: 50 });
      setOrders(res.data.data.orders);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [filterStatus]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    } catch {
    } finally {
      setUpdating(null);
    }
  };

  const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse' };
  const thStyle = { padding: '10px 14px', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)' };
  const tdStyle = { padding: '14px', fontSize: '14px', borderBottom: '1px solid var(--color-border)', verticalAlign: 'middle' };
  const filterRowStyle = { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' };
  const filterBtnStyle = (active) => ({
    padding: '5px 14px', borderRadius: 'var(--radius-full)',
    border: `1px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    background: active ? 'var(--color-primary-bg)' : 'transparent',
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    fontSize: '13px', fontWeight: active ? '600' : '400', cursor: 'pointer',
  });
  const selectStyle = {
    padding: '6px 10px', background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)', fontSize: '13px', cursor: 'pointer',
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '26px', marginBottom: '24px' }}>
        Customer Orders
      </h1>

      <div style={filterRowStyle}>
        <button style={filterBtnStyle(!filterStatus)} onClick={() => setFilterStatus('')}>All</button>
        {STATUSES.map(s => (
          <button key={s} style={filterBtnStyle(filterStatus === s)} onClick={() => setFilterStatus(s)}>{s}</button>
        ))}
      </div>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-muted)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>📭</div>
            <p style={{ color: 'var(--color-text-muted)' }}>No orders found.</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Buyer</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Amount</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Update Status</th>
                <th style={thStyle}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td style={tdStyle}>{order.productId?.name || '—'}</td>
                  <td style={tdStyle}>
                    <div>{order.buyerId?.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{order.buyerId?.email}</div>
                  </td>
                  <td style={tdStyle}>{order.quantity}</td>
                  <td style={{ ...tdStyle, color: 'var(--color-primary)', fontWeight: '600' }}>
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td style={tdStyle}><OrderStatusBadge status={order.status} /></td>
                  <td style={tdStyle}>
                    <select
                      style={selectStyle}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={updating === order._id || order.status === 'Delivered' || order.status === 'Cancelled'}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
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

export default SellerOrdersPage;
