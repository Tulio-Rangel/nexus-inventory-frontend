import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '../../../features/users/models/user.model';
import { FormControl, Validators } from '@angular/forms';

export interface ConfirmationDialogData {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  showUserSelection?: boolean; // Indica si se debe mostrar el selector de usuario
  availableUsers?: User[];    // Lista de usuarios disponibles para la selección
  productRegisteredById?: number; // Opcional: ID del usuario que registró el producto para preselección
}

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmation-dialog.component.html',
  styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent implements OnInit {
  userControl = new FormControl<number | null>(null, Validators.required);

  constructor(
    public dialogRef: MatDialogRef<ConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmationDialogData
  ) {}

  ngOnInit(): void {
    if (this.data.showUserSelection && this.data.productRegisteredById) {
      // Preselecciona al usuario que registró el producto si está disponible
      this.userControl.setValue(this.data.productRegisteredById);
    }
  }

  onConfirm(): void {
    if (this.data.showUserSelection && this.userControl.invalid) {
      this.userControl.markAsTouched(); // Marca el control como tocado para mostrar el error
      return;
    }
    // Devuelve true si es solo confirmación, o un objeto con la confirmación y el ID de usuario
    this.dialogRef.close({
      confirmed: true,
      selectedUserId: this.data.showUserSelection ? this.userControl.value : null
    });
  }

  onCancel(): void {
    this.dialogRef.close({ confirmed: false });
  }
}