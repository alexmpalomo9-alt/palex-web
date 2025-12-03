TABLA PERMISOS — MVP
📌 1. Administración General
Acción          	                adminGlobal	adminLocal	encargado	    mozo	    cocina
Crear restaurantes	                     ✔	        ❌	    ❌	        ❌	        ❌
Editar restaurantes	                     ✔          ❌      	❌	        ❌	        ❌
Eliminar restaurantes	                 ✔          ❌      	❌	        ❌	        ❌
Ver lista completa de restaurantes	     ✔	        ❌	    ❌	        ❌	        ❌

📌 2. Gestión interna del Restaurante
Acción	adminGlobal	adminLocal	encargado	mozo	cocina
Editar datos del restaurante	✔	✔	❌	❌	❌
Invitar/gestionar personal	✔	✔	❌	❌	❌
Ver todos los pedidos	✔	✔	✔	✔	✔
Ver todas las mesas / actividad del salón	✔	✔	✔	✔	❌
Mover clientes entre mesas	✔	✔	✔	✔	❌
📌 3. Gestión de Menú y Productos
Acción	adminGlobal	adminLocal	encargado	mozo	cocina
Crear/editar categorías	✔	✔	❌	❌	❌
Crear/editar productos	✔	✔	❌	❌	❌
Cambiar precios	✔	✔	✔ (notifica al adminLocal)	❌	❌
Pausar productos	✔	✔	✔ (notifica al adminLocal)	❌	❌
Ver menú	✔	✔	✔	✔	✔
📌 4. Gestión de Mesas y Clientes
Acción	adminGlobal	adminLocal	encargado	mozo	cocina
Crear/editar mesas	✔	✔	❌	❌	❌
Abrir mesa a un cliente	✔	✔	✔	✔	❌
Cerrar mesa	✔	✔	✔	✔	❌
Ver mesas en tiempo real	✔	✔	✔	✔	❌
📌 5. Gestión de Pedidos
Acción	adminGlobal	adminLocal	encargado	mozo	cocina
Ver pedidos en tiempo real	✔	✔	✔	✔	✔
Crear pedidos (POS / mozo)	✔	✔	✔	✔	❌
Actualizar estado del pedido	✔	✔	✔	✔	✔
Marcar pedido como listo	✔	✔	❌	❌	✔
Marcar pedido como entregado	✔	✔	✔	✔	❌
Cancelar pedidos	✔	✔	✔	🟧 (solo si solicita y aprueba el encargado)	❌

🟧 El mozo puede iniciar la solicitud, pero lo cancela el encargado.

📌 6. Pagos y Facturación
Acción	adminGlobal	adminLocal	encargado	mozo	cocina
Ver facturación completa	✔	✔	❌	❌	❌
Ver ventas del día	✔	✔	✔	❌	❌
Procesar pagos	✔	✔	✔	✔	❌
Cierre de caja	✔	✔	✔	❌	❌
📌 7. Estadísticas y Reportes
Acción	adminGlobal	adminLocal	encargado	mozo	cocina
Ver estadísticas avanzadas	✔	✔	❌	❌	❌
Ver métricas del día	✔	✔	🟧 (depende si queremos incluirlo)	❌	❌
Ver desempeño de productos	✔	✔	❌	❌	❌

🟧 Podés decidir si el encargado ve métricas básicas.