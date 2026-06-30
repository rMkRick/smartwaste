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
        console.log('🔍 Verificando estado de sprints...\n');
        
        // Sprint 1
        console.log('Sprint 1 (201):');
        const s1 = await jira.get('/sprint/201/issue');
        console.log(`  Issues: ${s1.data.issues.length}`);
        s1.data.issues.forEach(i => console.log(`    - ${i.key}: ${i.fields.summary}`));

        // Sprint 2
        console.log('\nSprint 2 (202):');
        const s2 = await jira.get('/sprint/202/issue');
        console.log(`  Issues: ${s2.data.issues.length}`);
        
        // Backlog
        console.log('\nBacklog:');
        const board = await jira.get('/board?projectKeyOrId=SMR');
        const boardId = board.data.values[0]?.id;
        const backlog = await jira.get(`/board/${boardId}/backlog`);
        console.log(`  Total: ${backlog.data.issues.length}`);
        backlog.data.issues.slice(0, 15).forEach(i => {
            console.log(`    - ${i.key}: ${i.fields.summary}`);
        });
        
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
})();
