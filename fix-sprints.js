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
        console.log('🗑️ Eliminando épics duplicados...\n');
        const epicsToDelete = ['SMR-33', 'SMR-34', 'SMR-35', 'SMR-36'];
        
        for (const epic of epicsToDelete) {
            try {
                await jira.delete(`/issue/${epic}`);
                console.log(`✅ ${epic} eliminado`);
            } catch (error) {
                console.log(`⚠️ ${epic}: ${error.response?.status}`);
            }
        }
        
        console.log('\n✅ Duplicados eliminados');
        console.log('\n📌 Ve a tu Jira Board y abre Sprint 1 manualmente:');
        console.log('https://unsaac-team-grupois.atlassian.net/jira/software/projects/SMR/boards/100');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
