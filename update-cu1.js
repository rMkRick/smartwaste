const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const AUTH = {
    username: '150400@unsaac.edu.pe',
    password: 'ATATT3xFfGF0gr6baRgxHN4SwAO_JaTIzpyXVUKqlete0cmbiMv-GiezY-5Zje3T1bP06tvofttTHLeZqw_ZobV7X-Jnl53RpV64xIyGqtVDkmAA3okS9WF7tdjJEZVuOT2x4ccGhu8b4iv4zZ-tNdi3Ttfdn1_tqxKnynJ7zirE-WjQDHLKx9U=06E35106'
};

const jira = axios.create({
    baseURL: 'https://unsaac-team-grupois.atlassian.net/rest/api/2',
    auth: AUTH
});

// Contenido de archivos adjuntos por subtarea
const ATTACHMENTS = {
    'backend-login': {
        filename: 'backend-login-endpoint.txt',
        content: `BACKEND: Login Endpoint - SmartWaste Cusco
==========================================

Endpoint: POST /api/auth/login

Request Body:
{
  "correo": "ciudadano@smartwaste.com",
  "contrasena": "123456"
}

Response 200 OK:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": 1,
    "nombres": "Juan",
    "apellidos": "Quispe",
    "correo": "ciudadano@smartwaste.com",
    "rol": 1,
    "zona_id": 1
  }
}

Response 401 Unauthorized:
{
  "mensaje": "Credenciales inválidas"
}

Implementación:
- Buscar usuario por correo en BD
- Comparar contraseña con bcrypt.compare()
- Si válido: generar JWT con jwt.sign({ id, rol }, SECRET, { expiresIn: "24h" })
- Si inválido: retornar 401

Archivo: backend/src/controllers/authController.js
Middleware: backend/src/middleware/auth.js
`
    },
    'frontend-login': {
        filename: 'frontend-login-form.txt',
        content: `FRONTEND: Login Form - SmartWaste Cusco
========================================

Componente: src/pages/LoginPage.jsx

Estado manejado:
- correo (string)
- contrasena (string)
- error (string)
- loading (boolean)

Flujo:
1. Usuario ingresa correo y contraseña
2. onSubmit llama a api.login({ correo, contrasena })
3. Si éxito: guarda token en localStorage, redirige según rol
   - rol 1 → /citizen-dashboard
   - rol 2 → /operador-dashboard
   - rol 3 → /admin-dashboard
   - rol 4 → /supervisor-dashboard
4. Si error: muestra mensaje "Credenciales inválidas"

Servicio API:
- src/services/api.js → login(data)
- axios.post('/api/auth/login', data)

Validaciones frontend:
- Correo no vacío
- Contraseña no vacía
- Formato email válido
`
    },
    'testing-login': {
        filename: 'testing-e2e-login.txt',
        content: `TESTING: E2E Login - SmartWaste Cusco
======================================

Casos de prueba:

✅ TC01: Login exitoso ciudadano
   Input: ciudadano@smartwaste.com / 123456
   Expected: Token JWT, redirect /citizen-dashboard

✅ TC02: Login exitoso operador
   Input: operador@smartwaste.com / 123456
   Expected: Token JWT, redirect /operador-dashboard

✅ TC03: Login exitoso admin
   Input: admin@smartwaste.com / 123456
   Expected: Token JWT, redirect /admin-dashboard

✅ TC04: Login exitoso supervisor
   Input: supervisor@smartwaste.com / 123456
   Expected: Token JWT, redirect /supervisor-dashboard

❌ TC05: Contraseña incorrecta
   Input: ciudadano@smartwaste.com / wrongpass
   Expected: 401, "Credenciales inválidas"

❌ TC06: Usuario no existe
   Input: noexiste@smartwaste.com / 123456
   Expected: 401, "Credenciales inválidas"

❌ TC07: Campos vacíos
   Input: "" / ""
   Expected: Validación frontend, no envía request

Herramientas: Postman / Jest / Axios
`
    }
};

const SUBTAREAS = [
    {
        titulo: 'Backend: Login endpoint',
        desc: `Implementar POST /api/auth/login.
Validar correo/contraseña contra BD.
Generar JWT con jwt.sign().
Retornar usuario + token.
Archivo: authController.js`,
        attachKey: 'backend-login'
    },
    {
        titulo: 'Frontend: Login form',
        desc: `Formulario con email y password.
Llamar a api.login() al submit.
Guardar token en localStorage.
Redirigir por rol al dashboard correcto.
Archivo: LoginPage.jsx`,
        attachKey: 'frontend-login'
    },
    {
        titulo: 'Testing: E2E login',
        desc: `Probar los 4 roles con credenciales válidas.
Probar credenciales incorrectas (401).
Probar campos vacíos (validación frontend).
Verificar redirección correcta por rol.`,
        attachKey: 'testing-login'
    }
];

async function createTempFile(filename, content) {
    const filePath = path.join('C:\\Users\\ASUS\\AndroidStudioProjects\\smartwaste', filename);
    fs.writeFileSync(filePath, content, 'utf8');
    return filePath;
}

async function attachFile(issueKey, filePath, filename) {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath), { filename });

    const res = await axios.post(
        `https://unsaac-team-grupois.atlassian.net/rest/api/2/issue/${issueKey}/attachments`,
        form,
        {
            auth: AUTH,
            headers: {
                ...form.getHeaders(),
                'X-Atlassian-Token': 'no-check'
            }
        }
    );
    return res.data;
}

(async () => {
    try {
        const STORY_KEY = 'PS-2';
        console.log(`🔧 Actualizando ${STORY_KEY}: CU1 Iniciar Sesión\n`);

        // 1. Actualizar Story Points en la historia principal
        console.log('📊 Agregando Story Points (3)...');
        await jira.put(`/issue/${STORY_KEY}`, {
            fields: {
                customfield_10016: 3,
                description: `Como ciudadano, quiero iniciar sesión con mi correo y contraseña para acceder a mi panel personal.

*Epic:* EP1 - Módulo Ciudadano
*Story Points (Poker Planning):* 3 puntos
*Actor:* Ciudadano, Operador, Admin, Supervisor
*Prioridad:* Alta

*Criterios de Aceptación:*
- Login exitoso con credenciales válidas → Token JWT generado
- Redirección automática según rol del usuario
- Mensaje de error claro con credenciales inválidas
- Token almacenado en localStorage

*Endpoint:* POST /api/auth/login`
            }
        });
        console.log('✅ Historia actualizada\n');

        // 2. Crear subtareas + adjuntar archivos
        console.log('📋 Creando subtareas con descripciones técnicas y archivos...\n');
        for (const sub of SUBTAREAS) {
            // Crear subtarea
            const res = await jira.post('/issue', {
                fields: {
                    project: { key: 'PS' },
                    summary: sub.titulo,
                    description: sub.desc,
                    issuetype: { id: '10158' },
                    parent: { key: STORY_KEY }
                }
            });
            const subKey = res.data.key;
            console.log(`✅ Subtarea: ${subKey} - ${sub.titulo}`);

            // Crear archivo temporal
            const attach = ATTACHMENTS[sub.attachKey];
            const filePath = await createTempFile(attach.filename, attach.content);

            // Adjuntar archivo
            try {
                await attachFile(subKey, filePath, attach.filename);
                console.log(`   📎 Adjunto: ${attach.filename}`);
            } catch (e) {
                console.log(`   ⚠️  Error adjunto: ${e.response?.status}`);
            }

            // Limpiar archivo temporal
            fs.unlinkSync(filePath);
            console.log('');
        }

        console.log('\n✅ CU1 COMPLETO:');
        console.log(`   🔗 ${STORY_KEY}: https://unsaac-team-grupois.atlassian.net/browse/${STORY_KEY}`);
        console.log('   📊 Story Points: 3');
        console.log('   📋 3 subtareas con descripción técnica');
        console.log('   📎 3 archivos adjuntos (.txt con specs)');

    } catch (e) {
        console.error('Error:', e.response?.data || e.message);
    }
})();
