import React from 'react';

const styles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: 'var(--font-body)',
    fontWeight: '500',
    borderRadius: 'var(--radius-md)',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
    border: 'none',
    whiteSpace: 'nowrap',
  },
  variants: {
    primary: {
      background: 'var(--color-primary)',
      color: '#fff',
    },
    secondary: {
      background: 'var(--color-surface-raised)',
      color: 'var(--color-text)',
      border: '1px solid var(--color-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--color-text-secondary)',
    },
    danger: {
      background: 'var(--color-error)',
      color: '#fff',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: '1px solid var(--color-primary)',
    },
  },
  sizes: {
    sm: { padding: '6px 12px', fontSize: '13px' },
    md: { padding: '10px 20px', fontSize: '14px' },
    lg: { padding: '14px 28px', fontSize: '15px' },
    xl: { padding: '16px 36px', fontSize: '16px' },
  },
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  icon,
  onClick,
  type = 'button',
  style: extraStyle,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const btnStyle = {
    ...styles.base,
    ...styles.variants[variant],
    ...styles.sizes[size],
    width: fullWidth ? '100%' : 'auto',
    opacity: isDisabled ? 0.55 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    ...extraStyle,
  };

  return (
    <button
      type={type}
      style={btnStyle}
      disabled={isDisabled}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
            display: 'inline-block',
          }}
        />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
};

export default Button;
