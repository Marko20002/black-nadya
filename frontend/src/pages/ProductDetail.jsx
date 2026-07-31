import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { getProduct } from '../api/resources';
import { pickTranslated } from '../i18n/pickTranslated';
import { categoryLabel } from '../i18n/categoryLabel';
import { useCart } from '../hooks/useCart';
import Loader from '../components/Loader';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const cart = useCart();
  const lang = i18n.language?.split('-')[0] || 'en';
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setQuantity(1);
    getProduct(slug)
      .then((data) => {
        setProduct(data);
        setActiveImage(data.image);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <Loader label={t('about.loading')} />;
  if (error || !product) {
    return (
      <div className="section container">
        <p>{t('productDetail.notFound')}</p>
        <Link to="/products" className="btn btn--outline-dark">
          {t('productDetail.backToProducts')}
        </Link>
      </div>
    );
  }

  const name = pickTranslated(product, 'name', lang);
  const description = pickTranslated(product, 'full_description', lang) || pickTranslated(product, 'short_description', lang);
  const ingredients = pickTranslated(product, 'ingredients', lang);

  const ingredientTags = ingredients
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  const gallery = [product.image, ...product.gallery_images.map((g) => g.image)].filter(Boolean);

  const handleAddToCart = () => {
    cart.add(product, quantity);
    toast.success(t('cart.addedToast'));
    setQuantity(1);
  };

  return (
    <div className="section">
      <div className="container product-detail">
        <div className="product-detail__gallery">
          <div className="product-detail__main-image">
            {activeImage ? <img src={activeImage} alt={name} /> : <div className="product-detail__placeholder" />}
          </div>
          {gallery.length > 1 && (
            <div className="product-detail__thumbs">
              {gallery.map((img) => (
                <button
                  key={img}
                  type="button"
                  className={`product-detail__thumb${activeImage === img ? ' product-detail__thumb--active' : ''}`}
                  onClick={() => setActiveImage(img)}
                >
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail__info">
          {product.category && <span className="eyebrow">{categoryLabel(product.category, lang)}</span>}
          <h1>{name}</h1>
          {product.size && <p className="product-detail__size">{product.size}</p>}
          <p className="product-detail__desc">{description}</p>

          {ingredientTags.length > 0 && (
            <>
              <h3>{t('productDetail.keyIngredients')}</h3>
              <div className="product-detail__tags">
                {ingredientTags.map((tag) => (
                  <span key={tag} className="product-card__tag">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}

          <div className="product-detail__cart-row">
            <div className="product-detail__stepper">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label={t('cart.decreaseQty')}
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                aria-label={t('cart.increaseQty')}
              >
                +
              </button>
            </div>
            <button type="button" className="btn btn--gold" onClick={handleAddToCart}>
              {t('cart.addToCart')}
            </button>
          </div>

          <Link to="/where-to-buy" className="btn btn--outline-dark product-detail__cta">
            {t('productDetail.whereToBuyThis')}
          </Link>
        </div>
      </div>
    </div>
  );
}
