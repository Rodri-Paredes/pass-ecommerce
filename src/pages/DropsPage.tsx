import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Drop } from '../types';
import DropCard from '../components/drops/DropCard';
import { Loader2 } from 'lucide-react';

export default function DropsPage() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Scroll to top when drops page loads
    window.scrollTo({ top: 0, behavior: 'smooth' });
    loadDrops();
  }, []);

  const loadDrops = async () => {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .eq('status', 'ACTIVO')
        .order('is_featured', { ascending: false })
        .order('launch_date', { ascending: false })
        .limit(1); // Solo obtener el último drop activo

      if (error) throw error;
      setDrops(data || []);
    } catch (error) {
      console.error('Error loading drops:', error);
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

  return (
    <div className="min-h-screen pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-3 tracking-tight">ÚLTIMO DROP</h1>
          <p className="text-gray-600">Nuestra colección más reciente</p>
        </div>

        {drops.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No hay drops disponibles en este momento</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {drops.map((drop, index) => (
              <DropCard key={drop.id} drop={drop} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
