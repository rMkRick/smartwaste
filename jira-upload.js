const axios = require('axios');

const JIRA_HOST = 'https://unsaac-team-grupois.atlassian.net';
const EMAIL = '150400@unsaac.edu.pe';
const API_TOKEN = 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106';
const PROJECT_KEY = 'SMR';

const jira = axios.create({
    baseURL: `${JIRA_HOST}/rest/api/2`,
    auth: {
        username: EMAIL,
        password: API_TOKEN
    },
    headers: { 'Content-Type': 'application/json' }
});

const CUS = [
    { id: 'CU1', nombre: 'Iniciar Sesión', descripcion: 'Usuario ingresa con correo y contraseña', actor: 'Ciudadano' },
    { id: 'CU2', nombre: 'Login Social (Google/Facebook)', descripcion: 'Autenticación con OAuth', actor: 'Ciudadano' },
    { id: 'CU3', nombre: 'Registrar Usuario', descripcion: 'Crear cuenta nueva con validaciones', actor: 'Ciudadano' },
    { id: 'CU4', nombre: 'Modificar Perfil/Contraseña', descripcion: 'Actualizar datos de usuario', actor: 'Ciudadano' },
    { id: 'CU5', nombre: 'Registrar Reporte de Residuos', descripcion: 'Enviar incidencia con foto y ubicación', actor: 'Ciudadano' },
    { id: 'CU6', nombre: 'Consultar Horarios Recolección', descripcion: 'Ver cronograma por zona', actor: 'Ciudadano' },
    { id: 'CU7', nombre: 'Consultar Ubicación Camión', descripcion: 'Ver GPS camión en tiempo real', actor: 'Ciudadano' },
    { id: 'CU8', nombre: 'Gestionar Notificaciones', descripcion: 'Ver historial de notificaciones', actor: 'Ciudadano' },
    { id: 'CU9', nombre: 'Recibir Notificaciones', descripcion: 'Push/email automáticos', actor: 'Ciudadano' },
    { id: 'CU10', nombre: 'Gestionar Zonas', descripcion: 'CRUD zonas geográficas', actor: 'Administrador' },
    { id: 'CU11', nombre: 'Gestionar Camiones', descripcion: 'CRUD camiones recolectores', actor: 'Administrador' },
    { id: 'CU12', nombre: 'Gestionar Rutas', descripcion: 'CRUD rutas de recolección', actor: 'Administrador' },
    { id: 'CU13', nombre: 'Visualizar Ruta Asignada', descripcion: 'Operador ve su ruta del día', actor: 'Operador Vehículo' },
    { id: 'CU14', nombre: 'Registrar Recolección', descripcion: 'Marcar inicio de recolección en zona', actor: 'Operador Vehículo' },
    { id: 'CU15', nombre: 'Marcar Recolección Completada', descripcion: 'Finalizar recolección y notificar ciudadanos', actor: 'Operador Vehículo' },
    { id: 'CU16', nombre: 'Activar GPS Camión', descripcion: 'Rastreo en tiempo real', actor: 'Operador Vehículo' },
    { id: 'CU17', nombre: 'Consultar Reportes (Dashboard)', descripcion: 'Ver todos los reportes filtrados', actor: 'Supervisor Municipal' },
    { id: 'CU18', nombre: 'Ver Cumplimiento Rutas', descripcion: 'Estadísticas de cumplimiento', actor: 'Supervisor Municipal' },
    { id: 'CU19', nombre: 'Generar Reporte Ambiental', descripcion: 'Kg recolectados por tipo', actor: 'Supervisor Municipal' },
    { id: 'CU20', nombre: 'Ver Participación Ciudadana', descripcion: 'Estadísticas de engagement', actor: 'Supervisor Municipal' },
    { id: 'CU21', nombre: 'Gestionar Reportes Incidencias', descripcion: 'Ver y filtrar incidencias', actor: 'Supervisor Municipal' },
    { id: 'CU22', nombre: 'Responder Reporte Incidencia', descripcion: 'Enviar respuesta a ciudadano', actor: 'Supervisor Municipal' }
];

async function createEpic() {
    try {
        console.log('📌 Creando Epic...');
        const epic = await jira.post('/issue', {
            fields: {
                project: { key: PROJECT_KEY },
                summary: 'SmartWaste Cusco - Sistema de Gestión de Residuos',
                description: 'Implementar plataforma completa de gestión de residuos para Cusco con 22 casos de uso: 9 para ciudadanos, 3 para admin, 4 para operadores, 6 para supervisores',
                issuetype: { id: '10145' },
                labels: ['smartwaste', 'cusco', 'residuos', 'mvp-2026']
            }
        });
        console.log(`✅ Epic creada: ${epic.data.key}`);
        return epic.data.key;
    } catch (error) {
        console.error('❌ Error creando Epic:', error.response?.data || error.message);
        throw error;
    }
}

async function createStory(epicKey, cu) {
    try {
        const story = await jira.post('/issue', {
            fields: {
                project: { key: PROJECT_KEY },
                summary: `${cu.id}: ${cu.nombre}`,
                description: `*Actor:* ${cu.actor}\n\n*Descripción:* ${cu.descripcion}`,
                issuetype: { id: '10148' },
                labels: ['caso-uso', cu.id.toLowerCase()]
            }
        });
        console.log(`✅ ${cu.id} creada: ${story.data.key}`);
        return story.data.key;
    } catch (error) {
        console.error(`❌ Error creando ${cu.id}:`, error.response?.data || error.message);
    }
}

async function createDevTasks(epicKey) {
    const tasks = [
        { summary: 'Backend: Crear modelo User con métodos de auth', description: 'Incluir login, register, social login' },
        { summary: 'Backend: Crear modelo Report con validaciones', description: 'Reportes con estados: enviado, leido, en_proceso, completado' },
        { summary: 'Backend: Crear modelo Recoleccion y Ruta', description: 'Gestión de rutas y recolecciones de operadores' },
        { summary: 'Backend: Montar endpoints de Auth', description: 'POST /login, /register, /login-social, PUT /perfil' },
        { summary: 'Backend: Montar endpoints de Reportes', description: 'POST /reportes, GET filtros por estado/zona' },
        { summary: 'Backend: Montar endpoints de Supervisor', description: 'GET /reportes, /cumplimiento-rutas, /reporte-ambiental, etc' },
        { summary: 'Frontend: Crear CitizenDashboard', description: 'Dashboard completo para ciudadanos con mapa' },
        { summary: 'Frontend: Crear OperadorDashboard', description: 'Dashboard para operadores con GPS y recolecciones' },
        { summary: 'Frontend: Crear AdminDashboard', description: 'CRUD de zonas, camiones, rutas' },
        { summary: 'Frontend: Crear SupervisorDashboard', description: 'Reportes, estadísticas, gestión incidencias' },
        { summary: 'Frontend: Integrar MapaPicker', description: 'Componente con Leaflet y OpenStreetMap' },
        { summary: 'BD: Crear script SQL con 11 tablas', description: 'Roles, usuarios, zonas, camiones, rutas, etc' },
        { summary: 'Testing: E2E flow ciudadano', description: 'Login → Crear reporte → Ver estado' },
        { summary: 'Testing: E2E flow operador', description: 'Ver ruta → Activar GPS → Marcar completado' },
        { summary: 'Testing: E2E flow supervisor', description: 'Ver reportes → Responder incidencia' },
        { summary: 'Deploy: Configurar backend en servidor', description: 'Node + Express + MySQL' },
        { summary: 'Deploy: Configurar frontend en Vercel/Netlify', description: 'React build optimizado' }
    ];

    console.log('\n📋 Creando tareas de desarrollo...');
    for (const task of tasks) {
        try {
            const issue = await jira.post('/issue', {
                fields: {
                    project: { key: PROJECT_KEY },
                    summary: task.summary,
                    description: task.description,
                    issuetype: { id: '10147' },
                    labels: ['desarrollo']
                }
            });
            console.log(`✅ ${task.summary.substring(0, 40)}... creada`);
        } catch (error) {
            console.error(`❌ Error en tarea:`, error.response?.data?.errors || error.message);
        }
    }
}

async function main() {
    console.log('🚀 SmartWaste Jira Uploader\n');
    console.log(`📧 Email: ${EMAIL}`);
    console.log(`🔑 Project: ${PROJECT_KEY}\n`);

    try {
        // Crear Epic
        const epicKey = await createEpic();

        // Crear CUs
        console.log('\n📚 Creando 22 Casos de Uso...');
        for (const cu of CUS) {
            await createStory(epicKey, cu);
        }

        // Crear tareas de dev
        await createDevTasks(epicKey);

        console.log('\n✅ ¡Todos los tickets subidos a Jira!');
        console.log(`\n🔗 Ver en: ${JIRA_HOST}/browse/${PROJECT_KEY}`);
    } catch (error) {
        console.error('\n❌ Error fatal:', error.message);
    }
}

main();
