import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api'
});

export const login = (credenciales) => api.post('/auth/login', credenciales);
export const register = (datosUsuario) => api.post('/auth/register', datosUsuario);
export const createReport = (datosReporte) => api.post('/reports', datosReporte);
export const getReports = () => api.get('/reports');

export default api;
