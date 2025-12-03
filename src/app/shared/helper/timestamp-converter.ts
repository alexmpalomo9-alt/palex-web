import { Timestamp } from '@angular/fire/firestore';

export function convertTimestamps<T>(data: any): T {
  if (!data || typeof data !== 'object') return data;

  const copy = Array.isArray(data) ? [...data] : { ...data };

  Object.keys(copy).forEach((key) => {
    const value = copy[key];

    if (value instanceof Timestamp) {
      copy[key] = value.toDate();
    }

    // Si hay objetos anidados tambien los convierte
    else if (typeof value === 'object' && value !== null) {
      copy[key] = convertTimestamps(value);
    }
  });

  return copy as T;
}
