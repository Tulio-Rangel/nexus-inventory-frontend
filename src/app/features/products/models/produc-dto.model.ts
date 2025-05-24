export interface ProductCreationDTO {
  productName: string;
  quantity: number;
  entryDate: string;
  registeredByUserId: number;
}

export interface ProductUpdateDTO {
  productName: string;
  quantity: number;
  entryDate: string;
  lastModifiedByUserId: number;
}