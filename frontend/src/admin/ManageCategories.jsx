import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminCategories } from '../api/resources';
import ConfirmDialog from '../components/ConfirmDialog';
import LangTabs from './components/LangTabs';

const LANGS = ['en', 'mk', 'sq'];

function emptyForm() {
  const form = {};
  LANGS.forEach((lang) => {
    form[`name_${lang}`] = '';
  });
  return form;
}

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [activeLang, setActiveLang] = useState('en');
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    adminCategories
      .list()
      .then(setCategories)
      .catch(() => toast.error('Failed to load categories.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setActiveLang('en');
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    const next = {};
    LANGS.forEach((lang) => {
      next[`name_${lang}`] = category[`name_${lang}`] || '';
    });
    setForm(next);
    setActiveLang('en');
    setModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminCategories.update(editing.id, form);
        toast.success('Category updated.');
      } else {
        await adminCategories.create(form);
        toast.success('Category added.');
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error('Could not save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminCategories.remove(deleteTarget.id);
      toast.success('Category deleted.');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Could not delete category.');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Categories</h1>
        <button type="button" className="btn btn--gold admin-add-btn" onClick={openAdd}>
          + Add Category
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : categories.length === 0 ? (
        <div className="admin-table-wrap">
          <p className="admin-empty">No categories yet. Click "+ Add Category" to create the first one.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>English</th>
                <th>Macedonian</th>
                <th>Albanian</th>
                <th>Products</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id}>
                  <td>{category.name_en}</td>
                  <td>{category.name_mk || '—'}</td>
                  <td>{category.name_sq || '—'}</td>
                  <td>{category.product_count}</td>
                  <td>
                    <div className="admin-table__actions">
                      <button type="button" className="admin-icon-btn" onClick={() => openEdit(category)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn--danger"
                        onClick={() => setDeleteTarget(category)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="admin-modal__backdrop" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit}>
              <label>Translated Name</label>
              <LangTabs active={activeLang} onChange={setActiveLang} />

              <div className="form-field">
                <label htmlFor={`name_${activeLang}`}>
                  Name{activeLang === 'en' ? ' (required — used as fallback)' : ''}
                </label>
                <input
                  id={`name_${activeLang}`}
                  name={`name_${activeLang}`}
                  value={form[`name_${activeLang}`]}
                  onChange={handleChange}
                  required={activeLang === 'en'}
                />
              </div>

              <div className="admin-modal__actions">
                <button type="button" className="btn btn--outline-dark" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn--gold" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete category?"
        message={
          deleteTarget?.product_count > 0
            ? `${deleteTarget.product_count} product${deleteTarget.product_count === 1 ? '' : 's'} currently use "${deleteTarget?.name_en}". Deleting it will leave ${deleteTarget.product_count === 1 ? 'that product' : 'those products'} uncategorized. This cannot be undone.`
            : `Are you sure you want to delete "${deleteTarget?.name_en}"? This cannot be undone.`
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        confirmLabel="Delete"
      />
    </div>
  );
}
