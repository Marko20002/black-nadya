import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminSiteSettings } from '../api/resources';

const EMPTY_FORM = {
  contact_phone: '',
  contact_email: '',
  contact_address: '',
  instagram: '',
  facebook: '',
  footer_text: '',
};

export default function ManageContact() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminSiteSettings
      .get()
      .then((data) => {
        setForm({
          contact_phone: data.contact_phone || '',
          contact_email: data.contact_email || '',
          contact_address: data.contact_address || '',
          instagram: data.social_links?.instagram || '',
          facebook: data.social_links?.facebook || '',
          footer_text: data.footer_text || '',
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
      contact_address: form.contact_address,
      footer_text: form.footer_text,
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
        <div className="form-field">
          <label htmlFor="contact_address">Address</label>
          <input id="contact_address" name="contact_address" value={form.contact_address} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="instagram">Instagram Link</label>
          <input id="instagram" name="instagram" value={form.instagram} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="facebook">Facebook Link</label>
          <input id="facebook" name="facebook" value={form.facebook} onChange={handleChange} />
        </div>
        <div className="form-field">
          <label htmlFor="footer_text">Footer Text</label>
          <input id="footer_text" name="footer_text" value={form.footer_text} onChange={handleChange} />
        </div>
        <button type="submit" className="btn btn--gold" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
