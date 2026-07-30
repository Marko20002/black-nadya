import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { getPharmacies, submitOrderRequest } from '../api/resources';
import { pickTranslated } from '../i18n/pickTranslated';
import Loader from '../components/Loader';
import './WhereToBuy.css';

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
  const [pharmacies, setPharmacies] = useState([]);
  const [loadingPharmacies, setLoadingPharmacies] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    getPharmacies()
      .then(setPharmacies)
      .catch(() => setPharmacies([]))
      .finally(() => setLoadingPharmacies(false));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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
    </div>
  );
}
