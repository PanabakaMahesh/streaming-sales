import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';
import OrderStatusBadge from '../components/common/OrderStatusBadge';

const BuyerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const res = await ordersAPI.getBuyerOrders({ page, limit: 15 });
      setOrders(res.data.data.orders);
      setPagination(res.data.data.pagination);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const containerStyle = { maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' };
  const tableStyle = { width: '100%', borderCollapse: 'collapse' };
  const thStyle = { padding: '12px 16px', textAlign: 'left', fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface-raised)' };
  const tdStyle = { padding: '16px', fontSize: '14px', borderBottom: '1px solid var(--color-border)' };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '26px', marginBottom: '8px' }}>
        Order History
      </h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '28px' }}>{pagination.total} total orders</p>

      <div style={cardStyle}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--color-text-muted)' }}>Loading orders...</div>
        ) : orders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛒</div>
            <p style={{ color: 'var(--color-text-muted)' }}>You haven't placed any orders yet.</p>
          </div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Product</th>
                <th style={thStyle}>Seller</th>
                <th style={thStyle}>Qty</th>
                <th style={thStyle}>Paid</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Ordered On</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-raised)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {order.productId?.images?.[0] ? (
                        <img src={order.productId.images[0]} alt="" style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📦</div>
                      )}
                      <span style={{ fontWeight: '500' }}>{order.productId?.name || 'Product'}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-secondary)' }}>{order.sellerId?.name}</td>
                  <td style={tdStyle}>{order.quantity}</td>
                  <td style={{ ...tdStyle, fontWeight: '700', color: 'var(--color-primary)' }}>
                    ₹{order.totalAmount?.toLocaleString('en-IN')}
                  </td>
                  <td style={tdStyle}><OrderStatusBadge status={order.status} /></td>
                  <td style={{ ...tdStyle, color: 'var(--color-text-muted)' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((pg) => (
            <button key={pg} onClick={() => fetchOrders(pg)} style={{
              width: '36px', height: '36px', borderRadius: 'var(--radius-md)',
              border: `1px solid ${pg === pagination.page ? 'var(--color-primary)' : 'var(--color-border)'}`,
              background: pg === pagination.page ? 'var(--color-primary)' : 'transparent',
              color: pg === pagination.page ? '#fff' : 'var(--color-text-secondary)',
              cursor: 'pointer', fontWeight: '600',
            }}>{pg}</button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerOrdersPage;
