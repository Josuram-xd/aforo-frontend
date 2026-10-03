# PRD — aforo-frontend

**Repositorio:** `aforo-frontend`
**Última actualización:** 26 de septiembre de 2026

## 1. Problema

Durante la prueba piloto, el profesor y Josuram necesitan ver — en una pantalla, en vivo — cuántas personas hay dentro del salón y quién ha entrado o salido, sin tener que leer JSON crudo del backend.

## 2. Objetivo

Un dashboard web simple que muestre:
1. El aforo actual del salón (personas dentro en este momento).
2. La lista de personas enroladas del curso y su estado (dentro/fuera).
3. Un historial de eventos del día (quién entró/salió y a qué hora).
4. Un login de usuarios: solo quien inicia sesión ve el dashboard y las cámaras.
5. (Opcional, si el tiempo alcanza) una vista en vivo de las cámaras para usuarios `viewer`, y una vista **dev** con el video anotado de cómo va analizando el sistema (cajas, IDs, identidad, dirección).

## 3. No-objetivos

- No maneja registro abierto, recuperación de cuentas propia ni administración de usuarios desde la UI: las cuentas las crea el admin con el script de `aforo-backend` (task 11.3) y el login lo hace Cognito.
- No necesita funcionar en móvil de forma prioritaria — se muestra en el laptop o un proyector.
- No maneja configuración del sistema (eso se hace directamente en `aforo-vision`).

## 4. Usuarios

- **El profesor**, que observa el dashboard durante la demo.
- **Josuram**, que lo opera y lo muestra.
- **Usuarios `viewer`**: inician sesión para ver el dashboard y las cámaras.
- **Usuarios `dev`**: además ven el video anotado del análisis, para depurar y explicar el sistema.

## 5. Requisitos funcionales

1. Mostrar el aforo actual, actualizado automáticamente (polling periódico a `GET /aforo`).
2. Mostrar la lista de personas enroladas con su estado actual (`GET /people`).
3. Mostrar un historial de eventos ordenado por hora (`GET /events`), con nombre (o "no identificado"), dirección (entrada/salida) y hora.
4. Indicar visualmente si un evento fue identificado por rostro o solo contado por cuerpo (`FACE` vs `BODY_ONLY`), para que quede claro en la demo qué tan bien está funcionando el reconocimiento.
5. Todo el texto visible para el usuario debe estar en español.
6. Pantalla de login (Cognito); sin sesión no se muestra ningún dato. Botón de cerrar sesión.
7. (Opcional) Página **Cámaras** (`viewer` y `dev`) con el video de cada cámara, y página **Dev** (solo `dev`) con el video anotado. Solo funcionan en la misma red que el laptop (ver ADR-006 de `aforo-vision`).

## 6. Requisitos no funcionales

- Debe cargar y actualizarse rápido en una red del día del piloto (posiblemente un hotspot compartido con la cámara WiFi).
- Debe ser desplegable gratuitamente (AWS Amplify).
- Diseño simple y legible desde lejos (para cuando se proyecte en el salón).

## 7. Restricciones

- TypeScript + React.
- Debe consumir exclusivamente la API de `aforo-backend` — no accede a DynamoDB ni a `aforo-vision` directamente.
- Presupuesto: 0 COP adicionales — el hosting debe mantenerse dentro del nivel gratuito de AWS Amplify.

## 8. Métricas de éxito del piloto

- El aforo mostrado en pantalla siempre coincide con lo que se ve realmente entrando/saliendo del salón.
- El profesor puede entender el estado del sistema de un vistazo, sin explicación adicional.
