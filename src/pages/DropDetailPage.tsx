import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Loader2, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Drop } from '../types';
import ProductGrid from '../components/product/ProductGrid';

export default function DropDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [drop, setDrop] = useState<Drop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when drop detail page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (id) {
      loadDrop();
    }
  }, [id]);

  const loadDrop = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setDrop(data);
    } catch (error) {
      console.error('Error loading drop:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!drop) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16">
        <p className="text-xl text-gray-500 mb-4">Drop no encontrado</p>
        <Link to="/drops" className="text-sm underline">
          Ver todos los drops
        </Link>
      </div>
    );
  }

  const launchDate = new Date(drop.launch_date);
  const formattedDate = launchDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen pt-16">
      {drop.banner_url && (
        <div className="relative h-[50vh] overflow-hidden">
          <img
            src={drop.banner_url}
            alt={drop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/drops"
          className="inline-flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity"
        >
          <ChevronLeft className="w-4 h-4" />
          Volver a drops
        </Link>

        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold tracking-tight">{drop.name}</h1>
            {drop.status === 'ACTIVO' && (
              <span className="bg-green-500 text-white px-3 py-1 text-xs font-medium tracking-wide">
                ACTIVO
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>

          {drop.description && (
            <p className="text-lg text-gray-700 max-w-3xl leading-relaxed">
              {drop.description}
            </p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-6 tracking-tight">PRODUCTOS DE ESTE DROP</h2>
          <ProductGrid dropId={drop.id} />
        </div>
      </div>
    </div>
  );
}
