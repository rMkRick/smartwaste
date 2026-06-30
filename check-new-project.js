const axios = require('axios');

const jira = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/api/2',
    auth: {
        username: '150400@unsaac.edu.pe',
        password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
    }
});

(async () => {
    try {
        console.log('🔍 Verificando proyecto SMRTWSTC...\n');
        
        const project = await jira.get('/project/SMRTWSTC');
        console.log(`📌 Proyecto: ${project.data.name}`);
        console.log(`   Key: ${project.data.key}`);
        console.log(`   Tipo: ${project.data.projectTypeKey}`);
        console.log(`   Componentes: ${project.data.components?.length || 0}`);
        console.log(`   Versiones: ${project.data.versions?.length || 0}\n`);

        const issues = await jira.get('/search?jql=project=SMRTWSTC&maxResults=100');
        console.log(`📊 Issues actuales: ${issues.data.total}\n`);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
})();
