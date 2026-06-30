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
        const res = await jira.get('/project/SMR');
        console.log('Tipos de issue disponibles:');
        res.data.issueTypes.forEach(t => {
            console.log(`- ${t.name} (id: ${t.id})`);
        });
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
})();
