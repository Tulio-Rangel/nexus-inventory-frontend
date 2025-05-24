import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../models/user.model';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'name', 'age', 'position', 'hireDate', 'actions'];
  dataSource: MatTableDataSource<User> = new MatTableDataSource();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.dataSource = new MatTableDataSource(data);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (err) => {
        this.snackBar.open('Error al cargar usuarios: ' + err.message, 'Cerrar', { duration: 3000 });
        console.error('Error al cargar usuarios:', err);
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editUser(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }

  deleteUser(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => {
          this.snackBar.open('Usuario eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.loadUsers(); // Recargar la lista
        },
        error: (err) => {
          this.snackBar.open('Error al eliminar usuario: ' + err.error.message, 'Cerrar', { duration: 5000 });
          console.error('Error al eliminar usuario:', err);
        }
      });
    }
  }
}