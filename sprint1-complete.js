const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const AUTH = {
    username: '150400@unsaac.edu.pe',
    password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
};
const BASE = 'https://unsaac-team-grupois.atlassian.net';
const SPRINT_ID = 207;
const PROTO_PATH = 'C:/Users/ASUS/Desktop/prototipos_smartwaste';

const jira = axios.create({ baseURL: `${BASE}/rest/api/2`, auth: AUTH });
const jiraAgile = axios.create({ baseURL: `${BASE}/rest/agile/1.0`, auth: AUTH });

// HUs del Sprint 1 con sus prototipos
const SPRINT1_HUS = [
    {
        key: 'PS-2', // Ya existe
        id: 'CU1', nombre: 'Iniciar Sesión', points: 3,
        prototipo: '1_HU01_Login.png',
        subtareas: ['PS-3', 'PS-4', 'PS-5'] // Ya existen
    },
    {
        id: 'CU2', nombre: 'Registrar Usuario', points: 5,
        prototipo: '2_HU02_Registro.png',
        subtareasNuevas: [
            { titulo: 'Backend: Register endpoint', desc: 'POST /api/auth/register - Validar DNI único, email único, hashear contraseña con bcrypt, retornar token.' },
            { titulo: 'Frontend: Registro form UI', desc: 'Formulario con campos: nombres, apellidos, DNI, correo, contraseña, zona. Incluye validación en tiempo real.' },
            { titulo: 'Testing: Validaciones registro', desc: 'Test DNI duplicado, email duplicado, contraseña débil, campos vacíos.' }
        ]
    },
    {
        id: 'CU3', nombre: 'Registrar Reporte de Residuos', points: 8,
        prototipo: '3_HU03_Reportar.png',
        subtareasNuevas: [
            { titulo: 'Backend: Reportes endpoint', desc: 'POST /api/reportes - Guardar foto, lat, lng, tipo_residuo_id, descripcion. Estado inicial: enviado. Generar numero_ticket interno.' },
            { titulo: 'Frontend: Formulario reporte UI', desc: 'Formulario con: foto (camera), tipo residuo (select), descripción, mapa interactivo Leaflet para seleccionar ubicación.' },
            { titulo: 'Testing: Flujo completo reporte', desc: 'Test crear reporte autenticado y como invitado. Verificar estado inicial = enviado.' }
        ]
    },
    {
        id: 'CU4', nombre: 'Consultar Horarios Recolección', points: 2,
        prototipo: '4_HU04_Horarios.png',
        subtareasNuevas: [
            { titulo: 'Backend: Horarios endpoint', desc: 'GET /api/horarios/zona/:zonaId - Retornar horarios por zona con tipo_residuo y dia_semana.' },
            { titulo: 'Frontend: Horarios UI', desc: 'Tabla semanal con horarios de recolección por zona. Mostrar tipo de residuo y hora de cada día.' },
            { titulo: 'Testing: Filtro por zona', desc: 'Test obtener horarios de cada zona disponible. Verificar datos correctos por dia_semana.' }
        ]
    },
    {
        id: 'CU5', nombre: 'Consultar Ubicación Camión en Mapa', points: 3,
        prototipo: '5_HU05_Mapa.png',
        subtareasNuevas: [
            { titulo: 'Backend: Ubicacion camion endpoint', desc: 'GET /api/camiones/:id/ubicacion - Retornar lat, lng, placa, estado, ultima_actualizacion.' },
            { titulo: 'Frontend: Mapa camion UI', desc: 'Mapa Leaflet con marcador de ubicación del camión en tiempo real. Mostrar placa y estado.' },
            { titulo: 'Testing: GPS camion', desc: 'Test obtener ubicación del camión. Verificar lat/lng correctos y timestamp actualizado.' }
        ]
    },
    {
        id: 'CU6', nombre: 'Clasificación de Residuos', points: 2,
        prototipo: '6_HU06_Clasificacion.png',
        subtareasNuevas: [
            { titulo: 'Backend: Tipos residuos endpoint', desc: 'GET /api/tipos-residuos - Retornar lista con nombre, descripcion, color de cada tipo.' },
            { titulo: 'Frontend: Clasificacion UI', desc: 'Tarjetas visuales por tipo: Orgánico (verde), Reciclable (azul), No Reciclable (gris), Peligroso (rojo).' },
            { titulo: 'Testing: Tipos residuos', desc: 'Test listar todos los tipos. Verificar colores y descripciones correctas.' }
        ]
    }
];

async function getTransitionId(issueKey, targetStatus) {
    const res = await jira.get(`/issue/${issueKey}/transitions`);
    const t = res.data.transitions.find(t =>
        t.name.toLowerCase().includes('listo') ||
        t.name.toLowerCase().includes('done') ||
        t.to.name.toLowerCase().includes('listo')
    );
    return t?.id;
}

async function markDone(issueKey) {
    try {
        const transId = await getTransitionId(issueKey);
        if (transId) {
            await jira.post(`/issue/${issueKey}/transitions`, { transition: { id: transId } });
            return true;
        }
        return false;
    } catch (e) {
        return false;
    }
}

async function attachImage(issueKey, imagePath, filename) {
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(imagePath), { filename });
        await axios.post(`${BASE}/rest/api/2/issue/${issueKey}/attachments`, form, {
            auth: AUTH,
            headers: { ...form.getHeaders(), 'X-Atlassian-Token': 'no-check' }
        });
        return true;
    } catch (e) {
        return false;
    }
}

async function addToSprint(issueKey) {
    try {
        await jiraAgile.post(`/sprint/${SPRINT_ID}/issue`, { issues: [issueKey] });
        return true;
    } catch (e) {
        return false;
    }
}

(async () => {
    console.log('🚀 COMPLETANDO SPRINT 1 - proyecto SmartWaste PS\n');

    for (const hu of SPRINT1_HUS) {
        let storyKey = hu.key;

        // Crear HU si no existe
        if (!storyKey) {
            console.log(`\n📖 Creando ${hu.id}: ${hu.nombre}...`);
            const res = await jira.post('/issue', {
                fields: {
                    project: { key: 'PS' },
                    summary: `${hu.id}: ${hu.nombre}`,
                    description: `Como usuario, quiero ${hu.nombre.toLowerCase()} para mejorar la gestión de residuos.\n\n*Story Points (Poker Planning):* ${hu.points}\n\n*Criterios de Aceptación:* Ver subtareas para especificación técnica.`,
                    issuetype: { id: '10160' },
                    customfield_10016: hu.points
                }
            });
            storyKey = res.data.key;
            console.log(`   ✅ Creada: ${storyKey} (${hu.points} pts)`);
        } else {
            console.log(`\n📖 Actualizando ${hu.id}: ${hu.nombre} (${storyKey})...`);
        }

        // Asignar al Sprint 1
        const inSprint = await addToSprint(storyKey);
        console.log(`   ${inSprint ? '✅' : '⚠️ '} Sprint 1 asignado`);

        // Procesar subtareas existentes (CU1)
        if (hu.subtareas) {
            for (const subKey of hu.subtareas) {
                // Adjuntar prototipo al subtask de frontend
                if (subKey === 'PS-4') {
                    const imgPath = `${PROTO_PATH}/${hu.prototipo}`;
                    const attached = await attachImage(subKey, imgPath, hu.prototipo);
                    console.log(`   ${attached ? '📎' : '⚠️ '} Prototipo adjuntado a ${subKey}`);
                }
                // Marcar como listo
                const done = await markDone(subKey);
                console.log(`   ${done ? '✅' : '⚠️ '} ${subKey} marcado como Listo`);
            }
        }

        // Crear subtareas nuevas
        if (hu.subtareasNuevas) {
            let isFrontend = false;
            let frontendKey = null;

            for (const sub of hu.subtareasNuevas) {
                const subRes = await jira.post('/issue', {
                    fields: {
                        project: { key: 'PS' },
                        summary: sub.titulo,
                        description: sub.desc,
                        issuetype: { id: '10158' },
                        parent: { key: storyKey }
                    }
                });
                const subKey = subRes.data.key;

                // Guardar key del subtask frontend para adjuntar prototipo
                if (sub.titulo.toLowerCase().includes('frontend') || sub.titulo.toLowerCase().includes('ui')) {
                    frontendKey = subKey;
                }

                // Marcar como listo
                const done = await markDone(subKey);
                console.log(`   ${done ? '✅' : '⚠️ '} ${subKey}: ${sub.titulo}`);
            }

            // Adjuntar prototipo al subtask de frontend
            if (frontendKey && hu.prototipo) {
                const imgPath = `${PROTO_PATH}/${hu.prototipo}`;
                if (fs.existsSync(imgPath)) {
                    const attached = await attachImage(frontendKey, imgPath, hu.prototipo);
                    console.log(`   ${attached ? '📎' : '⚠️ '} Prototipo ${hu.prototipo} → ${frontendKey}`);
                }
            }
        }
    }

    console.log('\n\n✅ SPRINT 1 COMPLETO');
    console.log('📊 Resumen:');
    console.log('   - 6 Historias de Usuario (CU1-CU6)');
    console.log('   - Story Points asignados');
    console.log('   - 3 Subtareas por HU con descripción técnica');
    console.log('   - Prototipos adjuntados a subtareas Frontend');
    console.log('   - Subtareas marcadas como Listo');
    console.log(`\n🔗 Ver: https://unsaac-team-grupois.atlassian.net/jira/software/projects/PS/boards/102/backlog`);
})();
