# Sistema de Gestión de Inventario Automotriz (Prueba Técnica)

Este proyecto es una prueba técnica que implementa un sistema para la gestión de productos y usuarios en un inventario automotriz. Fue desarrollado utilizando Angular.

## Características Principales

### Gestión de Productos

- Listado de productos.
- Creación de nuevos productos.
- Edición de productos existentes.
- Eliminación de productos (solo el usuario creador puede eliminar el producto).
- Filtrado de productos por nombre.
- Filtrado de productos por usuario asignado.
- Filtrado multiparámetro para productos.
- Validaciones y manejo de errores específicos (ej. producto con nombre duplicado, fecha futura no permitida).

### Gestión de Usuarios

- Listado de usuarios.
- Creación de nuevos usuarios.
- Edición de usuarios existentes.
- Filtrado de usuarios.

## Instalación y Ejecución

### Prerrequisitos

- Node.js
- Angular CLI (versión 16.2.16 o compatible)

Este proyecto fue generado con [Angular CLI](https://github.com/angular/angular-cli) version 16.2.16.

Para levantar el servidor de desarrollo, ejecuta `ng serve`. Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias algún archivo fuente.

Para compilar el proyecto para producción, ejecuta `ng build`. Los artefactos de la compilación se almacenarán en el directorio `dist/`.

## Guía de Uso

A continuación, se muestra cómo utilizar las principales funcionalidades del sistema.

### Gestión de Productos

**Listado de Productos**
Visualiza todos los productos existentes en el inventario.
![Listado de Productos](images/Listado-de-productos.png)

**Creación de Producto**
Permite agregar un nuevo producto al inventario mediante un formulario.
![Formulario Nuevo Producto](images/nuevo-producto.png)

**Edición de Producto**
Permite modificar la información de un producto existente.
![Formulario Editar Producto](images/Editar-Producto.png)

**Validaciones de Producto**
El sistema incluye validaciones para asegurar la integridad de los datos:

- Error al intentar crear un producto con un nombre que ya existe:
  ![Error Nombre Duplicado](images/Error-producto-con-mismo-nombre.png)
- Error al ingresar una fecha de registro futura:
  ![Error Fecha Futura](images/Error-fecha-futura.png)

**Eliminación de Producto**
Permite eliminar productos, con la restricción de que solo el usuario que creó el producto puede eliminarlo.
![Error Eliminación Producto](images/Error-solo-usuario-creador-puede-eliminar-producto.png)

**Filtros de Producto**
Se pueden aplicar diversos filtros para facilitar la búsqueda de productos:

- Filtro por nombre de producto:
  ![Filtro Nombre Producto](images/filtro-por-nombre-producto.png)
- Filtro por persona (usuario asignado):
  ![Filtro Producto por Persona](images/filtrar-producto-por-persona.png)
- Filtro multiparámetro:
  ![Filtro Multiparámetro Productos](images/filtro-multiparametro.png)

### Gestión de Usuarios

**Listado de Usuarios**
Muestra todos los usuarios registrados en el sistema.
![Listado de Usuarios](images/listado-de-usuarios.png)

**Creación de Usuario**
Permite registrar un nuevo usuario en el sistema.
![Formulario Nuevo Usuario](images/crear-nuevo-usuario.png)

**Edición de Usuario**
Permite modificar la información de un usuario existente.
![Formulario Editar Usuario](images/editar-usuario.png)

**Filtro de Usuarios**
Permite filtrar usuarios según diferentes criterios.
![Filtro Usuarios](images/filtro-de-usuario.png)
