import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

const Navbar = () => {
  const { user, logout, isSeller, isBuyer } = useAuth();
  const { cartCount } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const navStyle = {
    background: 'rgba(13,13,15,0.92)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid var(--color-border)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const innerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  };

  const logoStyle = {
    fontFamily: 'var(--font-display)',
    fontWeight: '800',
    fontSize: '20px',
    color: 'var(--color-text)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textDecoration: 'none',
  };

  const navLinksStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const linkStyle = (active) => ({
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    background: active ? 'var(--color-primary-bg)' : 'transparent',
    transition: 'all 0.15s ease',
    textDecoration: 'none',
  });

  const badgeStyle = {
    background: 'var(--color-primary)',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: 'var(--radius-full)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const avatarStyle = {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'var(--color-primary)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
  };

  const logoutBtnStyle = {
    padding: '6px 14px',
    borderRadius: 'var(--radius-md)',
    fontSize: '14px',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-border)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };

  return (
    <nav style={navStyle}>
      <div style={innerStyle}>

        {/* Logo */}
        <Link to="/" style={logoStyle}>
          <span style={{ color: 'var(--color-primary)', fontSize: '22px' }}>
            ▶
          </span>
          StreamSales
        </Link>

        {/* Navigation Links */}
        <div style={navLinksStyle}>

          <Link
            to="/products"
            style={linkStyle(isActive('/products'))}
          >
            Marketplace
          </Link>

          <Link
            to="/streams"
            style={linkStyle(isActive('/streams'))}
          >
            Live
            <span style={{ ...badgeStyle, marginLeft: '6px' }}>
              LIVE
            </span>
          </Link>

          {user ? (
            <>
              {/* Buyer Navigation */}
              {isBuyer && (
                <>
                  <Link
                    to="/buyer/dashboard"
                    style={linkStyle(isActive('/buyer/dashboard'))}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/buyer/orders"
                    style={linkStyle(isActive('/buyer/orders'))}
                  >
                    Orders
                  </Link>

                  <Link
                    to="/cart"
                    style={{
                      ...linkStyle(isActive('/cart')),
                      position: 'relative',
                    }}
                  >
                    🛒 Cart

                    {cartCount > 0 && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: 'var(--color-primary)',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          fontSize: '10px',
                          fontWeight: '700',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {/* Seller Navigation */}
              {isSeller && (
                <>
                  <Link
                    to="/seller/dashboard"
                    style={linkStyle(isActive('/seller/dashboard'))}
                  >
                    Dashboard
                  </Link>

                  <Link
                    to="/seller/products"
                    style={linkStyle(isActive('/seller/products'))}
                  >
                    Products
                  </Link>

                  <Link
                    to="/seller/orders"
                    style={linkStyle(isActive('/seller/orders'))}
                  >
                    Orders
                  </Link>

                  <Link
                    to="/seller/streams"
                    style={linkStyle(isActive('/seller/streams'))}
                  >
                    Stream
                  </Link>
                </>
              )}

              {/* User Avatar + Logout */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginLeft: '8px',
                }}
              >
                <div style={avatarStyle} title={user.name}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>

                <button
                  style={logoutBtnStyle}
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: '8px',
                marginLeft: '8px',
              }}
            >
              <Link
                to="/login"
                style={linkStyle(isActive('/login'))}
              >
                Login
              </Link>

              <Link
                to="/register"
                style={{
                  padding: '6px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '14px',
                  fontWeight: '600',
                  background: 'var(--color-primary)',
                  color: '#fff',
                  textDecoration: 'none',
                  transition: 'background 0.15s ease',
                }}
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;