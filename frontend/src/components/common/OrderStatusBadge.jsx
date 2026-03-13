import React from 'react';

const STATUS_CONFIG = {
  Placed:     { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Placed' },
  Processing: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Processing' },
  Shipped:    { color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', label: 'Shipped' },
  Delivered:  { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  label: 'Delivered' },
  Cancelled:  { color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Cancelled' },
};

const OrderStatusBadge = ({ status, size = 'sm' }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG['Placed'];

  const style = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: size === 'sm' ? '3px 10px' : '5px 14px',
    borderRadius: 'var(--radius-full)',
    fontSize: size === 'sm' ? '12px' : '13px',
    fontWeight: '600',
    color: config.color,
    background: config.bg,
    border: `1px solid ${config.color}30`,
  };

  const dotStyle = {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: config.color,
    flexShrink: 0,
  };

  return (
    <span style={style}>
      <span style={dotStyle} />
      {config.label}
    </span>
  );
};

export default OrderStatusBadge;
