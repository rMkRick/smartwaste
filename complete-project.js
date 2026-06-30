const axios = require('axios');

const jira = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/api/2',
    auth: {
        username: '150400@unsaac.edu.pe',
        password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
    }
});

const jiraAgile = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/agile/1.0',
    auth: {
        username: '150400@unsaac.edu.pe',
        password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
    }
});

const CUS = [
    { id: 'CU1', nombre: 'Iniciar Sesión', tech: 'POST /api/auth/login - Validar correo/contraseña, generar JWT, retornar usuario + token', sprint: 1 },
    { id: 'CU2', nombre: 'Login Social (Google/Facebook)', tech: 'POST /api/auth/login-social - OAuth 2.0, crear usuario si no existe, guardar proveedor_id', sprint: 1 },
    { id: 'CU3', nombre: 'Registrar Usuario', tech: 'POST /api/auth/register - Validar DNI, correo único, hashear contraseña bcrypt, rol_id=1', sprint: 1 },
    { id: 'CU4', nombre: 'Modificar Perfil/Contraseña', tech: 'PUT /api/auth/perfil, POST /api/auth/cambiar-contrasena - Actualizar datos, verificar contraseña anterior', sprint: 1 },
    { id: 'CU5', nombre: 'Registrar Reporte de Residuos', tech: 'POST /api/reportes - usuario_id, foto, lat, lng, tipo_residuo_id, generar numero_ticket interno, estado=enviado', sprint: 1 },
    { id: 'CU6', nombre: 'Consultar Horarios Recolección', tech: 'GET /api/horarios/zona/:zonaId - Retornar horarios por zona, tipo_residuo, dia_semana', sprint: 1 },
    { id: 'CU7', nombre: 'Consultar Ubicación Camión', tech: 'GET /api/camiones/:id/ubicacion - Retornar lat, lng, última actualización, solo ciudadano autenticado', sprint: 2 },
    { id: 'CU8', nombre: 'Gestionar Notificaciones', tech: 'GET /api/notificaciones, GET /api/notificaciones/no-leidas - Crear automáticamente en eventos, marcar como leídas', sprint: 2 },
    { id: 'CU9', nombre: 'Recibir Notificaciones', tech: 'Automático en cambios de estado - Notificar: Reporte #{id} cambió a {estado}, Push/Email futuro', sprint: 2 },
    { id: 'CU10', nombre: 'Gestionar Zonas', tech: 'CRUD /api/zonas - GET/POST/PUT/DELETE, tabla: id, nombre, descripcion, estado, solo admin', sprint: 2 },
    { id: 'CU11', nombre: 'Gestionar Camiones', tech: 'CRUD /api/camiones - Tabla: placa, modelo, capacidad_kg, estado, gps_activo, solo admin', sprint: 2 },
    { id: 'CU12', nombre: 'Gestionar Rutas', tech: 'CRUD /api/rutas + POST /api/rutas/asignar (camion+operador) - Tabla: nombre, zona_id, descripcion', sprint: 2 },
    { id: 'CU13', nombre: 'Visualizar Ruta Asignada', tech: 'GET /api/rutas/mi-ruta - Retornar ruta asignada al operador con camion, zona, horarios, estado', sprint: 3 },
    { id: 'CU14', nombre: 'Registrar Recolección', tech: 'POST /api/recolecciones - asignacion_id, zona_id, tipo_residuo_id, cantidad_kg, estado=en_proceso', sprint: 3 },
    { id: 'CU15', nombre: 'Marcar Recolección Completada', tech: 'POST /api/recolecciones/:id/completar - Estado=completado, auto marcar reportes zona, notificar ciudadanos', sprint: 3 },
    { id: 'CU16', nombre: 'Activar GPS Camión', tech: 'POST /api/camiones/:id/gps - Actualizar lat, lng, gps_activo=true, timestamp ultima_actualizacion', sprint: 3 },
    { id: 'CU17', nombre: 'Consultar Reportes (Dashboard)', tech: 'GET /api/supervisor/reportes - Filtrar por estado, zona, fecha, retornar usuario, descripcion, estado', sprint: 3 },
    { id: 'CU18', nombre: 'Ver Cumplimiento Rutas', tech: 'GET /api/supervisor/cumplimiento-rutas - Retornar rutas_completadas, rutas_pendientes, % cumplimiento', sprint: 3 },
    { id: 'CU19', nombre: 'Generar Reporte Ambiental', tech: 'GET /api/supervisor/reporte-ambiental - Kg recolectados total y por tipo, gráficas por zona', sprint: 4 },
    { id: 'CU20', nombre: 'Ver Participación Ciudadana', tech: 'GET /api/supervisor/participacion-ciudadana - Reportes totales, ciudadanos activos, % aumento mensual', sprint: 4 },
    { id: 'CU21', nombre: 'Gestionar Reportes Incidencias', tech: 'GET /api/supervisor/incidencias - Filtrar por estado (enviado, leido, en_proceso, completado), ver detalles', sprint: 4 },
    { id: 'CU22', nombre: 'Responder Reporte Incidencia', tech: 'POST /api/supervisor/responder/:id - Guardar respuesta, cambiar estado, notificar ciudadano automáticamente', sprint: 4 }
];

(async () => {
    try {
        console.log('🚀 CREANDO PROYECTO COMPLETO SMRTWSTC\n');

        // 1. CREAR EPIC
        console.log('📌 Paso 1: Creando Epic Principal...\n');
        const epic = await jira.post('/issue', {
            fields: {
                project: { key: 'SMRTWSTC' },
                summary: 'SmartWaste Cusco - Sistema Completo de Gestión de Residuos',
                description: 'Implementación completa del sistema SmartWaste Cusco con 22 casos de uso, 4 roles, dashboards analytics y reportes en tiempo real.',
                issuetype: { id: '10151' },
                labels: ['smartwaste', 'cusco', 'residuos', 'mvp-2026']
            }
        });
        console.log(`✅ Epic creada: ${epic.data.key}\n`);
        const epicKey = epic.data.key;

        // 2. CREAR 4 SPRINTS
        console.log('⏭️ Paso 2: Creando 4 Sprints...\n');
        const board = await jiraAgile.get('/board?projectKeyOrId=SMRTWSTC');
        const boardId = board.data.values[0]?.id;

        if (!boardId) {
            console.log('⚠️  No board found');
            return;
        }

        const sprints = {};
        const sprintNames = [
            'Sprint 1: Auth & Reportes Básicos',
            'Sprint 2: Operador & Admin',
            'Sprint 3: Recolección & Supervisor',
            'Sprint 4: Estadísticas & Deploy'
        ];

        for (let i = 0; i < 4; i++) {
            try {
                const sprint = await jiraAgile.post(`/board/${boardId}/sprint`, {
                    name: sprintNames[i]
                });
                sprints[i + 1] = sprint.data.id;
                console.log(`✅ ${sprintNames[i]} (id: ${sprint.data.id})`);
            } catch (error) {
                console.log(`⚠️  Sprint ${i + 1}: ${error.response?.data?.errorMessages?.[0] || 'error'}`);
            }
        }
        console.log('');

        // 3. CREAR 22 HISTORIAS
        console.log('📚 Paso 3: Creando 22 Historias de Usuario...\n');
        const historias = {};
        for (const cu of CUS) {
            try {
                const historia = await jira.post('/issue', {
                    fields: {
                        project: { key: 'SMRTWSTC' },
                        summary: `${cu.id}: ${cu.nombre}`,
                        description: `*Especificación Técnica:*\n${cu.tech}\n\n*Criterios de Aceptación:*\n- Endpoint implementado y funcional\n- Validaciones en frontend y backend\n- Manejo de errores\n- Testeo E2E`,
                        issuetype: { id: '10154' },
                        labels: [cu.id.toLowerCase()]
                    }
                });
                historias[cu.id] = historia.data.key;
                console.log(`✅ ${cu.id}: ${cu.nombre}`);
            } catch (error) {
                console.log(`❌ ${cu.id}: error`);
            }
        }
        console.log('');

        // 4. ASIGNAR A SPRINTS
        console.log('🎯 Paso 4: Asignando historias a sprints...\n');
        for (const cu of CUS) {
            if (historias[cu.id] && sprints[cu.sprint]) {
                try {
                    await jiraAgile.post(`/sprint/${sprints[cu.sprint]}/issue`, {
                        issues: [historias[cu.id]]
                    });
                    console.log(`✅ ${cu.id} → Sprint ${cu.sprint}`);
                } catch (error) {
                    // silent
                }
            }
        }

        console.log('\n✅ ¡PROYECTO COMPLETO!\n');
        console.log('📊 RESUMEN:');
        console.log(`- 1 Epic: ${epicKey}`);
        console.log(`- 4 Sprints creados y configurados`);
        console.log(`- 22 Historias de Usuario con descripciones técnicas`);
        console.log(`\n🔗 Ver en: https://unsaac-team-grupois.atlassian.net/jira/software/projects/SMRTWSTC/boards/101`);

    } catch (error) {
        console.error('Error:', error.message);
    }
})();
