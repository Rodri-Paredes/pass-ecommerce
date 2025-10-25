import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Drop } from '../../types';
import DropCard from './DropCard';
import { Loader2 } from 'lucide-react';

export default function DropsSection() {
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDrops();
  }, []);

  const loadDrops = async () => {
    try {
      const { data, error } = await supabase
        .from('drops')
        .select('*')
        .eq('status', 'ACTIVO')
        .order('is_featured', { ascending: false })
        .order('launch_date', { ascending: false });

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
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (drops.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-3 tracking-tight">DROPS ACTIVOS</h2>
        <p className="text-gray-600">Colecciones limitadas disponibles ahora</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {drops.map((drop, index) => (
          <DropCard key={drop.id} drop={drop} index={index} />
        ))}
      </div>
    </section>
  );
}
