-- Crear tabla para pedidos compartidos temporales
CREATE TABLE IF NOT EXISTS shared_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code VARCHAR(8) UNIQUE NOT NULL,
  items JSONB NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  selected_city VARCHAR(100),
  selected_store VARCHAR(50),
  comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '48 hours',
  viewed_count INTEGER DEFAULT 0
);

-- Índice para búsqueda rápida por código
CREATE INDEX idx_shared_orders_code ON shared_orders(order_code);

-- Índice para limpieza de pedidos expirados
CREATE INDEX idx_shared_orders_expires ON shared_orders(expires_at);

-- Función para limpiar pedidos expirados (se puede ejecutar periódicamente)
CREATE OR REPLACE FUNCTION cleanup_expired_orders()
RETURNS void AS $$
BEGIN
  DELETE FROM shared_orders WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
