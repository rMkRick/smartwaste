# SmartWaste Cusco - 22 Casos de Uso

## Resumen General
| CU | Nombre | Actor Principal | Estado API |
|---|---|---|---|
| CU1 | Iniciar Sesión | Ciudadano | ✅ POST /api/auth/login |
| CU2 | Login Social (Google/Facebook) | Ciudadano | ✅ POST /api/auth/login-social |
| CU3 | Registrar Usuario | Ciudadano | ✅ POST /api/auth/register |
| CU4 | Modificar Perfil/Contraseña | Ciudadano | ✅ PUT/POST /api/auth/perfil, /cambiar-contrasena |
| CU5 | Registrar Reporte de Residuos | Ciudadano | ✅ POST /api/reportes |
| CU6 | Consultar Horarios Recolección | Ciudadano | ✅ GET /api/horarios/zona/:zonaId |
| CU7 | Consultar Ubicación Camión | Ciudadano | ✅ GET /api/camiones/:id/ubicacion |
| CU8 | Gestionar Notificaciones | Ciudadano | ✅ GET /api/notificaciones |
| CU9 | Recibir Notificaciones | Ciudadano | ✅ GET /api/notificaciones/no-leidas |
| CU10 | Gestionar Zonas | Administrador | ✅ CRUD /api/zonas |
| CU11 | Gestionar Camiones | Administrador | ✅ CRUD /api/camiones |
| CU12 | Gestionar Rutas | Administrador | ✅ CRUD /api/rutas |
| CU13 | Visualizar Ruta Asignada | Operador Vehículo | ✅ GET /api/rutas/mi-ruta |
| CU14 | Registrar Recolección | Operador Vehículo | ✅ POST /api/recolecciones |
| CU15 | Marcar Recolección Completada | Operador Vehículo | ✅ POST /api/recolecciones/:id/completar |
| CU16 | Activar GPS Camión | Operador Vehículo | ✅ POST /api/camiones/:id/gps |
| CU17 | Consultar Reportes (Dashboard) | Supervisor Municipal | ✅ GET /api/supervisor/reportes |
| CU18 | Ver Cumplimiento Rutas | Supervisor Municipal | ✅ GET /api/supervisor/cumplimiento-rutas |
| CU19 | Generar Reporte Ambiental | Supervisor Municipal | ✅ GET /api/supervisor/reporte-ambiental |
| CU20 | Ver Participación Ciudadana | Supervisor Municipal | ✅ GET /api/supervisor/participacion-ciudadana |
| CU21 | Gestionar Reportes Incidencias | Supervisor Municipal | ✅ GET /api/supervisor/incidencias |
| CU22 | Responder Reporte Incidencia | Supervisor Municipal | ✅ POST /api/supervisor/responder/:id |

---

## Detalle de Cada Caso de Uso

### **CU1: Iniciar Sesión**
- **Actor:** Ciudadano, Operador, Admin, Supervisor
- **Descripción:** Usuario ingresa correo y contraseña
- **Endpoint:** `POST /api/auth/login`
- **Request:** `{ correo, contrasena }`
- **Response:** `{ token, usuario: { id, nombres, rol_id, ... } }`
- **Validación:** Verificar credenciales contra BD, generar JWT

---

### **CU2: Login Social**
- **Actor:** Ciudadano
- **Descripción:** Login con Google o Facebook OAuth
- **Endpoint:** `POST /api/auth/login-social`
- **Request:** `{ proveedor, proveedor_id, nombres, correo, foto }`
- **Response:** `{ token, usuario }`
- **Nota:** Crea usuario automáticamente si no existe

---

### **CU3: Registrar Usuario**
- **Actor:** Ciudadano
- **Descripción:** Crear cuenta nueva con formulario
- **Endpoint:** `POST /api/auth/register`
- **Request:** `{ nombres, apellidos, dni, correo, contrasena, zona_id }`
- **Response:** `{ usuario, token }`
- **Validación:** DNI único, correo único, contraseña hasheada

---

### **CU4: Modificar Perfil/Contraseña**
- **Actor:** Ciudadano
- **Descripción:** Actualizar datos o cambiar contraseña
- **Endpoints:**
  - `PUT /api/auth/perfil` → actualizar nombres, foto, zona
  - `POST /api/auth/cambiar-contrasena` → cambiar contraseña
- **Validación:** Verificar contraseña actual antes de cambiar

---

### **CU5: Registrar Reporte de Residuos**
- **Actor:** Ciudadano (autenticado o invitado)
- **Descripción:** Enviar reporte de basura en vía pública
- **Endpoint:** `POST /api/reportes`
- **Request:** `{ usuario_id, tipo_residuo_id, descripcion, foto_url, latitud, longitud }`
- **Response:** `{ id, numero_ticket (interno), estado: "enviado" }`
- **Ciudadano VE:** Solo "Enviado" y "Completado", sin número de ticket
- **Workflow:** enviado → leido (supervisor) → en_proceso → completado

---

### **CU6: Consultar Horarios Recolección**
- **Actor:** Ciudadano
- **Descripción:** Ver cuándo pasan los camiones por su zona
- **Endpoint:** `GET /api/horarios/zona/:zonaId`
- **Response:** `[{ ruta, dia_semana, hora_inicio, hora_fin, tipo_residuo }, ...]`

---

### **CU7: Consultar Ubicación Camión**
- **Actor:** Ciudadano
- **Descripción:** Ver dónde está el camión recolector en tiempo real
- **Endpoint:** `GET /api/camiones/:id/ubicacion`
- **Response:** `{ placa, latitud, longitud, estado, ultima_actualizacion }`

---

### **CU8: Gestionar Notificaciones**
- **Actor:** Ciudadano
- **Descripción:** Ver historial de notificaciones
- **Endpoint:** `GET /api/notificaciones`
- **Response:** `[{ id, titulo, mensaje, tipo, leido, fecha }, ...]`

---

### **CU9: Recibir Notificaciones**
- **Actor:** Ciudadano
- **Descripción:** Recibir notificaciones push/email cuando:
  - Reporte es leído por supervisor
  - Recolector marca zona como completada
  - Se asigna ruta cercana
- **Endpoint:** `GET /api/notificaciones/no-leidas`
- **Automático:** Backend crea notificación en eventos

---

### **CU10: Gestionar Zonas**
- **Actor:** Administrador
- **Descripción:** CRUD de zonas geográficas
- **Endpoints:**
  - `GET /api/zonas` → listar
  - `POST /api/zonas` → crear
  - `PUT /api/zonas/:id` → editar
  - `DELETE /api/zonas/:id` → eliminar
- **Request:** `{ nombre, descripcion, estado }`

---

### **CU11: Gestionar Camiones**
- **Actor:** Administrador
- **Descripción:** CRUD de camiones recolectores
- **Endpoints:**
  - `GET /api/camiones` → listar
  - `POST /api/camiones` → crear
  - `PUT /api/camiones/:id` → editar
  - `DELETE /api/camiones/:id` → eliminar
- **Request:** `{ placa, modelo, capacidad_kg, estado }`

---

### **CU12: Gestionar Rutas**
- **Actor:** Administrador
- **Descripción:** CRUD de rutas de recolección
- **Endpoints:**
  - `GET /api/rutas` → listar
  - `POST /api/rutas` → crear
  - `PUT /api/rutas/:id` → editar
  - `/api/rutas/asignar` → asignar camión + operador a ruta
- **Request Asignar:** `{ camion_id, ruta_id, operador_id, fecha_asignacion }`

---

### **CU13: Visualizar Ruta Asignada**
- **Actor:** Operador Vehículo
- **Descripción:** Ver qué ruta tiene asignada hoy
- **Endpoint:** `GET /api/rutas/mi-ruta`
- **Response:** `{ camion, ruta, zona, horarios, estado }`
- **Autenticación:** Solo operadores (rol_id = 2)

---

### **CU14: Registrar Recolección**
- **Actor:** Operador Vehículo
- **Descripción:** Marcar que inició la recolección en una zona
- **Endpoint:** `POST /api/recolecciones`
- **Request:** `{ asignacion_id, zona_id, tipo_residuo_id, cantidad_kg, observaciones }`
- **Response:** `{ id, estado: "en_proceso", fecha_inicio }`

---

### **CU15: Marcar Recolección Completada**
- **Actor:** Operador Vehículo
- **Descripción:** Finalizar recolección en zona
- **Endpoint:** `POST /api/recolecciones/:id/completar`
- **Automático:** Cambia estado de recolección a "completado"
- **Automático:** Marca TODOS los reportes de esa zona como "completado"
- **Automático:** Envía notificación a cada ciudadano: "Tu reporte fue recolectado"

---

### **CU16: Activar GPS Camión**
- **Actor:** Operador Vehículo
- **Descripción:** Activar tracking GPS del camión
- **Endpoint:** `POST /api/camiones/:id/gps`
- **Request:** `{ latitud, longitud }`
- **Almacena:** Ubicación actual + timestamp
- **Ciudadano accede:** Vía CU7

---

### **CU17: Consultar Reportes (Dashboard)**
- **Actor:** Supervisor Municipal
- **Descripción:** Ver todos los reportes enviados (filtrar por estado/zona)
- **Endpoint:** `GET /api/supervisor/reportes?estado=enviado&zona_id=1`
- **Response:** `[{ id, usuario, zona, tipo_residuo, descripcion, estado, fecha }, ...]`

---

### **CU18: Ver Cumplimiento Rutas**
- **Actor:** Supervisor Municipal
- **Descripción:** Estadísticas: qué rutas se completaron, cuáles retrasadas
- **Endpoint:** `GET /api/supervisor/cumplimiento-rutas`
- **Response:** `{ rutas_completadas, rutas_pendientes, % cumplimiento }`

---

### **CU19: Generar Reporte Ambiental**
- **Actor:** Supervisor Municipal
- **Descripción:** Estadísticas de residuos por zona/tipo
- **Endpoint:** `GET /api/supervisor/reporte-ambiental`
- **Response:** `{ kg_recolectados_total, por_tipo, por_zona, tendencia }`

---

### **CU20: Ver Participación Ciudadana**
- **Actor:** Supervisor Municipal
- **Descripción:** Cuántos reportes enviaron ciudadanos, tendencia de uso
- **Endpoint:** `GET /api/supervisor/participacion-ciudadana`
- **Response:** `{ reportes_totales, ciudadanos_activos, % aumento, top_zonas }`

---

### **CU21: Gestionar Reportes Incidencias**
- **Actor:** Supervisor Municipal
- **Descripción:** Ver lista de reportes (incidencias) que requieren supervisión
- **Endpoint:** `GET /api/supervisor/incidencias`
- **Response:** `[{ id, usuario, descripcion, foto, zona, estado, fecha }, ...]`
- **Filtros:** Por estado (enviado, leido, en_proceso, completado)

---

### **CU22: Responder Reporte Incidencia**
- **Actor:** Supervisor Municipal
- **Descripción:** Escribir respuesta/nota y cambiar estado del reporte
- **Endpoint:** `POST /api/supervisor/responder/:reporteId`
- **Request:** `{ respuesta_texto, nuevo_estado }`
- **Automático:** Notifica al ciudadano: "Supervisor respondió: [respuesta]"
- **Workflow:** 
  - enviado → leido (cuando lo lee supervisor)
  - leido → en_proceso (cuando responde)
  - en_proceso → completado (cuando recolector marca completado)

---

## Diagrama de Transiciones de Estado - REPORTE

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE UN REPORTE                       │
└─────────────────────────────────────────────────────────────┘

CIUDADANO crea reporte (CU5)
         ↓
    [ENVIADO] ← estado inicial, ciudadano VE "Enviado"
         ↓
    Supervisor lo ve (CU17, CU21)
         ↓
    [LEIDO] ← supervisor leyó el reporte
         ↓
    Supervisor responde (CU22)
         ↓
    [EN_PROCESO] ← en supervisión, operador va a recolectar
         ↓
    Operador marca zona completada (CU15)
         ↓
    [COMPLETADO] ← ciudadano VE "Completado" + notificación
         ↓
    FIN


ALTERNATIVA (Cancelado):
    [ENVIADO] → [CANCELADO] (si admin cancela manualmente)
```

---

## Tabla de Permisos por Rol

| Acción | Ciudadano | Operador | Admin | Supervisor |
|---|---|---|---|---|
| Login | ✅ CU1 | ✅ CU1 | ✅ CU1 | ✅ CU1 |
| Registrar | ✅ CU3 | - | - | - |
| Ver Perfil | ✅ CU4 | ✅ CU4 | ✅ CU4 | ✅ CU4 |
| Crear Reporte | ✅ CU5 | - | - | - |
| Ver Horarios | ✅ CU6 | ✅ CU6 | ✅ CU6 | ✅ CU6 |
| Ver Camión | ✅ CU7 | ✅ CU7 | ✅ CU7 | ✅ CU7 |
| Notificaciones | ✅ CU8,9 | ✅ CU8,9 | ✅ CU8,9 | ✅ CU8,9 |
| Gestionar Zonas | - | - | ✅ CU10 | - |
| Gestionar Camiones | - | - | ✅ CU11 | - |
| Gestionar Rutas | - | - | ✅ CU12 | - |
| Ver Mi Ruta | - | ✅ CU13 | ✅ | - |
| Registrar Recolección | - | ✅ CU14 | ✅ | - |
| Completar Recolección | - | ✅ CU15 | ✅ | - |
| Activar GPS | - | ✅ CU16 | ✅ | - |
| Ver Reportes | - | - | ✅ | ✅ CU17 |
| Ver Cumplimiento | - | - | ✅ | ✅ CU18 |
| Reporte Ambiental | - | - | ✅ | ✅ CU19 |
| Participación | - | - | ✅ | ✅ CU20 |
| Gestionar Incidencias | - | - | ✅ | ✅ CU21,22 |

---

## Estructura BD Resumida

```
roles (id, nombre)
  ↓
usuarios (id, nombres, correo, rol_id, zona_id, proveedor_social, ...)
  ↓
reportes (id, usuario_id, tipo_residuo_id, estado, numero_ticket, ...)
notificaciones (id, usuario_id, titulo, leido, ...)
  ↓
zonas (id, nombre)
rutas (id, nombre, zona_id)
camiones (id, placa, gps_activo, latitud_actual, ...)
  ↓
asignacion_rutas (id, camion_id, ruta_id, operador_id, estado)
  ↓
recolecciones (id, asignacion_id, zona_id, estado, cantidad_kg, ...)
```

---

## Endpoints Resumen (29 total)

### Auth (5)
- POST `/api/auth/register`
- POST `/api/auth/login`
- POST `/api/auth/login-social`
- PUT `/api/auth/perfil`
- POST `/api/auth/cambiar-contrasena`

### Reportes (1)
- POST `/api/reportes`

### Horarios (1)
- GET `/api/horarios/zona/:zonaId`

### Camiones (4)
- GET `/api/camiones`
- POST `/api/camiones`
- GET `/api/camiones/:id/ubicacion`
- POST `/api/camiones/:id/gps`

### Notificaciones (3)
- GET `/api/notificaciones`
- GET `/api/notificaciones/no-leidas`
- POST `/api/notificaciones/:id/leer`

### Zonas (4)
- GET `/api/zonas`
- POST `/api/zonas`
- PUT `/api/zonas/:id`
- DELETE `/api/zonas/:id`

### Rutas (4)
- GET `/api/rutas`
- POST `/api/rutas`
- GET `/api/rutas/mi-ruta`
- POST `/api/rutas/asignar`

### Recolecciones (2)
- POST `/api/recolecciones`
- POST `/api/recolecciones/:id/completar`

### Supervisor (5)
- GET `/api/supervisor/reportes`
- GET `/api/supervisor/cumplimiento-rutas`
- GET `/api/supervisor/reporte-ambiental`
- GET `/api/supervisor/participacion-ciudadana`
- GET `/api/supervisor/incidencias`
- POST `/api/supervisor/responder/:id`

---

**Generado:** 28 de junio 2026  
**Proyecto:** SmartWaste Cusco  
**Versión:** 2.0 - Completa con 22 CUs
