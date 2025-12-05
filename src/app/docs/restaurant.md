📌 Restaurante – Documentación

1. RestaurantListComponent
Responsabilidad:
Mostrar la lista de restaurantes con posibilidad de filtrar, ordenar y seleccionar un restaurante.

Inputs:
restaurants: Restaurant[] → Lista de restaurantes recibida del componente padre.

Outputs:
selectRestaurant(restaurantId: string) → Se emite cuando el usuario selecciona un restaurante.
edit(restaurant: Restaurant) → Se emite para editar un restaurante.
remove(restaurant: Restaurant) → Se emite para deshabilitar (borrado lógico) un restaurante.
enable(restaurant: Restaurant) → Se emite para reactivar un restaurante.
disable(restaurant: Restaurant) → Se emite para deshabilitar un restaurante.

Servicios utilizados:
Ninguno directamente; depende de los outputs para que el padre maneje la lógica con RestaurantService.

Notas:
Usa MatTableDataSource para filtrado y paginación.
Visualiza el estado de enabled para saber si el restaurante tiene membresía activa.

2. RestaurantPageComponent
Responsabilidad:
Componente contenedor que administra la lista de restaurantes, acciones de alta/baja, y navegación hacia el detalle o creación de un restaurante.

Servicios utilizados:
RestaurantService → Obtener restaurantes, habilitar/deshabilitar y actualizar datos.
RestaurantDialogService → Abrir formularios de creación o edición.
DialogService → Mostrar diálogos de confirmación e información.

Funciones principales:
loadRestaurants() → Carga los restaurantes según su estado (enabled o deshabilitado).
onRemove(restaurant) → Deshabilita un restaurante (borrado lógico).
onEnable(restaurant) → Habilita un restaurante.
onEdit(restaurant) → Abre diálogo para editar un restaurante.
addRestaurant() → Abre diálogo para crear un nuevo restaurante.

3. RestaurantService
Responsabilidad:
Comunicación con Firestore para CRUD de restaurantes y sus productos.

Funciones principales:
getRestaurantsByStatus(enabled: boolean) → Obtiene restaurantes filtrando por estado enabled.
disableRestaurant(restaurantId) → Borrado lógico, marca el restaurante como inactivo.
enableRestaurant(restaurantId) → Reactiva un restaurante.
updateRestaurantData(restaurantId, updatedData) → Actualiza los datos de un restaurante.
addRestaurant(newRestaurant) → Crea un restaurante nuevo.
getProductsByRestaurant(restaurantId) → Obtiene productos asociados a un restaurante.

Notas:
Ya no se utiliza deleteRestaurant, se reemplazó por el borrado lógico con enabled.

4. RestaurantDialogComponent
Responsabilidad:
Formulario para crear o editar un restaurante.

Inputs:
data: RestaurantDialogData → Contiene restaurant y mode (edit o create).

Outputs:
Devuelve los datos completos del formulario al componente padre al cerrar (dialogRef.close(...)).

Notas:
El campo enabled permite definir si el restaurante estará activo al crearlo o editarlo.
Valida campos con FormControl y expresiones regulares.


FLUJO
🟦 FLUJO VISUAL — CREACIÓN Y GESTIÓN DE PEDIDOS (con QR + Mozo + Cocina)
📌 1. Usuario escanea el QR de la mesa

QR contiene:
/order?restaurantId=XXX&tableId=YYY&tableNumber=Z

👇

➡ Vue/Angular abre página order-page

Y ejecuta:

createOrGetActiveOrder(restaurantId, tableId, tableNumber)

🟩 2. SE INTENTA OBTENER un pedido existente

Firestore Query:

/restaurants/{restaurantId}/orders
   where tableId == <tableId>
   where status not-in ["closed", "cancelled"]
   limit 1


Si existe →
📌 Lo devuelve
⬆ El usuario sigue con ese pedido ya abierto

Si NO existe →
➡ pasa al paso 3

🟧 3. SE CREA un nuevo pedido

Se crea un documento así:

/restaurants/{restaurantId}/orders/{orderId}
{
  restaurantId,
  tableId,
  tableNumber,
  status: "new",
  total: 0,
  createdAt,
  updatedAt
}


👉 Este documento NO contiene items
👉 Los items viven en la subcolección:

/orders/{orderId}/items/{itemId}

🟨 4. Usuario agrega items al pedido

Al tocar “Agregar al pedido”:

addItemWithStatusCheck(restaurantId, orderId, item)


Esto crea un documento:

/restaurants/{restaurantId}/orders/{orderId}/items/{itemId}
{
  productId,
  productName,
  price,
  quantity,
  subtotal,
  createdAt
}


⚡ Todo independiente
⚡ Sin pisar nada
⚡ Listo para escalabilidad

🟦 5. Cocina / mozo ven actualizaciones en tiempo real

Listeners:

collection(`/restaurants/${restaurantId}/orders/${orderId}/items`)


La cocina recibe:

Nuevos items

Cambios de cantidad

Items cancelados

Items preparados

🟥 6. Cálculo del total del pedido (automático)

Cuando cambia la subcolección /items, se recalcula:

total = sum(subtotal of all items)


Esto se puede hacer:

🔥 En Cloud Function onWrite

❄️ O en Angular cuando el usuario está usando el pedido

(Más adelante elegimos)

🟪 7. Usuario envía pedido a la cocina

status: "pending"

Pasa de:

new → pending → preparing → ready → delivered → closed

🟫 8. El mozo puede mover el pedido a otra mesa

Función:

changeOrderTable(restaurantId, orderId, newTableId)

🟩 9. Pedido cerrado

Cuando se paga:

status: "closed"
closedAt: timestamp


Y ya no podrá ser reutilizado.

🌀 RESUMEN VISUAL (super claro)
📲 Usuario escanea QR
       ↓
  order-page carga
       ↓
🔍 Buscar pedido activo
       ↓
  ┌───────────────┐
  │ ¿Existe?       │
  └───────┬───────┘
          │ sí
          ▼
   🔄 Usar pedido
          │
          │ no
          ▼
 🆕 Crear pedido nuevo
          ↓
 🛒 Agregar items (subcolección)
          ↓
🎛 Cocina escucha items en tiempo real
          ↓
🧮 Recalcular total
          ↓
📤 Enviar pedido
          ↓
🍽 Preparar → Listo → Entregado
          ↓
💵 Pago & Cierre
