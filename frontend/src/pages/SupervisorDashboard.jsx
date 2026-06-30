import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, BarChart3, AlertTriangle, CheckCircle,
    MessageSquare, Eye, Send, Users, RefreshCw, X, Clock
} from 'lucide-react';
import { getSupervisorReportes, getSupervisorParticipacion, responderReporte } from '../services/api';

const ESTADO_COLOR = {
    enviado:    '#f97316',
    leido:      '#eab308',
    en_proceso: '#3b82f6',
    completado: '#22c55e',
    rechazado:  '#ef4444',
};

const ESTADO_LABEL = {
    enviado:    'Enviado',
    leido:      'Leído',
    en_proceso: 'En Proceso',
    completado: 'Completado',
    rechazado:  'Rechazado',
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
    }, [tab, cargarParticipacion]);

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

    const reportesFiltrados = filtro === 'todos'
        ? reportes
        : reportes.filter(r => r.estado === filtro);

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
