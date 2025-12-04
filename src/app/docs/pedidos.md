✅ 1) FLUJO FUNCIONAL COMPLETO DE LOS PEDIDOS
A. Cliente (mesa)

El cliente escanea el QR → entra a /mesa/:mesaId.

Ve el menú (categorías, productos, precios).

Agrega productos al carrito local (localStorage / service in-memory).

Confirma → se crea un Pedido:

estado: "pendiente"

mesa actual

lista de ítems

hora y total

El cliente puede:

ver el estado del pedido en tiempo real

agregar un nuevo pedido si todavía está en la mesa

B. Mozo / Personal

En su panel verá:

pedidos pendientes

pedidos en preparación

pedidos listos

pedidos entregados

Puede:

Aceptar el pedido (cambia a "en preparación")

Mover al cliente de mesa (si el usuario se cambió de mesa accidentalmente)

Marcar como listo

Marcar como entregado

Cancelar

C. Cocina

Tendrá su propio panel:

Solo ve pedidos aceptados o en preparación

Puede marcar como listo para entregar

D. Caja

Puede ver los pedidos entregados

Puede hacer cierre de mesa

Pagos

📌 IMPORTANTE:

Cada pedido debe quedar asociado a la mesa, al usuario (si hay login), y registrar un historial de estados.

✅ 2) ENTIDADES PRINCIPALES (MODELOS)
Pedido
id: string;
mesaId: string;
clienteUid?: string;
estado: 'pendiente' | 'preparación' | 'listo' | 'entregado' | 'cancelado';
items: PedidoItem[];
total: number;
timestamp: number;
notas?: string;
historialEstados: EstadoPedido[];

PedidoItem
productoId: string;
nombre: string;
cantidad: number;
precioUnitario: number;
subtotal: number;
modificadores?: any;

EstadoPedido
estado: string;
fecha: number;
usuarioId: string;

Mesa
id: string;
número: number;
estado: 'libre' | 'ocupada';
pedidoActualId?: string;

Producto
id: string;
nombre: string;
precio: number;
imagen: string;
categoriaId: string;
disponible: boolean;

✅ 3) SERVICIOS NECESARIOS
1. PedidoService

crearPedido()

obtenerPedidosActivos()

obtenerPedidosPorMesa(mesaId)

cambiarEstadoPedido(pedidoId, estado)

agregarItem()

cancelarPedido()

totalizador()

2. MesaService

setMesaOcupada()

setMesaLibre()

cambiarMesaDePedido()

3. ProductoService

obtenerProductos()

obtenerProductoById()

4. CarritoService (cliente)

agregarAlCarrito()

quitarDelCarrito()

obtenerCarrito()

limpiarCarrito()

totalCarrito()

5. CocinaService (opcional, puede ser parte de PedidoService)

obtenerPedidosEnPreparación()

marcarPedidoListo()

6. NotificacionesService

Opción futura para mostrar:

"Tu pedido fue aceptado"

"Tu pedido está listo"

"Tu pedido está llegando"

7. AuthService

Ya lo tenés, pero se usa en:

identificar mozo / cocina / caja

registrar usuario en pedido (cliente opcional)

✅ 4) COMPONENTES NECESARIOS
Cliente (Front Mesa)

MenuComponent

ProductoDetalleComponent

CarritoComponent

ConfirmarPedidoComponent

EstadoPedidoComponent (con actualización en vivo)

Panel Mozo

PedidosPendientesComponent

PedidosEnPreparaciónComponent

PedidosListosComponent

DetallePedidoComponent

MoverMesaDialogComponent

Cocina

CocinaListaPedidosComponent

CocinaDetallePedidoComponent

Caja

CajaPedidosEntregadosComponent

CerrarMesaComponent

HistorialDeCierresComponent (versión futura incluyendo tu idea de cierre de caja)

✅ 5) RELACIONES ENTRE TODO
Cliente → CarritoService → PedidoService → Firestore
                       ↑
                       |
                   ProductoService

Mozo → PedidoService → Firestore
    → MesaService

Cocina → PedidoService (solo lectura de algunos)
Caja → PedidoService
