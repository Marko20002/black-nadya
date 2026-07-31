import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { getPharmacies, getProducts, submitOrderRequest } from '../api/resources';
import { pickTranslated } from '../i18n/pickTranslated';
import { useCart } from '../hooks/useCart';
import Loader from '../components/Loader';
import ProductChecklistModal from '../components/ProductChecklistModal';
import './WhereToBuy.css';

function formatItemsSummary(items) {
  return items.map(({ name, qty }) => `${qty}x ${name}`).join(', ');
}

const EMPTY_FORM = {
  name: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  products_wanted: '',
  notes: '',
};

export default function WhereToBuy() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const cart = useCart();
  const [pharmacies, setPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [allProducts, setAllProducts] = useState([]);
  const [dropdownProductId, setDropdownProductId] = useState('');
  const [checklistOpen, setChecklistOpen] = useState(false);
  const cartSyncedRef = useRef(false);

  useEffect(() => {
    getPharmacies()
      .then(setPharmacies)
      .catch(() => setPharmacies([]))
      .finally(() => setLoadingPharmacies(false));
  }, []);

  useEffect(() => {
    getProducts()
      .then(setAllProducts)
      .catch(() => setAllProducts([]));
  }, []);

  // Cart items may already be populated when arriving here via "Proceed to
  // Order" — fold them into the textarea once per page visit so the
  // person's own edits afterward aren't clobbered by re-syncing on re-render.
  useEffect(() => {
    if (cartSyncedRef.current || cart.items.length === 0) return;
    cartSyncedRef.current = true;
    const summary = formatItemsSummary(
      cart.items.map(({ product, qty }) => ({ name: pickTranslated(product, 'name', lang), qty }))
    );
    appendToProductsWanted(summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appendToProductsWanted = (summaryLine) => {
    if (!summaryLine) return;
    setForm((f) => {
      const trimmed = f.products_wanted.trim();
      return { ...f, products_wanted: trimmed ? `${trimmed}\n${summaryLine}` : summaryLine };
    });
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDropdownAdd = () => {
    if (!dropdownProductId) return;
    setChecklistOpen(true);
  };

  const handleChecklistConfirm = (selectedProducts) => {
    selectedProducts.forEach((product) => cart.add(product, 1));
    const summary = formatItemsSummary(
      selectedProducts.map((product) => ({ name: pickTranslated(product, 'name', lang), qty: 1 }))
    );
    appendToProductsWanted(summary);
    setChecklistOpen(false);
    setDropdownProductId('');
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t('whereToBuy.nameRequired');
    if (!form.phone.trim()) next.phone = t('whereToBuy.phoneRequired');
    if (!form.products_wanted.trim()) next.products_wanted = t('whereToBuy.productsRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitOrderRequest(form);
      toast.success(t('whereToBuy.successToast'));
      setForm(EMPTY_FORM);
      setErrors({});
      cart.clear();
      cartSyncedRef.current = false;
    } catch (err) {
      const message =
        err?.response?.status === 429 ? t('whereToBuy.tooManyRequestsToast') : t('whereToBuy.errorToast');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <span className="eyebrow">{t('whereToBuy.eyebrow')}</span>
        <h1>{t('whereToBuy.title')}</h1>
        <hr className="rule-gold" />

        <div className="where-to-buy">
          <div className="card where-to-buy__panel">
            <h2>{t('whereToBuy.cargoTitle')}</h2>
            <p className="where-to-buy__intro">{t('whereToBuy.cargoIntro')}</p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="name">{t('whereToBuy.fullName')}</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} />
                {errors.name && <span className="form-field-error">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="phone">{t('whereToBuy.phone')}</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                {errors.phone && <span className="form-field-error">{errors.phone}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="email">{t('whereToBuy.emailOptional')}</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="city">{t('whereToBuy.city')}</label>
                <input id="city" name="city" value={form.city} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="address">{t('whereToBuy.address')}</label>
                <input id="address" name="address" value={form.address} onChange={handleChange} />
              </div>
              {cart.items.length > 0 && (
                <div className="where-to-buy__cart-list">
                  <span className="where-to-buy__cart-list-label">{t('whereToBuy.cartItemsLabel')}</span>
                  <ul>
                    {cart.items.map(({ product, qty }) => (
                      <li key={product.id} className="where-to-buy__cart-row">
                        <span className="where-to-buy__cart-row-name">
                          {pickTranslated(product, 'name', lang)}
                        </span>
                        <div className="where-to-buy__cart-row-controls">
                          <div className="where-to-buy__cart-stepper">
                            <button
                              type="button"
                              onClick={() => cart.updateQuantity(product.id, qty - 1)}
                              aria-label={t('cart.decreaseQty')}
                            >
                              <Minus size={13} />
                            </button>
                            <span>{qty}</span>
                            <button
                              type="button"
                              onClick={() => cart.updateQuantity(product.id, qty + 1)}
                              aria-label={t('cart.increaseQty')}
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                          <button
                            type="button"
                            className="where-to-buy__cart-row-remove"
                            onClick={() => cart.removeItem(product.id)}
                            aria-label={t('cart.remove')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="where-to-buy__product-picker">
                <select
                  value={dropdownProductId}
                  onChange={(e) => setDropdownProductId(e.target.value)}
                  aria-label={t('whereToBuy.pickProduct')}
                >
                  <option value="">{t('whereToBuy.pickProduct')}</option>
                  {allProducts.map((product) => (
                    <option key={product.id} value={product.id}>
                      {pickTranslated(product, 'name', lang)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn--outline-dark"
                  disabled={!dropdownProductId}
                  onClick={handleDropdownAdd}
                >
                  {t('whereToBuy.addProduct')}
                </button>
              </div>

              <div className="form-field">
                <label htmlFor="products_wanted">{t('whereToBuy.productsWanted')}</label>
                <textarea
                  id="products_wanted"
                  name="products_wanted"
                  rows={3}
                  value={form.products_wanted}
                  onChange={handleChange}
                />
                {errors.products_wanted && <span className="form-field-error">{errors.products_wanted}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="notes">{t('whereToBuy.notesOptional')}</label>
                <textarea id="notes" name="notes" rows={3} value={form.notes} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn--gold" disabled={submitting}>
                {submitting ? t('whereToBuy.submitting') : t('whereToBuy.submit')}
              </button>
            </form>
          </div>

          <div className="card where-to-buy__panel">
            <h2>{t('whereToBuy.pharmacyTitle')}</h2>
            <p className="where-to-buy__intro">{t('whereToBuy.pharmacyIntro')}</p>
            {loadingPharmacies ? (
              <Loader label={t('whereToBuy.loadingPharmacies')} />
            ) : pharmacies.length > 0 ? (
              <ul className="pharmacy-list">
                {pharmacies.map((pharmacy) => (
                  <li key={pharmacy.id} className="pharmacy-list__item">
                    <h4>{pickTranslated(pharmacy, 'name', lang)}</h4>
                    <p>
                      {pickTranslated(pharmacy, 'address', lang)}, {pharmacy.city}
                    </p>
                    {pharmacy.phone && <p>{pharmacy.phone}</p>}
                    {pharmacy.map_link && (
                      <a href={pharmacy.map_link} target="_blank" rel="noreferrer" className="pharmacy-list__map">
                        {t('whereToBuy.viewOnMap')}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>{t('whereToBuy.noPharmacies')}</p>
            )}
          </div>
        </div>
      </div>

      <ProductChecklistModal
        open={checklistOpen}
        products={allProducts}
        initialSelectedId={dropdownProductId ? Number(dropdownProductId) : null}
        onConfirm={handleChecklistConfirm}
        onClose={() => setChecklistOpen(false)}
      />
    </div>
  );
}
