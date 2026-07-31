import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminCategories, adminProducts } from '../api/resources';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageDropzone from './components/ImageDropzone';
import LangTabs from './components/LangTabs';

const TRANSLATED_BASES = ['name', 'short_description', 'full_description', 'ingredients'];
const LANGS = ['en', 'mk', 'sq'];

function emptyForm() {
  const form = { category: '', size: '', is_featured: false, is_active: true };
  TRANSLATED_BASES.forEach((base) => {
    LANGS.forEach((lang) => {
      form[`${base}_${lang}`] = '';
    });
  });
  return form;
}

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [activeLang, setActiveLang] = useState('en');
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadAll = () => {
    setLoading(true);
    Promise.all([adminProducts.list(), adminCategories.list()])
      .then(([productsData, categoriesData]) => {
        setProducts(productsData);
        setCategories(categoriesData);
      })
      .catch(() => toast.error('Failed to load products.'))
      .finally(() => setLoading(false));
  };

  useEffect(loadAll, []);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm());
    setActiveLang('en');
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    const next = { category: product.category || '', size: product.size, is_featured: product.is_featured, is_active: product.is_active };
    TRANSLATED_BASES.forEach((base) => {
      LANGS.forEach((lang) => {
        next[`${base}_${lang}`] = product[`${base}_${lang}`] || '';
      });
    });
    setForm(next);
    setActiveLang('en');
    setImageFile(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, category: form.category || null };
    if (imageFile) payload.image = imageFile;
    try {
      if (editing) {
        await adminProducts.update(editing.id, payload);
        toast.success('Product updated.');
      } else {
        await adminProducts.create(payload);
        toast.success('Product added.');
      }
      setModalOpen(false);
      loadAll();
    } catch {
      toast.error('Could not save product. Check the fields and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminProducts.remove(deleteTarget.id);
      toast.success('Product deleted.');
      setDeleteTarget(null);
      loadAll();
    } catch {
      toast.error('Could not delete product.');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Products</h1>
        <button type="button" className="btn btn--gold admin-add-btn" onClick={openAdd}>
          + Add Product
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : products.length === 0 ? (
        <div className="admin-table-wrap">
          <p className="admin-empty">No products yet. Click "+ Add Product" to create the first one.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Name</th>
                <th>Category</th>
                <th>Featured</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    {product.image ? (
                      <img src={product.image} alt="" className="admin-table__thumb" />
                    ) : (
                      <div className="admin-table__thumb" />
                    )}
                  </td>
                  <td>{product.name_en}</td>
                  <td>{product.category_name || '—'}</td>
                  <td>
                    {product.is_featured && <span className="admin-badge admin-badge--gold">Featured</span>}
                  </td>
                  <td>
                    <span className={`admin-badge ${product.is_active ? 'admin-badge--gold' : 'admin-badge--muted'}`}>
                      {product.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button type="button" className="admin-icon-btn" onClick={() => openEdit(product)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn--danger"
                        onClick={() => setDeleteTarget(product)}
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
        <div className="admin-modal__backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange}>
                  <option value="">— Select category —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name_en}
                    </option>
                  ))}
                </select>
                <Link to="/admin-panel/categories" className="admin-inline-link">
                  Manage Categories →
                </Link>
              </div>

              <div className="form-field">
                <label htmlFor="size">Size</label>
                <input id="size" name="size" placeholder="e.g. 30ml" value={form.size} onChange={handleChange} />
              </div>

              <label>Translated Content</label>
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

              <div className="form-field">
                <label htmlFor={`short_description_${activeLang}`}>Short Description</label>
                <textarea
                  id={`short_description_${activeLang}`}
                  name={`short_description_${activeLang}`}
                  rows={2}
                  value={form[`short_description_${activeLang}`]}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor={`full_description_${activeLang}`}>Full Description</label>
                <textarea
                  id={`full_description_${activeLang}`}
                  name={`full_description_${activeLang}`}
                  rows={4}
                  value={form[`full_description_${activeLang}`]}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor={`ingredients_${activeLang}`}>Ingredients (comma-separated)</label>
                <textarea
                  id={`ingredients_${activeLang}`}
                  name={`ingredients_${activeLang}`}
                  rows={2}
                  value={form[`ingredients_${activeLang}`]}
                  onChange={handleChange}
                />
              </div>

              <ImageDropzone
                label="Product Image"
                currentImageUrl={editing?.image}
                onFileSelected={setImageFile}
              />

              <div className="checkbox-field">
                <input
                  id="is_featured"
                  name="is_featured"
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={handleChange}
                />
                <label htmlFor="is_featured">Featured on homepage</label>
              </div>

              <div className="checkbox-field">
                <input
                  id="is_active"
                  name="is_active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                <label htmlFor="is_active">Active (visible on site)</label>
              </div>

              <div className="admin-modal__actions">
                <button type="button" className="btn btn--outline-dark" onClick={closeModal}>
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
        title="Delete product?"
        message={`Are you sure you want to delete "${deleteTarget?.name_en}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
