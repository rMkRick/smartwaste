const axios = require('axios');

const jira = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/agile/1.0',
    auth: {
        username: '150400@unsaac.edu.pe',
        password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
    }
});

(async () => {
    try {
        console.log('🔍 Buscando boards...\n');
        const boards = await jira.get('/board');
        const smrBoard = boards.data.values.find(b => b.name.includes('SMR') || b.projectKey === 'SMR');
        
        if (!smrBoard) {
            console.log('No board found');
            return;
        }

        console.log(`📌 Board: ${smrBoard.name} (id: ${smrBoard.id})\n`);

        console.log('📊 Sprints:\n');
        const sprints = await jira.get(`/board/${smrBoard.id}/sprint`);
        sprints.data.values.forEach(s => {
            console.log(`- ${s.id}: ${s.name} (${s.state})`);
        });

        console.log('\n\n📋 Historias en Backlog:\n');
        const backlog = await jira.get(`/board/${smrBoard.id}/backlog`);
        console.log(`Total en backlog: ${backlog.data.issues.length}`);
        backlog.data.issues.slice(0, 10).forEach(i => {
            console.log(`- ${i.key}: ${i.fields.summary}`);
        });

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
})();
