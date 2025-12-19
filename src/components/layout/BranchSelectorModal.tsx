import { useEffect, useState } from 'react';
import { MapPin, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBranchStore } from '../../store/branchStore';
import { supabase } from '../../lib/supabase';
import type { Branch } from '../../types';

interface BranchSelectorModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function BranchSelectorModal({ isOpen: externalIsOpen, onClose }: BranchSelectorModalProps) {
  const { selectedBranch, setSelectedBranch } = useBranchStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [hasSelectedBefore, setHasSelectedBefore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  useEffect(() => {
    // Verificar si ya hay una selección guardada y cuándo fue la última vez
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
    const stored = localStorage.getItem('pass-branch-storage');
    const lastSelectionTime = localStorage.getItem('pass-branch-selection-time');
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.state?.selectedBranch !== undefined) {
          // Verificar si han pasado 24 horas desde la última selección
          const now = Date.now();
          const lastTime = lastSelectionTime ? parseInt(lastSelectionTime, 10) : 0;
          const timeDiff = now - lastTime;
          
          if (timeDiff < TWENTY_FOUR_HOURS) {
            setHasSelectedBefore(true);
          } else {
            // Han pasado 24 horas, pedir selección de nuevo
            setHasSelectedBefore(false);
            localStorage.removeItem('pass-branch-selection-time');
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Si no hay selección previa y no está controlado externamente, mostrar modal
    if (!hasSelectedBefore && externalIsOpen === undefined) {
      setInternalIsOpen(true);
    }

    // Cargar sucursales
    loadBranches();
  }, []);

  const loadBranches = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');

      if (error) throw error;
      // Filtrar cualquier sucursal que contenga 'Sucre' en el nombre
      const filtered = (data || []).filter(branch => !branch.name.toLowerCase().includes('sucre'));
      setBranches(filtered);
    } catch (error) {
      console.error('Error loading branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBranch = (branchId: string | null) => {
    setSelectedBranch(branchId);
    setHasSelectedBefore(true);
    // Guardar el timestamp de la selección
    localStorage.setItem('pass-branch-selection-time', Date.now().toString());
    setInternalIsOpen(false);
    if (onClose) onClose();
  };

  const handleClose = () => {
    // Solo permitir cerrar si ya seleccionó antes
    if (hasSelectedBefore) {
      setInternalIsOpen(false);
      if (onClose) onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-[280px] sm:max-w-xs p-3 sm:p-4 space-y-3 sm:space-y-4 max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="text-center space-y-1 relative">
                {hasSelectedBefore && onClose && (
                  <button
                    onClick={handleClose}
                    className="absolute -top-1 -right-1 p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
                <div className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-black/5 rounded-full mb-1">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold tracking-tight">Selecciona tu ciudad</h2>
              </div>

              {/* Current selection indicator */}
              {selectedBranch && (
                <div className="bg-gray-50 p-1.5 sm:p-2 rounded text-[10px] sm:text-xs text-center">
                  <span className="text-gray-600">Viendo: </span>
                  <span className="font-semibold">
                    {branches.find(b => b.id === selectedBranch)?.name || 'Todas'}
                  </span>
                </div>
              )}
              {!selectedBranch && hasSelectedBefore && (
                <div className="bg-gray-50 p-1.5 sm:p-2 rounded text-[10px] sm:text-xs text-center">
                  <span className="text-gray-600">Viendo: </span>
                  <span className="font-semibold">Todas</span>
                </div>
              )}

              {/* Options */}
              <div className="space-y-1.5 sm:space-y-2">
                {isLoading ? (
                  // Skeleton loader
                  <>
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="w-full p-2 sm:p-3 border-2 border-gray-200 rounded animate-pulse"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="h-3 sm:h-4 bg-gray-200 rounded w-24"></div>
                          </div>
                          <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 bg-gray-200 rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    {/* Todas las sucursales */}
                    <button
                      onClick={() => handleSelectBranch(null)}
                      className={`w-full p-2 sm:p-3 border-2 rounded transition-all text-left group ${
                        selectedBranch === null 
                          ? 'border-black bg-gray-50' 
                          : 'border-gray-200 hover:border-black'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm font-semibold group-hover:translate-x-1 transition-transform">
                            Todas
                          </p>
                        </div>
                        <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 rounded-full transition-colors flex items-center justify-center ${
                          selectedBranch === null 
                            ? 'border-black bg-black' 
                            : 'border-gray-300 group-hover:border-black'
                        }`}>
                          {selectedBranch === null && (
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Sucursales individuales */}
                    {branches.map((branch) => (
                  <button
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch.id)}
                    className={`w-full p-2 sm:p-3 border-2 rounded transition-all text-left group ${
                      selectedBranch === branch.id 
                        ? 'border-black bg-gray-50' 
                        : 'border-gray-200 hover:border-black'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-semibold group-hover:translate-x-1 transition-transform">
                          {branch.name}
                        </p>
                      </div>
                      <div className={`w-3.5 h-3.5 sm:w-4 sm:h-4 border-2 rounded-full transition-colors flex items-center justify-center ${
                        selectedBranch === branch.id 
                          ? 'border-black bg-black' 
                        : 'border-gray-300 group-hover:border-black'
                      }`}>
                        {selectedBranch === branch.id && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}
                  </>
                )}
              </div>

              {/* Footer */}
              {!hasSelectedBefore && (
                <p className="text-xs text-center text-gray-500">
                  Selecciona una opción para continuar
                </p>
              )}
              {hasSelectedBefore && (
                <p className="text-xs text-center text-gray-500">
                  Puedes cambiar la sucursal en cualquier momento
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
