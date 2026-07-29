import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from '../api/resources';
import Loader from '../components/Loader';
import './ProductDetail.css';

export default function ProductDetail() {
  const { slug } = useParams();
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

  if (loading) return <Loader label="Loading product…" />;
  if (error || !product) {
    return (
      <div className="section container">
        <p>We couldn't find that product.</p>
        <Link to="/products" className="btn btn--outline-dark">
          Back to Products
        </Link>
      </div>
    );
  }

  const ingredientTags = (product.ingredients || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const gallery = [product.image, ...product.gallery_images.map((g) => g.image)].filter(Boolean);

  return (
    <div className="section">
      <div className="container product-detail">
        <div className="product-detail__gallery">
          <div className="product-detail__main-image">
            {activeImage ? <img src={activeImage} alt={product.name} /> : <div className="product-detail__placeholder" />}
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
          {product.category?.name && <span className="eyebrow">{product.category.name}</span>}
          <h1>{product.name}</h1>
          {product.size && <p className="product-detail__size">{product.size}</p>}
          <p className="product-detail__desc">{product.full_description || product.short_description}</p>

          {ingredientTags.length > 0 && (
            <>
              <h3>Key Ingredients</h3>
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
            Where to Buy This
          </Link>
        </div>
      </div>
    </div>
  );
}
