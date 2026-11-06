import { BrowserRouter as Router, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
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
import ActivateAccountPage from './pages/account/ActivateAccountPage';
import SignupPage from './pages/account/SignupPage';
import AccountPage from './pages/account/AccountPage';
import PassCrewLandingPage from './pages/PassCrewLandingPage';
import PassCrewRequestPage from './pages/PassCrewRequestPage';
import PassCrewStatusPage from './pages/PassCrewStatusPage';
import RewardsCatalogPage from './pages/RewardsCatalogPage';
import FavoritesPage from './pages/FavoritesPage';
import PassFridayPage from './pages/PassFridayPage';
import { useCustomerAuthStore } from './store/customerAuthStore';
import PassFridayCountdown from './components/pass-friday/PassFridayCountdown';

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
      <div className="min-h-screen overflow-x-hidden bg-white">
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
        <ScrollToTop />
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
              <Route path="/activate" element={<ActivateAccountPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="/pass-friday" element={<PassFridayPage />} />
              <Route path="/pass-crew" element={<PassCrewLandingPage />} />
              <Route path="/pass-crew/recompensas" element={<RewardsCatalogPage />} />
              <Route path="/pass-crew/join" element={<ProtectedRoute><PassCrewRequestPage /></ProtectedRoute>} />
              <Route path="/pass-crew/status" element={<ProtectedRoute><PassCrewStatusPage /></ProtectedRoute>} />
            </Routes>
          </PageTransition>
        </main>
        <Footer />
        <PassFridayCountdown />
        <Analytics />
      </div>
    </Router>
  );
}

function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';
    const storageKey = `pass-scroll:${location.pathname}${location.search}`;
    const routePath = `${location.pathname}${location.search}`;
    const savedPosition = navigationType === 'POP' ? Number(sessionStorage.getItem(storageKey) || 0) : 0;
    let attempts = 0;
    let timer = 0;
    let animationFrame = 0;

    const savePosition = () => {
      if (`${window.location.pathname}${window.location.search}` !== routePath) return;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => sessionStorage.setItem(storageKey, String(window.scrollY)));
    };

    const saveBeforeNavigation = (event: MouseEvent) => {
      if ((event.target as Element | null)?.closest('a[href]')) savePosition();
    };

    const restore = () => {
      const pageIsTallEnough = document.documentElement.scrollHeight >= savedPosition + window.innerHeight;
      if (pageIsTallEnough || attempts >= 30) {
        window.scrollTo({ top: savedPosition, left: 0, behavior: 'auto' });
        return;
      }
      attempts += 1;
      timer = window.setTimeout(restore, 100);
    };

    if (savedPosition > 0) timer = window.setTimeout(restore, 450);
    else window.scrollTo({ top: 0, left: 0, behavior: 'auto' });

    window.addEventListener('scroll', savePosition, { passive: true });
    document.addEventListener('click', saveBeforeNavigation, true);

    return () => {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener('scroll', savePosition);
      document.removeEventListener('click', saveBeforeNavigation, true);
    };
  }, [location.key, location.pathname, location.search, navigationType]);

  return null;
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
