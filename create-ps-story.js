const axios = require('axios');
const jira = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/api/2',
    auth: { username: '150400@unsaac.edu.pe', password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106' }
});
const jiraAgile = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/agile/1.0',
    auth: { username: '150400@unsaac.edu.pe', password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106' }
});
(async () => {
    try {
        // 1. Crear Epic
        console.log('Creando Epic 1: Módulo Ciudadano...');
        const epic = await jira.post('/issue', {
            fields: {
                project: { key: 'PS' },
                summary: 'EP1: Módulo Ciudadano - Autenticación y Reportes',
                description: 'Epic para gestionar autenticación, registro y reportes de residuos del ciudadano.',
                issuetype: { id: '10157' }
            }
        });
        console.log(`✅ Epic: ${epic.data.key}`);

        // 2. Crear Historia
        console.log('Creando Historia CU1: Iniciar Sesión...');
        const historia = await jira.post('/issue', {
            fields: {
                project: { key: 'PS' },
                summary: 'CU1: Iniciar Sesión',
                description: 'Como ciudadano, quiero iniciar sesión con mi correo y contraseña para acceder a mi panel personal.\n\n*Especificación Técnica:*\nPOST /api/auth/login - Valida credenciales, genera JWT y retorna usuario + token.\n\n*Criterios de Aceptación:*\n- Login exitoso con credenciales válidas\n- Mensaje de error con credenciales inválidas\n- Token JWT generado correctamente\n- Redirección al dashboard según rol',
                issuetype: { id: '10160' }
            }
        });
        console.log(`✅ Historia: ${historia.data.key}`);

        // 3. Asignar al Sprint 1
        console.log('Asignando al Sprint 1 (207)...');
        await jiraAgile.post('/sprint/207/issue', { issues: [historia.data.key] });
        console.log('✅ Asignado al Sprint 1');

        console.log(`\n✅ Listo! Ver en: https://unsaac-team-grupois.atlassian.net/browse/${historia.data.key}`);
    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
})();
