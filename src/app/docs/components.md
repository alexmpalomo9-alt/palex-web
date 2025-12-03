# Components Overview

Este documento describe la responsabilidad, inputs, outputs y dependencias de cada componente del proyecto.  
Sirve como referencia para el desarrollo, mantenimiento y futuras ampliaciones del sistema.

---

## 📌 RestaurantListComponent

**Responsabilidad:**  
Mostrar el listado de restaurantes disponibles. Permitir filtrar, ordenar y seleccionar uno para ver su detalle.

**Inputs:**  
- Ninguno (obtiene los datos desde `RestaurantService`).

**Outputs:**  
- `selectRestaurant(restaurantId)` → cuando el usuario escoge un restaurante.

**Servicios utilizados:**  
- `RestaurantService`

---

## 📌 RestaurantDetailComponent

**Responsabilidad:**  
Mostrar la información completa de un restaurante: descripción, foto, horarios, rating, dirección y menú agrupado por categorías.

**Inputs:**  
- `restaurantId`

**Outputs:**  
- Ninguno

**Servicios utilizados:**  
- `RestaurantService`
- `MenuService`

---

## 📌 MenuItemComponent

**Responsabilidad:**  
Mostrar la tarjeta visual de un ítem del menú (foto, nombre, precio, descripción corta).  
Permite agregar el producto al carrito.

**Inputs:**  
- `menuItem`

**Outputs:**  
- `addToCart(item)`

**Servicios utilizados:**  
- Ninguno (solo emite eventos)

---

## 📌 ProductComponent

**Responsabilidad:**  
Mostrar el detalle completo del producto seleccionado: ingredientes, descripción extendida, información nutricional, fotos grandes, variaciones (si aplica).

**Inputs:**  
- `productId`

**Outputs:**  
- `addToCart(product)`

**Servicios utilizados:**  
- `MenuService`

---

## 📌 CartComponent

**Responsabilidad:**  
Mostrar los productos añadidos al carrito, permitir actualizar cantidades, eliminar ítems y ver el total actualizado.  
Permite iniciar el proceso de compra (checkout).

**Inputs:**  
- Ninguno (consume desde `CartService`)

**Outputs:**  
- `updateQty(item, newQty)`
- `removeItem(item)`
- `goToCheckout()`

**Servicios utilizados:**  
- `CartService`

---

## 📌 OrderSummaryComponent

**Responsabilidad:**  
Mostrar el resumen final del pedido antes de confirmarlo.  
Incluye: listado, subtotal, envío (si aplica), notas personalizadas y total final.

**Inputs:**  
- `orderDraft` (o se obtiene del servicio)

**Outputs:**  
- `confirmOrder(order)`

**Servicios utilizados:**  
- `OrderService`

---

## 📌 OrderHistoryComponent

**Responsabilidad:**  
Mostrar el historial de pedidos hechos por el usuario, con fecha, estado, total y opción de ver detalle o volver a pedir.

**Inputs:**  
- Ninguno

**Servicios utilizados:**  
- `OrderService`

---

## 📌 LoginComponent

**Responsabilidad:**  
Autenticación del usuario existente mediante email/password o métodos alternativos si se agregan.

**Inputs:**  
- Ninguno

**Outputs:**  
- `loginUser(credentials)`

**Servicios utilizados:**  
- `AuthService`

---

## 📌 RegisterComponent

**Responsabilidad:**  
Crear un nuevo usuario con email y contraseña y opcionalmente nombre.

**Inputs:**  
- Ninguno

**Outputs:**  
- `registerUser(data)`

**Servicios utilizados:**  
- `AuthService`

---

## 📌 AdminRestaurantComponent

**Responsabilidad:**  
Administración del perfil del restaurante: datos básicos, horarios, descripción, domicilio, fotos, configuraciones generales.

**Inputs:**  
- `restaurantId` (si edita)

**Outputs:**  
- `saveRestaurant(data)`
- `deleteRestaurant(id)`

**Servicios utilizados:**  
- `AdminRestaurantService`

> Acceso restringido a rol: **OWNER** o **ADMIN**

---

## 📌 AdminMenuComponent

**Responsabilidad:**  
Administrar los menús del restaurante:  
crear, editar, eliminar categorías; relacionar ítems; ordenar.

**Inputs:**  
- `restaurantId`

**Outputs:**  
- `saveMenu(menu)`
- `deleteMenu(menuId)`

**Servicios utilizados:**  
- `AdminMenuService`

> Acceso restringido a rol: **OWNER** o **EDITOR**

---

## 📌 AdminMenuItemComponent

**Responsabilidad:**  
CRUD completo de los ítems del menú:  
crear, editar, borrar y asociar a categorías.

**Inputs:**  
- `menuItemId` (si edita)

**Outputs:**  
- `saveItem(item)`
- `deleteItem(itemId)`

**Servicios utilizados:**  
- `AdminMenuItemService`

> Acceso restringido a rol: **OWNER**, **EDITOR** o **KITCHEN_MANAGER** (según definición del proyecto)

---

## 📌 Componentes futuros (placeholder)

Estos no son parte del MVP pero podrían agregarse:

- **TableManagementComponent** (para mozos)
- **OrderTrackingComponent** (para ver estado en tiempo real)
- **KitchenDisplayComponent** (pantalla para cocina)
- **NotificationsComponent**

---

### ✔ Buenas prácticas aplicadas

- Cada componente tiene **una sola responsabilidad** (SRP).
- Inputs/Outputs definidos claramente.
- Dependencias mínimas por componente.
- Separación entre áreas: pública vs. administrador.
- Facilita escalabilidad y testeo.

---

Falta:  
✅ `routes.md`  
✅ `firestore-schema.md`  
✅ `architecture.md`  
para tener la documentación completa del proyecto Victoria.
