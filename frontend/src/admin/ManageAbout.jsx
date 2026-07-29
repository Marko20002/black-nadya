import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { adminSiteSettings } from '../api/resources';
import ImageDropzone from './components/ImageDropzone';
import LangTabs from './components/LangTabs';

const QUILL_MODULES = {
  toolbar: [
    [{ header: [2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
};

export default function ManageAbout() {
  const [settings, setSettings] = useState(null);
  const [text, setText] = useState({ en: '', mk: '', sq: '' });
  const [activeLang, setActiveLang] = useState('en');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminSiteSettings
      .get()
      .then((data) => {
        setSettings(data);
        setText({
          en: data.about_us_text_en || '',
          mk: data.about_us_text_mk || '',
          sq: data.about_us_text_sq || '',
        });
      })
      .catch(() => toast.error('Failed to load About Us content.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      about_us_text_en: text.en,
      about_us_text_mk: text.mk,
      about_us_text_sq: text.sq,
    };
    if (imageFile) payload.about_us_image = imageFile;
    try {
      const updated = await adminSiteSettings.update(payload);
      setSettings(updated);
      toast.success('About Us page updated.');
    } catch {
      toast.error('Could not save About Us content.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div>
      <div className="admin-header">
        <h1>Manage About Us</h1>
      </div>
      <form className="card" style={{ padding: 32, maxWidth: 720 }} onSubmit={handleSubmit}>
        <ImageDropzone
          label="About Us Image"
          currentImageUrl={settings?.about_us_image}
          onFileSelected={setImageFile}
        />

        <div className="form-field">
          <label>Brand Story</label>
          <LangTabs active={activeLang} onChange={setActiveLang} />
          <div className="wysiwyg-wrap">
            <ReactQuill
              key={activeLang}
              theme="snow"
              value={text[activeLang]}
              onChange={(value) => setText({ ...text, [activeLang]: value })}
              modules={QUILL_MODULES}
            />
          </div>
        </div>

        <button type="submit" className="btn btn--gold" style={{ marginTop: 12 }} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
