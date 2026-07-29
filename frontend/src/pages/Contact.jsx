import { useState } from 'react';
import toast from 'react-hot-toast';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { submitContactMessage } from '../api/resources';
import './Contact.css';

const EMPTY_FORM = { name: '', email: '', message: '' };

export default function Contact() {
  const { settings } = useSiteSettings();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    if (!form.message.trim()) next.message = 'Please write a message';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitContactMessage(form);
      toast.success('Message sent! We will get back to you shortly.');
      setForm(EMPTY_FORM);
      setErrors({});
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const social = settings?.social_links || {};

  return (
    <div className="section">
      <div className="container">
        <span className="eyebrow">Contact</span>
        <h1>Get in Touch</h1>
        <hr className="rule-gold" />

        <div className="contact-page">
          <div className="card contact-page__form">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} />
                {errors.name && <span className="form-field-error">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-field-error">{errors.email}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows={6} value={form.message} onChange={handleChange} />
                {errors.message && <span className="form-field-error">{errors.message}</span>}
              </div>
              <button type="submit" className="btn btn--gold" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </div>

          <div className="contact-page__details">
            <h3>Contact Details</h3>
            {settings?.contact_phone && <p>📞 {settings.contact_phone}</p>}
            {settings?.contact_email && <p>✉️ {settings.contact_email}</p>}
            {settings?.contact_address && <p>📍 {settings.contact_address}</p>}
            {Object.keys(social).length > 0 && (
              <div className="contact-page__social">
                {Object.entries(social).map(([name, url]) => (
                  <a key={name} href={url} target="_blank" rel="noreferrer">
                    {name}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
