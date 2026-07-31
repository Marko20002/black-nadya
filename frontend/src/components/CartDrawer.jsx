import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { pickTranslated } from '../i18n/pickTranslated';
import './CartDrawer.css';

export default function CartDrawer({ open, onClose }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.split('-')[0] || 'en';
  const cart = useCart();
  const navigate = useNavigate();

  if (!open) return null;

  const handleProceed = () => {
    onClose();
    navigate('/where-to-buy');
  };

  return (
    <div className="cart-drawer__backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer__header">
          <h3>{t('cart.title')}</h3>
          <button type="button" className="cart-drawer__close" onClick={onClose} aria-label={t('cart.close')}>
            <X size={20} />
          </button>
        </div>

        {cart.items.length === 0 ? (
          <p className="cart-drawer__empty">{t('cart.empty')}</p>
        ) : (
          <ul className="cart-drawer__list">
            {cart.items.map(({ product, qty }) => (
              <li key={product.id} className="cart-drawer__item">
                <div className="cart-drawer__item-image">
                  {product.image ? <img src={product.image} alt="" /> : <div className="cart-drawer__item-placeholder" />}
                </div>
                <div className="cart-drawer__item-body">
                  <span className="cart-drawer__item-name">{pickTranslated(product, 'name', lang)}</span>
                  <div className="cart-drawer__item-controls">
                    <div className="cart-drawer__stepper">
                      <button
                        type="button"
                        onClick={() => cart.updateQuantity(product.id, qty - 1)}
                        aria-label={t('cart.decreaseQty')}
                      >
                        <Minus size={14} />
                      </button>
                      <span>{qty}</span>
                      <button
                        type="button"
                        onClick={() => cart.updateQuantity(product.id, qty + 1)}
                        aria-label={t('cart.increaseQty')}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-drawer__remove"
                      onClick={() => cart.removeItem(product.id)}
                      aria-label={t('cart.remove')}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="cart-drawer__footer">
          <button
            type="button"
            className="btn btn--gold cart-drawer__proceed"
            disabled={cart.items.length === 0}
            onClick={handleProceed}
          >
            {t('cart.proceedToOrder')}
          </button>
        </div>
      </div>
    </div>
  );
}
