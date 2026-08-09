import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Truck, MapPin, Clock, AlertTriangle, Navigation, Play } from 'lucide-react';
import MapaRuta from '../components/MapaRuta';
import { getMiRuta, actualizarGPSCamion } from '../services/api';

// Compara la fecha DATE que devuelve MySQL (mysql2 la serializa como
// medianoche UTC) contra la fecha local de hoy sin desfasarse por zona horaria.
const fechaUTC = (valor) => {
    const d = new Date(valor);
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};
const hoyLocal = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const OperadorDashboard = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [asignacionesHoy, setAsignacionesHoy] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState('');

    const [rutaActivaId, setRutaActivaId] = useState(null);
    const [iniciandoId, setIniciandoId] = useState(null);
    const [ubicacionActual, setUbicacionActual] = useState(null);
    const [gpsError, setGpsError] = useState('');

    const watchIdRef = useRef(null);
    const ultimoEnvioRef = useRef(0);

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
        if (!userStr) { navigate('/'); return; }
        const user = JSON.parse(userStr);
        if (user.rol !== 2) { navigate('/'); return; }
        setUsuario(user);

        getMiRuta()
            .then(({ data }) => {
                const hoy = hoyLocal();
                setAsignacionesHoy(data.filter(a => fechaUTC(a.fecha_asignacion) === hoy));
            })
            .catch(() => setError('No se pudo cargar tu ruta de hoy'))
            .finally(() => setCargando(false));

        return () => {
            if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [navigate]);

    const enviarUbicacion = (camionId, lat, lng, { forzar = false } = {}) => {
        const ahora = Date.now();
        if (!forzar && ahora - ultimoEnvioRef.current < 15000) return;
        ultimoEnvioRef.current = ahora;
        actualizarGPSCamion(camionId, { latitud: lat, longitud: lng, gps_activo: true }).catch(() => {});
    };

    const iniciarRuta = (asignacion) => {
        if (!navigator.geolocation) {
            setGpsError('Tu navegador no soporta geolocalización');
            return;
        }
        setIniciandoId(asignacion.id);
        setGpsError('');

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                const punto = { lat: coords.latitude, lng: coords.longitude };
                setUbicacionActual(punto);
                enviarUbicacion(asignacion.camion_id, punto.lat, punto.lng, { forzar: true });
                setRutaActivaId(asignacion.id);
                setIniciandoId(null);

                watchIdRef.current = navigator.geolocation.watchPosition(
                    (pos) => {
                        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setUbicacionActual(p);
                        enviarUbicacion(asignacion.camion_id, p.lat, p.lng);
                    },
                    () => setGpsError('Se perdió la señal de GPS'),
                    { enableHighAccuracy: true, maximumAge: 5000 }
                );
            },
            () => {
                setGpsError('No se pudo obtener tu ubicación. Revisa los permisos del navegador.');
                setIniciandoId(null);
            }
        );
    };

    const handleLogout = () => {
        if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
        localStorage.clear();
        navigate('/');
    };

    const rutaActiva = asignacionesHoy.find(a => a.id === rutaActivaId) || null;

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
                {cargando && (
                    <p style={{ color: colors.text }}>Cargando tu ruta de hoy...</p>
                )}

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#b91c1c', padding: '16px 20px', borderRadius: '10px', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle size={18} /> {error}
                    </div>
                )}

                {!cargando && !error && asignacionesHoy.length === 0 && (
                    <div style={{ backgroundColor: colors.white, padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', textAlign: 'center' }}>
                        <Clock size={36} color="#94a3b8" style={{ marginBottom: '12px' }} />
                        <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>No tienes ruta asignada para hoy</h2>
                        <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#64748b' }}>Cuando el supervisor te asigne una ruta, aparecerá aquí.</p>
                    </div>
                )}

                {!cargando && asignacionesHoy.length > 0 && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                        {asignacionesHoy.map((a) => {
                            const enCurso = a.id === rutaActivaId;
                            return (
                                <div key={a.id} style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', borderTop: `4px solid ${enCurso ? colors.success : colors.primary}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                                        <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '12px', borderRadius: '8px' }}>
                                            <Truck size={28} color={colors.primary} />
                                        </div>
                                        <div>
                                            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>{a.ruta_nombre}</h2>
                                            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: enCurso ? colors.success : '#64748b', fontWeight: enCurso ? '700' : '400' }}>
                                                {enCurso ? 'Ruta en curso' : a.estado === 'en_proceso' ? 'En proceso' : 'Pendiente de iniciar'}
                                            </p>
                                        </div>
                                    </div>

                                    <div style={{ backgroundColor: colors.lightBg, padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                                        <div style={{ marginBottom: '15px' }}>
                                            <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>ZONA</p>
                                            <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: colors.primary, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <MapPin size={16} /> {a.zona_nombre}
                                            </p>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>CAMIÓN</p>
                                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>{a.placa} · {a.modelo}</p>
                                            </div>
                                            <div>
                                                <p style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>HORARIO</p>
                                                <p style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                                                    {a.hora_inicio ? `${a.hora_inicio.slice(0, 5)} - ${a.hora_fin?.slice(0, 5) ?? ''}` : 'Sin horario fijo'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {!enCurso ? (
                                        <button
                                            onClick={() => iniciarRuta(a)}
                                            disabled={iniciandoId === a.id}
                                            style={{
                                                width: '100%', padding: '14px', backgroundColor: colors.success, color: 'white',
                                                border: 'none', borderRadius: '8px', fontWeight: '800',
                                                cursor: iniciandoId === a.id ? 'not-allowed' : 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '15px'
                                            }}
                                        >
                                            <Play size={18} />
                                            {iniciandoId === a.id ? 'Obteniendo ubicación...' : 'Iniciar Ruta'}
                                        </button>
                                    ) : (
                                        <div style={{ padding: '14px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: colors.success, borderRadius: '8px', fontWeight: '800', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                            <Navigation size={18} /> GPS activo — sigue la ruta abajo
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {rutaActiva && (
                    <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginBottom: '40px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ backgroundColor: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '8px' }}>
                                <Navigation size={28} color="#2563eb" />
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: colors.secondary }}>Ruta en vivo — {rutaActiva.ruta_nombre}</h2>
                                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                                    {ubicacionActual
                                        ? `Lat ${ubicacionActual.lat.toFixed(6)}, Lng ${ubicacionActual.lng.toFixed(6)}`
                                        : 'Esperando señal GPS...'}
                                </p>
                            </div>
                        </div>

                        {gpsError && (
                            <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', border: '1px solid #ef4444', color: '#b91c1c', padding: '12px 16px', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                <AlertTriangle size={16} /> {gpsError}
                            </div>
                        )}

                        <MapaRuta waypoints={rutaActiva.waypoints} ubicacionActual={ubicacionActual} height="480px" />
                    </div>
                )}
            </main>
        </div>
    );
};

export default OperadorDashboard;
