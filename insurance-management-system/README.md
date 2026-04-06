# 🛡️ InsurTech — Sistema de Gestión de Seguros

Sistema empresarial de gestión de seguros con arquitectura hexagonal (backend) y Clean Architecture (frontend), listo para producción.

---

## 📋 Tabla de Contenidos

1. [Tecnologías](#-tecnologías)
2. [Arquitectura](#-arquitectura)
3. [Requisitos Previos](#-requisitos-previos)
4. [Instalación y Ejecución](#-instalación-y-ejecución)
5. [Acceso al Sistema](#-acceso-al-sistema)
6. [Roles y Permisos](#-roles-y-permisos)
7. [Guía de Uso por Rol](#-guía-de-uso-por-rol)
8. [Endpoints de la API](#-endpoints-de-la-api)
9. [Estructura del Proyecto](#-estructura-del-proyecto)
10. [Modelo de Datos](#-modelo-de-datos)
11. [Migraciones de Base de Datos](#-migraciones-de-base-de-datos)
12. [Solución de Problemas](#-solución-de-problemas)

---

## 🔧 Tecnologías

### Backend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| Java | 21 | Lenguaje principal |
| Spring Boot | 3.3.x | Framework web |
| Spring Security | 6.x | Autenticación y autorización |
| JWT (jjwt) | 0.12.6 | Tokens de acceso y refresh |
| MySQL | 8.0 | Base de datos relacional |
| Flyway | 10.x | Migraciones de base de datos |
| JPA / Hibernate | 6.x | ORM y persistencia |
| Lombok | 1.18.x | Reducción de boilerplate |
| SpringDoc OpenAPI | 2.6.0 | Documentación Swagger |
| Docker & Docker Compose | - | Contenedorización |
| JUnit 5 + Mockito | - | Testing unitario |
| Maven | 3.9.x | Gestión de dependencias |

### Frontend
| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 18.3.x | Librería de UI |
| TypeScript | 5.6.x | Tipado estático |
| Vite | 5.4.x | Build tool y dev server |
| Tailwind CSS | 3.4.x | Estilos y diseño |
| React Router | 6.26.x | Navegación SPA |
| Axios | 1.7.x | Cliente HTTP |
| Lucide React | 0.441.x | Iconografía |
| React Hot Toast | 2.4.x | Notificaciones |

---

## 🏗 Arquitectura

### Backend — Arquitectura Hexagonal (Ports & Adapters)

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  REST Controllers (/api/v1/*)                               │
│  AuthController, AseguradoController, PolizaController,     │
│  SiniestroController, PrimaController, ClientePortalCtrl    │
├─────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                        │
│  Services: AseguradoService, PolizaService,                 │
│  SiniestroService, PrimaService, PrimeCalculatorService     │
│  DTOs, Mappers                                              │
├─────────────────────────────────────────────────────────────┤
│                      DOMAIN LAYER                           │
│  Entities: Asegurado, Poliza, Cobertura, Prima, Pago,       │
│  Siniestro, DocumentoSiniestro, Usuario                     │
│  Value Objects: Direccion, ContactoPersonal                 │
│  Ports (In): UseCases | Ports (Out): Repositories           │
│  Enums: 10 enums de dominio                                 │
├─────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                      │
│  JPA Repositories (Spring Data)                             │
│  Security (JWT Provider, Filter, UserDetailsService)        │
└─────────────────────────────────────────────────────────────┘
```

### Frontend — Clean Architecture

```
src/
├── domain/              # Capa de dominio (TypeScript puro, sin dependencias)
│   ├── entities/        # Interfaces: Asegurado, Poliza, Siniestro, Prima, Usuario
│   ├── enums/           # Enums que reflejan el backend
│   └── interfaces/      # Contratos: IAseguradoRepository, IPolizaRepository, etc.
│
├── infrastructure/      # Capa de infraestructura (implementaciones)
│   ├── api/             # httpClient.ts (Axios + interceptor JWT)
│   └── adapters/        # AseguradoAdapter, PolizaAdapter, SiniestroAdapter,
│                        # UsuarioAdapter, PortalAdapter, DashboardAdapter, AuthAdapter
│
├── presentation/        # Capa de presentación (React + Tailwind)
│   ├── components/      # UI reutilizables (Modal, Pagination, StatusBadge, Spinner)
│   │   ├── ui/          # Componentes genéricos
│   │   └── layout/      # Sidebar, MainLayout
│   ├── context/         # AuthContext (useReducer para estado global)
│   ├── pages/           # Páginas por módulo
│   │   ├── auth/        # LoginPage
│   │   ├── dashboard/   # DashboardPage (KPIs)
│   │   ├── asegurados/  # AseguradosPage (CRUD completo)
│   │   ├── polizas/     # PolizasPage (CRUD + renovar/cancelar)
│   │   ├── siniestros/  # SiniestrosPage (reportar/evaluar)
│   │   ├── usuarios/    # UsuariosPage (gestión admin)
│   │   └── portal/      # PortalPage (autoservicio cliente)
│   └── routes/          # ProtectedRoute
└── shared/              # Utilidades compartidas
```

---

## 📌 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Software | Versión mínima | Verificar instalación |
|----------|---------------|----------------------|
| Java JDK | 21 | `java -version` |
| Maven | 3.9+ | `mvn -version` |
| Docker | 24+ | `docker --version` |
| Docker Compose | 2.0+ | `docker compose version` |
| Node.js | 18+ | `node -v` |
| npm | 9+ | `npm -v` |
| Git | 2.0+ | `git --version` |

---

## 🚀 Instalación y Ejecución

### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd insurance-management-system
```

### Paso 2: Compilar el Backend

```bash
mvn clean package -DskipTests
```

> Esto genera el archivo `target/insurance-management-system-1.0.0-SNAPSHOT.jar`

### Paso 3: Levantar Backend con Docker Compose

```bash
docker compose up -d --build
```

Esto levanta dos contenedores:
- **insurtech-mysql** — MySQL 8.0 en puerto `3307`
- **insurtech-app** — Spring Boot en puerto `8080`

#### Verificar que el backend está corriendo:

```bash
# Ver estado de los contenedores
docker compose ps

# Ver logs del backend
docker logs insurtech-app

# Verificar health check
curl http://localhost:8080/api/v1/health
```

Respuesta esperada:
```json
{
  "status": "UP",
  "application": "Insurance Management System",
  "version": "1.0.0"
}
```

### Paso 4: Instalar y Levantar el Frontend

```bash
cd ../insurtech-frontend
npm install
npm run dev
```

El frontend se levanta en: **http://localhost:3000**

> El proxy de Vite redirige automáticamente las peticiones `/api/*` al backend en `http://localhost:8080`.

### Paso 5: Crear el usuario administrador inicial

El primer administrador se crea vía terminal (única vez):

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123!",
    "email": "admin@insurtech.com",
    "nombreCompleto": "Administrador del Sistema",
    "rol": "ROLE_ADMIN"
  }'
```

> **Importante:** Este es el único momento donde se usa la terminal para crear un usuario. A partir de aquí, el admin crea todos los demás usuarios desde el frontend.

### Paso 6: Acceder al sistema

1. Abre **http://localhost:3000** en tu navegador
2. Ingresa con las credenciales del admin que creaste
3. Ya puedes comenzar a usar el sistema

---

## 🔑 Acceso al Sistema

### URLs principales

| Recurso | URL |
|---------|-----|
| Frontend (aplicación web) | http://localhost:3000 |
| Backend API | http://localhost:8080/api/v1 |
| Swagger UI (documentación API) | http://localhost:8080/api/v1/swagger-ui.html |
| Health Check | http://localhost:8080/api/v1/health |
| MySQL (acceso directo) | localhost:3307 (user: `insurtech_user` / pass: `insurtech_pass`) |

### Autenticación

El sistema usa **JWT (JSON Web Tokens)** con dos tokens:
- **Access Token** — Expira en 15 minutos, se usa para autenticar cada petición
- **Refresh Token** — Expira en 7 días, permite renovar el access token

Al hacer login desde el frontend, los tokens se almacenan automáticamente en `localStorage` y se envían en cada petición vía el header `Authorization: Bearer <token>`.

---

## 👥 Roles y Permisos

El sistema tiene **5 roles** con permisos diferenciados:

| Rol | Código | Descripción |
|-----|--------|-------------|
| **Administrador** | `ROLE_ADMIN` | Acceso total al sistema. Gestiona usuarios, asegurados, pólizas, siniestros y reportes. |
| **Agente** | `ROLE_AGENT` | Crea y gestiona asegurados y pólizas. Puede reportar siniestros. |
| **Evaluador** | `ROLE_EVALUATOR` | Evalúa siniestros (aprobar/rechazar). Solo lectura del resto. |
| **Finanzas** | `ROLE_FINANCE` | Gestiona primas, pagos y reportes financieros. |
| **Cliente** | `ROLE_CUSTOMER` | Portal de autoservicio. Ve solo sus pólizas, siniestros y pagos pendientes. |

### Matriz de Permisos Detallada

| Funcionalidad | ADMIN | AGENT | EVALUATOR | FINANCE | CUSTOMER |
|----------------|:-----:|:-----:|:---------:|:-------:|:--------:|
| Dashboard general | ✅ | ✅ | ✅ | ✅ | ❌ |
| Crear asegurados | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver asegurados | ✅ | ✅ | ❌ | ❌ | ❌ |
| Crear pólizas | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ver pólizas | ✅ | ✅ | ❌ | ❌ | Solo propias |
| Reportar siniestros | ✅ | ✅ | ❌ | ❌ | Solo propios |
| Evaluar siniestros | ✅ | ❌ | ✅ | ❌ | ❌ |
| Gestionar primas/pagos | ✅ | ❌ | ❌ | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ | ❌ | ❌ |
| Cambiar contraseñas | ✅ | ❌ | ❌ | ❌ | ❌ |
| Portal autoservicio | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cambiar su contraseña | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📖 Guía de Uso por Rol

### 🔴 Administrador (ROLE_ADMIN)

El administrador es el primer usuario del sistema y tiene acceso completo.

#### Flujo inicial recomendado:

1. **Iniciar sesión** en http://localhost:3000 con las credenciales del admin
2. **Crear usuarios internos** (Sidebar → Usuarios → Nuevo Usuario):
   - Crear agentes (`ROLE_AGENT`) para que gestionen clientes y pólizas
   - Crear evaluadores (`ROLE_EVALUATOR`) para evaluar siniestros
   - Crear usuarios de finanzas (`ROLE_FINANCE`) para gestionar pagos
3. **Cambiar contraseñas** si es necesario (ícono de llave en la tabla de usuarios)
4. **Monitorear el dashboard** para ver KPIs generales del sistema

#### Crear un usuario cliente:

1. Primero ve a **Asegurados** → **Nuevo Asegurado** y crea el registro del cliente
2. Anota el **ID** del asegurado creado (aparece en la tabla)
3. Ve a **Usuarios** → **Nuevo Usuario**
4. Selecciona rol **Cliente (ROLE_CUSTOMER)**
5. Ingresa el **ID del asegurado** en el campo que aparece
6. Comparte las credenciales al cliente

#### Vincular un asegurado a un usuario existente:

1. Ve a **Usuarios**
2. Haz clic en el ícono de **eslabón** (🔗) en la fila del usuario
3. Ingresa el ID del asegurado

---

### 🔵 Agente (ROLE_AGENT)

El agente es el encargado de la relación con los clientes.

#### Funciones principales:

1. **Crear asegurados** — Registrar nuevos clientes con todos sus datos personales
2. **Crear pólizas** — Asignar pólizas a asegurados existentes:
   - Seleccionar tipo (AUTO, HOGAR, SALUD, VIDA)
   - Definir suma asegurada y vigencia
   - El sistema calcula automáticamente la prima según el riesgo del asegurado
3. **Gestionar pólizas** — Renovar, cancelar o modificar coberturas
4. **Reportar siniestros** — Registrar reclamos de los clientes

#### Menú visible para el agente:
- Dashboard
- Asegurados (CRUD completo)
- Pólizas (CRUD completo)
- Siniestros (reportar y listar)

---

### 🟣 Evaluador (ROLE_EVALUATOR)

El evaluador revisa y decide sobre los siniestros reportados.

#### Funciones principales:

1. **Ver siniestros** — Lista todos los siniestros del sistema
2. **Evaluar siniestros** — Para cada siniestro puede:
   - **Aprobar** — Define el monto aprobado (puede ser menor al solicitado)
   - **Rechazar** — Debe ingresar un motivo de rechazo obligatorio
   - **En Evaluación** — Marca que está en proceso de revisión

#### Menú visible para el evaluador:
- Dashboard
- Siniestros (evaluar)

---

### 🟢 Finanzas (ROLE_FINANCE)

El usuario de finanzas gestiona el flujo de dinero.

#### Funciones principales:

1. **Generar cuotas** — Crear las cuotas mensuales de una póliza (1 a 24 cuotas)
2. **Registrar pagos** — Marcar cuotas como pagadas con el método de pago
3. **Ver primas pendientes** — Consultar deudas por asegurado
4. **Cálculo automático de moras** — El sistema calcula diariamente los intereses por mora

#### Menú visible para finanzas:
- Dashboard
- Primas (gestión completa)

---

### ⚪ Cliente (ROLE_CUSTOMER)

El cliente tiene un portal de autoservicio con 4 secciones.

#### Portal del Cliente — Tabs:

1. **Mi Resumen** — Dashboard personal con:
   - Total de pólizas y vigentes
   - Siniestros reportados
   - Deuda total pendiente
   - Información personal
2. **Mis Pólizas** — Tabla con todas sus pólizas, tipo, suma asegurada, prima y estado
3. **Mis Siniestros** — Lista de siniestros con estado de cada uno. Puede **reportar nuevos siniestros** seleccionando la póliza afectada
4. **Pagos Pendientes** — Cuotas por pagar con fecha de vencimiento, días vencidos y mora

#### Menú visible para el cliente:
- Mi Portal (única opción)

> **Nota:** El cliente solo ve datos vinculados a su asegurado. No tiene acceso al dashboard general ni a datos de otros clientes.

---

## 📡 Endpoints de la API

### Autenticación (`/auth`)
```
POST   /auth/login                        Iniciar sesión (público)
POST   /auth/register                     Crear usuario (solo ADMIN)
GET    /auth/usuarios                     Listar usuarios (solo ADMIN)
PATCH  /auth/usuarios/{id}/estado         Activar/desactivar usuario (solo ADMIN)
PATCH  /auth/usuarios/{id}/rol            Cambiar rol (solo ADMIN)
PATCH  /auth/usuarios/{id}/password       Cambiar contraseña de otro usuario (solo ADMIN)
PATCH  /auth/usuarios/{id}/vincular-asegurado  Vincular asegurado (solo ADMIN)
PATCH  /auth/mi-password                  Cambiar mi propia contraseña (autenticado)
```

### Asegurados (`/asegurados`)
```
POST   /asegurados                        Crear asegurado
GET    /asegurados                        Listar con paginación
GET    /asegurados/{id}                   Obtener por ID
GET    /asegurados/documento/{numero}     Obtener por documento
GET    /asegurados/buscar?nombre=X        Buscar por nombre
PUT    /asegurados/{id}                   Actualizar
PATCH  /asegurados/{id}/estado            Cambiar estado
DELETE /asegurados/{id}                   Eliminar
```

### Pólizas (`/polizas`)
```
POST   /polizas                           Crear póliza
GET    /polizas                           Listar con paginación
GET    /polizas/{id}                      Obtener por ID
GET    /polizas/numero/{numero}           Obtener por número
GET    /polizas/asegurado/{id}            Listar por asegurado
GET    /polizas/estado/{estado}           Listar por estado
GET    /polizas/tipo/{tipo}               Listar por tipo
PATCH  /polizas/{id}/renovar              Renovar póliza
PATCH  /polizas/{id}/cancelar             Cancelar póliza
PATCH  /polizas/{id}/coberturas           Modificar coberturas
DELETE /polizas/{id}                      Eliminar
```

### Siniestros (`/siniestros`)
```
POST   /siniestros                        Reportar siniestro
GET    /siniestros                        Listar con paginación
GET    /siniestros/{id}                   Obtener por ID
GET    /siniestros/numero/{numero}        Obtener por número
GET    /siniestros/poliza/{polizaId}      Listar por póliza
GET    /siniestros/estado/{estado}        Listar por estado
PATCH  /siniestros/{id}/evaluar           Evaluar siniestro
DELETE /siniestros/{id}                   Eliminar
```

### Primas (`/primas`)
```
POST   /primas/generar/{polizaId}         Generar cuotas
GET    /primas/poliza/{polizaId}          Listar por póliza
GET    /primas/pendientes/asegurado/{id}  Pendientes por asegurado
POST   /primas/{primaId}/pagar            Registrar pago
```

### Portal Cliente (`/portal`)
```
GET    /portal/resumen                    Resumen del cliente
GET    /portal/mi-perfil                  Perfil del asegurado
GET    /portal/mis-polizas                Pólizas del cliente
GET    /portal/mis-siniestros             Siniestros del cliente
POST   /portal/mis-siniestros             Reportar siniestro como cliente
GET    /portal/mis-primas                 Primas pendientes
```

### Otros
```
GET    /health                            Health check
GET    /info                              Información del sistema
```

---

## 🗄 Modelo de Datos

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   USUARIOS   │       │  ASEGURADOS  │       │  COBERTURAS  │
│──────────────│       │──────────────│       │──────────────│
│ id           │  ┌───>│ id           │       │ id           │
│ username     │  │    │ tipo         │       │ nombre       │
│ password     │  │    │ documento    │       │ limite       │
│ email        │  │    │ nombre       │       │ deducible    │
│ rol          │  │    │ email        │       │ exclusiones  │
│ activo       │  │    │ estado       │       └──────┬───────┘
│ asegurado_id ├──┘    │ nivel_riesgo │              │ M:M
└──────────────┘       └──────┬───────┘              │
                              │ 1:N           ┌──────┴───────┐
                       ┌──────┴───────┐       │   POLIZAS    │
                       │   POLIZAS    │<──────│  COBERTURAS  │
                       │──────────────│       │  (join table) │
                       │ id           │       └──────────────┘
                       │ numero_poliza│
                       │ tipo_poliza  │
                       │ suma_asegurada│
                       │ prima_total  │
                       │ fecha_inicio │
                       │ fecha_fin    │
                       │ estado       │
                       └──┬───────┬───┘
                          │ 1:N   │ 1:N
                   ┌──────┴──┐  ┌─┴──────────┐
                   │ PRIMAS  │  │ SINIESTROS  │
                   │─────────│  │─────────────│
                   │ cuota   │  │ numero      │
                   │ monto   │  │ descripcion │
                   │ vencim. │  │ monto_solic │
                   │ estado  │  │ monto_aprob │
                   │ mora    │  │ estado      │
                   └────┬────┘  └──────┬──────┘
                        │ 1:N          │ 1:N
                   ┌────┴────┐  ┌──────┴──────┐
                   │  PAGOS  │  │ DOCUMENTOS  │
                   │─────────│  │ SINIESTRO   │
                   │ monto   │  │─────────────│
                   │ metodo  │  │ tipo        │
                   │ estado  │  │ archivo     │
                   └─────────┘  └─────────────┘
```

---

## 📦 Migraciones de Base de Datos

Las migraciones se ejecutan automáticamente con Flyway al iniciar la aplicación:

| Migración | Descripción |
|-----------|-------------|
| V1 | Tabla `asegurados` con constraints y checks |
| V2 | Tabla `polizas` con FK a asegurados |
| V3 | Tabla `coberturas` (catálogo) |
| V4 | Tabla `polizas_coberturas` (relación M:M) |
| V5 | Tabla `primas` (cuotas a pagar) |
| V6 | Tabla `pagos` (transacciones) |
| V7 | Tabla `siniestros` (reclamos) |
| V8 | Tabla `documentos_siniestro` (adjuntos) |
| V9 | Tabla `usuarios` + seed de usuarios iniciales |
| V10 | Índices de rendimiento + seed de 8 coberturas |
| V11 | Agrega `asegurado_id` a usuarios (vinculación cliente) |

---

## 🐳 Comandos Docker Útiles

```bash
# Levantar todo (backend + MySQL)
docker compose up -d --build

# Ver estado de contenedores
docker compose ps

# Ver logs del backend en tiempo real
docker logs -f insurtech-app

# Ver logs de MySQL
docker logs insurtech-mysql

# Detener todo
docker compose down

# Detener y BORRAR datos (reset completo de BD)
docker compose down
docker volume rm insurance-management-system_mysql_data
docker compose up -d --build

# Entrar a MySQL desde terminal
docker exec -it insurtech-mysql mysql -u insurtech_user -pinsutech_pass insurtech_db

# Reconstruir solo el backend (sin borrar BD)
mvn clean package -DskipTests
docker compose up -d --build app
```

---

## ⚠️ Solución de Problemas

### El backend no arranca

```bash
docker logs insurtech-app
```

**Error de Flyway**: Si modificaste una migración existente, debes borrar el volumen:
```bash
docker compose down
docker volume rm insurance-management-system_mysql_data
docker compose up -d --build
```

**Error de puerto en uso**: Verifica que los puertos 8080 y 3307 estén libres:
```bash
sudo lsof -i :8080
sudo lsof -i :3307
```

### No puedo hacer login

1. Verifica que el backend esté corriendo: `curl http://localhost:8080/api/v1/health`
2. Si es la primera vez, crea el admin con el comando curl de la sección de instalación
3. Si olvidaste la contraseña, accede a MySQL y borra el usuario:
```bash
docker exec -it insurtech-mysql mysql -u insurtech_user -pinsutech_pass insurtech_db
DELETE FROM usuarios WHERE username = 'admin';
```
Luego crea el usuario de nuevo con curl.

### El frontend no conecta con el backend

1. Verifica que el backend esté en el puerto 8080
2. Verifica que el frontend esté en el puerto 3000
3. El proxy de Vite en `vite.config.ts` debe apuntar a `http://localhost:8080`

### Error "asegurado no vinculado" al entrar como cliente

El usuario con `ROLE_CUSTOMER` necesita tener un asegurado vinculado. El admin debe:
1. Crear el asegurado en la sección "Asegurados"
2. Vincular el asegurado al usuario en la sección "Usuarios" (ícono de eslabón)

---

## 📄 Variables de Entorno

| Variable | Valor por defecto | Descripción |
|----------|-------------------|-------------|
| `DB_HOST` | `localhost` | Host de MySQL |
| `DB_PORT` | `3306` | Puerto de MySQL |
| `DB_NAME` | `insurtech_db` | Nombre de la base de datos |
| `DB_USER` | `insurtech_user` | Usuario de MySQL |
| `DB_PASSWORD` | `insurtech_pass` | Contraseña de MySQL |
| `JWT_SECRET` | (base64 string) | Clave secreta para firmar JWT |
| `SERVER_PORT` | `8080` | Puerto del backend |

---

## 📝 Formato de Respuestas de la API

### Respuesta exitosa
```json
{
  "status": "SUCCESS",
  "code": 200,
  "message": "Operación exitosa",
  "data": { ... },
  "timestamp": "2026-04-01T10:30:00"
}
```

### Respuesta paginada
```json
{
  "status": "SUCCESS",
  "code": 200,
  "data": {
    "content": [ ... ],
    "totalElements": 100,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 20
  }
}
```

### Respuesta de error
```json
{
  "status": "ERROR",
  "code": 404,
  "message": "Asegurado no encontrado con ID: 999",
  "timestamp": "2026-04-01T10:30:00",
  "path": "/api/v1/asegurados/999"
}
```

### Error de validación
```json
{
  "status": "ERROR",
  "code": 400,
  "message": "Error de validación",
  "errors": [
    { "field": "email", "message": "El email debe tener un formato válido" },
    { "field": "nombre", "message": "El nombre es obligatorio" }
  ]
}
```

---

## 👨‍💻 Desarrollado por

**Vargas InsurTech** — Sistema de Gestión de Seguros  
Arquitectura Hexagonal (Backend) + Clean Architecture (Frontend)  
Java 21 • Spring Boot 3.3 • React 18 • TypeScript • Tailwind CSS • MySQL • Docker
