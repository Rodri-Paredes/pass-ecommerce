import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useCustomerAuthStore } from '../../store/customerAuthStore';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { customer, isAuthenticated, isLoading, loadCustomer } = useCustomerAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) {
      loadCustomer();
    }
  }, [isLoading, loadCustomer]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !customer) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
