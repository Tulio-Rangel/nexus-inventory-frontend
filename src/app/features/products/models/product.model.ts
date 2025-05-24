export interface Product {
  id?: number;
  productName: string;
  quantity: number;
  entryDate: string;
  registeredByUserId?: number; // Para el DTO de creación
  lastModifiedByUserId?: number; // Para el DTO de actualización
}

export interface ProductResponseDTO {
  id?: number;
  productName: string;
  quantity: number;
  entryDate: string;
  registeredByName: string; // Nombre del usuario que registró
  lastModifiedByName: string; // Nombre del usuario que modificó
  lastModificationDate: string; // Fecha y hora de la última modificación
}