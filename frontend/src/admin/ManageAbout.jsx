import { useEffect, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import toast from 'react-hot-toast';
import { adminSiteSettings } from '../api/resources';
import ImageDropzone from './components/ImageDropzone';

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
  const [text, setText] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminSiteSettings
      .get()
      .then((data) => {
        setSettings(data);
        setText(data.about_us_text || '');
      })
      .catch(() => toast.error('Failed to load About Us content.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { about_us_text: text };
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
          <div className="wysiwyg-wrap">
            <ReactQuill theme="snow" value={text} onChange={setText} modules={QUILL_MODULES} />
          </div>
        </div>

        <button type="submit" className="btn btn--gold" style={{ marginTop: 12 }} disabled={saving}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
