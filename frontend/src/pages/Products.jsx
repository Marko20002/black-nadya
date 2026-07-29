import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getCategories, getProducts } from '../api/resources';
import { categoryLabel } from '../i18n/categoryLabel';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Products.css';

export default function Products() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || '';
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts(activeCategory ? { category: activeCategory } : {})
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [activeCategory]);

  const selectCategory = (slug) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="section">
      <div className="container">
        <span className="eyebrow">{t('products.eyebrow')}</span>
        <h1>{t('products.title')}</h1>
        <hr className="rule-gold" />

        <div className="category-filter">
          <button
            type="button"
            className={`category-filter__pill${!activeCategory ? ' category-filter__pill--active' : ''}`}
            onClick={() => selectCategory('')}
          >
            {t('products.all')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-filter__pill${activeCategory === cat.slug ? ' category-filter__pill--active' : ''}`}
              onClick={() => selectCategory(cat.slug)}
            >
              {categoryLabel(cat, t)}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader label={t('products.loading')} />
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>{t('products.empty')}</p>
        )}
      </div>
    </div>
  );
}
