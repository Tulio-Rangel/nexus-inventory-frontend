import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../../core/services/product.service';
import { UserService } from '../../../../core/services/user.service';
import { ProductCreationDTO, ProductUpdateDTO } from '../../models/produc-dto.model';
import { User } from '../../../users/models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: ['./product-form.component.scss']
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  productId: number | null = null;
  isEditMode = false;
  availableUsers: User[] = []; // Para el menú desplegable de usuarios

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*$')]],
      entryDate: ['', Validators.required],
      registeredByUserId: [null],
      lastModifiedByUserId: [null]
    });

    this.productId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEditMode = !!this.productId;

    this.loadUsers();

    if (this.isEditMode) {
      this.productService.getProductById(this.productId!).subscribe({
        next: (product) => {
          this.productForm.patchValue({
            productName: product.productName,
            quantity: product.quantity,
            entryDate: moment(product.entryDate), // Para MatDatepicker
            // Si el producto tiene un lastModifiedByName, intentamos encontrar su ID
            lastModifiedByUserId: product.lastModifiedByName ? this.availableUsers.find(u => u.name === product.lastModifiedByName)?.id : null
          });
          // Deshabilitar registeredByUserId en edición, ya que no se puede cambiar
          this.productForm.get('registeredByUserId')?.disable();
        },
        error: (err) => {
          this.snackBar.open('Error al cargar mercancía para edición: ' + err.error.message, 'Cerrar', { duration: 3000 });
          console.error('Error al cargar mercancía:', err);
          this.router.navigate(['/products']); // Redirige si hay un error al cargar el producto
        }
      });
    } else {
      // En modo creación, hacemos que registeredByUserId sea requerido
      this.productForm.get('registeredByUserId')?.setValidators(Validators.required);
      this.productForm.get('registeredByUserId')?.updateValueAndValidity();
      // Deshabilitar lastModifiedByUserId en creación
      this.productForm.get('lastModifiedByUserId')?.disable();
    }
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.availableUsers = users;
        // Si estamos en modo edición y los usuarios ya se cargaron,
        // esto asegurará que 'lastModifiedByUserId' tenga el valor correcto
        // Esto es importante si loadUsers tarda más que la carga del producto.
        if (this.isEditMode && this.productId && this.productForm.get('lastModifiedByUserId')?.value === null) {
            this.productService.getProductById(this.productId!).subscribe(product => {
                this.productForm.patchValue({
                    lastModifiedByUserId: product.lastModifiedByName ? this.availableUsers.find(u => u.name === product.lastModifiedByName)?.id : null
                });
            });
        }
      },
      error: (err) => {
        this.snackBar.open('Error al cargar usuarios disponibles: ' + err.message, 'Cerrar', { duration: 3000 });
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const entryDateFormatted = moment(this.productForm.value.entryDate).format('YYYY-MM-DD');

      if (this.isEditMode) {
        const productUpdateDTO: ProductUpdateDTO = {
          productName: this.productForm.value.productName,
          quantity: this.productForm.value.quantity,
          entryDate: entryDateFormatted,
          lastModifiedByUserId: this.productForm.value.lastModifiedByUserId
        };
        this.productService.updateProduct(this.productId!, productUpdateDTO).subscribe({
          next: () => {
            this.snackBar.open('Mercancía actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/products']);
          },
          error: (err) => {
            this.snackBar.open('Error al actualizar mercancía: ' + err.error.message, 'Cerrar', { duration: 5000 });
            console.error('Error al actualizar mercancía:', err);
          }
        });
      } else {
        const productCreationDTO: ProductCreationDTO = {
          productName: this.productForm.value.productName,
          quantity: this.productForm.value.quantity,
          entryDate: entryDateFormatted,
          registeredByUserId: this.productForm.value.registeredByUserId
        };
        this.productService.createProduct(productCreationDTO).subscribe({
          next: () => {
            this.snackBar.open('Mercancía creada correctamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/products']);
          },
          error: (err) => {
            this.snackBar.open('Error al crear mercancía: ' + err.error.message, 'Cerrar', { duration: 5000 });
            console.error('Error al crear mercancía:', err);
          }
        });
      }
    } else {
      this.snackBar.open('Por favor, complete todos los campos requeridos y válidos.', 'Cerrar', { duration: 3000 });
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.productForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      return 'La cantidad debe ser un número entero positivo';
    }
    if (control?.hasError('pattern')) {
      return 'La cantidad debe ser un número entero';
    }
    return '';
  }
}