import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { pageview } from './lib/analytics';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BranchSelectorModal from './components/layout/BranchSelectorModal';
import DiscountModal from './components/layout/DiscountModal';
import PageTransition from './components/layout/PageTransition';
import PassCrewOverlay from './components/pass-crew/PassCrewOverlay';
import Cart from './components/cart/Cart';
import Toast from './components/ui/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import DropsPage from './pages/DropsPage';
import DropDetailPage from './pages/DropDetailPage';
import ShippingPage from './pages/ShippingPage';
import ReturnsPage from './pages/ReturnsPage';
import SizeGuidePage from './pages/SizeGuidePage';
import ContactPage from './pages/ContactPage';
import SharedOrderPage from './pages/SharedOrderPage';
import PassOffPage from './pages/PassOffPage';
import LoginPage from './pages/account/LoginPage';
import SignupPage from './pages/account/SignupPage';
import AccountPage from './pages/account/AccountPage';
import PassCrewLandingPage from './pages/PassCrewLandingPage';
import PassCrewRequestPage from './pages/PassCrewRequestPage';
import PassCrewStatusPage from './pages/PassCrewStatusPage';
import { useCustomerAuthStore } from './store/customerAuthStore';

function App() {
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const loadCustomer = useCustomerAuthStore((s) => s.loadCustomer);

  useEffect(() => {
    loadCustomer();
  }, [loadCustomer]);

  useEffect(() => {
    // Esperar a que se cierre el modal de sucursal
    const checkBranchSelection = () => {
      const lastSelectionTime = localStorage.getItem('pass-branch-selection-time');
      if (lastSelectionTime) {
        // Si ya seleccionó sucursal, mostrar modal de descuentos después de 1.5 segundos
        setTimeout(() => {
          setShowDiscountModal(true);
        }, 1500);
      }
    };

    // Verificar después de 2 segundos (tiempo suficiente para modal de sucursal)
    const timer = setTimeout(checkBranchSelection, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Header />
        <Cart />
        <Toast />
        <BranchSelectorModal />
        <PassCrewOverlay />
        <DiscountModal
          isOpen={showDiscountModal}
          onClose={() => setShowDiscountModal(false)}
        />
        {/* Track SPA route changes and send pageviews to analytics */}
        <RouteChangeTracker />
        <main className="overflow-x-hidden">
          <PageTransition>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductPage />} />
              <Route path="/drops" element={<DropsPage />} />
              <Route path="/drops/:id" element={<DropDetailPage />} />
              <Route path="/pass-off" element={<PassOffPage />} />
              <Route path="/shipping" element={<ShippingPage />} />
              <Route path="/returns" element={<ReturnsPage />} />
              <Route path="/size-guide" element={<SizeGuidePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/pedido/:orderCode" element={<SharedOrderPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/pass-crew" element={<PassCrewLandingPage />} />
              <Route path="/pass-crew/join" element={<ProtectedRoute><PassCrewRequestPage /></ProtectedRoute>} />
              <Route path="/pass-crew/status" element={<ProtectedRoute><PassCrewStatusPage /></ProtectedRoute>} />
            </Routes>
          </PageTransition>
        </main>
        <Footer />
        <Analytics />
      </div>
    </Router>
  );
}

function RouteChangeTracker() {
  const location = useLocation();

  useEffect(() => {
    // send pageview whenever location changes
    pageview(location.pathname + location.search);
  }, [location]);

  return null;
}

export default App;
