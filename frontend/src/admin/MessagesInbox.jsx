import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { adminContactMessages } from '../api/resources';
import ConfirmDialog from '../components/ConfirmDialog';
import TextPreview from '../components/TextPreview';

export default function MessagesInbox() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = () => {
    setLoading(true);
    adminContactMessages
      .list()
      .then(setMessages)
      .catch(() => toast.error('Failed to load messages.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleRead = async (message) => {
    const nextRead = !message.is_read;
    setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: nextRead } : m)));
    try {
      await adminContactMessages.update(message.id, { is_read: nextRead });
    } catch {
      toast.error('Could not update message.');
      load();
    }
  };

  const handleDelete = async () => {
    try {
      await adminContactMessages.remove(deleteTarget.id);
      toast.success('Message deleted.');
      setDeleteTarget(null);
      load();
    } catch {
      toast.error('Could not delete message.');
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1>Messages</h1>
      </div>

      {loading ? (
        <p>Loading…</p>
      ) : messages.length === 0 ? (
        <div className="admin-table-wrap">
          <p className="admin-empty">No messages yet.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Message</th>
                <th>Received</th>
                <th>Read</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {messages.map((message) => (
                <tr key={message.id} style={{ fontWeight: message.is_read ? 400 : 700 }}>
                  <td>{message.name}</td>
                  <td>{message.email}</td>
                  <td>
                    <TextPreview text={message.message} title={`Message from ${message.name}`} />
                  </td>
                  <td>{new Date(message.created_at).toLocaleDateString()}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={message.is_read}
                      onChange={() => toggleRead(message)}
                      title="Mark as read"
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-icon-btn admin-icon-btn--danger"
                      onClick={() => setDeleteTarget(message)}
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
        title="Delete message?"
        message={`Are you sure you want to delete the message from "${deleteTarget?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
