import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI, ordersAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';
import Button from '../components/common/Button';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isBuyer } = useAuth();
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [selectedImg, setSelectedImg] = useState(0);

  // Step: 'detail' | 'cart' | 'address' | 'payment' | 'success'
  const [step, setStep] = useState('detail');
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [ordering, setOrdering] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await productsAPI.getById(id);
        setProduct(res.data.data.product);
      } catch {
        setError('Product not found.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleConfirmOrder = async () => {
    setOrdering(true);
    setError('');
    try {
      const res = await ordersAPI.place({
        productId: id,
        quantity,
        shippingAddress: address,
        paymentMethod,
      });
      setPlacedOrder(res.data.data.order);
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order.');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px', color: 'var(--color-text-secondary)' }}>
      Loading product...
    </div>
  );
  if (!product) return (
    <div style={{ textAlign: 'center', padding: '80px', color: 'var(--color-error)' }}>Product not found.</div>
  );

  const containerStyle = { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px' };
  const gridStyle = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'start' };

  const mainImgStyle = {
    width: '100%', aspectRatio: '1/1', objectFit: 'cover',
    borderRadius: 'var(--radius-lg)', background: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
  };
  const thumbsStyle = { display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' };
  const thumbStyle = (active) => ({
    width: '64px', height: '64px', objectFit: 'cover',
    borderRadius: 'var(--radius-sm)',
    border: `2px solid ${active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    cursor: 'pointer',
  });
  const placeholderImgStyle = {
    width: '100%', aspectRatio: '1/1',
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '80px',
  };
  const inputStyle = {
    padding: '10px 14px', background: 'var(--color-surface-raised)',
    border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
    color: 'var(--color-text)', fontSize: '14px', width: '100%',
  };
  const cardStyle = {
    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-lg)', padding: '24px',
  };
  const stepIndicatorStyle = {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginBottom: '24px', fontSize: '13px',
  };
  const stepDotStyle = (active, done) => ({
    width: '28px', height: '28px', borderRadius: '50%', display: 'flex',
    alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700',
    background: done ? 'var(--color-success)' : active ? 'var(--color-primary)' : 'var(--color-surface-raised)',
    color: done || active ? '#fff' : 'var(--color-text-muted)',
    border: `2px solid ${done ? 'var(--color-success)' : active ? 'var(--color-primary)' : 'var(--color-border)'}`,
    flexShrink: 0,
  });
  const stepLineStyle = (done) => ({
    flex: 1, height: '2px',
    background: done ? 'var(--color-success)' : 'var(--color-border)',
  });

  const steps = ['Cart', 'Address', 'Payment'];
  const stepIndex = { cart: 0, address: 1, payment: 2, success: 3 };
  const currentStepIndex = stepIndex[step] ?? -1;

  // ── SUCCESS PAGE ──────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div style={{ ...containerStyle, maxWidth: '600px', textAlign: 'center', paddingTop: '80px' }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎉</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '28px', marginBottom: '8px' }}>
          Order Placed!
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '28px' }}>
          Your order has been confirmed and is being processed.
        </p>
        <div style={{ ...cardStyle, textAlign: 'left', marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Summary</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Product</span>
            <span style={{ fontWeight: '600' }}>{product.name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Quantity</span>
            <span style={{ fontWeight: '600' }}>{quantity}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Total Paid</span>
            <span style={{ fontWeight: '700', color: 'var(--color-primary)', fontSize: '16px' }}>
              ₹{(product.price * quantity).toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Payment</span>
            <span style={{ fontWeight: '600' }}>{paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI'}</span>
          </div>
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: '12px', paddingTop: '12px' }}>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Delivering to</div>
            <div style={{ fontSize: '14px', marginTop: '4px' }}>
              {address.street}, {address.city}, {address.state} – {address.pincode}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <Button onClick={() => navigate('/buyer/orders')}>View My Orders</Button>
          <Button variant="secondary" onClick={() => navigate('/products')}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={gridStyle}>
        {/* ── LEFT: Images ── */}
        <div>
          {product.images?.length > 0 ? (
            <>
              <img src={product.images[selectedImg]} alt={product.name} style={mainImgStyle} />
              {product.images.length > 1 && (
                <div style={thumbsStyle}>
                  {product.images.map((img, i) => (
                    <img key={i} src={img} alt="" style={thumbStyle(i === selectedImg)} onClick={() => setSelectedImg(i)} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={placeholderImgStyle}>📦</div>
          )}
        </div>

        {/* ── RIGHT: Details + Flow ── */}
        <div>
          {/* Product Info — always visible */}
          {product.category && (
            <span style={{
              display: 'inline-block', padding: '3px 10px', borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary-bg)', color: 'var(--color-primary)',
              fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px',
            }}>
              {product.category}
            </span>
          )}
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: '800', fontSize: '26px', marginBottom: '12px' }}>
            {product.name}
          </h1>
          <div style={{ fontSize: '32px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: '16px' }}>
            ₹{product.price?.toLocaleString('en-IN')}
          </div>
          <p style={{ color: 'var(--color-text-secondary)', lineHeight: '1.7', marginBottom: '20px' }}>
            {product.description}
          </p>

          {/* Stock */}
          <div style={{
            padding: '12px 16px', background: 'var(--color-surface)',
            border: `1px solid ${product.quantity < 5 && product.quantity > 0 ? 'rgba(239,68,68,0.3)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ color: product.quantity > 0 ? 'var(--color-success)' : 'var(--color-error)', fontWeight: '600' }}>
              {product.quantity > 0 ? `✓ ${product.quantity} units in stock` : '✗ Out of stock'}
            </span>
            {product.quantity > 0 && product.quantity < 5 && (
              <span style={{
                padding: '3px 10px', borderRadius: 'var(--radius-full)',
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)',
                color: '#ef4444', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase',
                animation: 'pulse 1.8s infinite',
              }}>
                🔥 Limited Stock
              </span>
            )}
          </div>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '12px', color: 'var(--color-error)', marginBottom: '16px', fontSize: '14px' }}>
              {error}
            </div>
          )}

          {/* ── STEP: DETAIL (initial Buy Now button) ── */}
          {step === 'detail' && (
            <>
              {isBuyer && product.quantity > 0 && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Button
                    fullWidth
                    size="lg"
                    variant="secondary"
                    onClick={() => {
                      addToCart(product, 1);
                      setAddedToCart(true);
                      setTimeout(() => setAddedToCart(false), 2000);
                    }}
                  >
                    {addedToCart ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                  </Button>
                  <Button fullWidth size="lg" onClick={() => setStep('cart')}>
                    Buy Now
                  </Button>
                </div>
              )}
              {!user && (
                <Button fullWidth size="lg" onClick={() => navigate('/login')}>Login to Buy</Button>
              )}
            </>
          )}

          {/* ── STEP INDICATOR ── */}
          {['cart', 'address', 'payment'].includes(step) && (
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
          )}

          {/* ── STEP: CART ── */}
          {step === 'cart' && (
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
                🛒 Your Cart
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '12px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '32px' }}>📦</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>{product.name}</div>
                  <div style={{ color: 'var(--color-primary)', fontWeight: '700' }}>₹{product.price?.toLocaleString('en-IN')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <span style={{ fontSize: '14px', color: 'var(--color-text-secondary)', minWidth: '70px' }}>Quantity</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                  <span style={{ fontWeight: '700', fontSize: '16px', minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))} style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Subtotal</span>
                  <span>₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--color-text-secondary)' }}>Shipping</span>
                  <span style={{ color: 'var(--color-success)' }}>FREE</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--color-primary)' }}>₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Button fullWidth onClick={() => setStep('address')}>Proceed to Checkout →</Button>
                <Button variant="secondary" onClick={() => setStep('detail')}>Back</Button>
              </div>
            </div>
          )}

          {/* ── STEP: ADDRESS ── */}
          {step === 'address' && (
            <div style={cardStyle}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '16px', marginBottom: '16px' }}>
                📍 Delivery Address
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { field: 'street', placeholder: 'Street / House No / Area', label: 'Street' },
                  { field: 'city', placeholder: 'City', label: 'City' },
                  { field: 'state', placeholder: 'State', label: 'State' },
                  { field: 'pincode', placeholder: 'Pincode', label: 'Pincode' },
                ].map(({ field, placeholder }) => (
                  <input
                    key={field}
                    placeholder={placeholder}
                    value={address[field]}
                    onChange={e => setAddress(p => ({ ...p, [field]: e.target.value }))}
                    required
                    style={inputStyle}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <Button
                  fullWidth
                  onClick={() => {
                    if (!address.street || !address.city || !address.state || !address.pincode) {
                      setError('Please fill all address fields.');
                      return;
                    }
                    setError('');
                    setStep('payment');
                  }}
                >
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

              {/* COD Option */}
              <div
                onClick={() => setPaymentMethod('cod')}
                style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '10px', cursor: 'pointer',
                  border: `2px solid ${paymentMethod === 'cod' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: paymentMethod === 'cod' ? 'var(--color-primary-bg)' : 'var(--color-surface-raised)',
                  display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '24px' }}>💵</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>Cash on Delivery</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Pay when your order arrives</div>
                </div>
                {paymentMethod === 'cod' && <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: '700' }}>✓</span>}
              </div>

              {/* UPI Option */}
              <div
                onClick={() => setPaymentMethod('upi')}
                style={{
                  padding: '14px 16px', borderRadius: 'var(--radius-md)', marginBottom: '16px', cursor: 'pointer',
                  border: `2px solid ${paymentMethod === 'upi' ? 'var(--color-primary)' : 'var(--color-border)'}`,
                  background: paymentMethod === 'upi' ? 'var(--color-primary-bg)' : 'var(--color-surface-raised)',
                  display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.15s',
                }}
              >
                <span style={{ fontSize: '24px' }}>📱</span>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px' }}>UPI Payment</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Scan QR code and pay instantly</div>
                </div>
                {paymentMethod === 'upi' && <span style={{ marginLeft: 'auto', color: 'var(--color-primary)', fontWeight: '700' }}>✓</span>}
              </div>

              {/* UPI QR Code */}
              {paymentMethod === 'upi' && (
                <div style={{ textAlign: 'center', padding: '20px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                    Scan with any UPI app
                  </div>
                  {/* QR Code placeholder — replace src with your actual UPI QR image */}
                  <div style={{
                    width: '160px', height: '160px', margin: '0 auto 12px',
                    background: '#fff', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', color: '#333', fontWeight: '600', padding: '12px',
                    textAlign: 'center', border: '2px solid var(--color-border)',
                  }}>
                    
                      
                      <img src="/payment_gateway1.png" alt="UPI QR" style={{ width: '160px', borderRadius: '8px' }} />
                      
                    
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-text)' }}>
                    UPI ID: rajinionly@upi
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                    Amount: ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </div>
                  <div style={{ marginTop: '10px', padding: '8px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: '#f59e0b' }}>
                    ⚠️ After payment, click "Confirm Order" below
                  </div>
                </div>
              )}

              {/* Order Summary */}
              <div style={{ padding: '12px', background: 'var(--color-surface-raised)', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>{product.name} × {quantity}</span>
                  <span style={{ fontWeight: '700', color: 'var(--color-primary)' }}>₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Delivering to</span>
                  <span>{address.city}, {address.state}</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button fullWidth loading={ordering} onClick={handleConfirmOrder}>
                  {paymentMethod === 'cod' ? '✅ Confirm Order (COD)' : '✅ I have Paid – Confirm Order'}
                </Button>
                <Button variant="secondary" onClick={() => setStep('address')}>Back</Button>
              </div>
            </div>
          )}

          {/* Seller info */}
          {step === 'detail' && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sold by</div>
              <div style={{ fontWeight: '600', fontSize: '15px', marginTop: '4px' }}>{product.sellerId?.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;