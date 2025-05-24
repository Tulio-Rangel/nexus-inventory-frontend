import { Component, OnInit, ViewChild } from '@angular/core';
import { ProductService } from '../../../../core/services/product.service';
import { UserService } from '../../../../core/services/user.service'; // Para el filtro por usuario
import { ProductResponseDTO } from '../../models/product.model';
import { User } from '../../../users/models/user.model'; // Para el dropdown de usuarios
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import * as moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmationDialogData } from '../../../../shared/components/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'productName', 'quantity', 'entryDate', 'registeredByName', 'lastModifiedByName', 'lastModificationDate', 'actions'];
  dataSource: MatTableDataSource<ProductResponseDTO> = new MatTableDataSource();
  availableUsers: User[] = []; // Para el filtro por usuario

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
    this.loadProducts();
    this.loadUsers(); // Cargar usuarios para el filtro

    // Suscribirse a cambios en el formulario de filtros para recargar los productos
    this.filterForm.valueChanges.subscribe(() => {
      this.loadProducts();
    });
  }

  loadProducts(): void {
    const filters = this.filterForm.value;
    const formattedFilters = {
      entryDate: filters.entryDate ? moment(filters.entryDate).format('YYYY-MM-DD') : undefined,
      userId: filters.userId || undefined,
      productName: filters.productName || undefined
    };

    this.productService.searchProducts(formattedFilters).subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        this.snackBar.open('Error al cargar mercancía: ' + err.error.message, 'Cerrar', { duration: 3000 });
        console.error('Error al cargar mercancía:', err);
      }
    });
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
      },
      error: (err) => {
        console.error('Error al cargar usuarios para filtro:', err);
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
      productRegisteredById: registeredByUserId // Pasa el ID del usuario que lo registró para preseleccionar
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
              this.loadProducts();
            },
            error: (err) => {
              this.snackBar.open('Error al eliminar mercancía: ' + err.error.message, 'Cerrar', { duration: 5000 });
              console.error('Error al eliminar mercancía:', err);
            }
          });
        } else {
          this.snackBar.open('No se seleccionó un usuario para la eliminación.', 'Cerrar', { duration: 3000 });
        }
      }
    });
  }

  clearFilters(): void {
    this.filterForm.reset({
      entryDate: null,
      userId: null,
      productName: ''
    });
    // loadProducts() se llamará automáticamente por valueChanges
  }
}