import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminCategories, adminProducts } from '../api/resources';
import ConfirmDialog from '../components/ConfirmDialog';
import ImageDropzone from './components/ImageDropzone';

const EMPTY_FORM = {
  name: '',
  category: '',
  short_description: '',
  full_description: '',
  ingredients: '',
  size: '',
  is_featured: false,
  is_active: true,
};

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);
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
    setForm(EMPTY_FORM);
    setImageFile(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      name: product.name,
      category: product.category || '',
      short_description: product.short_description,
      full_description: product.full_description,
      ingredients: product.ingredients,
      size: product.size,
      is_featured: product.is_featured,
      is_active: product.is_active,
    });
    setImageFile(null);
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const category = await adminCategories.create({ name: newCategoryName.trim() });
      setCategories([...categories, category]);
      setForm((f) => ({ ...f, category: category.id }));
      setNewCategoryName('');
      toast.success('Category added.');
    } catch {
      toast.error('Could not add category.');
    } finally {
      setAddingCategory(false);
    }
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
                  <td>{product.name}</td>
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
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>

              <div className="form-field">
                <label htmlFor="category">Category</label>
                <select id="category" name="category" value={form.category} onChange={handleChange}>
                  <option value="">— Select category —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="admin-inline-add">
                  <input
                    placeholder="+ new category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn--outline-dark"
                    onClick={handleAddCategory}
                    disabled={addingCategory}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="short_description">Short Description</label>
                <textarea
                  id="short_description"
                  name="short_description"
                  rows={2}
                  value={form.short_description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="full_description">Full Description</label>
                <textarea
                  id="full_description"
                  name="full_description"
                  rows={4}
                  value={form.full_description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="ingredients">Ingredients (comma-separated)</label>
                <textarea
                  id="ingredients"
                  name="ingredients"
                  rows={2}
                  value={form.ingredients}
                  onChange={handleChange}
                />
              </div>

              <div className="form-field">
                <label htmlFor="size">Size</label>
                <input id="size" name="size" placeholder="e.g. 30ml" value={form.size} onChange={handleChange} />
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
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
