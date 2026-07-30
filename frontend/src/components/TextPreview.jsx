import { useState } from 'react';

const DEFAULT_LIMIT = 70;

export default function TextPreview({ text, limit = DEFAULT_LIMIT, title = 'Full text' }) {
  const [open, setOpen] = useState(false);
  const value = text || '';
  const isTruncated = value.length > limit;
  const preview = isTruncated ? `${value.slice(0, limit).trimEnd()}...` : value;

  return (
    <>
      <div className="text-preview">
        <span className="text-preview__text">{preview || '—'}</span>
        {isTruncated && (
          <button type="button" className="text-preview__view-btn" onClick={() => setOpen(true)}>
            View
          </button>
        )}
      </div>

      {open && (
        <div className="admin-modal__backdrop" onClick={() => setOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{title}</h2>
            <p className="text-preview__full">{value}</p>
            <div className="admin-modal__actions">
              <button type="button" className="btn btn--outline-dark" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
