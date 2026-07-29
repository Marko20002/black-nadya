import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getProduct } from '../api/resources';
import { pickTranslated } from '../i18n/pickTranslated';
import { categoryLabel } from '../i18n/categoryLabel';
import Loader from '../components/Loader';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
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
          {product.category && <span className="eyebrow">{categoryLabel(product.category, t)}</span>}
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

          <Link to="/where-to-buy" className="btn btn--gold product-detail__cta">
            {t('productDetail.whereToBuyThis')}
          </Link>
        </div>
      </div>
    </div>
  );
}
