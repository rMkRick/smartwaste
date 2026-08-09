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

// Gestión de rutas (supervisor)
export const getRutasGestion = () => api.get('/supervisor/rutas-gestion');
export const getCamiones = () => api.get('/camiones');
export const actualizarCamion = (id, datos) => api.put(`/camiones/${id}`, datos);
export const cambiarEstadoCamion = (id, estado) => api.put(`/camiones/${id}/estado`, { estado });
export const asignarRuta = (datos) => api.post('/rutas/asignar', datos);
export const guardarWaypoints = (id, waypoints) => api.put(`/rutas/${id}/waypoints`, { waypoints });
export const getHorarios = () => api.get('/horarios');

// Operador (CU13, CU16)
export const getMiRuta = () => api.get('/rutas/mi-ruta');
export const actualizarGPSCamion = (id, datos) => api.put(`/camiones/${id}/gps`, datos);
export const getAsignacionesMes = (anio, mes) => api.get('/supervisor/asignaciones-mes', { params: { anio, mes } });

// Conductores (admin)
export const getConductores = () => api.get('/conductores');
export const crearConductor = (datos) => api.post('/conductores', datos);
export const actualizarConductor = (id, datos) => api.put(`/conductores/${id}`, datos);
export const cambiarEstadoConductor = (id, estado) => api.put(`/conductores/${id}/estado`, { estado });
export const eliminarConductor = (id) => api.delete(`/conductores/${id}`);

export default api;
