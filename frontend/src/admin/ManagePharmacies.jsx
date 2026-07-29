import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminPharmacies } from '../api/resources';
import ConfirmDialog from '../components/ConfirmDialog';

const EMPTY_FORM = { name: '', address: '', city: '', phone: '', map_link: '', is_active: true };

export default function ManagePharmacies() {
  const [pharmacies, setPharmacies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    adminPharmacies
      .list()
      .then(setPharmacies)
      .catch(() => toast.error('Failed to load pharmacies.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (pharmacy) => {
    setEditing(pharmacy);
    setForm({ ...pharmacy });
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminPharmacies.update(editing.id, form);
        toast.success('Pharmacy updated.');
      } else {
        await adminPharmacies.create(form);
        toast.success('Pharmacy added.');
      }
      setModalOpen(false);
      load();
    } catch {
      toast.error('Could not save pharmacy.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminPharmacies.remove(deleteTarget.id);
      toast.success('Pharmacy deleted.');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Could not delete pharmacy.');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Pharmacies</h1>
        <button type="button" className="btn btn--gold admin-add-btn" onClick={openAdd}>
          + Add Pharmacy
        </button>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : pharmacies.length === 0 ? (
        <div className="admin-table-wrap">
          <p className="admin-empty">No pharmacies yet. Click "+ Add Pharmacy" to add the first one.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>City</th>
                <th>Phone</th>
                <th>Active</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pharmacies.map((pharmacy) => (
                <tr key={pharmacy.id}>
                  <td>{pharmacy.name}</td>
                  <td>{pharmacy.city}</td>
                  <td>{pharmacy.phone}</td>
                  <td>
                    <span className={`admin-badge ${pharmacy.is_active ? 'admin-badge--gold' : 'admin-badge--muted'}`}>
                      {pharmacy.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button type="button" className="admin-icon-btn" onClick={() => openEdit(pharmacy)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="admin-icon-btn admin-icon-btn--danger"
                        onClick={() => setDeleteTarget(pharmacy)}
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
            <h2>{editing ? 'Edit Pharmacy' : 'Add Pharmacy'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" value={form.name} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="address">Address</label>
                <input id="address" name="address" value={form.address} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="city">City</label>
                <input id="city" name="city" value={form.city} onChange={handleChange} required />
              </div>
              <div className="form-field">
                <label htmlFor="phone">Phone</label>
                <input id="phone" name="phone" value={form.phone} onChange={handleChange} />
              </div>
              <div className="form-field">
                <label htmlFor="map_link">Map Link (optional)</label>
                <input id="map_link" name="map_link" value={form.map_link} onChange={handleChange} />
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
        title="Delete pharmacy?"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
