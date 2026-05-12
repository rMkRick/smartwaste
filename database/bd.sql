CREATE DATABASE IF NOT EXISTS smartwaste_db;
USE smartwaste_db;

-- Eliminar tablas si existen (en orden inverso para evitar errores de llaves foráneas)
DROP TABLE IF EXISTS asignacion_rutas;
DROP TABLE IF EXISTS alertas;
DROP TABLE IF EXISTS reportes;
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS rutas;
DROP TABLE IF EXISTS camiones;
DROP TABLE IF EXISTS tipos_residuos;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS zonas;
DROP TABLE IF EXISTS roles;

-- 1. Roles: ciudadano, operador, administrador, gerente
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE 
);

INSERT INTO roles (nombre) VALUES ('ciudadano'), ('operador'), ('administrador'), ('gerente');

-- 2. Zonas/Sectores del Cusco
CREATE TABLE zonas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT
);

INSERT INTO zonas (nombre, descripcion) VALUES 
('Centro Histórico', 'Zona monumental y comercial'),
('San Blas', 'Barrio artesanal y turístico'),
('San Sebastián', 'Distrito con alta densidad poblacional'),
('Santiago', 'Zona residencial y comercial'),
('Wanchaq', 'Centro administrativo y residencial');

-- 3. Usuarios (Conectado a Roles y Zonas)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    dni VARCHAR(8) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    rol_id INT,
    zona_id INT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id),
    FOREIGN KEY (zona_id) REFERENCES zonas(id)
);

-- 4. Tipos de Residuos
CREATE TABLE tipos_residuos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO tipos_residuos (nombre) VALUES ('Orgánico'), ('Reciclable'), ('No Reciclable'), ('Peligroso');

-- 5. Camiones (Módulo 3: Monitoreo)
CREATE TABLE camiones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    modelo VARCHAR(50),
    capacidad_kg DECIMAL(10, 2),
    estado ENUM('disponible', 'en_ruta', 'mantenimiento') DEFAULT 'disponible',
    latitud_actual DECIMAL(10, 8),
    longitud_actual DECIMAL(11, 8),
    ultima_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 6. Rutas de Recolección (Módulo 3: Monitoreo)
CREATE TABLE rutas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    zona_id INT,
    descripcion TEXT,
    FOREIGN KEY (zona_id) REFERENCES zonas(id)
);

-- 7. Horarios de Recolección
CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruta_id INT,
    dia_semana ENUM('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'),
    hora_inicio TIME,
    hora_fin TIME,
    tipo_residuo_id INT,
    FOREIGN KEY (ruta_id) REFERENCES rutas(id),
    FOREIGN KEY (tipo_residuo_id) REFERENCES tipos_residuos(id)
);

-- 8. Reportes de Incidencias
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    foto_url VARCHAR(255),
    latitud DECIMAL(10, 8),
    longitud DECIMAL(11, 8),
    tipo_residuo_id INT,
    descripcion TEXT,
    numero_ticket VARCHAR(20) UNIQUE,
    estado ENUM('pendiente', 'asignado', 'en_proceso', 'resuelto', 'cancelado') DEFAULT 'pendiente',
    comentario_admin TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (tipo_residuo_id) REFERENCES tipos_residuos(id)
);

-- 9. Sistema de Alertas (Módulo 5)
CREATE TABLE alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    titulo VARCHAR(100),
    mensaje TEXT,
    tipo ENUM('proximidad', 'retraso', 'informativo') DEFAULT 'informativo',
    leido BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 10. Asignación de Camiones a Rutas
CREATE TABLE asignacion_rutas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    camion_id INT,
    ruta_id INT,
    operador_id INT,
    fecha_asignacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estado ENUM('activo', 'completado') DEFAULT 'activo',
    FOREIGN KEY (camion_id) REFERENCES camiones(id),
    FOREIGN KEY (ruta_id) REFERENCES rutas(id),
    FOREIGN KEY (operador_id) REFERENCES usuarios(id)
);

-- --- DATOS DE PRUEBA (Español) ---

INSERT INTO rutas (nombre, zona_id, descripcion) VALUES 
('Ruta Centro 01', 1, 'Recorrido por la Plaza de Armas y calles aledañas'),
('Ruta San Blas 02', 2, 'Subida por calle Tandapata y alrededores'),
('Ruta San Sebastián 03', 3, 'Avenida de la Cultura y calles interiores');

INSERT INTO horarios (ruta_id, dia_semana, hora_inicio, hora_fin, tipo_residuo_id) VALUES 
(1, 'Lunes', '20:00:00', '22:00:00', 1),
(1, 'Miércoles', '20:00:00', '22:00:00', 2),
(1, 'Viernes', '20:00:00', '22:00:00', 3);

INSERT INTO camiones (placa, modelo, capacidad_kg, estado) VALUES 
('X1Y-888', 'Volvo FE', 15000.00, 'disponible'),
('A2B-999', 'Mercedes-Benz Econic', 12000.00, 'en_ruta');

-- --- USUARIOS DE PRUEBA (Contraseña: 123456) ---

INSERT INTO usuarios (nombres, apellidos, dni, correo, contrasena, rol_id, zona_id) VALUES 
('Juan', 'Quispe', '11111111', 'ciudadano@smartwaste.com', '$2b$10$.ZEHvTqdR2wZLgqzndBhneQ/.sHKT2KerCioQeNtLdC69zkQoZHJG', 1, 1),
('Pedro', 'Mamani', '22222222', 'operador@smartwaste.com', '$2b$10$.ZEHvTqdR2wZLgqzndBhneQ/.sHKT2KerCioQeNtLdC69zkQoZHJG', 2, 2),
('Ana', 'García', '33333333', 'admin@smartwaste.com', '$2b$10$.ZEHvTqdR2wZLgqzndBhneQ/.sHKT2KerCioQeNtLdC69zkQoZHJG', 3, 3),
('Maria', 'Vargas', '44444444', 'gerente@smartwaste.com', '$2b$10$.ZEHvTqdR2wZLgqzndBhneQ/.sHKT2KerCioQeNtLdC69zkQoZHJG', 4, 4);
