✅ CHECKLIST DEL MVP — Proyecto Victoria
0. Base del sistema
✔ Ya tenés

Autenticación (signup/login)

Login persistente (Firebase Auth)

Firestore integrado

Módulo restaurante CRUD

Módulo productos CRUD

Index inicial con restaurantes

⏳ Pendiente

Estructura de roles y permisos

Guards según rol

Normalización del módulo User

Organización final de colecciones de Firestore

1. Módulo Usuarios
✔ Ya tenés (parcial)

Registro básico

Login

⏳ Falta para el MVP

Modelo de usuario definitivo

uid

name

email

roles: { adminLocal: true/false, mozo: true, cocina: true }

restaurantsOwner: []

restaurantsStaff: []

Alta de empleados

Desde panel del administrador del restaurante

Asignación y edición de roles

Vincular empleado ⇢ restaurante

User management screens

Listado de empleados

Editar roles

Remover empleado

2. Módulo Restaurantes
✔ Ya tenés

CRUD completo

Selección de restaurante

Listado inicial

⏳ Falta

Flujo de registro de restaurante

Pantalla de “Crear restaurante”

Validar que el usuario pueda registrar varios

Pantalla de términos/condiciones antes del alta

Asociar el restaurante al usuario

restaurantsOwner.push(id)

3. Módulo Productos / Menú
✔ Ya tenés

CRUD completo

Vinculado al restaurante

⏳ Falta

Notas simples

Ej: “sin aceitunas”, “pan tostado”, “poco queso”

Control de disponibilidad

Activar/desactivar producto momentáneamente

4. Módulo Mesas (básico)
⏳ Pendiente de implementar

CRUD de mesas

Número o identificador

Cantidad de comensales (opcional)

Estado:

Disponible

Ocupada

Movimiento de mesas:

Cambiar cliente de mesa (por mozo)

5. Módulo QR — MVP
⏳ Pendiente

Generar QR con restaurantId + tableId

Cuando un cliente escanea:

Abrir pantalla “Mesa X”

Mantenerlo asociado a esa mesa

Permitir al mozo cambiar la mesa manualmente

(El QR no va a llevar nada complejo en el MVP, solo restaurantId/tableId)

6. Módulo Pedidos
⏳ Pendiente grande pero abordable

Crear pedido

productos[]

notas[]

estado: pendiente

mesaId

clienteId (opcional)

Cambiar estado del pedido:

Pendiente → En preparación → Listo → Entregado

Listado para la cocina

Listado para el mozo

Listado por mesa

7. Panel General del Restaurante

(administración del día a día)

⏳ Pendiente

Ver mesas ocupadas/libres

Ver pedidos activos

Filtrar por estado

Acceso rápido a cerrar mesa

8. Guards / Seguridad / Routing
⏳ Pendiente

AuthGuard → requiere login

AdminGuard → acceso solo dueño del restaurante

StaffGuard → acceso mozos/cocina

OwnerGuard → para editar restaurantes propios

9. UI / UX
⏳ Pendiente

Estilizar flujo de onboarding

Pantallas claras para:

Crear restaurante

Administrar empleados

Ver pedidos