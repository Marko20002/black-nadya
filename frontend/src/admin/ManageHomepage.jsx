import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminSiteSettings } from '../api/resources';
import ImageDropzone from './components/ImageDropzone';
import LangTabs from './components/LangTabs';

export default function ManageHomepage() {
  const [settings, setSettings] = useState(null);
  const [tagline, setTagline] = useState({ en: '', mk: '', sq: '' });
  const [activeLang, setActiveLang] = useState('en');
  const [backgroundFile, setBackgroundFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminSiteSettings
      .get()
      .then((data) => {
        setSettings(data);
        setTagline({
          en: data.hero_tagline_en || '',
          mk: data.hero_tagline_mk || '',
          sq: data.hero_tagline_sq || '',
        });
      })
      .catch(() => toast.error('Failed to load homepage settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      hero_tagline_en: tagline.en,
      hero_tagline_mk: tagline.mk,
      hero_tagline_sq: tagline.sq,
    };
    if (backgroundFile) payload.hero_background_image = backgroundFile;
    if (logoFile) payload.logo_image = logoFile;
    try {
      const updated = await adminSiteSettings.update(payload);
      setSettings(updated);
      toast.success('Homepage updated.');
    } catch {
      toast.error('Could not save homepage settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <div className="admin-header">
        <h1>Manage Homepage</h1>
      </div>
      <form className="card" style={{ padding: 32, maxWidth: 560 }} onSubmit={handleSubmit}>
        <ImageDropzone
          label="Change Background Image"
          currentImageUrl={settings?.hero_background_image}
          onFileSelected={setBackgroundFile}
        />

        <ImageDropzone
          label="Change Logo"
          currentImageUrl={settings?.logo_image}
          onFileSelected={setLogoFile}
        />

        <label>Hero Tagline</label>
        <LangTabs active={activeLang} onChange={setActiveLang} />
        <div className="form-field">
          <input
            value={tagline[activeLang]}
            onChange={(e) => setTagline({ ...tagline, [activeLang]: e.target.value })}
          />
        </div>

        <button type="submit" className="btn btn--gold" disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
