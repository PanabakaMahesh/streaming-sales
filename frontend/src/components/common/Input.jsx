import React from 'react';

const Input = React.forwardRef(({
  label,
  error,
  hint,
  icon,
  type = 'text',
  fullWidth = true,
  style: extraStyle,
  ...props
}, ref) => {
  const wrapperStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyle = {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    letterSpacing: '0.02em',
  };

  const inputWrapStyle = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  };

  const inputStyle = {
    width: '100%',
    padding: icon ? '10px 14px 10px 40px' : '10px 14px',
    background: 'var(--color-surface-raised)',
    border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
    borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)',
    fontSize: '14px',
    transition: 'border-color var(--transition-fast)',
    ...extraStyle,
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    color: 'var(--color-text-muted)',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none',
  };

  const errorStyle = {
    fontSize: '12px',
    color: 'var(--color-error)',
  };

  const hintStyle = {
    fontSize: '12px',
    color: 'var(--color-text-muted)',
  };

  return (
    <div style={wrapperStyle}>
      {label && <label style={labelStyle}>{label}</label>}
      <div style={inputWrapStyle}>
        {icon && <span style={iconStyle}>{icon}</span>}
        <input
          ref={ref}
          type={type}
          style={inputStyle}
          {...props}
        />
      </div>
      {error && <span style={errorStyle}>{error}</span>}
      {hint && !error && <span style={hintStyle}>{hint}</span>}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
