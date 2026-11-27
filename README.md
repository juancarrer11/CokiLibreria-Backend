# Coki Librería · Backend

API REST de **Coki Librería**, desarrollada con **NestJS**, **Prisma** y **MySQL**.

Es el backend del sistema de gestión de la librería: productos, carrito de compras, pedidos, impresiones, usuarios y actualización de precios según la inflación.

## Integrantes

- **Nahum Saravia** · [Nahum-Saravia](https://github.com/Nahum-Saravia)
- **Sofía Sánchez** · [sofisanchez126](https://github.com/sofisanchez126)
- **Juan Cruz Carrer** · [juancarrer11](https://github.com/juancarrer11)

Frontend del proyecto: [CokiLibreria](https://github.com/Nahum-Saravia/CokiLibreria)

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| **NestJS 12** | Framework del backend |
| **TypeScript** | Lenguaje |
| **MySQL** | Base de datos |
| **Prisma 7** | ORM: esquema, migraciones y consultas |
| **@prisma/adapter-mariadb** | Adaptador de Prisma 7 para MySQL |
| **class-validator** | Validación de datos con DTO |
| **@nestjs/jwt** | Generación de tokens JWT |
| **bcrypt** | Encriptación de contraseñas |
| **@nestjs/config** | Lectura de variables de entorno |
| **Postman** | Documentación y pruebas de la API |

---

## Estructura del proyecto

```
coki_libreria/
├── prisma/
│   ├── migrations/          historial de cambios de la base
│   ├── schema.prisma        modelos y relaciones
│   └── datos-prueba.sql     registros de ejemplo
├── prisma7.config.ts        configuración de Prisma
└── src/
    ├── main.ts
    └── modules/
        ├── app/
        ├── auth/            registro e inicio de sesión
        ├── users/           usuarios
        ├── productos/       productos de la librería
        ├── carrito/         carrito de compras
        ├── pedidos/         pedidos y su estado
        ├── impresiones/     impresiones de cada pedido
        ├── inflacion/       inflación y actualización de precios
        └── prisma/          conexión con la base de datos
```

Cada módulo sigue la misma organización:

- **Controller:** recibe la petición.
- **DTO:** valida los datos que llegan.
- **Service:** usa Prisma Client para trabajar con la base.

---

## Instalación

### Requisitos

- Node.js
- MySQL (por ejemplo, el incluido en XAMPP)
- MySQL Workbench

### 1. Clonar el repositorio e instalar las dependencias

```bash
git clone https://github.com/juancarrer11/CokiLibreria-Backend.git
cd CokiLibreria-Backend/coki_libreria
npm install
```

### 2. Crear el archivo `.env`

Dentro de `coki_libreria/`:

```
PORT=4000
DATABASE_URL=mysql://USUARIO:CONTRASEÑA@localhost:3306/coki_libreria
API_BASE_URL=http://localhost:4000/
INFLACION_API_URL=https://api.argentinadatos.com/v1/finanzas/indices/inflacion
JWT_SECRET=clave_secreta
```

| Variable | Para qué sirve |
|---|---|
| `PORT` | Puerto donde corre la API |
| `DATABASE_URL` | Conexión a MySQL. Si el usuario no tiene contraseña: `mysql://root@localhost:3306/coki_libreria` |
| `API_BASE_URL` | URL base de la API |
| `INFLACION_API_URL` | API pública de inflación de ArgentinaDatos |
| `JWT_SECRET` | Clave para firmar los tokens |

El `.env` no se sube al repositorio. Para generar un `JWT_SECRET` seguro:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Preparar la base de datos

1. Importar en MySQL Workbench el script **`CokiLibreria.sql`**, que comparte el equipo. Crea la base `coki_libreria` con sus tablas, categorías, productos y estados de pedido.

   > El script empieza con `DROP DATABASE`: ejecutarlo solo la primera vez, porque borra los datos existentes.

2. Registrar las migraciones de Prisma y crear la tabla `carrito`:

   ```bash
   npx prisma migrate resolve --applied 20261124140000_init
   npx prisma migrate deploy
   npx prisma generate
   ```

3. Cargar los datos de prueba: abrir `prisma/datos-prueba.sql` en MySQL Workbench y ejecutarlo.

### 4. Iniciar el servidor

```bash
npm run start:dev
```

La API queda disponible en `http://localhost:4000`.

---

## Base de datos

### Tablas y relaciones

```
categorias     1 ─── N  productos
usuarios       1 ─── N  pedidos
usuarios       1 ─── N  carrito
productos      1 ─── N  carrito
estados_pedido 1 ─── N  pedidos
pedidos        1 ─── N  detalle_pedido
productos      1 ─── N  detalle_pedido
pedidos        1 ─── N  impresiones
```

### Datos de prueba

`prisma/datos-prueba.sql` carga 5 usuarios, 5 pedidos (uno en cada estado), sus productos e impresiones, y 5 ítems en el carrito. Se puede ejecutar más de una vez sin duplicar registros.

| Correo | Rol | Contraseña |
|---|---|---|
| `admin@example.com` | admin | `Coki2026!` |
| `lucia.fernandez@example.com` | cliente | `Coki2026!` |
| `mateo.gomez@example.com` | cliente | `Coki2026!` |
| `valentina.ruiz@example.com` | cliente | `Coki2026!` |
| `tomas.herrera@example.com` | cliente | `Coki2026!` |

---

## Endpoints

Todas las rutas usan `http://localhost:4000` como base.

### Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/register` | Registra un usuario con rol `cliente` |
| POST | `/auth/login` | Inicia sesión y devuelve un JWT válido por 1 hora |

```json
{
  "nombre": "Ana Ruiz",
  "correo": "ana@mail.com",
  "contrasena": "Coki2026!",
  "telefono": "3815555555"
}
```

Los usuarios se crean solo desde `/auth/register`, para no duplicar esa operación. Las contraseñas se guardan encriptadas y nunca se devuelven en las respuestas.

### Usuarios

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/users` | Lista los usuarios |
| GET | `/users/:id` | Devuelve un usuario |
| PATCH | `/users/:id` | Modifica un usuario |
| DELETE | `/users/:id` | Elimina un usuario |

### Productos

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/productos` | Lista los productos con su categoría |
| GET | `/productos/:id` | Devuelve un producto |
| POST | `/productos` | Crea un producto |
| PATCH | `/productos/:id` | Modifica un producto |
| DELETE | `/productos/:id` | Elimina un producto |

```json
{
  "nombre": "Resaltador Amarillo",
  "descripcion": "Resaltador fluorescente.",
  "precio": 1200,
  "stock": 15,
  "id_categoria": 2
}
```

### Carrito

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/carrito` | Agrega un producto (si ya estaba, suma la cantidad) |
| GET | `/carrito` | Lista todos los ítems |
| GET | `/carrito/usuario/:id_usuario` | Carrito de un usuario con el total |
| GET | `/carrito/:id` | Devuelve un ítem |
| PATCH | `/carrito/:id` | Cambia la cantidad |
| DELETE | `/carrito/:id` | Quita un ítem |

```json
{
  "id_usuario": 1,
  "id_producto": 3,
  "cantidad": 2
}
```

No permite superar el stock del producto.

### Pedidos

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/pedidos` | Crea un pedido a partir del carrito del usuario |
| GET | `/pedidos` | Lista los pedidos |
| GET | `/pedidos/usuario/:id_usuario` | Pedidos de un usuario |
| GET | `/pedidos/:id` | Devuelve un pedido con sus productos, impresiones y total |
| PATCH | `/pedidos/:id` | Cambia el estado (`id_estado`) o las notas |
| DELETE | `/pedidos/:id` | Elimina un pedido |

```json
{
  "id_usuario": 1,
  "notas": "Retiro a la tarde"
}
```

Al crear el pedido se descuenta el stock, se genera un número de retiro y se vacía el carrito.

**Estados:** `1` Pendiente · `2` En preparación · `3` Listo para retirar · `4` Entregado · `5` Cancelado

Al cancelar un pedido, el stock vuelve a los productos.

### Impresiones

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/impresiones` | Agrega una impresión a un pedido |
| GET | `/impresiones` | Lista las impresiones |
| GET | `/impresiones/pedido/:id_pedido` | Impresiones de un pedido |
| GET | `/impresiones/:id` | Devuelve una impresión |
| PATCH | `/impresiones/:id` | Modifica una impresión |
| DELETE | `/impresiones/:id` | Elimina una impresión |

```json
{
  "id_pedido": 1,
  "tipo_impresion": "Color",
  "tipo_papel": "Papel común",
  "cantidad_copias": 10,
  "archivo": "tp-final.pdf"
}
```

El precio se calcula automáticamente: $200 por copia en blanco y negro y $400 a color.

### Inflación

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/inflacion?meses=6` | Inflación de los últimos meses (hasta 24), con el último mes y la acumulada |
| POST | `/inflacion/actualizar-precios` | Actualiza los precios de los productos según un porcentaje |

```json
{
  "porcentaje": 10,
  "redondeo": 10,
  "id_productos": [1, 2]
}
```

Si no se envía el porcentaje, se usa la inflación del último mes. También se puede filtrar por `id_categoria`, o no enviar filtros para actualizar todos los productos.

---

## Validaciones y errores

Los datos se validan con DTO antes de llegar al service. Las respuestas de error usan mensajes en español:

| Código | Cuándo |
|---|---|
| **400** | Datos inválidos, stock insuficiente o id no numérico |
| **401** | Correo o contraseña incorrectos |
| **404** | El registro no existe |
| **409** | Correo repetido o registro en uso por otro |
| **503** | La API de inflación no responde |

---

## Organización del trabajo

| Rama | Uso |
|---|---|
| `main` | Rama estable |
| `dev` | Integración del desarrollo |
| `feature/...` | Nuevas funcionalidades |
| `fix/...` | Correcciones |
| `refactor/...` | Reorganización del código |
| `docs/...` | Documentación |

Cada cambio se desarrolla en su rama, se integra en `dev` mediante un Pull Request y después pasa a `main`.

La API está documentada y probada en una colección de **Postman** compartida por el equipo.
