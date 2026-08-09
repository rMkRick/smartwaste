import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, BarChart3, AlertTriangle, CheckCircle,
    MessageSquare, Eye, Send, Users, RefreshCw, X, Clock,
    Truck, MapPin, Route, Calendar, UserX, UserCheck
} from 'lucide-react';
import {
    getSupervisorReportes, getSupervisorParticipacion, responderReporte,
    getRutasGestion, getCamiones, cambiarEstadoCamion, asignarRuta, guardarWaypoints,
    getHorarios, getAsignacionesMes, getConductores, cambiarEstadoConductor
} from '../services/api';
import MapaRuta from '../components/MapaRuta';
import CalendarioPlanificacion from '../components/CalendarioPlanificacion';
import { trazarPorCalles } from '../services/osrm';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const DIAS_ORDEN = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Franjas horarias permitidas al asignar una ruta (turnos de 3 horas). El Centro
// Histórico solo recoge de noche (para no afectar el turismo); el resto es diurno.
// Al terminar la hora_fin de su turno, el camión y el conductor vuelven solos a
// "disponible"/"activo" (se calcula en el backend, no hace falta revertirlo a mano).
const SLOTS_HORARIO = [
    { inicio: '09:00', fin: '12:00', label: '9:00 a. m. – 12:00 p. m.' },
    { inicio: '10:00', fin: '13:00', label: '10:00 a. m. – 1:00 p. m.' },
    { inicio: '14:00', fin: '17:00', label: '2:00 p. m. – 5:00 p. m.' },
    { inicio: '15:00', fin: '18:00', label: '3:00 p. m. – 6:00 p. m.' },
];
const SLOT_CENTRO_HISTORICO = { inicio: '20:00', fin: '23:00', label: '8:00 p. m. – 11:00 p. m.' };

const slotsDisponibles = (ruta) =>
    ruta?.zona_nombre === 'Centro Histórico' ? [SLOT_CENTRO_HISTORICO] : SLOTS_HORARIO;

const ESTADO_COLOR = {
    enviado:    '#f97316',
    leido:      '#eab308',
    en_proceso: '#3b82f6',
    completado: '#22c55e',
    rechazado:  '#ef4444',
    disponible: '#22c55e',
    en_ruta:    '#3b82f6',
    mantenimiento: '#eab308',
    de_baja:    '#ef4444',
    activo:     '#22c55e',
    inactivo:   '#ef4444',
    suspendido: '#eab308',
};

const ESTADO_LABEL = {
    enviado:    'Enviado',
    leido:      'Leído',
    en_proceso: 'En Proceso',
    completado: 'Completado',
    rechazado:  'Rechazado',
    disponible: 'Disponible',
    en_ruta:    'En Ruta',
    mantenimiento: 'Mantenimiento',
    de_baja:    'Dado de baja',
    activo:     'Activo',
    inactivo:   'Inactivo',
    suspendido: 'Suspendido',
};

const colors = {
    primary:   '#f97316',
    secondary: '#0f172a',
    text:      '#334155',
    lightBg:   '#f8fafc',
    white:     '#ffffff',
    success:   '#22c55e',
    warning:   '#eab308',
    danger:    '#ef4444',
};

const Badge = ({ estado }) => (
    <span style={{
        backgroundColor: ESTADO_COLOR[estado] || '#94a3b8',
        color: 'white',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: '700',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
    }}>
        {ESTADO_LABEL[estado] || estado}
    </span>
);

export default function SupervisorDashboard() {
    const navigate = useNavigate();
    const [usuario, setUsuario]               = useState(null);
    const [tab, setTab]                       = useState('reportes');
    const [reportes, setReportes]             = useState([]);
    const [participacion, setParticipacion]   = useState(null);
    const [filtro, setFiltro]                 = useState('todos');
    const [selected, setSelected]             = useState(null);
    const [respuesta, setRespuesta]           = useState('');
    const [nuevoEstado, setNuevoEstado]       = useState('en_proceso');
    const [cargando, setCargando]             = useState(true);
    const [enviando, setEnviando]             = useState(false);

    // Gestión de rutas
    const [rutas, setRutas]                   = useState([]);
    const [camiones, setCamiones]             = useState([]);
    const [cargandoRutas, setCargandoRutas]   = useState(false);
    const [rutaSeleccionada, setRutaSeleccionada] = useState(null);
    const [camionId, setCamionId]             = useState('');
    const [operadorId, setOperadorId]         = useState('');
    const [horaSeleccionada, setHoraSeleccionada] = useState('');
    const [fechaAsignacion, setFechaAsignacion] = useState(new Date().toISOString().split('T')[0]);
    const [asignando, setAsignando]           = useState(false);
    const [modoPanel, setModoPanel]           = useState('asignar'); // 'asignar' | 'editar'
    const [waypointsEdit, setWaypointsEdit]   = useState([]);
    const [guardando, setGuardando]           = useState(false);
    const [horarios, setHorarios]             = useState([]);
    const [asignacionesMes, setAsignacionesMes] = useState([]);
    const [mostrarCalendario, setMostrarCalendario] = useState(false);
    const [trazandoCalles, setTrazandoCalles] = useState(false);

    // Camiones y conductores
    const [cargandoCamiones, setCargandoCamiones] = useState(false);
    const [conductores, setConductores]       = useState([]);
    const [cargandoConductores, setCargandoConductores] = useState(false);

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        if (!userStr) { navigate('/'); return; }
        const u = JSON.parse(userStr);
        if (u.rol !== 4) { navigate('/'); return; }
        setUsuario(u);
    }, [navigate]);

    const cargarReportes = useCallback(async () => {
        setCargando(true);
        try {
            const { data } = await getSupervisorReportes();
            setReportes(data);
        } catch {
            alert('Error al cargar reportes');
        } finally {
            setCargando(false);
        }
    }, []);

    const cargarParticipacion = useCallback(async () => {
        try {
            const { data } = await getSupervisorParticipacion();
            setParticipacion(data);
        } catch {
            alert('Error al cargar participación ciudadana');
        }
    }, []);

    useEffect(() => { cargarReportes(); }, [cargarReportes]);

    useEffect(() => {
        if (tab === 'participacion') cargarParticipacion();
        if (tab === 'rutas' || tab === 'horarios') cargarRutas();
        if (tab === 'camiones') cargarCamiones();
        if (tab === 'conductores') cargarConductores();
    }, [tab, cargarParticipacion]);

    const cargarCamiones = useCallback(async () => {
        setCargandoCamiones(true);
        try {
            const { data } = await getCamiones();
            setCamiones(data);
        } catch {
            alert('Error al cargar camiones');
        } finally {
            setCargandoCamiones(false);
        }
    }, []);

    const cargarConductores = useCallback(async () => {
        setCargandoConductores(true);
        try {
            const { data } = await getConductores();
            setConductores(data);
        } catch {
            alert('Error al cargar conductores');
        } finally {
            setCargandoConductores(false);
        }
    }, []);

    const handleCambiarEstadoCamion = async (cam, estado) => {
        try {
            await cambiarEstadoCamion(cam.id, estado);
            setCamiones(prev => prev.map(c => c.id === cam.id ? { ...c, estado } : c));
        } catch {
            alert('Error al cambiar el estado del camión');
        }
    };

    const handleCambiarEstadoConductor = async (c) => {
        const nuevoEstado = c.conductor_estado === 'activo' ? 'inactivo' : 'activo';
        const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Deseas ${accion} a ${c.nombres} ${c.apellidos}?`)) return;
        try {
            await cambiarEstadoConductor(c.id, nuevoEstado);
            cargarConductores();
        } catch {
            alert('Error al cambiar el estado del conductor');
        }
    };

    const cargarRutas = useCallback(async () => {
        setCargandoRutas(true);
        try {
            const hoy = new Date();
            const [rutasRes, camionesRes, horariosRes, asignacionesRes, conductoresRes] = await Promise.all([
                getRutasGestion(), getCamiones(), getHorarios(),
                getAsignacionesMes(hoy.getFullYear(), hoy.getMonth() + 1),
                getConductores(),
            ]);
            setRutas(rutasRes.data);
            setCamiones(camionesRes.data);
            setHorarios(horariosRes.data);
            setAsignacionesMes(asignacionesRes.data.asignaciones);
            setConductores(conductoresRes.data);
        } catch {
            alert('Error al cargar rutas');
        } finally {
            setCargandoRutas(false);
        }
    }, []);

    // Día de la semana (formato horarios) correspondiente a una fecha 'YYYY-MM-DD'
    const diaSemanaDeFecha = (fecha) => DIAS_SEMANA[new Date(`${fecha}T00:00:00`).getDay()];

    // Abre el modal de asignación con el conductor y el horario por defecto
    // (el que corresponde a esta ruta según "Horarios"), pero ambos editables.
    const abrirAsignar = (ruta) => {
        const fecha = new Date().toISOString().split('T')[0];
        const dia = diaSemanaDeFecha(fecha);
        const horarioRuta = horarios.find(h => h.ruta_id === ruta.id && h.dia_semana === dia);
        const slots = slotsDisponibles(ruta);
        const slotPorDefecto = (horarioRuta &&
            slots.find(s => s.inicio === String(horarioRuta.hora_inicio).slice(0, 5))) || slots[0];

        setTab('rutas');
        setRutaSeleccionada(ruta);
        setModoPanel('asignar');
        setCamionId('');
        setOperadorId('');
        setFechaAsignacion(fecha);
        setHoraSeleccionada(`${slotPorDefecto.inicio}-${slotPorDefecto.fin}`);
    };

    // Días hasta el próximo recojo programado de una ruta (0 = hoy)
    const diasHastaProximo = useCallback((rutaId) => {
        const diasRuta = horarios.filter(h => h.ruta_id === rutaId).map(h => DIAS_SEMANA.indexOf(h.dia_semana));
        if (!diasRuta.length) return 99;
        const hoyIdx = new Date().getDay();
        return Math.min(...diasRuta.map(d => (d - hoyIdx + 7) % 7));
    }, [horarios]);

    const rutasOrdenadas = useMemo(() => {
        return [...rutas].sort((a, b) => {
            const aAsignada = !!a.camion_id, bAsignada = !!b.camion_id;
            if (aAsignada !== bAsignada) return aAsignada ? 1 : -1; // asignadas al final
            return diasHastaProximo(a.id) - diasHastaProximo(b.id);
        });
    }, [rutas, diasHastaProximo]);

    const handleGuardarWaypoints = async () => {
        setGuardando(true);
        try {
            await guardarWaypoints(rutaSeleccionada.id, waypointsEdit);
            setRutas(prev => prev.map(r =>
                r.id === rutaSeleccionada.id ? { ...r, waypoints: waypointsEdit } : r
            ));
            setRutaSeleccionada(null);
        } catch {
            alert('Error al guardar la ruta');
        } finally {
            setGuardando(false);
        }
    };

    const handleAutotrazar = async () => {
        const principales = waypointsEdit.filter(p => p.tipo !== 'curva');
        if (principales.length < 2) {
            alert('Necesitas al menos 2 puntos principales en la ruta para trazar por calles');
            return;
        }
        setTrazandoCalles(true);
        try {
            const trazado = await trazarPorCalles(principales);
            setWaypointsEdit(trazado);
        } catch (err) {
            alert('No se pudo trazar por calles: ' + (err.message || 'error desconocido'));
        } finally {
            setTrazandoCalles(false);
        }
    };

    const handleAsignar = async () => {
        if (!camionId) { alert('Selecciona un camión'); return; }
        if (!operadorId) { alert('Selecciona un conductor'); return; }
        if (!horaSeleccionada) { alert('Selecciona un horario'); return; }
        const [hora_inicio, hora_fin] = horaSeleccionada.split('-');
        setAsignando(true);
        try {
            await asignarRuta({
                camion_id: camionId,
                ruta_id: rutaSeleccionada.id,
                operador_id: operadorId,
                fecha_asignacion: fechaAsignacion,
                hora_inicio,
                hora_fin,
            });
            setRutaSeleccionada(null);
            setCamionId('');
            setOperadorId('');
            setHoraSeleccionada('');
            cargarRutas();
        } catch {
            alert('Error al asignar el camión');
        } finally {
            setAsignando(false);
        }
    };

    const abrirReporte = (rep) => {
        setSelected(rep);
        setRespuesta(rep.respuesta_supervisor || '');
        setNuevoEstado(rep.estado === 'enviado' || rep.estado === 'leido' ? 'en_proceso' : rep.estado);
    };

    const handleResponder = async () => {
        if (!respuesta.trim()) { alert('La respuesta no puede estar vacía'); return; }
        setEnviando(true);
        try {
            await responderReporte(selected.id, { respuesta_supervisor: respuesta, estado: nuevoEstado });
            setSelected(null);
            setRespuesta('');
            cargarReportes();
        } catch {
            alert('Error al responder el reporte');
        } finally {
            setEnviando(false);
        }
    };

    const handleCompletar = async (rep, e) => {
        e.stopPropagation();
        if (!window.confirm(`¿Marcar ${rep.numero_ticket} como completado?`)) return;
        try {
            await responderReporte(rep.id, {
                respuesta_supervisor: rep.respuesta_supervisor || 'Incidencia atendida y resuelta.',
                estado: 'completado',
            });
            cargarReportes();
        } catch {
            alert('Error al actualizar el reporte');
        }
    };

    const reportesFiltrados = (filtro === 'todos' ? reportes : reportes.filter(r => r.estado === filtro))
        .slice()
        .sort((a, b) => (a.estado === 'completado') - (b.estado === 'completado'));

    const kpis = {
        total:      reportes.length,
        pendientes: reportes.filter(r => r.estado === 'enviado').length,
        enProceso:  reportes.filter(r => r.estado === 'en_proceso').length,
        completados: reportes.filter(r => r.estado === 'completado').length,
    };

    const tabBtn = (key, icon, label) => (
        <button
            key={key}
            onClick={() => setTab(key)}
            style={{
                padding: '12px 20px',
                backgroundColor: tab === key ? colors.primary : 'transparent',
                color: tab === key ? 'white' : colors.text,
                border: 'none', borderRadius: '8px',
                fontWeight: '700', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '8px',
                whiteSpace: 'nowrap', fontSize: '14px',
            }}
        >
            {icon} {label}
        </button>
    );

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            {/* Navbar */}
            <nav style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '20px 8%', backgroundColor: colors.secondary,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800', fontSize: '22px', color: 'white' }}>
                    <div style={{ backgroundColor: colors.primary, padding: '8px 12px', borderRadius: '8px' }}>
                        <BarChart3 size={24} />
                    </div>
                    SUPERVISOR MUNICIPAL
                </div>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <div style={{ color: 'white', textAlign: 'right' }}>
                        <p style={{ margin: '0 0 2px 0', fontWeight: '700' }}>{usuario?.nombres || 'Supervisor'}</p>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.6 }}>Supervisor Municipal</p>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); navigate('/'); }}
                        style={{ backgroundColor: colors.primary, color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </nav>

            <main style={{ padding: '40px 8%' }}>
                {/* KPIs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                    {[
                        { label: 'Total Reportes',  val: kpis.total,       color: colors.primary,  icon: <AlertTriangle size={20} /> },
                        { label: 'Pendientes',       val: kpis.pendientes,  color: colors.danger,   icon: <Clock size={20} /> },
                        { label: 'En Proceso',       val: kpis.enProceso,   color: '#3b82f6',       icon: <RefreshCw size={20} /> },
                        { label: 'Completados',      val: kpis.completados, color: colors.success,  icon: <CheckCircle size={20} /> },
                    ].map(({ label, val, color, icon }) => (
                        <div key={label} style={{ backgroundColor: colors.white, padding: '22px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderTop: `5px solid ${color}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>{label}</p>
                                <span style={{ color }}>{icon}</span>
                            </div>
                            <p style={{ margin: 0, fontSize: '30px', fontWeight: '800', color: colors.secondary }}>{val}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: `2px solid #e2e8f0`, paddingBottom: '15px', overflowX: 'auto' }}>
                    {tabBtn('reportes',      <AlertTriangle size={16} />,  'Reportes Ciudadanos')}
                    {tabBtn('rutas',         <Route size={16} />,           'Gestión de Rutas')}
                    {tabBtn('horarios',      <Clock size={16} />,           'Horarios')}
                    {tabBtn('camiones',      <Truck size={16} />,           'Camiones')}
                    {tabBtn('conductores',   <Users size={16} />,           'Conductores')}
                    {tabBtn('participacion', <Users size={16} />,           'Verificación Ciudadana')}
                </div>

                {/* ── TAB: REPORTES ── */}
                {tab === 'reportes' && !selected && (
                    <div>
                        {/* Filtros */}
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                            {['todos', 'enviado', 'leido', 'en_proceso', 'completado'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFiltro(f)}
                                    style={{
                                        padding: '7px 16px', borderRadius: '20px', border: 'none',
                                        fontWeight: '700', fontSize: '12px', cursor: 'pointer',
                                        backgroundColor: filtro === f ? (ESTADO_COLOR[f] || colors.secondary) : '#e2e8f0',
                                        color: filtro === f ? 'white' : colors.text,
                                    }}
                                >
                                    {f === 'todos' ? 'Todos' : ESTADO_LABEL[f]}
                                    {f !== 'todos' && (
                                        <span style={{ marginLeft: '6px', backgroundColor: 'rgba(255,255,255,0.3)', padding: '1px 6px', borderRadius: '10px' }}>
                                            {reportes.filter(r => r.estado === f).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={cargarReportes}
                                style={{ marginLeft: 'auto', padding: '7px 14px', border: 'none', borderRadius: '8px', backgroundColor: colors.lightBg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: colors.text }}
                            >
                                <RefreshCw size={14} /> Actualizar
                            </button>
                        </div>

                        {cargando ? (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Cargando reportes...</p>
                        ) : reportesFiltrados.length === 0 ? (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No hay reportes con este filtro.</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                                {reportesFiltrados.map(rep => (
                                    <div key={rep.id} style={{
                                        backgroundColor: colors.white, padding: '22px', borderRadius: '12px',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                        borderLeft: `5px solid ${ESTADO_COLOR[rep.estado] || '#94a3b8'}`,
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                                            <div>
                                                <p style={{ margin: '0 0 3px 0', fontWeight: '800', fontSize: '14px', color: colors.secondary }}>
                                                    {rep.numero_ticket}
                                                </p>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                                                    {new Date(rep.fecha_creacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </p>
                                            </div>
                                            <Badge estado={rep.estado} />
                                        </div>

                                        <div style={{ marginBottom: '10px' }}>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: colors.text }}>
                                                <strong>Ciudadano:</strong> {rep.nombres} {rep.apellidos}
                                            </p>
                                            <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: colors.text }}>
                                                <strong>Tipo:</strong> {rep.tipo_residuo}
                                            </p>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                                                {rep.descripcion?.length > 80 ? rep.descripcion.slice(0, 80) + '…' : rep.descripcion}
                                            </p>
                                        </div>

                                        {rep.respuesta_supervisor && (
                                            <div style={{ backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', marginBottom: '10px', borderLeft: `3px solid ${colors.success}` }}>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#166534' }}>
                                                    <strong>Respuesta:</strong> {rep.respuesta_supervisor?.length > 60 ? rep.respuesta_supervisor.slice(0, 60) + '…' : rep.respuesta_supervisor}
                                                </p>
                                            </div>
                                        )}

                                        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                            <button
                                                onClick={() => abrirReporte(rep)}
                                                style={{ flex: 1, padding: '9px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                            >
                                                <MessageSquare size={14} /> {rep.respuesta_supervisor ? 'Ver / Editar' : 'Responder'}
                                            </button>
                                            {rep.estado !== 'completado' && (
                                                <button
                                                    onClick={(e) => handleCompletar(rep, e)}
                                                    style={{ flex: 1, padding: '9px', backgroundColor: colors.success, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                                                >
                                                    <CheckCircle size={14} /> Completar
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── PANEL RESPONDER ── */}
                {tab === 'reportes' && selected && (
                    <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxWidth: '700px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>
                                Gestionar Reporte — {selected.numero_ticket}
                            </h2>
                            <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={22} />
                            </button>
                        </div>

                        <div style={{ backgroundColor: colors.lightBg, padding: '18px', borderRadius: '10px', marginBottom: '22px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                                <p style={{ margin: 0, fontSize: '13px' }}><strong>Ciudadano:</strong> {selected.nombres} {selected.apellidos}</p>
                                <p style={{ margin: 0, fontSize: '13px' }}><strong>Correo:</strong> {selected.correo}</p>
                                <p style={{ margin: 0, fontSize: '13px' }}><strong>Tipo:</strong> {selected.tipo_residuo}</p>
                                <p style={{ margin: 0, fontSize: '13px' }}><strong>Estado actual:</strong> <Badge estado={selected.estado} /></p>
                            </div>
                            <p style={{ margin: '8px 0 0 0', fontSize: '13px' }}><strong>Descripción:</strong> {selected.descripcion}</p>
                            {selected.foto_url && selected.foto_url !== 'https://via.placeholder.com/300' && (
                                <img src={selected.foto_url} alt="Evidencia" style={{ marginTop: '12px', width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }} />
                            )}
                            {selected.latitud && (
                                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                    Coordenadas: {parseFloat(selected.latitud).toFixed(4)}, {parseFloat(selected.longitud).toFixed(4)}
                                </p>
                            )}
                        </div>

                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: colors.secondary }}>
                                Cambiar estado
                            </label>
                            <select
                                value={nuevoEstado}
                                onChange={e => setNuevoEstado(e.target.value)}
                                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', fontWeight: '600' }}
                            >
                                <option value="en_proceso">En Proceso</option>
                                <option value="completado">Completado</option>
                                <option value="rechazado">Rechazado</option>
                            </select>
                        </div>

                        <div style={{ marginBottom: '18px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: colors.secondary }}>
                                Respuesta al ciudadano <span style={{ color: colors.danger }}>*</span>
                            </label>
                            <textarea
                                rows={5}
                                value={respuesta}
                                onChange={e => setRespuesta(e.target.value)}
                                placeholder="Escribe la respuesta que recibirá el ciudadano por notificación..."
                                style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                            />
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                                El ciudadano recibirá esta respuesta como notificación interna.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={handleResponder}
                                disabled={enviando}
                                style={{ flex: 1, padding: '13px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '15px', cursor: enviando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                            >
                                <Send size={16} /> {enviando ? 'Enviando...' : 'Enviar Respuesta'}
                            </button>
                            <button
                                onClick={() => setSelected(null)}
                                style={{ padding: '13px 22px', backgroundColor: '#e2e8f0', color: colors.text, border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* ── TAB: GESTIÓN DE RUTAS ── */}
                {tab === 'rutas' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>Rutas del Distrito de Cusco</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                    {rutas.filter(r => r.camion_id).length} de {rutas.length} rutas con camión asignado hoy
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={() => setMostrarCalendario(true)} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: 'rgba(249,115,22,0.1)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: colors.primary }}>
                                    <Calendar size={14} /> Planificación del Mes
                                </button>
                                <button onClick={cargarRutas} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: colors.lightBg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: colors.text }}>
                                    <RefreshCw size={14} /> Actualizar
                                </button>
                            </div>
                        </div>

                        {cargandoRutas ? (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Cargando rutas...</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
                                {rutasOrdenadas.map(ruta => {
                                    const asignada = !!ruta.camion_id;
                                    return (
                                        <div key={ruta.id} style={{
                                            backgroundColor: colors.white,
                                            borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                            borderTop: `5px solid ${asignada ? colors.success : '#cbd5e1'}`,
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{ padding: '18px 20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ backgroundColor: asignada ? 'rgba(34,197,94,0.1)' : 'rgba(203,213,225,0.3)', padding: '8px', borderRadius: '8px' }}>
                                                            <MapPin size={16} color={asignada ? colors.success : '#94a3b8'} />
                                                        </div>
                                                        <div>
                                                            <p style={{ margin: 0, fontWeight: '800', fontSize: '14px', color: colors.secondary }}>{ruta.nombre}</p>
                                                            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{ruta.zona_nombre}</p>
                                                        </div>
                                                    </div>
                                                    <span style={{
                                                        backgroundColor: asignada ? 'rgba(34,197,94,0.1)' : 'rgba(203,213,225,0.2)',
                                                        color: asignada ? colors.success : '#94a3b8',
                                                        padding: '4px 10px', borderRadius: '20px',
                                                        fontSize: '11px', fontWeight: '700',
                                                    }}>
                                                        {asignada ? 'ASIGNADA' : 'LIBRE'}
                                                    </span>
                                                </div>

                                                <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b', lineHeight: '1.5' }}>
                                                    {ruta.descripcion}
                                                </p>

                                                {asignada ? (
                                                    <div style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: '8px', padding: '12px', marginBottom: '14px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                            <Truck size={14} color={colors.success} />
                                                            <span style={{ fontWeight: '700', fontSize: '13px', color: colors.secondary }}>{ruta.placa}</span>
                                                            <span style={{ fontSize: '12px', color: '#64748b' }}>— {ruta.modelo}</span>
                                                        </div>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                            <Calendar size={12} color='#64748b' />
                                                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                                {new Date(ruta.fecha_asignacion).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                            {ruta.hora_inicio && ruta.hora_fin && (
                                                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                                    · {String(ruta.hora_inicio).slice(0, 5)}–{String(ruta.hora_fin).slice(0, 5)}
                                                                </span>
                                                            )}
                                                            <span style={{
                                                                marginLeft: '6px',
                                                                backgroundColor: ruta.asignacion_estado === 'en_proceso' ? 'rgba(59,130,246,0.1)' : 'rgba(234,179,8,0.1)',
                                                                color: ruta.asignacion_estado === 'en_proceso' ? '#3b82f6' : colors.warning,
                                                                padding: '2px 7px', borderRadius: '10px',
                                                                fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
                                                            }}>
                                                                {ruta.asignacion_estado === 'en_proceso' ? 'En Ruta' : 'Pendiente'}
                                                            </span>
                                                        </div>
                                                        {ruta.operador_nombres && (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                                                                <Users size={12} color='#64748b' />
                                                                <span style={{ fontSize: '11px', color: '#64748b' }}>
                                                                    {ruta.operador_nombres} {ruta.operador_apellidos}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div style={{ backgroundColor: '#fafafa', border: '1px dashed #cbd5e1', borderRadius: '8px', padding: '10px', marginBottom: '14px', textAlign: 'center' }}>
                                                        <Truck size={18} color='#cbd5e1' style={{ marginBottom: '4px' }} />
                                                        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Sin camión asignado hoy</p>
                                                    </div>
                                                )}

                                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        onClick={() => abrirAsignar(ruta)}
                                                        style={{ flex: 1, padding: '9px', backgroundColor: asignada ? '#f1f5f9' : colors.primary, color: asignada ? colors.text : 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                                    >
                                                        <Truck size={13} /> {asignada ? 'Reasignar' : 'Asignar'}
                                                    </button>
                                                    <button
                                                        onClick={() => { setRutaSeleccionada(ruta); setModoPanel('editar'); setWaypointsEdit(ruta.waypoints || []); }}
                                                        style={{ flex: 1, padding: '9px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}
                                                    >
                                                        <MapPin size={13} /> Ver / Editar Ruta
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Modal rutas: asignar camión O editar trazado */}
                        {rutaSeleccionada && (
                            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
                                <div style={{ backgroundColor: colors.white, borderRadius: '16px', width: '100%', maxWidth: modoPanel === 'editar' ? '820px' : '500px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)' }}>

                                    {/* Header */}
                                    <div style={{ padding: '22px 28px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: '800', color: colors.secondary }}>{rutaSeleccionada.nombre}</h3>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{rutaSeleccionada.zona_nombre} — {rutaSeleccionada.descripcion}</p>
                                        </div>
                                        <button onClick={() => setRutaSeleccionada(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', marginLeft: '12px' }}>
                                            <X size={22} />
                                        </button>
                                    </div>

                                    {/* Tabs del modal */}
                                    <div style={{ display: 'flex', gap: '0', padding: '16px 28px 0', borderBottom: '2px solid #f1f5f9', marginTop: '16px' }}>
                                        {[['asignar', '🚛 Asignar Camión'], ['editar', '🗺️ Ver / Editar Ruta']].map(([key, label]) => (
                                            <button key={key} onClick={() => setModoPanel(key)} style={{ padding: '10px 20px', border: 'none', background: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer', color: modoPanel === key ? colors.primary : '#94a3b8', borderBottom: modoPanel === key ? `3px solid ${colors.primary}` : '3px solid transparent', marginBottom: '-2px' }}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>

                                    <div style={{ padding: '24px 28px 28px' }}>

                                        {/* ── PANEL ASIGNAR ── */}
                                        {modoPanel === 'asignar' && (
                                            <div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: colors.secondary }}>
                                                        Camión Recolector
                                                    </label>
                                                    <select value={camionId} onChange={e => setCamionId(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}>
                                                        <option value="">— Selecciona un camión —</option>
                                                        {camiones.map(c => (
                                                            <option key={c.id} value={c.id} disabled={c.estado === 'mantenimiento' || c.estado === 'de_baja'}>
                                                                {c.placa} · {c.modelo} · {Number(c.capacidad_kg).toLocaleString()} kg
                                                                {c.estado === 'mantenimiento' ? ' ✗ mantenimiento' : c.estado === 'de_baja' ? ' ✗ dado de baja' : c.estado === 'en_ruta' ? ' · en ruta' : ' ✓ disponible'}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: colors.secondary }}>
                                                        Conductor
                                                    </label>
                                                    <select value={operadorId} onChange={e => setOperadorId(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}>
                                                        <option value="">— Selecciona un conductor —</option>
                                                        {conductores.filter(c => c.conductor_estado === 'activo' && c.usuario_estado === 'activo').map(c => (
                                                            <option key={c.usuario_id} value={c.usuario_id}>
                                                                {c.nombres} {c.apellidos}{c.ruta_actual ? ` · ya en ${c.ruta_actual} hoy` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ marginBottom: '16px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: colors.secondary }}>
                                                        Horario
                                                    </label>
                                                    <select value={horaSeleccionada} onChange={e => setHoraSeleccionada(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', backgroundColor: 'white' }}>
                                                        {slotsDisponibles(rutaSeleccionada).map(s => (
                                                            <option key={s.inicio} value={`${s.inicio}-${s.fin}`}>{s.label}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div style={{ marginBottom: '24px' }}>
                                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: colors.secondary }}>
                                                        Fecha de Asignación
                                                    </label>
                                                    <input type="date" value={fechaAsignacion} onChange={e => setFechaAsignacion(e.target.value)} style={{ width: '100%', padding: '11px 12px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} />
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={handleAsignar} disabled={asignando} style={{ flex: 1, padding: '13px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '15px', cursor: asignando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <Truck size={16} /> {asignando ? 'Asignando...' : 'Confirmar Asignación'}
                                                    </button>
                                                    <button onClick={() => setRutaSeleccionada(null)} style={{ padding: '13px 20px', backgroundColor: '#e2e8f0', color: colors.text, border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                                                        Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* ── PANEL EDITAR RUTA EN MAPA ── */}
                                        {modoPanel === 'editar' && (
                                            <div>
                                                <div style={{ marginBottom: '12px', padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '8px', border: '1px solid #93c5fd', fontSize: '13px', color: '#1e40af', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                                                    <span><strong>Recomendado:</strong> deja solo los puntos principales (inicio, paradas clave, fin) y usa este botón para trazar automáticamente el camino real por las calles entre ellos.</span>
                                                    <button onClick={handleAutotrazar} disabled={trazandoCalles} style={{ padding: '9px 16px', backgroundColor: trazandoCalles ? '#93c5fd' : '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '13px', cursor: trazandoCalles ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <Route size={14} /> {trazandoCalles ? 'Trazando...' : 'Trazar por calles'}
                                                    </button>
                                                </div>

                                                <div style={{ marginBottom: '12px', padding: '12px 16px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fcd34d', fontSize: '13px', color: '#92400e' }}>
                                                    <strong>Modo edición manual:</strong> Haz clic <u>sobre la línea</u> para insertar un punto de curva (pequeño, sin número) y ajustar a mano. Haz clic fuera de la línea para agregar un punto principal (numerado) al final. Arrastra cualquier punto para ajustar. Clic derecho para eliminarlo.
                                                </div>

                                                <MapaRuta
                                                    key={rutaSeleccionada.id + '-edit'}
                                                    waypoints={waypointsEdit}
                                                    editable={true}
                                                    onChange={setWaypointsEdit}
                                                    height="420px"
                                                />

                                                {/* Lista de puntos principales (los de curva no se listan, solo dan forma a la línea) */}
                                                {waypointsEdit.length > 0 && (() => {
                                                    const principales = waypointsEdit
                                                        .map((pt, i) => ({ pt, i }))
                                                        .filter(({ pt }) => pt.tipo !== 'curva');
                                                    const curvas = waypointsEdit.length - principales.length;
                                                    return (
                                                        <div style={{ marginTop: '16px' }}>
                                                            <p style={{ margin: '0 0 8px 0', fontWeight: '700', fontSize: '13px', color: colors.secondary }}>
                                                                Puntos de la ruta ({principales.length})
                                                                {curvas > 0 && <span style={{ fontWeight: '500', color: '#94a3b8' }}> · {curvas} de curva (ocultos)</span>}
                                                            </p>
                                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                                                {principales.map(({ pt, i }, n) => (
                                                                    <span key={i} style={{ backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', color: colors.text, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                        <span style={{ fontWeight: '800', color: colors.primary }}>{n + 1}</span> {pt.label}
                                                                        <button onClick={() => setWaypointsEdit(w => w.filter((_, idx) => idx !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: '0 0 0 4px', fontSize: '14px', lineHeight: 1 }}>×</button>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    );
                                                })()}

                                                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                                    <button onClick={handleGuardarWaypoints} disabled={guardando} style={{ flex: 1, padding: '13px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '800', fontSize: '15px', cursor: guardando ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <MapPin size={16} /> {guardando ? 'Guardando...' : 'Guardar Ruta'}
                                                    </button>
                                                    <button onClick={() => setWaypointsEdit(rutaSeleccionada.waypoints || [])} style={{ padding: '13px 18px', backgroundColor: '#f1f5f9', color: colors.text, border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                                                        Restablecer
                                                    </button>
                                                    <button onClick={() => setRutaSeleccionada(null)} style={{ padding: '13px 18px', backgroundColor: '#e2e8f0', color: colors.text, border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                                                        Cerrar
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        )}

                        {mostrarCalendario && (
                            <CalendarioPlanificacion
                                horarios={horarios}
                                asignaciones={asignacionesMes}
                                onClose={() => setMostrarCalendario(false)}
                                onCambiarMes={async (anio, mes) => {
                                    try {
                                        const { data } = await getAsignacionesMes(anio, mes);
                                        setAsignacionesMes(data.asignaciones);
                                    } catch { /* deja el mes anterior visible si falla */ }
                                }}
                            />
                        )}
                    </div>
                )}

                {/* ── TAB: HORARIOS ── */}
                {tab === 'horarios' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>Horario Semanal de Recolección</h2>
                                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                    Revisa qué rutas tienen recojo programado cada día para decidir qué camión asignar hoy.
                                </p>
                            </div>
                            <button onClick={cargarRutas} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: colors.lightBg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: colors.text }}>
                                <RefreshCw size={14} /> Actualizar
                            </button>
                        </div>

                        {cargandoRutas ? (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Cargando horarios...</p>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '16px' }}>
                                {DIAS_ORDEN.map(dia => {
                                    const esHoy = DIAS_SEMANA[new Date().getDay()] === dia;
                                    const items = horarios.filter(h => h.dia_semana === dia);
                                    return (
                                        <div key={dia} style={{
                                            backgroundColor: colors.white, borderRadius: '12px',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                                            borderTop: `5px solid ${esHoy ? colors.primary : '#cbd5e1'}`,
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9' }}>
                                                <span style={{ fontWeight: '800', fontSize: '14px', color: colors.secondary }}>{dia}</span>
                                                {esHoy && (
                                                    <span style={{ backgroundColor: colors.primary, color: 'white', padding: '2px 9px', borderRadius: '20px', fontSize: '10px', fontWeight: '800' }}>HOY</span>
                                                )}
                                            </div>
                                            <div style={{ padding: items.length ? '10px 14px' : '20px 14px' }}>
                                                {items.length === 0 ? (
                                                    <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>Sin recojos programados</p>
                                                ) : items.map(h => {
                                                    const ruta = rutas.find(r => r.id === h.ruta_id);
                                                    const asignadaHoy = !!ruta?.camion_id;
                                                    return (
                                                        <div key={h.id} style={{ padding: '10px 0', borderBottom: '1px solid #f8fafc' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                                                <span style={{ width: '9px', height: '9px', borderRadius: '50%', backgroundColor: h.color || '#94a3b8', flexShrink: 0 }} />
                                                                <span style={{ fontWeight: '700', fontSize: '13px', color: colors.secondary }}>{h.ruta_nombre}</span>
                                                            </div>
                                                            <p style={{ margin: '0 0 4px 15px', fontSize: '11px', color: '#64748b' }}>
                                                                {h.zona_nombre} · {h.tipo_residuo} · {String(h.hora_inicio).slice(0, 5)}–{String(h.hora_fin).slice(0, 5)}
                                                            </p>
                                                            <div style={{ marginLeft: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <span style={{
                                                                    backgroundColor: asignadaHoy ? 'rgba(34,197,94,0.1)' : 'rgba(203,213,225,0.25)',
                                                                    color: asignadaHoy ? colors.success : '#94a3b8',
                                                                    padding: '2px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700',
                                                                }}>
                                                                    {asignadaHoy ? 'ASIGNADA' : 'SIN ASIGNAR'}
                                                                </span>
                                                                {esHoy && !asignadaHoy && ruta && (
                                                                    <button
                                                                        onClick={() => abrirAsignar(ruta)}
                                                                        style={{ padding: '3px 10px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', fontWeight: '700', fontSize: '10px' }}
                                                                    >
                                                                        Asignar
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── TAB: CAMIONES ── */}
                {tab === 'camiones' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>Flota de Camiones</h2>
                            <button onClick={cargarCamiones} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: colors.lightBg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: colors.text }}>
                                <RefreshCw size={14} /> Actualizar
                            </button>
                        </div>
                        <div style={{ backgroundColor: colors.white, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
                            {cargandoCamiones ? (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Cargando camiones...</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: colors.lightBg }}>
                                            {['Placa', 'Modelo', 'Capacidad (kg)', 'Estado', 'Cambiar estado'].map(h => (
                                                <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {camiones.length === 0
                                            ? <tr><td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No hay camiones registrados</td></tr>
                                            : camiones.map(cam => (
                                                <tr key={cam.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '13px 16px', fontWeight: '700', fontSize: '13px' }}>{cam.placa}</td>
                                                    <td style={{ padding: '13px 16px', fontSize: '13px' }}>{cam.modelo}</td>
                                                    <td style={{ padding: '13px 16px', fontSize: '13px' }}>{Number(cam.capacidad_kg).toLocaleString()}</td>
                                                    <td style={{ padding: '13px 16px' }}><Badge estado={cam.estado} /></td>
                                                    <td style={{ padding: '13px 16px' }}>
                                                        <select
                                                            value={cam.estado}
                                                            onChange={e => handleCambiarEstadoCamion(cam, e.target.value)}
                                                            style={{ padding: '7px 10px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px' }}
                                                        >
                                                            <option value="disponible">Disponible</option>
                                                            <option value="en_ruta" disabled>En ruta (automático)</option>
                                                            <option value="mantenimiento">Mantenimiento</option>
                                                            <option value="de_baja">Dado de baja</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB: CONDUCTORES ── */}
                {tab === 'conductores' && (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>Conductores</h2>
                            <button onClick={cargarConductores} style={{ padding: '8px 16px', border: 'none', borderRadius: '8px', backgroundColor: colors.lightBg, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: colors.text }}>
                                <RefreshCw size={14} /> Actualizar
                            </button>
                        </div>
                        <div style={{ backgroundColor: colors.white, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', overflowX: 'auto' }}>
                            {cargandoConductores ? (
                                <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Cargando conductores...</p>
                            ) : (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ backgroundColor: colors.lightBg }}>
                                            {['Conductor', 'Licencia', 'Teléfono', 'Ruta Hoy', 'Estado', 'Acciones'].map(h => (
                                                <th key={h} style={{ padding: '13px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', borderBottom: '2px solid #e2e8f0' }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {conductores.length === 0
                                            ? <tr><td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>No hay conductores registrados</td></tr>
                                            : conductores.map(c => (
                                                <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                    <td style={{ padding: '13px 16px', fontSize: '13px' }}>
                                                        <p style={{ margin: 0, fontWeight: '700' }}>{c.apellidos}, {c.nombres}</p>
                                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{c.correo}</p>
                                                    </td>
                                                    <td style={{ padding: '13px 16px', fontSize: '13px' }}>{c.licencia}</td>
                                                    <td style={{ padding: '13px 16px', fontSize: '13px' }}>{c.telefono || '—'}</td>
                                                    <td style={{ padding: '13px 16px', fontSize: '13px' }}>{c.ruta_actual || <span style={{ color: '#94a3b8' }}>Sin asignar</span>}</td>
                                                    <td style={{ padding: '13px 16px' }}><Badge estado={c.ruta_actual && c.conductor_estado === 'activo' ? 'en_ruta' : c.conductor_estado} /></td>
                                                    <td style={{ padding: '13px 16px' }}>
                                                        {c.conductor_estado === 'activo'
                                                            ? <button onClick={() => handleCambiarEstadoConductor(c)} title="Marcar como inactivo" style={{ padding: '8px 12px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}><UserX size={13} /> Desactivar</button>
                                                            : <button onClick={() => handleCambiarEstadoConductor(c)} title="Marcar como activo" style={{ padding: '8px 12px', backgroundColor: colors.success, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}><UserCheck size={13} /> Activar</button>
                                                        }
                                                    </td>
                                                </tr>
                                            ))
                                        }
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                )}

                {/* ── TAB: PARTICIPACIÓN CIUDADANA (CU20) ── */}
                {tab === 'participacion' && (
                    <div>
                        {!participacion ? (
                            <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Cargando datos...</p>
                        ) : (
                            <>
                                {/* Resumen global */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                    <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderTop: `5px solid ${colors.primary}` }}>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Ciudadanos Registrados</p>
                                        <p style={{ margin: 0, fontSize: '34px', fontWeight: '800', color: colors.secondary }}>{participacion.total_ciudadanos}</p>
                                    </div>
                                    <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderTop: `5px solid ${colors.success}` }}>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Ciudadanos Activos</p>
                                        <p style={{ margin: 0, fontSize: '34px', fontWeight: '800', color: colors.secondary }}>{participacion.ciudadanos_activos}</p>
                                    </div>
                                    <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', borderTop: `5px solid '#3b82f6'` }}>
                                        <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Tasa de Participación</p>
                                        <p style={{ margin: 0, fontSize: '34px', fontWeight: '800', color: colors.secondary }}>
                                            {participacion.total_ciudadanos > 0
                                                ? Math.round((participacion.ciudadanos_activos / participacion.total_ciudadanos) * 100)
                                                : 0}%
                                        </p>
                                    </div>
                                </div>

                                {/* Tabla por zona */}
                                <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}>
                                    <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '800', color: colors.secondary, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Eye size={18} color={colors.primary} /> Verificación por Zona
                                    </h3>
                                    {participacion.por_zona?.length === 0 ? (
                                        <p style={{ color: '#64748b' }}>Sin datos por zona aún.</p>
                                    ) : (
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                            <thead>
                                                <tr style={{ backgroundColor: colors.lightBg }}>
                                                    {['Zona', 'Total Reportes', 'Completados', 'Pendientes', 'Tasa'].map(h => (
                                                        <th key={h} style={{ padding: '12px 15px', textAlign: 'left', fontWeight: '700', color: '#64748b', fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {participacion.por_zona.map((z, i) => {
                                                    const tasa = z.total_reportes > 0
                                                        ? Math.round((z.completados / z.total_reportes) * 100)
                                                        : 0;
                                                    return (
                                                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                                            <td style={{ padding: '14px 15px', fontWeight: '700', color: colors.secondary }}>{z.zona}</td>
                                                            <td style={{ padding: '14px 15px', color: colors.text }}>{z.total_reportes}</td>
                                                            <td style={{ padding: '14px 15px' }}>
                                                                <span style={{ color: colors.success, fontWeight: '700' }}>{z.completados}</span>
                                                            </td>
                                                            <td style={{ padding: '14px 15px' }}>
                                                                <span style={{ color: colors.danger, fontWeight: '700' }}>{z.pendientes}</span>
                                                            </td>
                                                            <td style={{ padding: '14px 15px' }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                                    <div style={{ flex: 1, height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                                                                        <div style={{ height: '100%', width: `${tasa}%`, backgroundColor: tasa >= 80 ? colors.success : tasa >= 50 ? colors.warning : colors.danger, borderRadius: '4px' }} />
                                                                    </div>
                                                                    <span style={{ fontWeight: '700', fontSize: '13px', minWidth: '36px' }}>{tasa}%</span>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
