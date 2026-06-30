import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const login = (credenciales) => api.post('/auth/login', credenciales);
export const register = (datosUsuario) => api.post('/auth/register', datosUsuario);
export const loginSocial = (datos) => api.post('/auth/login-social', datos);
export const createReport = (datosReporte) => api.post('/reportes', datosReporte);
export const getReports = () => api.get('/reportes');

// Supervisor (CU17, CU20, CU21, CU22)
export const getSupervisorReportes = () => api.get('/supervisor/reportes');
export const getSupervisorParticipacion = () => api.get('/supervisor/participacion-ciudadana');
export const verIncidencia = (id) => api.get(`/supervisor/incidencias/${id}`);
export const responderReporte = (id, datos) => api.put(`/supervisor/incidencias/${id}/responder`, datos);

export default api;
