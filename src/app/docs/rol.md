1 Roles recomendados
2 Permisos de cada rol (qué puede y NO puede hacer)
3 Tabla comparativa clara
4 Ideas de escalabilidad

🎭 1. Roles del Sistema (estructurados correctamente)
A. SuperAdmin (Plataforma) - equipo desarrollador
B. Manager (Gestor del restaurante) - Dueño o encargado de un restaurante.
C. Staff (Personal del restaurante) Mozo / cajero / cocina según permisos internos.
D. Customer (Cliente final) - El usuario que escanea QR y pide.

🔐 2. Permisos por Rol — detallado
🟣 A. SUPERADMIN — rol más alto (plataforma)
✔ Puede:
Crear, editar y eliminar restaurantes de la plataforma
Gestionar planes / billing / suscripciones
Crear managers
Suspender o habilitar restaurantes
Ver estadísticas globales de uso
Ver y gestionar usuarios del sistema
Configurar parámetros globales del sistema (categorías, plantillas de menús, etc.)

✖ No puede (por diseño):
Crear pedidos dentro de un restaurante
Ver los menús privados (a menos que tenga vistas especiales)
El SuperAdmin es dueño del sistema, no parte del restaurante.

🔵 B. MANAGER (Gestor del restaurante)
✔ Puede:
Editar su restaurante:
Nombre
Datos de contacto
Horarios
Logo / portada
Mesas
QR
Gestionar menús e ítems:
Crear categorías
Agregar productos
Editar precios
Habilitar / deshabilitar items

Gestionar pedidos:
Ver pedidos entrantes
Cambiar estado (recibido, preparando, listo, entregado)
Gestionar staff:
Crear mozos
Gestionar roles internos
Deshabilitar personal
Ver historial de ventas
Ver reseñas del restaurante (si aplica)
Ver estadísticas internas

✖ No puede:
Crear o gestionar otros restaurantes
Ver estadísticas globales de la plataforma
Crear otros managers
Gestionar las finanzas globales del sistema

🟠 C. STAFF — mozos / caja / cocina (permisos parciales)

Podés dividirlos, o usar staff con subroles:

1. Mozo
✔ Ver mesas asignadas
✔ Crear pedidos en nombre del cliente
✔ Cambiar de mesa a un cliente
✔ Cobrar (si habilitás cobro interno)
✔ Ver pedidos propios
✖ NO editar menú
✖ NO ver estadísticas
✖ NO editar datos del restaurante

2. Cocina
✔ Ver pedidos en estado “pendiente”
✔ Marcar pedido como “preparándose” o “listo”
✖ NO crear pedidos
✖ NO editar productos o precios
✖ NO administrar usuarios

3. Caja / Encargado de cobro
✔ Ver todos los pedidos
✔ Cobrar
✔ Cerrar cuentas
✖ No modificar menú
✖ No administrar staff

🟢 D. CUSTOMER (usuario final)
✔ Elegir restaurante
✔ Ver menú
✔ Agregar productos al carrito
✔ Crear pedidos
✔ Dejar notas románticas / personalizadas
✔ Ver historial
✔ Editar su perfil
✔ Añadir métodos de pago (si aplica)

✖ No editar menú
✖ No ver pedidos de otros
✖ No acceder a rutas de administrador

📊 3. Tabla comparativa (súper clara)
Acción / Rol	SuperAdmin	Manager	Mozo	Cocina	Caja	Customer
Gestionar restaurantes	✔	✖	✖	✖	✖	✖
Gestionar menú	✖	✔	✖	✖	✖	✖
Ver pedidos	✖	✔	✔	✔	✔	✔ (solo propios)
Cambiar estado de pedidos	✖	✔	✔	✔	✔	✖
Crear pedidos	✖	✖	✔	✖	✔	✔
Gestionar staff	✖	✔	✖	✖	✖	✖
Ver estadísticas	✔ global	✔ local	✖	✖	✖	✖
Acceder dashboard plataforma	✔	✖	✖	✖	✖	✖
Acceder dashboard restaurante	✖	✔	✔ (limitado)	✔ (limitado)	✔ (limitado)	✖
🧠 4. ¿Cómo aplicarlo en Firestore y Angular?

En Firestore:
users/{uid}/role: "superadmin" | "manager" | "staff" | "customer"
staffType: "mozo" | "cocina" | "caja"
restaurantId: "...solo si staff o manager..."

En Angular Guards:
SuperAdminGuard
ManagerGuard
StaffGuard (parametrizado según rol interno)
CustomerGuard

Ejemplo ruta:
{
  path: 'manager',
  canActivate: [ManagerGuard],
  loadChildren: () => import('./manager/manager.module').then(m => m.ManagerModule)
}
