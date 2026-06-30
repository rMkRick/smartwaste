const axios = require('axios');

const jira = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/api/2',
    auth: {
        username: '150400@unsaac.edu.pe',
        password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
    }
});

const EPICS = [
    { key: 'MOD-CITIZEN', name: 'Módulo Ciudadano', descripcion: 'Autenticación, reportes y notificaciones para ciudadanos' },
    { key: 'MOD-ADMIN', name: 'Módulo Administrador', descripcion: 'Gestión de zonas, camiones y rutas' },
    { key: 'MOD-OPERADOR', name: 'Módulo Operador', descripcion: 'Recolección, GPS y asignación de rutas' },
    { key: 'MOD-SUPERVISOR', name: 'Módulo Supervisor', descripcion: 'Reportes, estadísticas y análisis' }
];

const CUS = [
    // Módulo Ciudadano (CU1-9)
    {
        id: 'CU1', nombre: 'Iniciar Sesión', epicIndex: 0, points: 3,
        subtareas: [
            { titulo: 'Backend: Login endpoint', desc: 'POST /api/auth/login con validación y JWT' },
            { titulo: 'Frontend: Login form', desc: 'Formulario con email/password + validaciones' },
            { titulo: 'Testing: E2E login', desc: 'Test credenciales válidas e inválidas' }
        ]
    },
    {
        id: 'CU2', nombre: 'Login Social (Google/Facebook)', epicIndex: 0, points: 5,
        subtareas: [
            { titulo: 'Backend: OAuth integration', desc: 'Configurar Google/Facebook OAuth 2.0' },
            { titulo: 'Frontend: Social buttons', desc: 'Botones Google/Facebook en login' },
            { titulo: 'Database: Store provider', desc: 'Guardar proveedor_id y proveedor_social' },
            { titulo: 'Testing: OAuth flow', desc: 'Test login con Google y Facebook' }
        ]
    },
    {
        id: 'CU3', nombre: 'Registrar Usuario', epicIndex: 0, points: 5,
        subtareas: [
            { titulo: 'Backend: Register endpoint', desc: 'POST /api/auth/register con validaciones' },
            { titulo: 'Frontend: Registration form', desc: 'Formulario completo con campos DNI, email, zona' },
            { titulo: 'Database: User table', desc: 'Validar DNI único y email único en BD' },
            { titulo: 'Testing: Registration', desc: 'Test validaciones y duplicados' }
        ]
    },
    {
        id: 'CU4', nombre: 'Modificar Perfil/Contraseña', epicIndex: 0, points: 3,
        subtareas: [
            { titulo: 'Backend: Profile endpoints', desc: 'PUT /perfil, POST /cambiar-contrasena' },
            { titulo: 'Frontend: Profile page', desc: 'Interfaz para editar datos y contraseña' },
            { titulo: 'Testing: Profile updates', desc: 'Test cambios de datos y contraseña' }
        ]
    },
    {
        id: 'CU5', nombre: 'Registrar Reporte de Residuos', epicIndex: 0, points: 8,
        subtareas: [
            { titulo: 'Backend: Report endpoint', desc: 'POST /api/reportes con foto, coords, tipo' },
            { titulo: 'Frontend: Report form', desc: 'Formulario con foto, mapa interactivo, tipo residuo' },
            { titulo: 'Database: Report storage', desc: 'Guardar reportes con estado "enviado"' },
            { titulo: 'Testing: Full report flow', desc: 'Test creación y visualización de reportes' }
        ]
    },
    {
        id: 'CU6', nombre: 'Consultar Horarios Recolección', epicIndex: 0, points: 2,
        subtareas: [
            { titulo: 'Backend: Horarios endpoint', desc: 'GET /api/horarios/zona/:zonaId' },
            { titulo: 'Frontend: Horarios display', desc: 'Mostrar horarios en formato tabla' },
            { titulo: 'Testing: Horarios query', desc: 'Test filtros por zona' }
        ]
    },
    {
        id: 'CU7', nombre: 'Consultar Ubicación Camión', epicIndex: 0, points: 3,
        subtareas: [
            { titulo: 'Backend: Location endpoint', desc: 'GET /api/camiones/:id/ubicacion' },
            { titulo: 'Frontend: Location map', desc: 'Mostrar camión en mapa con Leaflet' },
            { titulo: 'Testing: Location accuracy', desc: 'Test datos lat/lng correctos' }
        ]
    },
    {
        id: 'CU8', nombre: 'Gestionar Notificaciones', epicIndex: 0, points: 5,
        subtareas: [
            { titulo: 'Backend: Notification endpoints', desc: 'GET /notificaciones, GET /no-leidas, POST /leer' },
            { titulo: 'Frontend: Notification center', desc: 'UI para ver y marcar notificaciones leídas' },
            { titulo: 'Database: Notification table', desc: 'Tabla de notificaciones con estado' },
            { titulo: 'Testing: Notification flow', desc: 'Test crear, leer, marcar notificaciones' }
        ]
    },
    {
        id: 'CU9', nombre: 'Recibir Notificaciones', epicIndex: 0, points: 8,
        subtareas: [
            { titulo: 'Backend: Auto notifications', desc: 'Crear notificaciones en cambios de estado' },
            { titulo: 'Frontend: Notification badge', desc: 'Mostrar contador de notificaciones no leídas' },
            { titulo: 'Database: Notification events', desc: 'Registrar eventos que disparan notificaciones' },
            { titulo: 'Testing: Auto notifications', desc: 'Test notificaciones automáticas' }
        ]
    },
    // Módulo Admin (CU10-12)
    {
        id: 'CU10', nombre: 'Gestionar Zonas', epicIndex: 1, points: 5,
        subtareas: [
            { titulo: 'Backend: Zones CRUD', desc: 'GET/POST/PUT/DELETE /api/zonas' },
            { titulo: 'Frontend: Zones admin', desc: 'Tabla con opciones crear/editar/eliminar' },
            { titulo: 'Database: Zones table', desc: 'Tabla con id, nombre, descripcion, estado' },
            { titulo: 'Testing: CRUD operations', desc: 'Test todas las operaciones CRUD' }
        ]
    },
    {
        id: 'CU11', nombre: 'Gestionar Camiones', epicIndex: 1, points: 5,
        subtareas: [
            { titulo: 'Backend: Trucks CRUD', desc: 'GET/POST/PUT/DELETE /api/camiones' },
            { titulo: 'Frontend: Trucks admin', desc: 'Tabla con placa, modelo, capacidad, estado' },
            { titulo: 'Database: Trucks table', desc: 'Tabla con gps_activo y ultima_actualizacion' },
            { titulo: 'Testing: Truck management', desc: 'Test crear, editar, eliminar camiones' }
        ]
    },
    {
        id: 'CU12', nombre: 'Gestionar Rutas', epicIndex: 1, points: 8,
        subtareas: [
            { titulo: 'Backend: Routes CRUD', desc: 'GET/POST/PUT/DELETE /api/rutas + /asignar' },
            { titulo: 'Frontend: Routes admin', desc: 'Formulario para asignar camion+operador a ruta' },
            { titulo: 'Database: Assignment table', desc: 'asignacion_rutas con FK a camion, ruta, operador' },
            { titulo: 'Testing: Route assignment', desc: 'Test asignación y cambios de rutas' }
        ]
    },
    // Módulo Operador (CU13-16)
    {
        id: 'CU13', nombre: 'Visualizar Ruta Asignada', epicIndex: 2, points: 3,
        subtareas: [
            { titulo: 'Backend: My route endpoint', desc: 'GET /api/rutas/mi-ruta para operador' },
            { titulo: 'Frontend: Route dashboard', desc: 'Mostrar ruta con camion, zona, horarios' },
            { titulo: 'Testing: Route retrieval', desc: 'Test obtener ruta correcta del operador' }
        ]
    },
    {
        id: 'CU14', nombre: 'Registrar Recolección', epicIndex: 2, points: 5,
        subtareas: [
            { titulo: 'Backend: Collection endpoint', desc: 'POST /api/recolecciones con zona_id' },
            { titulo: 'Frontend: Start collection', desc: 'Botón para iniciar recolección en zona' },
            { titulo: 'Database: Collection record', desc: 'Guardar recoleccion en estado "en_proceso"' },
            { titulo: 'Testing: Collection start', desc: 'Test crear recolección' }
        ]
    },
    {
        id: 'CU15', nombre: 'Marcar Recolección Completada', epicIndex: 2, points: 8,
        subtareas: [
            { titulo: 'Backend: Complete endpoint', desc: 'POST /api/recolecciones/:id/completar' },
            { titulo: 'Frontend: Complete button', desc: 'Botón para marcar recolección como hecha' },
            { titulo: 'Database: Auto-complete reports', desc: 'Marcar reportes de zona como completados' },
            { titulo: 'Notifications: Citizen alerts', desc: 'Notificar automáticamente a ciudadanos' }
        ]
    },
    {
        id: 'CU16', nombre: 'Activar GPS Camión', epicIndex: 2, points: 5,
        subtareas: [
            { titulo: 'Backend: GPS endpoint', desc: 'POST /api/camiones/:id/gps con lat/lng' },
            { titulo: 'Frontend: GPS button', desc: 'Botón para activar GPS y capturar ubicación' },
            { titulo: 'Database: Store location', desc: 'Guardar lat/lng y timestamp' },
            { titulo: 'Testing: GPS accuracy', desc: 'Test actualizaciones de ubicación' }
        ]
    },
    // Módulo Supervisor (CU17-22)
    {
        id: 'CU17', nombre: 'Consultar Reportes (Dashboard)', epicIndex: 3, points: 5,
        subtareas: [
            { titulo: 'Backend: Reports endpoint', desc: 'GET /api/supervisor/reportes con filtros' },
            { titulo: 'Frontend: Reports table', desc: 'Tabla con filtros por estado, zona, fecha' },
            { titulo: 'Database: Query optimization', desc: 'Índices para búsquedas rápidas' },
            { titulo: 'Testing: Filtering', desc: 'Test filtros funcionan correctamente' }
        ]
    },
    {
        id: 'CU18', nombre: 'Ver Cumplimiento Rutas', epicIndex: 3, points: 8,
        subtareas: [
            { titulo: 'Backend: Compliance endpoint', desc: 'GET /api/supervisor/cumplimiento-rutas' },
            { titulo: 'Frontend: Compliance charts', desc: 'Gráficas de barras con % cumplimiento' },
            { titulo: 'Database: Aggregation queries', desc: 'Contar rutas completadas/pendientes' },
            { titulo: 'Testing: Calculations', desc: 'Test cálculos de porcentajes' }
        ]
    },
    {
        id: 'CU19', nombre: 'Generar Reporte Ambiental', epicIndex: 3, points: 8,
        subtareas: [
            { titulo: 'Backend: Environmental report', desc: 'GET /api/supervisor/reporte-ambiental' },
            { titulo: 'Frontend: Report dashboard', desc: 'Visualizaciones de kg por tipo/zona' },
            { titulo: 'Database: Collection analytics', desc: 'Aggregations de recolecciones' },
            { titulo: 'Testing: Report accuracy', desc: 'Test datos correctos en reportes' }
        ]
    },
    {
        id: 'CU20', nombre: 'Ver Participación Ciudadana', epicIndex: 3, points: 5,
        subtareas: [
            { titulo: 'Backend: Participation endpoint', desc: 'GET /api/supervisor/participacion-ciudadana' },
            { titulo: 'Frontend: Participation metrics', desc: 'KPIs: reportes totales, ciudadanos activos, % aumento' },
            { titulo: 'Database: User analytics', desc: 'Queries de usuarios activos y reportes' },
            { titulo: 'Testing: Metrics', desc: 'Test cálculos de participación' }
        ]
    },
    {
        id: 'CU21', nombre: 'Gestionar Reportes Incidencias', epicIndex: 3, points: 5,
        subtareas: [
            { titulo: 'Backend: Incidents endpoint', desc: 'GET /api/supervisor/incidencias con filtros' },
            { titulo: 'Frontend: Incidents list', desc: 'Mostrar incidencias sin resolver' },
            { titulo: 'Database: Incident tracking', desc: 'Tabla de incidencias con estados' },
            { titulo: 'Testing: Incident filtering', desc: 'Test filtros por estado' }
        ]
    },
    {
        id: 'CU22', nombre: 'Responder Reporte Incidencia', epicIndex: 3, points: 8,
        subtareas: [
            { titulo: 'Backend: Response endpoint', desc: 'POST /api/supervisor/responder/:id' },
            { titulo: 'Frontend: Response form', desc: 'Modal para escribir respuesta a ciudadano' },
            { titulo: 'Database: Store response', desc: 'Guardar respuesta y cambiar estado' },
            { titulo: 'Notifications: Citizen update', desc: 'Notificar ciudadano de la respuesta' }
        ]
    }
];

(async () => {
    try {
        console.log('🚀 ESTRUCTURA PROFESIONAL SMRTWSTC\n');

        // 1. CREAR 4 EPICS
        console.log('📌 Paso 1: Creando 4 Epics por módulo...\n');
        const epicKeys = {};
        for (const epic of EPICS) {
            try {
                const res = await jira.post('/issue', {
                    fields: {
                        project: { key: 'SMRTWSTC' },
                        summary: epic.name,
                        description: epic.descripcion,
                        issuetype: { id: '10151' }
                    }
                });
                epicKeys[epic.key] = res.data.key;
                console.log(`✅ ${epic.name} (${res.data.key})`);
            } catch (error) {
                console.log(`❌ ${epic.name}`);
            }
        }
        console.log('');

        // 2. CREAR 22 HISTORIAS CON SUBTAREAS
        console.log('📚 Paso 2: Creando 22 Historias con Story Points y Subtareas...\n');
        let createdCount = 0;
        for (const cu of CUS) {
            try {
                const epicKey = Object.values(epicKeys)[cu.epicIndex];
                const res = await jira.post('/issue', {
                    fields: {
                        project: { key: 'SMRTWSTC' },
                        summary: `${cu.id}: ${cu.nombre}`,
                        description: `*Epic:* ${EPICS[cu.epicIndex].name}\n*Story Points (Poker):* ${cu.points}\n\n*Criterios de Aceptación:* Ver subtareas para descripción técnica`,
                        issuetype: { id: '10154' }
                    }
                });

                const storyKey = res.data.key;
                createdCount++;
                console.log(`✅ ${cu.id}: ${cu.nombre} (${cu.points} pts)`);

                // Crear subtareas
                for (const subtarea of cu.subtareas) {
                    try {
                        await jira.post('/issue', {
                            fields: {
                                project: { key: 'SMRTWSTC' },
                                summary: subtarea.titulo,
                                description: subtarea.desc,
                                issuetype: { id: '10152' },
                                parent: { key: storyKey }
                            }
                        });
                        console.log(`   └─ ✅ ${subtarea.titulo}`);
                    } catch (error) {
                        console.log(`   └─ ⚠️  ${subtarea.titulo}`);
                    }
                }
                console.log('');
            } catch (error) {
                console.log(`❌ ${cu.id}: ${error.response?.data?.errors?.summary || 'error'}\n`);
            }
        }

        console.log('\n✅ ¡PROYECTO PROFESIONAL COMPLETO!\n');
        console.log('📊 RESUMEN:');
        console.log(`- 4 Epics por módulo`);
        console.log(`- ${createdCount} Historias de Usuario con Story Points`);
        console.log(`- ~80 Subtareas técnicas con descripciones`);
        console.log(`\n🔗 Ver en: https://unsaac-team-grupois.atlassian.net/jira/software/projects/SMRTWSTC/boards/101`);

    } catch (error) {
        console.error('Error:', error.message);
    }
})();
