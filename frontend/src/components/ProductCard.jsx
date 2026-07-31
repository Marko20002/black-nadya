import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { pickTranslated } from '../i18n/pickTranslated';
import { categoryLabel } from '../i18n/categoryLabel';
import { useCart } from '../hooks/useCart';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { t, i18n } = useTranslation();
  const cart = useCart();
  const lang = i18n.language?.split('-')[0] || 'en';

  const name = pickTranslated(product, 'name', lang);
  const shortDescription = pickTranslated(product, 'short_description', lang);
  const ingredients = pickTranslated(product, 'ingredients', lang);

  const tags = ingredients
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 3);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    cart.add(product, 1);
    toast.success(t('cart.addedToast'));
  };

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
        {product.category && <span className="eyebrow">{categoryLabel(product.category, lang)}</span>}
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
        <button type="button" className="btn btn--outline-dark product-card__add-btn" onClick={handleAddToCart}>
          {t('cart.addToCart')}
        </button>
      </div>
    </Link>
  );
}
