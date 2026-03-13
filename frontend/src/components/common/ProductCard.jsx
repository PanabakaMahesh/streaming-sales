import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {

  const cardStyle = {
    background: "var(--color-surface)",
    border: "1px solid var(--color-border)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
    transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
    textDecoration: "none",
    display: "block",
  };

  const imgStyle = {
    width: "100%",
    height: "200px",
    objectFit: "cover",
    background: "var(--color-surface-raised)",
  };

  const imgPlaceholderStyle = {
    width: "100%",
    height: "200px",
    background: "var(--color-surface-raised)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "48px",
  };

  const bodyStyle = {
    padding: "16px",
  };

  const nameStyle = {
    fontFamily: "var(--font-display)",
    fontWeight: "600",
    fontSize: "15px",
    color: "var(--color-text)",
    marginBottom: "6px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  };

  const priceStyle = {
    fontSize: "18px",
    fontWeight: "700",
    fontFamily: "var(--font-display)",
    color: "var(--color-primary)",
    marginBottom: "8px",
  };

  const metaStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  };

  const stockStyle = (qty) => ({
    fontSize: "12px",
    color: qty > 0 ? "var(--color-success)" : "var(--color-error)",
    fontWeight: "500",
  });

  const sellerStyle = {
    fontSize: "12px",
    color: "var(--color-text-muted)",
  };

  const categoryStyle = {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "var(--radius-full)",
    background: "var(--color-primary-bg)",
    color: "var(--color-primary)",
    fontSize: "11px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
  };

  return (
    <Link
      to={`/products/${product._id}`}
      style={cardStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = "var(--color-primary)";
        e.currentTarget.style.boxShadow = "var(--shadow-glow)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "var(--color-border)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {product.images?.[0] ? (
        <img
          src={product.images[0]}
          alt={product.name}
          style={imgStyle}
        />
      ) : (
        <div style={imgPlaceholderStyle}>📦</div>
      )}

      <div style={bodyStyle}>
        {product.category && (
          <span style={categoryStyle}>{product.category}</span>
        )}

        <div style={nameStyle}>{product.name}</div>

        <div style={priceStyle}>
          ₹{product.price?.toLocaleString("en-IN")}
        </div>

        <div style={metaStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              flexWrap: "wrap",
            }}
          >
            <span style={stockStyle(product.quantity)}>
              {product.quantity > 0
                ? `${product.quantity} in stock`
                : "Out of stock"}
            </span>

            {product.quantity > 0 && product.quantity < 5 && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  padding: "2px 7px",
                  borderRadius: "var(--radius-full)",
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.35)",
                  color: "#ef4444",
                  fontSize: "10px",
                  fontWeight: "700",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                🔥 Limited
              </span>
            )}
          </div>

          <span style={sellerStyle}>
            by {product.sellerId?.name || "Seller"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;