import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminContactMessages,
  adminOrderRequests,
  adminPharmacies,
  adminProducts,
} from '../api/resources';

const CARDS = [
  { key: 'products', label: 'Products', to: '/admin-panel/products' },
  { key: 'pharmacies', label: 'Pharmacies', to: '/admin-panel/pharmacies' },
  { key: 'orderRequests', label: 'Order Requests', to: '/admin-panel/order-requests' },
  { key: 'messages', label: 'Messages', to: '/admin-panel/messages' },
];

export default function Dashboard() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    Promise.all([
      adminProducts.list(),
      adminPharmacies.list(),
      adminOrderRequests.list(),
      adminContactMessages.list(),
    ])
      .then(([products, pharmacies, orderRequests, messages]) => {
        setCounts({
          products: products.length,
          pharmacies: pharmacies.length,
          orderRequests: orderRequests.filter((o) => o.status === 'new').length,
          messages: messages.filter((m) => !m.is_read).length,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div>
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>
      <div className="dashboard-grid">
        {CARDS.map((card) => (
          <Link key={card.key} to={card.to} className="card dashboard-card">
            <span className="dashboard-card__count">{counts[card.key] ?? '—'}</span>
            <span className="dashboard-card__label">{card.label}</span>
          </Link>
        ))}
      </div>
      <p className="dashboard-hint">
        Order Requests and Messages show the number of items needing your attention (new / unread).
      </p>
    </div>
  );
}
