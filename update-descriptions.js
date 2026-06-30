const axios = require('axios');

const jira = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/api/2',
    auth: {
        username: '150400@unsaac.edu.pe',
        password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
    }
});

const DESCRIPTIONS = {
    'SMR-37': 'Endpoint: POST /api/auth/login\nValidar correo/contraseña contra BD\nGenerar JWT token\nRetornar usuario + token',
    'SMR-38': 'Endpoint: POST /api/auth/login-social\nOAuth con Google/Facebook\nCrear usuario si no existe\nGuardar proveedor_id',
    'SMR-39': 'Endpoint: POST /api/auth/register\nValidar DNI (8 dígitos), correo único\nHashear contraseña con bcrypt\nAsignar rol_id=1 (ciudadano)',
    'SMR-40': 'Endpoints: PUT /api/auth/perfil, POST /api/auth/cambiar-contrasena\nActualizar nombres, foto_perfil\nVerificar contraseña anterior',
    'SMR-41': 'Endpoint: POST /api/reportes\nGuardar: usuario_id, foto, latitud, longitud, tipo_residuo_id, descripcion\nGenerar numero_ticket interno (no visible a ciudadano)\nEstado inicial: "enviado"',
    'SMR-42': 'Endpoint: GET /api/horarios/zona/:zonaId\nRetornar horarios por zona + tipo_residuo\nFiltrar por dia_semana y hora',
    'SMR-43': 'Endpoint: GET /api/camiones/:id/ubicacion\nRetornar latitud, longitud, última actualización',
    'SMR-44': 'Endpoints: GET /api/notificaciones, GET /api/notificaciones/no-leidas\nCrear notificaciones automáticas en eventos\nMarcar como leídas',
    'SMR-45': 'Automático al cambiar estado de reporte\nEnviar notificación: "Reporte #{id} cambió a {estado}"',
    'SMR-46': 'Endpoints CRUD: GET/POST/PUT/DELETE /api/zonas\nTabla: id, nombre, descripcion, estado',
    'SMR-47': 'Endpoints CRUD: GET/POST/PUT/DELETE /api/camiones\nTabla: placa, modelo, capacidad_kg, estado, gps_activo',
    'SMR-48': 'Endpoints CRUD: GET/POST/PUT/DELETE /api/rutas\nTabla: nombre, zona_id, descripcion\nEndpoint: POST /api/rutas/asignar (camion + operador)',
    'SMR-49': 'Endpoint: GET /api/rutas/mi-ruta\nRetornar ruta asignada al operador (rol_id=2)\nIncluir: camion, zona, horarios, estado',
    'SMR-50': 'Endpoint: POST /api/recolecciones\nCrear recoleccion: asignacion_id, zona_id, tipo_residuo_id\nEstado: "en_proceso"',
    'SMR-51': 'Endpoint: POST /api/recolecciones/:id/completar\nMarcar recoleccion como "completado"\nAutomático: marcar reportes de la zona como "completado"\nNotificar a ciudadanos',
    'SMR-52': 'Endpoint: POST /api/camiones/:id/gps\nActualizar latitud, longitud, gps_activo=true\nTimestamp ultima_actualizacion',
    'SMR-53': 'Endpoint: GET /api/supervisor/reportes\nFiltrar por estado, zona\nMostrar: usuario, descripcion, estado, fecha',
    'SMR-54': 'Endpoint: GET /api/supervisor/cumplimiento-rutas\nRetornar: rutas_completadas, rutas_pendientes, % cumplimiento',
    'SMR-55': 'Endpoint: GET /api/supervisor/reporte-ambiental\nKg recolectados total y por tipo\nGraficas por zona',
    'SMR-56': 'Endpoint: GET /api/supervisor/participacion-ciudadana\nReportes totales, ciudadanos activos, % aumento',
    'SMR-57': 'Endpoint: GET /api/supervisor/incidencias\nEndpoint: POST /api/supervisor/responder/:id\nGuardar respuesta, cambiar estado',
    'SMR-58': 'Testing E2E: Ciudadano login → crear reporte → ver estado\nTesting Operador: ver ruta → GPS → completar\nTesting Supervisor: ver reportes → responder'
};

(async () => {
    try {
        console.log('✏️  Actualizando descripciones técnicas...\n');
        
        for (const [key, desc] of Object.entries(DESCRIPTIONS)) {
            try {
                await jira.put(`/issue/${key}`, {
                    fields: {
                        description: desc
                    }
                });
                console.log(`✅ ${key}`);
            } catch (error) {
                console.log(`❌ ${key}: ${error.response?.data?.errors?.description || error.message}`);
            }
        }
        
        console.log('\n✅ Descripciones actualizadas');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
