import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SiteSettingsProvider } from './hooks/useSiteSettings';
import { AuthProvider } from './hooks/useAuth';
import { CartProvider } from './hooks/useCart';

import PublicLayout from './components/PublicLayout';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import WhereToBuy from './pages/WhereToBuy';
import About from './pages/About';
import Contact from './pages/Contact';

import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import ProtectedRoute from './admin/ProtectedRoute';
import Dashboard from './admin/Dashboard';
import ManageProducts from './admin/ManageProducts';
import ManagePharmacies from './admin/ManagePharmacies';
import ManageHomepage from './admin/ManageHomepage';
import ManageAbout from './admin/ManageAbout';
import ManageContact from './admin/ManageContact';
import OrderRequestsInbox from './admin/OrderRequestsInbox';
import MessagesInbox from './admin/MessagesInbox';

export default function App() {
  return (
    <AuthProvider>
      <SiteSettingsProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
            <Routes>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/where-to-buy" element={<WhereToBuy />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Route>

              <Route path="/admin-panel/login" element={<AdminLogin />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/admin-panel" element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="products" element={<ManageProducts />} />
                  <Route path="pharmacies" element={<ManagePharmacies />} />
                  <Route path="homepage" element={<ManageHomepage />} />
                  <Route path="about" element={<ManageAbout />} />
                  <Route path="contact-info" element={<ManageContact />} />
                  <Route path="order-requests" element={<OrderRequestsInbox />} />
                  <Route path="messages" element={<MessagesInbox />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </SiteSettingsProvider>
    </AuthProvider>
  );
}
