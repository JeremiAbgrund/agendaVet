# AgendaVet

Aplicación híbrida Ionic + Angular para gestionar citas veterinarias. Este proyecto sigue los requisitos de la actividad con encargo "Creando mi proyecto Gestor de Citas Veterinarias".

## Estructura inicial
- `src/app/pages/login` – página landing con formulario reactivo (pendiente de implementar lógica).
- `src/app/pages/home` – dashboard posterior al login.
- `src/app/pages/listado` – listado de citas (≥8 ítems).
- `src/app/pages/detalle/:id` – detalle de la cita con acción de favorito.
- `src/app/pages/perfil` – perfil editable del tutor.
- `src/app/pages/contacto` – formulario de contacto/soporte.
- `src/app/shared/{components,services,models}` – contenedores para reutilizables.
- `app-routing.module.ts` – rutas lazy cargadas que redirigen a `login` por defecto.

## Scripts clave
```bash
npm install       # instala dependencias si aún no lo has hecho
ionic serve       # levanta la app en modo desarrollo
ionic g page ...  # genera nuevas páginas lazy
ionic build       # genera build de producción
```
