CREATE DATABASE IF NOT EXISTS smartwaste_db;
USE smartwaste_db;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS recolecciones;
DROP TABLE IF EXISTS asignacion_rutas;
DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS reportes;
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS rutas;
DROP TABLE IF EXISTS camiones;
DROP TABLE IF EXISTS tipos_residuos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS zonas;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS alertas;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. Roles (CU1-CU22)
CREATE TABLE roles (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);
INSERT INTO roles (nombre) VALUES
('ciudadano'),('operadorVehiculo'),('administrador'),('supervisorMunicipal');

-- 2. Zonas (CU10)
CREATE TABLE zonas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    descripcion TEXT,
    estado      ENUM('activo','inactivo') DEFAULT 'activo'
);
INSERT INTO zonas (nombre, descripcion) VALUES
('Centro Histórico','Zona monumental y comercial'),
('San Blas','Barrio artesanal y turístico'),
('San Sebastián','Distrito con alta densidad poblacional'),
('Santiago','Zona residencial y comercial'),
('Wanchaq','Centro administrativo y residencial');

-- 3. Usuarios (CU1 iniciarSesion, CU2 loginSocial, CU3 registroUsuario, CU4 modificarDatos)
CREATE TABLE usuarios (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    nombres           VARCHAR(100) NOT NULL,
    apellidos         VARCHAR(100) NOT NULL,
    dni               VARCHAR(8)   UNIQUE,
    correo            VARCHAR(100) NOT NULL UNIQUE,
    contrasena        VARCHAR(255),
    rol_id            INT DEFAULT 1,
    zona_id           INT,
    proveedor_social  ENUM('local','google','facebook') DEFAULT 'local',
    proveedor_id      VARCHAR(255) DEFAULT NULL,
    foto_perfil       VARCHAR(255) DEFAULT NULL,
    estado            ENUM('activo','inactivo') DEFAULT 'activo',
    fecha_creacion    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id)   REFERENCES roles(id),
    FOREIGN KEY (zona_id)  REFERENCES zonas(id)
);

-- 4. Tipos de Residuos
CREATE TABLE tipos_residuos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(50)  NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    color       VARCHAR(7) DEFAULT '#808080'
);
INSERT INTO tipos_residuos (nombre, descripcion, color) VALUES
('Orgánico',     'Restos de comida y plantas',          '#8BC34A'),
('Reciclable',   'Papel, plástico, vidrio, metal',      '#2196F3'),
('No Reciclable','Residuos mixtos no reciclables',      '#9E9E9E'),
('Peligroso',    'Pilas, medicamentos, químicos',       '#F44336');

-- 5. Camiones (CU7 consultarUbicacionCamion, CU11 gestionarCamiones, CU16 activarGPS)
CREATE TABLE camiones (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    placa                VARCHAR(10) NOT NULL UNIQUE,
    modelo               VARCHAR(50),
    capacidad_kg         DECIMAL(10,2),
    estado               ENUM('disponible','en_ruta','mantenimiento') DEFAULT 'disponible',
    latitud_actual       DECIMAL(10,8),
    longitud_actual      DECIMAL(11,8),
    gps_activo           BOOLEAN DEFAULT FALSE,
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO camiones (placa, modelo, capacidad_kg, estado) VALUES
('X1Y-888','Volvo FE',          15000.00,'disponible'),
('A2B-999','Mercedes-Benz Econic',12000.00,'en_ruta');

-- 6. Rutas (CU12 gestionarRutas)
CREATE TABLE rutas (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    zona_id     INT,
    descripcion TEXT,
    estado      ENUM('activo','inactivo') DEFAULT 'activo',
    FOREIGN KEY (zona_id) REFERENCES zonas(id)
);
INSERT INTO rutas (nombre, zona_id, descripcion) VALUES
('Ruta Centro 01',    1,'Recorrido por la Plaza de Armas y calles aledañas'),
('Ruta San Blas 02',  2,'Subida por calle Tandapata y alrededores'),
('Ruta San Sebastián 03',3,'Avenida de la Cultura y calles interiores');

-- 7. Horarios (CU6 consultarHorarioRecoleccion)
CREATE TABLE horarios (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    ruta_id         INT,
    dia_semana      ENUM('Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'),
    hora_inicio     TIME,
    hora_fin        TIME,
    tipo_residuo_id INT,
    FOREIGN KEY (ruta_id)         REFERENCES rutas(id),
    FOREIGN KEY (tipo_residuo_id) REFERENCES tipos_residuos(id)
);
INSERT INTO horarios (ruta_id, dia_semana, hora_inicio, hora_fin, tipo_residuo_id) VALUES
(1,'Lunes',    '20:00:00','22:00:00',1),
(1,'Miércoles','20:00:00','22:00:00',2),
(1,'Viernes',  '20:00:00','22:00:00',3),
(2,'Martes',   '19:00:00','21:00:00',1),
(3,'Jueves',   '18:00:00','20:00:00',2);

-- 8. Asignacion de Rutas (CU13 visualizarRutaAsignada)
CREATE TABLE asignacion_rutas (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    camion_id        INT,
    ruta_id          INT,
    operador_id      INT,
    fecha_asignacion DATE NOT NULL,
    estado           ENUM('pendiente','en_proceso','completado','cancelado') DEFAULT 'pendiente',
    FOREIGN KEY (camion_id)   REFERENCES camiones(id),
    FOREIGN KEY (ruta_id)     REFERENCES rutas(id),
    FOREIGN KEY (operador_id) REFERENCES usuarios(id)
);

-- 9. Recolecciones (CU14 registrarRecoleccion, CU15 marcarRecoleccionCompletada)
CREATE TABLE recolecciones (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    asignacion_id    INT,
    operador_id      INT NOT NULL,
    zona_id          INT,
    tipo_residuo_id  INT,
    cantidad_kg      DECIMAL(10,2),
    observaciones    TEXT,
    estado           ENUM('en_proceso','completado') DEFAULT 'en_proceso',
    fecha_inicio     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_completado TIMESTAMP NULL,
    FOREIGN KEY (asignacion_id)   REFERENCES asignacion_rutas(id),
    FOREIGN KEY (operador_id)     REFERENCES usuarios(id),
    FOREIGN KEY (zona_id)         REFERENCES zonas(id),
    FOREIGN KEY (tipo_residuo_id) REFERENCES tipos_residuos(id)
);

-- 10. Reportes (CU5 registrarReporteResiduos, CU21 gestionarReportesIncidencias, CU22 responderReporte)
CREATE TABLE reportes (
    id                   INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id           INT,
    foto_url             VARCHAR(255),
    latitud              DECIMAL(10,8),
    longitud             DECIMAL(11,8),
    tipo_residuo_id      INT,
    descripcion          TEXT,
    numero_ticket        VARCHAR(20) UNIQUE,
    estado               ENUM('enviado','leido','en_proceso','completado','cancelado') DEFAULT 'enviado',
    supervisor_id        INT NULL,
    respuesta_supervisor TEXT NULL,
    fecha_respuesta      TIMESTAMP NULL,
    fecha_creacion       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id)      REFERENCES usuarios(id),
    FOREIGN KEY (tipo_residuo_id) REFERENCES tipos_residuos(id),
    FOREIGN KEY (supervisor_id)   REFERENCES usuarios(id)
);

-- 11. Notificaciones (CU8 gestionarNotificaciones, CU9 recibirNotificaciones)
CREATE TABLE notificaciones (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id       INT NOT NULL,
    titulo           VARCHAR(150) NOT NULL,
    mensaje          TEXT NOT NULL,
    tipo             ENUM('proximidad','retraso','respuesta','informativo') DEFAULT 'informativo',
    leido            BOOLEAN DEFAULT FALSE,
    referencia_id    INT NULL,
    referencia_tipo  VARCHAR(50) NULL,
    fecha_creacion   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- ── USUARIOS DE PRUEBA (contraseña: 123456) ──────────────────────────────────
INSERT INTO usuarios (nombres, apellidos, dni, correo, contrasena, rol_id, zona_id) VALUES
('Juan',  'Quispe', '11111111','ciudadano@smartwaste.com', '$2b$10$.ZEHvTqdR2wZLgqzndBhneQ/.sHKT2KerCioQeNtLdC69zkQoZHJG',1,1),
('Pedro', 'Mamani', '22222222','operador@smartwaste.com',  '$2b$10$.ZEHvTqdR2wZLgqzndBhneQ/.sHKT2KerCioQeNtLdC69zkQoZHJG',2,2),
('Ana',   'García', '33333333','admin@smartwaste.com',     '$2b$10$.ZEHvTqdR2wZLgqzndBhneQ/.sHKT2KerCioQeNtLdC69zkQoZHJG',3,3),
('Maria', 'Vargas', '44444444','supervisor@smartwaste.com','$2b$10$.ZEHvTqdR2wZLgqzndBhneQ/.sHKT2KerCioQeNtLdC69zkQoZHJG',4,4);

-- Asignacion de prueba para el operador
INSERT INTO asignacion_rutas (camion_id, ruta_id, operador_id, fecha_asignacion, estado) VALUES
(1, 1, 2, CURDATE(), 'pendiente');
