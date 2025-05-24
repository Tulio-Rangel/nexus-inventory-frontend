import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../models/user.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  userId: number | null = null;
  isEditMode = false;
  possiblePositions: string[] = ['Asesor de ventas', 'Administrador', 'Soporte', 'Gerente de Ventas', 'Técnico Mantenimiento'];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(1)]],
      position: ['', Validators.required],
      hireDate: ['', Validators.required]
    });

    this.userId = this.route.snapshot.params['id'] ? +this.route.snapshot.params['id'] : null;
    this.isEditMode = !!this.userId;

    if (this.isEditMode) {
      this.userService.getUserById(this.userId!).subscribe({
        next: (user) => {
          // Convertir string de fecha a Moment para MatDatepicker
          this.userForm.patchValue({
            ...user,
            hireDate: moment(user.hireDate)
          });
        },
        error: (err) => {
          this.snackBar.open('Error al cargar usuario: ' + err.error.message, 'Cerrar', { duration: 3000 });
          console.error('Error al cargar usuario:', err);
          this.router.navigate(['/users']);
        }
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const userData: User = {
        ...this.userForm.value,
        // Convertir Moment a string para el backend
        hireDate: moment(this.userForm.value.hireDate).format('YYYY-MM-DD')
      };

      if (this.isEditMode) {
        this.userService.updateUser(this.userId!, userData).subscribe({
          next: () => {
            this.snackBar.open('Usuario actualizado correctamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/users']);
          },
          error: (err) => {
            this.snackBar.open('Error al actualizar usuario: ' + err.error.message, 'Cerrar', { duration: 5000 });
            console.error('Error al actualizar usuario:', err);
          }
        });
      } else {
        this.userService.createUser(userData).subscribe({
          next: () => {
            this.snackBar.open('Usuario creado correctamente', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/users']);
          },
          error: (err) => {
            this.snackBar.open('Error al crear usuario: ' + err.error.message, 'Cerrar', { duration: 5000 });
            console.error('Error al crear usuario:', err);
          }
        });
      }
    } else {
      this.snackBar.open('Por favor, complete todos los campos requeridos y válidos.', 'Cerrar', { duration: 3000 });
    }
  }

  // Helper para mostrar errores de validación
  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    if (control?.hasError('required')) {
      return 'Este campo es requerido';
    }
    if (control?.hasError('min')) {
      return 'El valor debe ser positivo';
    }
    return '';
  }
}