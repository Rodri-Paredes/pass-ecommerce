# Cuentas de clientes

El registro usa Supabase Auth por email y contraseña. Cada cliente crea su propio perfil de PASS con nombre y teléfono; no se requiere una ficha previa de tienda. Puede añadir opcionalmente su CI para que el personal de caja lo encuentre al registrar una compra. La confirmación de email es opcional a nivel de Supabase y el cliente web sigue funcionando de forma segura mientras esté activa.

## Criterios de aceptación

- El formulario rechaza contraseñas distintas o de menos de seis caracteres antes de enviar datos.
- Una nueva cuenta autenticada crea su propio perfil y queda lista para solicitar PASS Crew.
- Una cuenta existente sin perfil puede completar nombre y teléfono después de iniciar sesión.
- Las rutas privadas redirigen al inicio de sesión cuando no existe una sesión vinculada.
- Cerrar sesión elimina el acceso a las rutas privadas.
