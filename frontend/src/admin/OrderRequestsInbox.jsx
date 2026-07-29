import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminOrderRequests } from '../api/resources';
import ConfirmDialog from '../components/ConfirmDialog';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'completed', label: 'Completed' },
];

export default function OrderRequestsInbox() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    adminOrderRequests
      .list()
      .then(setRequests)
      .catch(() => toast.error('Failed to load order requests.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStatusChange = async (request, status) => {
    setRequests((prev) => prev.map((r) => (r.id === request.id ? { ...r, status } : r)));
    try {
      await adminOrderRequests.update(request.id, { status });
      toast.success('Status updated.');
    } catch {
      toast.error('Could not update status.');
      load();
    }
  };

  const handleDelete = async () => {
    try {
      await adminOrderRequests.remove(deleteTarget.id);
      toast.success('Order request deleted.');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Could not delete order request.');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Order Requests</h1>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : requests.length === 0 ? (
        <div className="admin-table-wrap">
          <p className="admin-empty">No order requests yet.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>City</th>
                <th>Product(s)</th>
                <th>Status</th>
                <th>Received</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.name}</td>
                  <td>{request.phone}</td>
                  <td>{request.city}</td>
                  <td>{request.products_wanted}</td>
                  <td>
                    <select
                      className="status-select"
                      value={request.status}
                      onChange={(e) => handleStatusChange(request, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(request.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn--danger"
                      onClick={() => setDeleteTarget(request)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete order request?"
        message={`Are you sure you want to delete the request from "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
