import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pickTranslated } from '../i18n/pickTranslated';
import './ProductChecklistModal.css';

export default function ProductChecklistModal({ open, products, initialSelectedId, onConfirm, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const [selectedIds, setSelectedIds] = useState(() => new Set());

  useEffect(() => {
    if (open) {
      setSelectedIds(initialSelectedId ? new Set([initialSelectedId]) : new Set());
    }
  }, [open, initialSelectedId]);

  if (!open) return null;

  const toggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleConfirm = () => {
    const selected = products.filter((p) => selectedIds.has(p.id));
    onConfirm(selected);
  };

  return (
    <div className="product-checklist__backdrop" onClick={onClose}>
      <div className="product-checklist" onClick={(e) => e.stopPropagation()}>
        <h3>{t('productChecklist.title')}</h3>
        {products.length === 0 ? (
          <p className="product-checklist__empty">{t('productChecklist.empty')}</p>
        ) : (
          <ul className="product-checklist__list">
            {products.map((product) => (
              <li key={product.id} className="checkbox-field product-checklist__item">
                <input
                  type="checkbox"
                  id={`checklist-product-${product.id}`}
                  checked={selectedIds.has(product.id)}
                  onChange={() => toggle(product.id)}
                />
                <label htmlFor={`checklist-product-${product.id}`}>
                  {pickTranslated(product, 'name', lang)}
                </label>
              </li>
            ))}
          </ul>
        )}
        <div className="product-checklist__actions">
          <button type="button" className="btn btn--outline-dark" onClick={onClose}>
            {t('productChecklist.cancel')}
          </button>
          <button
            type="button"
            className="btn btn--gold"
            disabled={selectedIds.size === 0}
            onClick={handleConfirm}
          >
            {t('productChecklist.addSelected')}
          </button>
        </div>
      </div>
    </div>
  );
}
