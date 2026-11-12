# Contexto para IA

## PASS Crew

- Se restauró la interfaz pública completa en `/pass-crew`; no debe mostrar el estado de "Próximamente".
- Las rutas `/pass-crew/recompensas`, `/pass-crew/join` y `/pass-crew/status` vuelven a usar sus páginas específicas. Las dos últimas requieren iniciar sesión.
- Pendiente: verificar la experiencia con planes, beneficios y configuración de pago reales en Supabase antes de producción.
- La tarjeta de la portada de PASS Crew es interactiva: gira al tocarla y respeta la preferencia de reducir movimiento. Se verificó el giro en la vista previa local.

## PASS Friday

- La interfaz de Halloween fue retirada y el acceso flotante lleva a `/pass-friday`.
- `/pass-friday` ya no es solo un teaser: sin sesión explica el programa y permite crear cuenta o iniciar sesión; con sesión muestra una tarjeta PASS Friday separada de Crew con código PASS, puntos reales del RPC `get_customer_loyalty_summary` y progreso a los 300 puntos.
- El registro iniciado desde `/pass-friday` adapta título, explicación y CTA a la creación del código PASS Friday; al terminar vuelve a esa ruta.
- Regla publicada: una cuenta PASS gratuita con 300 puntos o más habilita el acceso general. La equivalencia de compra a puntos se configura internamente en el ERP y no se publica en la web. La suma de puntos se debe aplicar desde el ERP/caja al registrar una venta; no se simula en el cliente web.
- Las cuentas nuevas de PASS Friday reciben 20 puntos de bienvenida solo después de aplicar la migración del ERP `20261112_pass_friday_welcome_points.sql`; no se deben anunciar como acreditados antes de ejecutarla.
- PASS Crew es una suscripción pagada y agrega puntos x2, acceso anticipado a drops, más días de PASS Friday y envíos gratis dentro de Bolivia.
- El arte vertical para clientes está en `/pass-friday-clientes.svg`. Comunica: crear cuenta gratis, acumular puntos con código/celular/CI, llegar a 300 puntos y, opcionalmente, sumar PASS Crew como membresía pagada con extras.

## Cuentas y salida a producción

- Supabase Auth tiene registro por email activo y la confirmación de correo está desactivada.
- El registro de PASS Crew crea un perfil propio con nombre, email y teléfono; no depende de una ficha de tienda. El CI es opcional y solo sirve para que caja encuentre al cliente.
- La migración canónica de PASS Crew está en el ERP (`clothingStore`), no en este repositorio. Para el lanzamiento de PASS Friday se deben aplicar además `20261110_customer_purchase_history.sql` y `20261112_pass_friday_welcome_points.sql` antes de anunciar el historial o el bono de bienvenida.
- Verificado localmente: compilación, tipos, validación de contraseñas y redirección desde una ruta privada sin sesión. Falta una prueba controlada en Supabase de registro, bono, venta asociada e historial.
- El lint sigue fallando por seis errores preexistentes fuera de cuentas/PASS Crew.
