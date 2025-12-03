[ Crear restaurant ]
        │
        ▼
menuType = 'palex' por defecto
        │
        ▼
[ Visualización Menu en RestaurantMenu ]
        │
        ▼
[ Usuario cambia menú (Tradicional / Palex) ]
        │
        ▼
1. menuType en UI se actualiza
2. menuType en Firestore se actualiza
        │
        ▼
[ Render dinámico en MenuSelectorComponent ]
        ├─ ngSwitch → MenuTradicional
        └─ ngSwitch → MenuPalex
