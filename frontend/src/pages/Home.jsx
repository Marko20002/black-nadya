import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getProducts } from '../api/resources';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Home.css';

export default function Home() {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const [featured, setFeatured] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    getProducts({ featured: 1 })
      .then(setFeatured)
      .catch(() => setFeatured([]))
      .finally(() => setLoadingProducts(false));
  }, []);

  const heroStyle = settings?.hero_background_image
    ? { backgroundImage: `linear-gradient(rgba(13,13,13,0.55), rgba(13,13,13,0.75)), url(${settings.hero_background_image})` }
    : undefined;

  return (
    <div>
      <section className="hero" style={heroStyle}>
        <div className="container hero__inner">
          {settings?.logo_image && (
            <img src={settings.logo_image} alt="Black Nadya" className="hero__logo" />
          )}
          <span className="eyebrow">Natural Cosmetics</span>
          <h1 className="hero__title">Black Nadya</h1>
          <p className="hero__tagline">
            {settingsLoading ? '' : settings?.hero_tagline || 'Pure. Natural. Radiant.'}
          </p>
          <div className="hero__actions">
            <Link to="/products" className="btn btn--gold">
              View Products
            </Link>
            <Link to="/where-to-buy" className="btn btn--outline">
              Where to Buy
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">Featured</span>
          <h2>Our Signature Collection</h2>
          <hr className="rule-gold" />
          {loadingProducts ? (
            <Loader label="Loading products…" />
          ) : featured.length > 0 ? (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p>Featured products will appear here soon.</p>
          )}
        </div>
      </section>

      <section className="section section--dark">
        <div className="container about-teaser">
          <div>
            <span className="eyebrow">Our Story</span>
            <h2>Rooted in Nature, Refined by Science</h2>
            <p>
              Black Nadya was founded on a simple belief: skincare should be both effective and
              honest. Discover the story behind our formulas and the people who make them.
            </p>
            <Link to="/about" className="btn btn--outline">
              Read Our Story
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">How to Buy</span>
          <h2>Two Simple Ways to Get Black Nadya</h2>
          <hr className="rule-gold" />
          <div className="how-to-buy">
            <div className="card how-to-buy__option">
              <h3>Order via Cargo / Courier</h3>
              <p>
                Tell us what you'd like and where to send it — we'll arrange courier delivery
                directly to your door.
              </p>
              <Link to="/where-to-buy" className="btn btn--outline-dark">
                Request an Order
              </Link>
            </div>
            <div className="card how-to-buy__option">
              <h3>Buy In-Person at a Pharmacy</h3>
              <p>
                Prefer to shop in person? Find a partner pharmacy near you that carries the full
                Black Nadya range.
              </p>
              <Link to="/where-to-buy" className="btn btn--outline-dark">
                Find a Pharmacy
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
