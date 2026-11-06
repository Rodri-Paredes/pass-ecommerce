# Cuentas autónomas para PASS Crew

## Decisión

PASS Crew permitirá que cada cliente cree su propio perfil web con nombre, email y teléfono. El alta ya no vincula automáticamente por CI y teléfono a una ficha previa de tienda; el CI puede guardarse opcionalmente como atributo de búsqueda para caja.

## Motivo

El acceso a la membresía no debe depender de que el cliente haya comprado antes en una sucursal ni de exponer un proceso de vinculación difícil de entender.

## Seguridad y datos

El perfil se crea únicamente con el `auth_user_id` de la sesión autenticada. Las políticas de RLS del ERP permiten insertar y leer solo el perfil propio. No se consulta ni enlaza información de otros clientes.

## Configuración externa pendiente

En Supabase Auth se debe desactivar **Confirm email** para que la sesión se abra al instante tras registrarse. Mientras se completa ese ajuste, el cliente conserva los datos localmente y crea el perfil después de confirmar e iniciar sesión.
