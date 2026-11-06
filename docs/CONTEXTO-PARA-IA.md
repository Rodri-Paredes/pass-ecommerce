# Contexto para IA

## PASS Crew

- Se restauró la interfaz pública completa en `/pass-crew`; no debe mostrar el estado de "Próximamente".
- Las rutas `/pass-crew/recompensas`, `/pass-crew/join` y `/pass-crew/status` vuelven a usar sus páginas específicas. Las dos últimas requieren iniciar sesión.
- Pendiente: verificar la experiencia con planes, beneficios y configuración de pago reales en Supabase antes de producción.
- La tarjeta de la portada de PASS Crew es interactiva: gira al tocarla y respeta la preferencia de reducir movimiento. Se verificó el giro en la vista previa local.

## PASS Friday

- La interfaz de Halloween fue retirada y sustituida por un contador flotante que lleva a `/pass-friday`.
- El teaser cuenta hasta el 27 de noviembre de 2026 a las 00:00, hora de Bolivia, y muestra productos desenfocados sin nombres, precios ni compra. El acceso flotante muestra únicamente el contador completo en una línea horizontal sin fondo, fecha ni nombre repetido de campaña. Antes de publicar la campaña, definir productos, fechas y reglas de elegibilidad para aplicar descuentos reales.
- La apertura de `/pass-friday` usa un hero rojo de alto contraste con contador integrado y título “PASS FRIDAY” en una sola línea adaptable; “FRIDAY” va en blanco con espaciado propio para mantener las letras legibles. No muestra el contador flotante por segunda vez.
- La vista previa usa cuatro piezas compactas; si existen fotos de productos, se muestran desenfocadas en rojo/negro, no en gris.

## Cuentas y salida a producción

- Supabase Auth tiene registro por email activo y exige confirmación de correo.
- El registro de PASS Crew crea un perfil propio con nombre, email y teléfono; no depende de una ficha de tienda. El CI es opcional y solo sirve para que caja encuentre al cliente.
- La migración canónica de PASS Crew está en el ERP (`clothingStore`), no en este repositorio. Confirmar que fue aplicada al proyecto Supabase objetivo antes de publicar.
- Verificado localmente: compilación, tipos, validación de contraseñas y redirección desde una ruta privada sin sesión.
- **Confirm email** fue desactivado en Supabase Auth. Se verificó con una cuenta QA sintética el registro, la sesión inmediata, la creación del perfil con código PASS, el inicio de sesión y el cierre de sesión. El lint sigue fallando por seis errores preexistentes fuera de cuentas/PASS Crew.
