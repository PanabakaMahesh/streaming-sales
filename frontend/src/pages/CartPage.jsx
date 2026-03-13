import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { ordersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

const CartPage = () => {
  const { cartItems, removeFromCart, updateQty, clearCart, cartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step: 'cart' | 'address' | 'payment' | 'success'
  const [step, setStep] = useState('cart');
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState('');
  const [placedOrders, setPlacedOrders] = useState([]);

  const handlePlaceAllOrders = async () => {
    setOrdering(true);
    setError('');
    try {
      const results = [];
      for (const item of cartItems) {
        const res = await ordersAPI.place({
          productId: item._id,
          quantity: item.cartQty,
          shippingAddress: address,
          paymentMethod,
        });
        results.push(res.data.data.order);
      }
      setPlacedOrders(results);
      clearCart();
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place one or more orders. Please try again.');
    } finally {
      setOrdering(false);
    }
  };

  const containerStyle = { maxWidth: '760px', margin: '0 auto', padding: '40px 24px' };
  const cardStyle = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '16px' };
  const inputStyle = { padding: '10px 14px', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text)', fontSize: '14px', width: '100%' };

  const stepIndicatorStyle = { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px', fontSize: '13px' };
  const stepDotStyle = (active, done) => ({
    width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700',
    background: done ? 'var(--color-success)' : active ? 'var(--color-primary)' : 'var(--color-surface-raised)',
    color: done || active ? '#fff' : 'var(--color-text-muted)',
    border: `2px solid ${done ? 'var(--color-success)' : active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    flexShrink: 0,
  });
  const stepLineStyle = (done) => ({ flex: 1, height: '2px', background: done ? 'var(--color-success)' : 'var(--color-border)' });

  const steps = ['Cart', 'Address', 'Payment'];
  const stepIndex = { cart: 0, address: 1, payment: 2, success: 3 };
  const currentStepIndex = stepIndex[step] ?? 0;

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{ ...containerStyle, textAlign: 'center', paddingTop: '60px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px', marginBottom: '8px' }}>
          Orders Placed!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '28px' }}>
          {placedOrders.length} order{placedOrders.length > 1 ? 's' : ''} confirmed successfully.
        </p>
        <div style={{ ...cardStyle, textAlign: 'left' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '14px' }}>
            Summary
          </div>
          {placedOrders.map((order, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < placedOrders.length - 1 ? '1px solid var(--color-border)' : 'none', fontSize: '14px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Order {i + 1}</span>
              <span style={{ fontWeight: '600', color: 'var(--color-primary)' }}>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', fontWeight: '700', fontSize: '16px' }}>
            <span>Total</span>
            <span style={{ color: 'var(--color-primary)' }}>
              ₹{placedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0).toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Payment: {paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'} · Delivering to {address.city}, {address.state}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '8px' }}>
          <Button onClick={() => navigate('/buyer/orders')}>View My Orders</Button>
          <Button variant="secondary" onClick={() => navigate('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  // ── EMPTY CART ────────────────────────────────────────────────────────────
  if (cartItems.length === 0 && step === 'cart') {
    return (
      <div style={{ ...containerStyle, textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🛒</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '24px', marginBottom: '8px' }}>
          Your cart is empty
        </h2>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '24px' }}>
          Browse the marketplace and add products to your cart.
        </p>
        <Button onClick={() => navigate('/products')}>Browse Marketplace</Button>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '26px', marginBottom: '28px' }}>
        🛒 My Cart
      </h1>

      {/* Step Indicator */}
      <div style={stepIndicatorStyle}>
        {steps.map((s, i) => (
          <React.Fragment key={s}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={stepDotStyle(currentStepIndex === i, currentStepIndex > i)}>
                {currentStepIndex > i ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '11px', color: currentStepIndex === i ? 'var(--color-primary)' : 'var(--color-text-muted)', fontWeight: currentStepIndex === i ? '600' : '400' }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && <div style={stepLineStyle(currentStepIndex > i)} />}
          </React.Fragment>
        ))}
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--color-error)', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      {/* ── STEP: CART ── */}
      {step === 'cart' && (
        <>
          <div style={cardStyle}>
            {cartItems.map((item, i) => (
              <div key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 0', borderBottom: i < cartItems.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                {item.images?.[0] ? (
                  <img src={item.images[0]} alt={item.name} style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0 }}>📦</div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                  <div style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '14px' }}>₹{item.price?.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                  <button onClick={() => updateQty(item._id, item.cartQty - 1)} disabled={item.cartQty <= 1} style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontWeight: '700', minWidth: '20px', textAlign: 'center' }}>{item.cartQty}</span>
                  <button onClick={() => updateQty(item._id, item.cartQty + 1)} disabled={item.cartQty >= item.quantity} style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
                <div style={{ fontWeight: '700', color: 'var(--color-text)', minWidth: '90px', textAlign: 'right', fontSize: '14px' }}>
                  ₹{(item.price * item.cartQty).toLocaleString('en-IN')}
                </div>
                <button onClick={() => removeFromCart(item._id)} style={{ background: 'none', border: 'none', color: 'var(--color-error)', cursor: 'pointer', fontSize: '18px', padding: '4px', flexShrink: 0 }} title="Remove">🗑</button>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '8px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal ({cartItems.length} item{cartItems.length > 1 ? 's' : ''})</span>
              <span>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '12px' }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Shipping</span>
              <span style={{ color: 'var(--color-success)' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '18px', paddingTop: '12px', borderTop: '1px solid var(--color-border)' }}>
              <span>Total</span>
              <span style={{ color: 'var(--color-primary)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <Button fullWidth size="lg" onClick={() => setStep('address')}>
            Proceed to Checkout →
          </Button>
        </>
      )}

      {/* ── STEP: ADDRESS ── */}
      {step === 'address' && (
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
            📍 Delivery Address
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { field: 'street', placeholder: 'Street / House No / Area' },
              { field: 'city', placeholder: 'City' },
              { field: 'state', placeholder: 'State' },
              { field: 'pincode', placeholder: 'Pincode' },
            ].map(({ field, placeholder }) => (
              <input key={field} placeholder={placeholder} value={address[field]} onChange={e => setAddress(p => ({ ...p, [field]: e.target.value }))} required style={inputStyle} />
            ))}
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <Button fullWidth onClick={() => {
              if (!address.street || !address.city || !address.state || !address.pincode) {
                setError('Please fill all address fields.');
                return;
              }
              setError('');
              setStep('payment');
            }}>
              Continue to Payment →
            </Button>
            <Button variant="secondary" onClick={() => setStep('cart')}>Back</Button>
          </div>
        </div>
      )}

      {/* ── STEP: PAYMENT ── */}
      {step === 'payment' && (
        <div style={cardStyle}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
            💳 Payment Method
          </h3>

          {/* COD */}
          <div onClick={() => setPaymentMethod('cod')} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '10px', cursor: 'pointer', border: `2px solid ${paymentMethod === 'cod' ? 'var(--color-primary)' : 'var(--color-border)'}`, background: paymentMethod === 'cod' ? 'var(--color-primary-bg)' : 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s' }}>
            <span style={{ fontSize: '24px' }}>💵</span>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>Cash on Delivery</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Pay when your order arrives</div>
            </div>
            {paymentMethod === 'cod' && <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: '700' }}>✓</span>}
          </div>

          {/* UPI */}
          <div onClick={() => setPaymentMethod('upi')} style={{ padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', cursor: 'pointer', border: `2px solid ${paymentMethod === 'upi' ? 'var(--color-primary)' : 'var(--color-border)'}`, background: paymentMethod === 'upi' ? 'var(--color-primary-bg)' : 'var(--color-surface-raised)', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s' }}>
            <span style={{ fontSize: '24px' }}>📱</span>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px' }}>UPI Payment</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Scan QR code and pay instantly</div>
            </div>
            {paymentMethod === 'upi' && <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: '700' }}>✓</span>}
          </div>

          {/* UPI QR */}
          {paymentMethod === 'upi' && (
            <div style={{ textAlign: 'center', padding: '20px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>Scan with any UPI app</div>
              <div style={{ width: '160px', height: '160px', margin: '0 auto 12px', background: '#fff', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', color: '#333', fontWeight: '600', padding: '12px', textAlign: 'center', border: '2px solid var(--color-border)' }}>
                {/* Replace with: <img src="/upi-qr.png" alt="UPI QR" style={{ width: '100%' }} /> */}
                📷 Your UPI QR Code Here
              </div>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>UPI ID: yourname@upi</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Amount: ₹{cartTotal.toLocaleString('en-IN')}
              </div>
              <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: '#f59e0b' }}>
                ⚠️ After payment, click Confirm Order below
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={{ padding: '12px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</span>
              <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>₹{cartTotal.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Delivering to</span>
              <span>{address.city}, {address.state}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <Button fullWidth loading={ordering} onClick={handlePlaceAllOrders}>
              {paymentMethod === 'cod' ? '✅ Confirm Order (COD)' : '✅ I have Paid – Confirm Order'}
            </Button>
            <Button variant="secondary" onClick={() => setStep('address')}>Back</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;