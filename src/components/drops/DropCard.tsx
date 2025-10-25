import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import type { Drop } from '../../types';

interface DropCardProps {
  drop: Drop;
  index: number;
}

export default function DropCard({ drop, index }: DropCardProps) {
  const launchDate = new Date(drop.launch_date);
  const formattedDate = launchDate.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group"
    >
      <Link to={`/drops/${drop.id}`}>
        <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden mb-4">
          {drop.image_url && (
            <motion.img
              src={drop.image_url}
              alt={drop.name}
              className="w-full h-full object-cover"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.6 }}
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <h3 className="text-white text-2xl font-bold mb-2">{drop.name}</h3>
            <div className="flex items-center gap-2 text-white/90 text-sm">
              <Calendar className="w-4 h-4" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {drop.status === 'ACTIVO' && (
            <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 text-xs font-medium tracking-wide">
              ACTIVO
            </div>
          )}

          {drop.is_featured && (
            <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-xs font-medium tracking-wide">
              DESTACADO
            </div>
          )}
        </div>

        {drop.description && (
          <p className="text-sm text-gray-600 line-clamp-2 group-hover:text-gray-900 transition-colors">
            {drop.description}
          </p>
        )}
      </Link>
    </motion.div>
  );
}
