import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminSiteSettings } from '../api/resources';
import LangTabs from './components/LangTabs';

const EMPTY_FORM = {
  contact_phone: '',
  contact_email: '',
  instagram: '',
  facebook: '',
  contact_address_en: '',
  contact_address_mk: '',
  contact_address_sq: '',
  footer_text_en: '',
  footer_text_mk: '',
  footer_text_sq: '',
};

export default function ManageContact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeLang, setActiveLang] = useState('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminSiteSettings
      .get()
      .then((data) => {
        setForm({
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          instagram: data.social_links?.instagram || '',
          facebook: data.social_links?.facebook || '',
          contact_address_en: data.contact_address_en || '',
          contact_address_mk: data.contact_address_mk || '',
          contact_address_sq: data.contact_address_sq || '',
          footer_text_en: data.footer_text_en || '',
          footer_text_mk: data.footer_text_mk || '',
          footer_text_sq: data.footer_text_sq || '',
        });
      })
      .catch(() => toast.error('Failed to load contact info.'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      contact_phone: form.contact_phone,
      contact_email: form.contact_email,
      contact_address_en: form.contact_address_en,
      contact_address_mk: form.contact_address_mk,
      contact_address_sq: form.contact_address_sq,
      footer_text_en: form.footer_text_en,
      footer_text_mk: form.footer_text_mk,
      footer_text_sq: form.footer_text_sq,
      social_links: { instagram: form.instagram, facebook: form.facebook },
    };
    try {
      await adminSiteSettings.update(payload);
      toast.success('Contact info updated.');
    } catch {
      toast.error('Could not save contact info.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <div className="admin-header">
        <h1>Manage Contact Info</h1>
      </div>
      <form className="card" style={{ padding: 32, maxWidth: 560 }} onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="contact_phone">Phone</label>
          <input id="contact_phone" name="contact_phone" value={form.contact_phone} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="contact_email">Email</label>
          <input id="contact_email" name="contact_email" value={form.contact_email} onChange={handleChange} />
        </div>

        <label>Address</label>
        <LangTabs active={activeLang} onChange={setActiveLang} />
        <div className="form-field">
          <input
            name={`contact_address_${activeLang}`}
            value={form[`contact_address_${activeLang}`]}
            onChange={handleChange}
          />
        </div>

        <div className="form-field">
          <label htmlFor="instagram">Instagram Link</label>
          <input id="instagram" name="instagram" value={form.instagram} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="facebook">Facebook Link</label>
          <input id="facebook" name="facebook" value={form.facebook} onChange={handleChange} />
        </div>

        <label>Footer Text</label>
        <LangTabs active={activeLang} onChange={setActiveLang} />
        <div className="form-field">
          <input
            name={`footer_text_${activeLang}`}
            value={form[`footer_text_${activeLang}`]}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn--gold" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
