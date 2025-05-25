import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductResponseDTO } from 'src/app/features/products/models/product.model';
import { ProductCreationDTO, ProductUpdateDTO } from 'src/app/features/products/models/produc-dto.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(private http: HttpClient) { }

  createProduct(product: ProductCreationDTO): Observable<ProductResponseDTO> {
    return this.http.post<ProductResponseDTO>(this.apiUrl, product);
  }

  updateProduct(id: number, product: ProductUpdateDTO): Observable<ProductResponseDTO> {
    return this.http.put<ProductResponseDTO>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number, requestingUserId: number): Observable<void> {
    const params = new HttpParams().set('requestingUserId', requestingUserId.toString());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }

  getProductById(id: number): Observable<ProductResponseDTO> {
    return this.http.get<ProductResponseDTO>(`${this.apiUrl}/${id}`);
  }

  searchProducts(filters: { entryDate?: string, userId?: number, productName?: string }): Observable<ProductResponseDTO[]> {
    let params = new HttpParams();
    if (filters.entryDate) {
      params = params.set('entryDate', filters.entryDate);
    }
    if (filters.userId) {
      params = params.set('userId', filters.userId.toString());
    }
    if (filters.productName) {
      params = params.set('productName', filters.productName);
    }
    return this.http.get<ProductResponseDTO[]>(this.apiUrl, { params });
  }
}