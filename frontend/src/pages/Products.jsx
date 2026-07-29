import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCategories, getProducts } from '../api/resources';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import './Products.css';

export default function Products() {
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
        <span className="eyebrow">Shop</span>
        <h1>Our Products</h1>
        <hr className="rule-gold" />

        <div className="category-filter">
          <button
            type="button"
            className={`category-filter__pill${!activeCategory ? ' category-filter__pill--active' : ''}`}
            onClick={() => selectCategory('')}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`category-filter__pill${activeCategory === cat.slug ? ' category-filter__pill--active' : ''}`}
              onClick={() => selectCategory(cat.slug)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <Loader label="Loading products…" />
        ) : products.length > 0 ? (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>No products found in this category yet.</p>
        )}
      </div>
    </div>
  );
}
