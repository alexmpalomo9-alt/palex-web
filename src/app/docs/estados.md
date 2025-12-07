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
