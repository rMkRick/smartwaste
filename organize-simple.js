const axios = require('axios');

const jira = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/agile/1.0',
    auth: {
        username: '150400@unsaac.edu.pe',
        password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
    }
});

const SPRINTS = {
    '201': 'Sprint 1: Auth & Reports',
    '202': 'Sprint 2: Operador & Admin',
    '203': 'Sprint 3: Supervisor & Stats',
    '204': 'Sprint 4: Testing & Deploy'
};

const SPRINT_DISTRIBUTION = {
    '201': ['SMR-37', 'SMR-38', 'SMR-39', 'SMR-40', 'SMR-41', 'SMR-42'], // CU1-6: Auth & reportes básicos
    '202': ['SMR-43', 'SMR-44', 'SMR-45', 'SMR-46', 'SMR-47', 'SMR-48'], // CU7-12: Operador & Admin
    '203': ['SMR-49', 'SMR-50', 'SMR-51', 'SMR-52', 'SMR-53', 'SMR-54'], // CU13-18: Operador & Supervisor
    '204': ['SMR-55', 'SMR-56', 'SMR-57', 'SMR-58'] // CU19-22: Supervisor stats
};

(async () => {
    try {
        console.log('📌 Organizando HU en sprints...\n');
        
        for (const [sprintId, issues] of Object.entries(SPRINT_DISTRIBUTION)) {
            console.log(`\n🏃 ${SPRINTS[sprintId]}`);
            
            for (const issueKey of issues) {
                try {
                    await jira.post(`/sprint/${sprintId}/issue`, { issues: [issueKey] });
                    console.log(`  ✅ ${issueKey} → Sprint ${sprintId}`);
                } catch (error) {
                    if (error.response?.status !== 400) {
                        console.log(`  ⚠️  ${issueKey}: ${error.response?.data?.errorMessages?.[0] || error.message}`);
                    }
                }
            }
        }
        
        console.log('\n✅ Sprints organizados correctamente');
        console.log('\n📊 Ver en: https://unsaac-team-grupois.atlassian.net/jira/software/projects/SMR/boards/100');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
