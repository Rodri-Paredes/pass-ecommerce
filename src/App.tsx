import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { pageview } from './lib/analytics';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import BranchSelectorModal from './components/layout/BranchSelectorModal';
import Cart from './components/cart/Cart';
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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Header />
        <Cart />
        <BranchSelectorModal />
        {/* Track SPA route changes and send pageviews to analytics */}
        <RouteChangeTracker />
        <main className="overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/drops" element={<DropsPage />} />
            <Route path="/drops/:id" element={<DropDetailPage />} />
            <Route path="/shipping" element={<ShippingPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/size-guide" element={<SizeGuidePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/pedido/:orderCode" element={<SharedOrderPage />} />
          </Routes>
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
