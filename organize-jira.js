const axios = require('axios');

const jira = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/api/2',
    auth: {
        username: '150400@unsaac.edu.pe',
        password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
    },
    headers: { 'Content-Type': 'application/json' }
});

(async () => {
    try {
        console.log('📋 Obteniendo épicas...\n');
        const epics = await jira.get('/search?jql=project=SMR&type=Epic');
        epics.data.issues.forEach(e => {
            console.log(`- ${e.key}: ${e.fields.summary}`);
        });

        console.log('\n\n⏭️ Obteniendo sprints...\n');
        const board = await jira.get('/board?projectKeyOrId=SMR');
        const boardId = board.data.values[0]?.id;
        if (boardId) {
            const sprints = await jira.get(`/board/${boardId}/sprint`);
            sprints.data.values.forEach(s => {
                console.log(`- Sprint ${s.id}: ${s.name} (${s.state})`);
            });
        }

        console.log('\n\n📊 Obteniendo historias actuales...\n');
        const stories = await jira.get('/search?jql=project=SMR&type=Historia&maxResults=100');
        console.log(`Total historias: ${stories.data.issues.length}`);
        stories.data.issues.forEach(s => {
            console.log(`- ${s.key}: ${s.fields.summary}`);
        });

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
})();
