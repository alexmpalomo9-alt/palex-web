                       ┌─────────┐
                       │  draft  │
                       └────┬────┘
                            │
                            ▼
                       ┌─────────┐
                       │ pending │
                       └────┬────┘
                            │
                            ▼
                       ┌─────────┐
                       │ approved│
                       └───┬─────┘
          (mozo actualiza) │
                            ▼
                       ┌─────────┐
                       │ updated │
                       └───┬─────┘
          (cocina acepta) │
                            ▼
                       ┌───────────┐
                       │ preparing │
                       └───┬───────┘
          (mozo actualiza) │
                            ▼
                       ┌─────────┐
                       │ updated │
                       └───┬─────┘
          (cocina acepta) │
                            ▼
                       ┌───────────┐
                       │ preparing │
                       └───┬───────┘
                            │
                            ▼
                       ┌─────────┐
                       │  ready  │
                       └───┬─────┘
                            │
                            ▼
                       ┌───────────┐
                       │ delivered │
                       └───┬───────┘
                            │
                            ▼
                       ┌─────────┐
                       │  closed │
                       └─────────┘




        ┌───────────────┐
        │    updated    │
        └──────┬────────┘
               │
      (cocina rechaza)
               │
               ▼
        ┌───────────────┐
        │ update_rejected│
        └──────┬────────┘
               │
               └──► vuelve al estado anterior (approved o preparing)

📊 Flujo de estados de pedidos en tu sistema
1️⃣ draft

Qué es: Pedido recién creado, todavía en borrador.

Quién lo usa: Mozo u operador antes de enviarlo a cocina.

Acciones posibles:

Agregar/quitar items

Modificar notas

Aprobar (approved)

Cancelar (cancelled)

2️⃣ approved

Qué es: Pedido aprobado por mozo, listo para cocina.

Quién lo usa: Cocina o sistema de gestión.

Acciones posibles:

Cocina empieza a preparar → cambia a preparing

Cancelar (cancelled)

3️⃣ updated

Qué es: Pedido aprobado pero modificado (items o cantidades) mientras estaba en preparación.

Acciones posibles:

Cocina acepta cambios → preparing

Cocina rechaza cambios → update_rejected

Cancelar (cancelled)

4️⃣ preparing

Qué es: Cocina está preparando el pedido.

Acciones posibles:

Pedido listo → se cierra (closed)

Cancelar (cancelled) solo si es permitido según reglas internas

5️⃣ closed

Qué es: Pedido completado y pagado.

Qué indica: Venta realizada.

Acciones posibles:

Ya no se puede modificar

Queda como registro para estadísticas de ventas

6️⃣ cancelled

Qué es: Pedido cancelado antes de cerrarlo.

Qué indica: No hubo venta, mesa liberada.

Acciones posibles:

Solo sirve para estadísticas de cancelaciones

Se conserva todo el historial (history, items, total)

7️⃣ update_rejected (opcional)

Qué es: Cocina rechazó cambios de un pedido updated.

Qué indica: El pedido sigue en preparación con estado operativo original.

Acciones posibles:

Reintentar cambios → updated

Cancelar → cancelled

💡 Resumen visual de decisiones:

draft → approved → preparing → closed
   ↘             ↘
  cancelled     updated → preparing
                    ↘
                  update_rejected


cancelled puede suceder desde cualquier estado antes de closed.

closed solo desde preparing o approved (según reglas de tu sistema).

updated y update_rejected ayudan a reflejar cambios y control interno sin perder track de lo real.