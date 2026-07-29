import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { pickTranslated } from '../i18n/pickTranslated';
import { categoryLabel } from '../i18n/categoryLabel';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';

  const name = pickTranslated(product, 'name', lang);
  const shortDescription = pickTranslated(product, 'short_description', lang);
  const ingredients = pickTranslated(product, 'ingredients', lang);

  const tags = ingredients
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);

  return (
    <Link to={`/products/${product.slug}`} className="product-card">
      <div className="product-card__image-wrap">
        {product.image ? (
          <img src={product.image} alt={name} className="product-card__image" />
        ) : (
          <div className="product-card__placeholder" />
        )}
      </div>
      <div className="product-card__body">
        {product.category && <span className="eyebrow">{categoryLabel(product.category, t)}</span>}
        <h3 className="product-card__name">{name}</h3>
        <p className="product-card__desc">{shortDescription}</p>
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
