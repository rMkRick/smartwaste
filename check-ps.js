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
        // Issue types
        const proj = await jira.get('/project/PS');
        console.log('Tipos disponibles:');
        proj.data.issueTypes.forEach(t => console.log(`- ${t.name} (${t.id})`));

        // Sprints
        console.log('\nSprints:');
        const sprints = await jiraAgile.get('/board/102/sprint');
        sprints.data.values.forEach(s => console.log(`- ${s.id}: ${s.name} (${s.state})`));

        // Epics
        console.log('\nEpics:');
        const epics = await jiraAgile.get('/board/102/epic');
        epics.data.values.forEach(e => console.log(`- ${e.key}: ${e.name}`));

    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
})();
