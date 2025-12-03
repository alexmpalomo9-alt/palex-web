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