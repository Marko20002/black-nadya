import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { getProducts } from '../api/resources';
import { pickTranslated } from '../i18n/pickTranslated';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Home.css';

export default function Home() {
  const { settings, loading: settingsLoading } = useSiteSettings();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
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

  const tagline = pickTranslated(settings, 'hero_tagline', lang) || 'Pure. Natural. Radiant.';

  return (
    <div>
      <section className="hero" style={heroStyle}>
        <div className="container hero__inner">
          {settings?.logo_image && (
            <img src={settings.logo_image} alt="Black Nadya" className="hero__logo" />
          )}
          <span className="eyebrow">{t('home.eyebrow')}</span>
          <h1 className="hero__title">Black Nadya</h1>
          <p className="hero__tagline">{settingsLoading ? '' : tagline}</p>
          <div className="hero__actions">
            <Link to="/products" className="btn btn--gold">
              {t('home.viewProducts')}
            </Link>
            <Link to="/where-to-buy" className="btn btn--outline">
              {t('home.whereToBuyCta')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">{t('home.featuredEyebrow')}</span>
          <h2>{t('home.featuredTitle')}</h2>
          <hr className="rule-gold" />
          {loadingProducts ? (
            <Loader label={t('home.loadingProducts')} />
          ) : featured.length > 0 ? (
            <div className="product-grid">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p>{t('home.noFeatured')}</p>
          )}
        </div>
      </section>

      <section className="section section--dark">
        <div className="container about-teaser">
          <div>
            <span className="eyebrow">{t('home.storyEyebrow')}</span>
            <h2>{t('home.storyTitle')}</h2>
            <p>{t('home.storyText')}</p>
            <Link to="/about" className="btn btn--outline">
              {t('home.readStory')}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow">{t('home.howToBuyEyebrow')}</span>
          <h2>{t('home.howToBuyTitle')}</h2>
          <hr className="rule-gold" />
          <div className="how-to-buy">
            <div className="card how-to-buy__option">
              <h3>{t('home.cargoTitle')}</h3>
              <p>{t('home.cargoText')}</p>
              <Link to="/where-to-buy" className="btn btn--outline-dark">
                {t('home.requestOrder')}
              </Link>
            </div>
            <div className="card how-to-buy__option">
              <h3>{t('home.pharmacyTitle')}</h3>
              <p>{t('home.pharmacyText')}</p>
              <Link to="/where-to-buy" className="btn btn--outline-dark">
                {t('home.findPharmacy')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
