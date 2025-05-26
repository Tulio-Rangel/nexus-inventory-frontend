import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { UserService } from '../../../../core/services/user.service';
import { ProductResponseDTO } from '../../models/product.model';
import { User } from '../../../users/models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'productName', 'quantity', 'entryDate', 'registeredByName', 'lastModifiedByName', 'lastModificationDate', 'actions'];
  dataSource: MatTableDataSource<ProductResponseDTO> = new MatTableDataSource();
  availableUsers: User[] = [];

  filterForm: FormGroup;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private productService: ProductService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {
    this.filterForm = new FormGroup({
      entryDate: new FormControl(null),
      userId: new FormControl(null),
      productName: new FormControl('')
    });
  }

  ngOnInit(): void {
    this.loadAllProducts();

    this.loadUsers();

    this.filterForm.valueChanges.pipe(
      debounceTime(300), // Espera 300ms después de que el usuario deja de escribir/seleccionar
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)) // Solo emite si los valores cambian realmente
    ).subscribe(() => {
      this.applyDynamicFilters();
    });
  }

  loadAllProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        this.snackBar.open('Error al cargar todos los productos: ' + (err.error?.message || err.message), 'Cerrar', { duration: 3000 });
        console.error('Error al cargar todos los productos:', err);
      }
    });
  }

  // Lógica de filtrado que se ejecuta dinámicamente
  applyDynamicFilters(): void {
    const filters = this.filterForm.value;
    const formattedFilters: { entryDate?: string, userId?: number, productName?: string } = {};

    let hasAnyFilterValue = false;

    if (filters.entryDate) {
      formattedFilters.entryDate = moment(filters.entryDate).format('YYYY-MM-DD');
      hasAnyFilterValue = true;
    }
    if (filters.userId) {
      formattedFilters.userId = filters.userId;
      hasAnyFilterValue = true;
    }
    // Asegura que productName no sea solo espacios en blanco
    if (filters.productName && filters.productName.trim() !== '') {
      formattedFilters.productName = filters.productName.trim();
      hasAnyFilterValue = true;
    }

    // Si NO hay ningún filtro activo (todos los campos están vacíos o nulos)
    if (!hasAnyFilterValue) {
      // Cargam todos los productos de nuevo
      this.loadAllProducts();
    } else {
      // Si hay al menos un filtro con valor, aplica la búsqueda
      this.productService.searchProducts(formattedFilters).subscribe({
        next: (data) => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error: (err) => {
          this.snackBar.open('Error al buscar mercancía: ' + (err.error?.message || err.message), 'Cerrar', { duration: 3000 });
          console.error('Error al buscar mercancía:', err);
        }
      });
    }
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios para filtro/modal:', err);
      }
    });
  }

  editProduct(id: number): void {
    this.router.navigate(['/products/edit', id]);
  }

  deleteProduct(productId: number, registeredByUserId: number): void {
    const dialogData: ConfirmationDialogData = {
      title: 'Confirmar Eliminación',
      message: '¿Está seguro de que desea eliminar esta mercancía? Solo el usuario que la registró puede hacerlo. Por favor, selecciona tu usuario.',
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      showUserSelection: true,
      availableUsers: this.availableUsers,
      productRegisteredById: registeredByUserId
    };

    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: dialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        const requestingUserId = result.selectedUserId;
        if (requestingUserId) {
          this.productService.deleteProduct(productId, requestingUserId).subscribe({
            next: () => {
              this.snackBar.open('Mercancía eliminada correctamente', 'Cerrar', { duration: 3000 });
              this.loadAllProducts(); // Recarga la lista completa después de la eliminación
            },
            error: (err) => {
              this.snackBar.open('Error al eliminar mercancía: ' + (err.error?.message || err.message), 'Cerrar', { duration: 5000 });
              console.error('Error al eliminar mercancía:', err);
            }
          });
        } else {
          this.snackBar.open('No se seleccionó un usuario para la eliminación.', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }
  // Método para aplicar filtros manualmente
  // applyFilters(): void {
  //   this.applyDynamicFilters();
  // }

  clearFilters(): void {
    this.filterForm.reset({
      entryDate: null,
      userId: null,
      productName: ''
    });
    this.loadAllProducts();
  }
}