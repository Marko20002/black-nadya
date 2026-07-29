import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getPharmacies, submitOrderRequest } from '../api/resources';
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
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.phone.trim()) next.phone = 'Phone number is required';
    if (!form.products_wanted.trim()) next.products_wanted = 'Please list the product(s) you want';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitOrderRequest(form);
      toast.success("Order request sent! We'll contact you soon.");
      setForm(EMPTY_FORM);
      setErrors({});
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="section">
      <div className="container">
        <span className="eyebrow">Where to Buy</span>
        <h1>Two Ways to Get Black Nadya</h1>
        <hr className="rule-gold" />

        <div className="where-to-buy">
          <div className="card where-to-buy__panel">
            <h2>Order via Cargo / Courier</h2>
            <p className="where-to-buy__intro">
              Fill out this form and our team will reach out to arrange payment and courier
              delivery. No online payment is processed here.
            </p>
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="name">Full Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} />
                {errors.name && <span className="form-field-error">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
                {errors.phone && <span className="form-field-error">{errors.phone}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="email">Email (optional)</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="city">City</label>
                <input id="city" name="city" value={form.city} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" value={form.address} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="products_wanted">Product(s) Wanted</label>
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
                <label htmlFor="notes">Notes (optional)</label>
                <textarea id="notes" name="notes" rows={3} value={form.notes} onChange={handleChange} />
              </div>
              <button type="submit" className="btn btn--gold" disabled={submitting}>
                {submitting ? 'Sending…' : 'Submit Order Request'}
              </button>
            </form>
          </div>

          <div className="card where-to-buy__panel">
            <h2>Buy In-Person at a Pharmacy</h2>
            <p className="where-to-buy__intro">
              Black Nadya products are available at the following partner pharmacies.
            </p>
            {loadingPharmacies ? (
              <Loader label="Loading pharmacies…" />
            ) : pharmacies.length > 0 ? (
              <ul className="pharmacy-list">
                {pharmacies.map((pharmacy) => (
                  <li key={pharmacy.id} className="pharmacy-list__item">
                    <h4>{pharmacy.name}</h4>
                    <p>
                      {pharmacy.address}, {pharmacy.city}
                    </p>
                    {pharmacy.phone && <p>{pharmacy.phone}</p>}
                    {pharmacy.map_link && (
                      <a href={pharmacy.map_link} target="_blank" rel="noreferrer" className="pharmacy-list__map">
                        View on map →
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Pharmacy locations coming soon.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
