import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { submitContactMessage } from '../api/resources';
import { pickTranslated } from '../i18n/pickTranslated';
import './Contact.css';

const EMPTY_FORM = { name: '', email: '', message: '' };

export default function Contact() {
  const { settings } = useSiteSettings();
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = t('contact.nameRequired');
    if (!form.email.trim()) next.email = t('contact.emailRequired');
    if (!form.message.trim()) next.message = t('contact.messageRequired');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await submitContactMessage(form);
      toast.success(t('contact.successToast'));
      setForm(EMPTY_FORM);
      setErrors({});
    } catch (err) {
      const message =
        err?.response?.status === 429 ? t('contact.tooManyRequestsToast') : t('contact.errorToast');
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const social = settings?.social_links || {};
  const contactAddress = pickTranslated(settings, 'contact_address', lang);

  return (
    <div className="section">
      <div className="container">
        <span className="eyebrow">{t('contact.eyebrow')}</span>
        <h1>{t('contact.title')}</h1>
        <hr className="rule-gold" />

        <div className="contact-page">
          <div className="card contact-page__form">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-field">
                <label htmlFor="name">{t('contact.name')}</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} />
                {errors.name && <span className="form-field-error">{errors.name}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="email">{t('contact.email')}</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                {errors.email && <span className="form-field-error">{errors.email}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="message">{t('contact.message')}</label>
                <textarea id="message" name="message" rows={6} value={form.message} onChange={handleChange} />
                {errors.message && <span className="form-field-error">{errors.message}</span>}
              </div>
              <button type="submit" className="btn btn--gold" disabled={submitting}>
                {submitting ? t('contact.sending') : t('contact.send')}
              </button>
            </form>
          </div>

          <div className="contact-page__details">
            <h3>{t('contact.detailsTitle')}</h3>
            {settings?.contact_phone && <p>📞 {settings.contact_phone}</p>}
            {settings?.contact_email && <p>✉️ {settings.contact_email}</p>}
            {contactAddress && <p>📍 {contactAddress}</p>}
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
