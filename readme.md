## 👥 Autores

* [Juan Camilo Montoya](https://github.com/camilogh)
* Moisés Castro
* Anderson Florez

---

# POC de Microservicios: Sistema de Usuarios y Pedidos

Este proyecto es una Prueba de Concepto (POC) que demuestra la implementación de una arquitectura de microservicios utilizando Node.js y Express, con bases de datos MySQL. El objetivo principal es ilustrar la comunicación síncrona entre microservicios independientes: un **Servicio de Usuarios** y un **Servicio de Pedidos**.

## 🚀 ¿Qué hace este proyecto?

Este proyecto simula una parte de un sistema de ventas o e-commerce, dividiendo las funcionalidades principales en dos microservicios dedicados:

1.  **Servicio de Usuarios (`user-service`):**

    - Gestiona las operaciones CRUD (Crear, Leer, Actualizar, Eliminar) para los usuarios del sistema.
    - Expone una API RESTful para la creación, consulta, actualización y eliminación de información de usuarios.

2.  **Servicio de Pedidos (`orders-service`):**
    - Gestiona la creación y consulta de pedidos, incluyendo sus ítems.
    - **Comunicación Síncrona:** Antes de crear un pedido, este servicio realiza una **validación síncrona** contactando al `user-service` para verificar si el `user_id` asociado al pedido realmente existe. Si el usuario no existe, el pedido no se crea.

## 🤝 Comunicación entre Servicios (Síncrona por REST/HTTP)

Un aspecto central de esta POC es la demostración de la comunicación síncrona entre el `orders-service` y el `user-service`.

- Cuando el `orders-service` recibe una solicitud para crear un nuevo pedido, necesita saber si el `user_id` proporcionado es válido.
- En lugar de acceder directamente a la base de datos de usuarios (lo cual violaría el principio de autonomía del microservicio), el `orders-service` actúa como un **cliente HTTP** y envía una solicitud `GET` a la API RESTful expuesta por el `user-service` (ej. `http://localhost:3000/api/users/{user_id}`).
- El `user-service` actúa como un **servidor HTTP** y responde a esta solicitud.
- El `orders-service` **espera** la respuesta del `user-service` antes de proceder. Si el `user-service` indica que el usuario no existe (ej. con un estado HTTP 404), el `orders-service` rechaza la creación del pedido.

Este tipo de comunicación es **síncrona** porque el servicio que inicia la comunicación (el `orders-service` en este caso) **depende de una respuesta inmediata** del otro servicio (`user-service`) para poder completar su propia operación.

## 📁 Estructura del Proyecto

El proyecto está organizado como un monorepo ligero, con cada microservicio en su propia carpeta. Las dependencias compartidas se gestionan desde la raíz.

poc-microservicios/
├── .gitignore # Archivos y carpetas a ignorar por Git
├── database.json # Configuración para las migraciones de DB
├── migrations/ # Archivos de migración de la base de datos
│ └── YYYYMMDDHHMMSS\_\*.sql # Ej. Migración para crear tablas iniciales
├── node_modules/ # Dependencias de Node.js (instaladas en la raíz)
├── package.json # Configuración principal de Node.js y dependencias
├── user-service/ # Microservicio de Usuarios
│ └── src/
│ ├── app.js # Punto de entrada principal
│ ├── config/ # Configuración (ej. conexión a DB)
│ │ └── db.js
│ ├── controllers/ # Lógica de negocio (maneja solicitudes HTTP)
│ │ └── user.controller.js
│ ├── models/ # Interacción con la base de datos (CRUD)
│ │ └── user.model.js
│ └── routes/ # Definición de rutas API
│ └── user.routes.js
└── orders-service/ # Microservicio de Pedidos
└── src/
├── app.js # Punto de entrada principal
├── config/ # Configuración (ej. conexión a DB)
│ └── db.js
├── controllers/ # Lógica de negocio (maneja solicitudes HTTP, comunicación con user-service)
│ │ └── order.controller.js
├── models/ # Interacción con la base de datos (CRUD de pedidos y ítems)
│ │ └── order.model.js
└── routes/ # Definición de rutas API
└── order.routes.js

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de tener instalado lo siguiente:

- **Node.js**: v16 o superior (se recomienda la última versión LTS).
- **npm**: Se instala con Node.js.
- **MySQL Server**: v5.x o superior.
- Un cliente MySQL (ej. MySQL Workbench, DBeaver, phpMyAdmin) para gestión de la base de datos.

## 🚀 Primeros Pasos: Instalación y Configuración

Sigue estos pasos para poner en marcha el proyecto por primera vez:

1.  **Clonar el Repositorio (si aplica):**

    ```bash
    git clone <URL_DE_TU_REPOSITORIO>
    cd poc-microservicios
    ```

2.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la **raíz del proyecto** (`poc-microservicios/.env`) con la siguiente configuración. **¡Asegúrate de reemplazar `your_password` con tu contraseña real de MySQL!** Si tu usuario `root` no tiene contraseña, deja el valor de `DB_PASSWORD` vacío (`DB_PASSWORD=`).

    ```
    # Variables de Entorno para la Base de Datos
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_password
    DB_NAME=db_users

    # Variables de Entorno para el Microservicio de Usuarios
    USER_SERVICE_PORT=3000

    # Variables de Entorno para el Microservicio de Pedidos
    ORDERS_SERVICE_PORT=3001
    USER_SERVICE_URL=http://localhost
    ```

3.  **Instalar Dependencias:**
    Desde la **raíz del proyecto** (`poc-microservicios`), ejecuta:

    ```bash
    npm install
    npm install -g db-migrate db-migrate-mysql # Instala el CLI de migraciones globalmente
    ```

4.  **Configurar `database.json` para Migraciones:**
    `db-migrate init` debería haber creado `database.json`. Abre `database.json` en la **raíz del proyecto** (`poc-microservicios/database.json`) y asegúrate de que tenga esta configuración para leer las credenciales del `.env`:

    ```json
    {
      "defaultEnv": "dev",
      "dev": {
        "driver": "mysql",
        "host": { "ENV": "DB_HOST" },
        "user": { "ENV": "DB_USER" },
        "password": { "ENV": "DB_PASSWORD" },
        "database": { "ENV": "DB_NAME" },
        "port": 3306,
        "multipleStatements": true,
        "timezone": "Z"
      }
      // Puedes añadir "test" y "prod" si los necesitas más adelante
    }
    ```

5.  **Crear la Base de Datos en MySQL:**
    Conéctate a tu servidor MySQL (usando un cliente como MySQL Workbench) y crea la base de datos si no existe:

    ```sql
    CREATE DATABASE IF NOT EXISTS db_users;
    ```

6.  **Ejecutar Migraciones de Base de Datos:**
    Desde la **raíz del proyecto** (`poc-microservicios`), ejecuta las migraciones para crear las tablas necesarias:

    ```bash
    db-migrate up
    ```

    Si `db-migrate up` falla indicando que no encuentra `database.json`, asegúrate de que el archivo exista en la raíz y de que la carpeta `migrations` también esté vacía (o contenga tus archivos de migración). Si aún tienes problemas, puedes crear manualmente la carpeta `migrations` y el archivo `database.json` con el contenido del paso 4, y luego intentar `db-migrate create create_initial_tables --sql-file` seguido de `db-migrate up`.

## ▶️ Ejecutar los Microservicios

Para ejecutar ambos microservicios, necesitarás dos terminales.

1.  **Abrir dos terminales:**
    Abre dos ventanas de terminal separadas y navega a la **raíz de tu proyecto** (`poc-microservicios`) en ambas.

2.  **Iniciar Servicio de Usuarios:**
    En la primera terminal, ejecuta:

    ```bash
    npm run start-users
    ```

    Deberías ver un mensaje indicando que el servicio está escuchando en el puerto 3000.

3.  **Iniciar Servicio de Pedidos:**
    En la segunda terminal, ejecuta:
    ```bash
    npm run start-orders
    ```
    Deberías ver un mensaje indicando que el servicio está escuchando en el puerto 3001.

¡Ambos microservicios ahora deberían estar en funcionamiento!

## 🧪 Cómo Probar

Puedes usar herramientas como [Postman](https://www.postman.com/downloads/) o [Insomnia](https://insomnia.rest/download) para probar las APIs.

### Importar Colección de Postman

Para facilitar las pruebas, este repositorio incluye una colección de Postman con solicitudes preconfiguradas para ambos microservicios.

1.  **Abre Postman.**
2.  Haz clic en **`File`** > **`Import`** (o el botón `Import` en la interfaz principal).
3.  Selecciona la pestaña **`File`** y busca el archivo **`poc-services.postman_collection.json`** que se encuentra en la raíz de este repositorio.
4.  Haz clic en **`Open`** y luego en **`Import`**.

Esto agregará una nueva colección a tu espacio de trabajo de Postman con todas las solicitudes organizadas para el `user-service` y el `orders-service`.

### Servicio de Usuarios (`http://localhost:3000`)

- **Crear Usuario (`POST /api/users`)**
  ```json
  {
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "password": "mi_password_segura"
  }
  ```
- **Obtener Todos los Usuarios (`GET /api/users`)**
- **Obtener Usuario por ID (`GET /api/users/:id`)**
  (Ej. `http://localhost:3000/api/users/1`)
- **Actualizar Usuario (`PUT /api/users/:id`)**
  ```json
  {
    "name": "Juan Pérez Actualizado",
    "email": "juan.perez@example.com",
    "password": "nueva_password"
  }
  ```
- **Eliminar Usuario (`DELETE /api/users/:id`)**
  (Ej. `http://localhost:3000/api/users/1`)

### Servicio de Pedidos (`http://localhost:3001`)

- **Crear Pedido (`POST /api/orders`)**
  **Importante:** Asegúrate de que el `user_id` exista previamente en el `user-service`.

  ```json
  {
    "user_id": 1, // ¡Debe ser un ID de usuario existente en el user-service!
    "items": [
      { "product_name": "Laptop XYZ", "quantity": 1, "price": 1200.0 },
      { "product_name": "Mouse Inalámbrico", "quantity": 2, "price": 25.0 }
    ]
  }
  ```

- **Obtener Todos los Pedidos (`GET /api/orders`)**
- **Obtener Pedido por ID (`GET /api/orders/:id`)**
  (Ej. `http://localhost:3001/api/orders/1`)

## 📦 Paquetes Utilizados

| Paquete            | Versión    | Descripción                                                                                                  |
| :----------------- | :--------- | :----------------------------------------------------------------------------------------------------------- |
| `express`          | `^5.1.0`   | Framework web minimalista y flexible para construir APIs RESTful.                                            |
| `mysql2`           | `^3.14.1`  | Driver de MySQL de alto rendimiento para Node.js.                                                            |
| `axios`            | `^1.9.0`   | Cliente HTTP basado en promesas para realizar solicitudes web (utilizado para comunicación entre servicios). |
| `dotenv`           | `^16.4.5`  | Carga variables de entorno desde un archivo `.env` en `process.env`.                                         |
| `db-migrate`       | `^0.11.14` | Herramienta para gestionar migraciones de bases de datos.                                                    |
| `db-migrate-mysql` | `^3.0.0`   | Driver para que `db-migrate` trabaje con bases de datos MySQL.                                               |
