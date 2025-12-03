[Restaurant] 
    │
    ├── [Mesas] ----------------------> Cada mesa tiene:
    │       ├─ tableId / número
    │       ├─ capacidad nominal
    │       ├─ estado (libre / ocupada / reservada)
    │       ├─ sector / ubicación
    │       └─ QR único (JSON: {restaurantId, tableId})
    │
    ├── [Cliente]
    │       ├─ Escanea QR → obtiene tableId
    │       ├─ Accede a restaurant-menu
    │       ├─ Carrito inicializado por mesa
    │       └─ Hace pedido (por su mesa)
    │
    ├── [Pedido]
    │       ├─ Asociado a tableId + restaurantId + userId/guest
    │       ├─ Estado: pendiente / en preparación / listo / entregado
    │       └─ Puede ser modificado por mozo si es necesario
    │
    ├── [Panel Staff]
    │       ├─ Visualización de mesas (grilla/tabla)
    │       ├─ Estado de cada mesa
    │       ├─ Pedidos por mesa
    │       ├─ Función: unir mesas / separar mesas
    │       └─ Función: reasignar pedidos a otra mesa
    │
    └── [Reglas y restricciones]
            ├─ Bloqueo de pedidos fuera de horario
            ├─ Validación de capacidad nominal
            ├─ Seguridad: guest solo interactúa con su mesa
            └─ Estadísticas futuras: promedio ocupación, mesas unidas, etc.



Notas importantes para MVP:
Cliente siempre hace pedido solo por la mesa que escanea.
El mozo maneja uniones/separaciones de mesas.
La capacidad nominal es informativa; no se hace lógica compleja de grupos por ahora.

Componentes del módulo (teórico)
RestaurantTablesComponent
Listado visual de mesas (grilla o tablero)
Indicadores de estado (colores o iconos)
Botones para crear, editar, eliminar mesa
Botón para generar/ver QR

TableDialogComponent
Modal para crear/editar mesa
Campos: número, capacidad, sector, estado
Generación de QR dentro del modal

QRViewerComponent
Mostrar QR en tamaño grande
Opciones: descargar, imprimir

CustomerTableViewComponent
Vista para el cliente al escanear QR
Muestra nombre de mesa y menú digital
Inicializa carrito asociado a tableId
Botón “hacer pedido”

StaffPanelTableViewComponent
Vista para mozos / cocina
Pedidos por mesa
Función unir/separar mesas
Función reasignar pedido a otra mesa
Estado de mesas actualizado en tiempo real (opcional para MVP)
Servicios del módulo (teórico)

TableService
CRUD de mesas
Generación y almacenamiento de QR
Estado de mesa: libre / ocupada / reservada
Unión / separación de mesas
Asociar pedido a tableId

OrderService (integrado)
Crear pedido asociado a tableId
Actualizar estado del pedido
Consultar pedidos por mesa

StaffService
Reasignar pedido a otra mesa o usuario
Cerrar mesa / marcar como liberada
Gestionar uniones y separaciones de mesas
HorarioService (integrado con bloqueos)
Validar si pedido permitido según horario
Bloquear pedido fuera de horario

💡 Extras a futuro (no para MVP):
Chat grupal por mesa para pedidos compartidos
Estadísticas de ocupación y capacidad promedio
Tipos de mesa especiales: barra, sofá, combinadas
Sincronización real de pedidos entre varios clientes en la misma mesa