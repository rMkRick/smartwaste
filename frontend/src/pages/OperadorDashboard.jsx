import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, LogOut, Truck, MapPin, CheckCircle, Clock, AlertTriangle, Navigation, Play, Pause, Zap } from 'lucide-react';

const OperadorDashboard = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [rutaAsignada, setRutaAsignada] = useState({
        ruta: { nombre: 'Ruta Centro 01' },
        zona: { nombre: 'Centro Histórico' },
        camion: { placa: 'X1Y-888', modelo: 'Volvo FE', capacidad_kg: 15000, gps_activo: true },
        horarios: [
            { dia_semana: 'Lunes', hora_inicio: '20:00:00', hora_fin: '22:00:00' },
            { dia_semana: 'Miércoles', hora_inicio: '20:00:00', hora_fin: '22:00:00' }
        ],
        estado: 'en_proceso'
    });
    const [gpsActivo, setGpsActivo] = useState(true);
    const [ubicacion, setUbicacion] = useState({ lat: -13.5319, lng: -71.9675 });
    const [loading, setLoading] = useState(false);
    const [recolecciones, setRecolecciones] = useState([
        { id: 1, zona: 'Centro Histórico', estado: 'completado', cantidad_kg: 450, hora: '20:30' },
        { id: 2, zona: 'Plaza de Armas', estado: 'en_proceso', cantidad_kg: 0, hora: '19:45' }
    ]);

    const colors = {
        primary: '#f97316',
        secondary: '#0f172a',
        text: '#334155',
        lightBg: '#f8fafc',
        white: '#ffffff',
        success: '#22c55e',
        warning: '#eab308'
    };

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.rol !== 2) navigate('/');
            setUsuario(user);
        } else {
            navigate('/');
        }
    }, [navigate]);

    const activarGPS = () => {
        if (!navigator.geolocation) {
            alert('GPS no disponible');
            return;
        }
        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setUbicacion({ lat: coords.latitude, lng: coords.longitude });
                setGpsActivo(true);
                setLoading(false);
            },
            () => {
                alert('Error al obtener ubicación');
                setLoading(false);
            }
        );
    };

    const completarRecoleccion = (id) => {
        setRecolecciones(recolecciones.map(r => r.id === id ? { ...r, estado: 'completado' } : r));
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            {/* Navbar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 8%',
                backgroundColor: colors.secondary,
                color: colors.white,
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800', fontSize: '22px' }}>
                    <div style={{ backgroundColor: colors.primary, padding: '8px 12px', borderRadius: '8px' }}>
                        <Truck size={24} />
                    </div>
                    OPERADOR SMART
                </div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ margin: '0 0 3px 0', fontWeight: '700' }}>{usuario?.nombres}</p>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>Operador de Vehículo</p>
                    </div>
                    <button onClick={handleLogout} style={{ backgroundColor: colors.primary, color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </nav>

            <main style={{ padding: '40px 8%' }}>
                {/* Estado Ruta */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                    {/* Tarjeta Ruta */}
                    <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '12px', borderRadius: '8px' }}>
                                <Truck size={28} color={colors.primary} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>Mi Ruta Hoy</h2>
                                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>Operación en curso</p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: colors.lightBg, padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>RUTA</p>
                                <p style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>{rutaAsignada.ruta.nombre}</p>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>ZONA</p>
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: colors.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <MapPin size={16} /> {rutaAsignada.zona.nombre}
                                </p>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>CAMIÓN</p>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{rutaAsignada.camion.placa}</p>
                                </div>
                                <div>
                                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>CAPACIDAD</p>
                                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{rutaAsignada.camion.capacidad_kg.toLocaleString()} kg</p>
                                </div>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                            <p style={{ margin: '0 0 12px 0', fontSize: '12px', fontWeight: '700', color: colors.secondary, textTransform: 'uppercase' }}>Horarios de Recolección</p>
                            {rutaAsignada.horarios.map((h, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < rutaAsignada.horarios.length - 1 ? '1px solid #e2e8f0' : 'none' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>{h.dia_semana}</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: colors.secondary }}>{h.hora_inicio} - {h.hora_fin}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* GPS y Ubicación */}
                    <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ backgroundColor: gpsActivo ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px' }}>
                                <Navigation size={28} color={gpsActivo ? colors.success : '#ef4444'} />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>Rastreo GPS</h2>
                                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: gpsActivo ? colors.success : '#ef4444', fontWeight: '700' }}>
                                    {gpsActivo ? '🟢 Activo' : '🔴 Inactivo'}
                                </p>
                            </div>
                        </div>

                        <div style={{ backgroundColor: gpsActivo ? 'rgba(34, 197, 94, 0.05)' : 'rgba(239, 68, 68, 0.05)', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                            <div style={{ marginBottom: '15px' }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>LATITUD</p>
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', color: colors.secondary }}>{ubicacion.lat.toFixed(6)}</p>
                            </div>
                            <div>
                                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>LONGITUD</p>
                                <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', fontFamily: 'monospace', color: colors.secondary }}>{ubicacion.lng.toFixed(6)}</p>
                            </div>
                        </div>

                        <button
                            onClick={activarGPS}
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '14px',
                                backgroundColor: gpsActivo ? colors.warning : colors.success,
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '800',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                fontSize: '15px',
                                marginBottom: '15px'
                            }}
                        >
                            <Zap size={18} />
                            {loading ? 'Actualizando...' : gpsActivo ? 'GPS Activo' : 'Activar GPS'}
                        </button>

                        <div style={{ backgroundColor: colors.lightBg, padding: '15px', borderRadius: '8px' }}>
                            <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '700', color: colors.secondary }}>INFO CAMIÓN</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>Modelo:</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700' }}>{rutaAsignada.camion.modelo}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>Estado GPS:</span>
                                    <span style={{ fontSize: '13px', fontWeight: '700', color: colors.success }}>Activo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recolecciones */}
                <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '25px' }}>
                        <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '8px' }}>
                            <CheckCircle size={24} color={colors.success} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>Recolecciones de Hoy</h2>
                            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>Progreso de operaciones</p>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '15px' }}>
                        {recolecciones.map((rec) => (
                            <div key={rec.id} style={{ backgroundColor: colors.lightBg, padding: '20px', borderRadius: '10px', borderTop: `4px solid ${rec.estado === 'completado' ? colors.success : colors.warning}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: colors.secondary }}>{rec.zona}</h3>
                                    <span style={{ backgroundColor: rec.estado === 'completado' ? colors.success : colors.warning, color: 'white', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                                        {rec.estado}
                                    </span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 3px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>CANTIDAD</p>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: colors.secondary }}>{rec.cantidad_kg} kg</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 3px 0', fontSize: '11px', color: '#64748b', fontWeight: '700' }}>HORA</p>
                                        <p style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: colors.secondary }}>{rec.hora}</p>
                                    </div>
                                </div>
                                {rec.estado === 'en_proceso' && (
                                    <button
                                        onClick={() => completarRecoleccion(rec.id)}
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            backgroundColor: colors.success,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            fontSize: '13px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        <CheckCircle size={14} /> Marcar Completada
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '25px', padding: '20px', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: '10px', borderLeft: `4px solid ${colors.success}` }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: '700', color: colors.secondary }}>Estadísticas del día</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                            <div>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Completadas</p>
                                <p style={{ margin: '3px 0 0 0', fontSize: '20px', fontWeight: '800', color: colors.success }}>1</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>En Proceso</p>
                                <p style={{ margin: '3px 0 0 0', fontSize: '20px', fontWeight: '800', color: colors.warning }}>1</p>
                            </div>
                            <div>
                                <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>Total Recolectado</p>
                                <p style={{ margin: '3px 0 0 0', fontSize: '20px', fontWeight: '800', color: colors.primary }}>450 kg</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OperadorDashboard;
