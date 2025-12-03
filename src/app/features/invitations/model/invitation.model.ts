export interface Restaurant {
restaurantId: string;
email: string | null; //(puede venir vacío si es link abierto)
role: string; 
token: string;// (único)
status: "pending" | "accepted",
createdAt: Date;
}

