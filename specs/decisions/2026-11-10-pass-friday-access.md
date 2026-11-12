# Acceso a PASS Friday y beneficios de PASS Crew

## Decisión de producto

- Una cuenta PASS gratuita puede acceder a PASS Friday al acumular 300 puntos o más.
- La web no publica la equivalencia de compra a puntos. Esa regla se configura internamente en el ERP; la condición pública es llegar a 300 puntos.
- PASS Crew es una membresía pagada adicional. No reemplaza el requisito de puntos para el acceso general de PASS Friday.
- PASS Crew agrega: puntos x2, acceso anticipado a drops, más días de PASS Friday y envíos gratis dentro de Bolivia.

## Alcance técnico

La web muestra el saldo devuelto por `get_customer_loyalty_summary` y la tarjeta PASS Friday. La suma efectiva de puntos al cerrar una venta debe aplicarse en el ERP/caja que registra la venta; este repositorio no contiene esa migración ni ese flujo de escritura.
