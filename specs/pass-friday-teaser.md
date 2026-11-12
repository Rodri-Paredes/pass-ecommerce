# Acceso PASS Friday

La ruta pública `/pass-friday` permite que una persona cree su cuenta PASS, entienda cómo acumula puntos y consulte su acceso a la campaña. Reemplaza el teaser pasivo de la campaña por una experiencia de fidelidad operativa.

## Criterios de aceptación

- No existe un selector ni tema visual de Halloween en la tienda.
- Una persona sin sesión ve cómo funciona el programa, puede crear su cuenta PASS sin costo o iniciar sesión.
- Una cuenta autenticada ve una tarjeta exclusiva de PASS Friday —distinta de la tarjeta PASS Crew— con su código PASS, saldo real de puntos y progreso hasta los 300 puntos.
- El acceso a PASS Friday se habilita a partir de 300 puntos. La equivalencia de compra a puntos se configura en el ERP y no se publica en la interfaz.
- La web consulta el saldo desde `get_customer_loyalty_summary`; la acreditación de puntos en ventas sigue siendo responsabilidad del ERP/caja y no se simula desde el cliente web.
- PASS Crew es una membresía pagada adicional, no requisito para llegar a los 300 puntos. Sus beneficios publicados son puntos x2, acceso anticipado a drops, más días de PASS Friday y envío gratis dentro de Bolivia.
