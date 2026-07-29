import { Link } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const tags = (product.ingredients || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card__image-wrap">
        {product.image ? (
          <img src={product.image} alt={product.name} className="product-card__image" />
        ) : (
          <div className="product-card__placeholder" />
        )}
      </div>
      <div className="product-card__body">
        {product.category?.name && <span className="eyebrow">{product.category.name}</span>}
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__desc">{product.short_description}</p>
        {tags.length > 0 && (
          <div className="product-card__tags">
            {tags.map((tag) => (
              <span key={tag} className="product-card__tag">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
