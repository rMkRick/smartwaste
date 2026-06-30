import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Camera, MapPin, Send, LogOut, History, Bell, User, Shield, AlertTriangle, TrendingUp, Calendar, Clock } from 'lucide-react';
import { createReport } from '../services/api';
import MapaPicker from '../components/MapaPicker';

const CitizenDashboard = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [tipoResiduoId, setTipoResiduoId] = useState(1);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [latitud, setLatitud] = useState(-13.5319);
    const [longitud, setLongitud] = useState(-71.9675);
    const [activeTab, setActiveTab] = useState('reportar');

    const colors = {
        primary: '#f97316',
        secondary: '#0f172a',
        text: '#334155',
        lightBg: '#f8fafc',
        white: '#ffffff',
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444'
    };

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.rol !== 1) {
                navigate('/');
            }
            setUsuario(user);
        } else {
            navigate('/');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await createReport({
                usuario_id: usuario.id,
                foto_url: previewUrl || 'https://via.placeholder.com/300',
                latitud,
                longitud,
                tipo_residuo_id: tipoResiduoId,
                descripcion
            });

            alert('¡Reporte enviado exitosamente! El equipo municipal lo atenderá pronto.');
            setDescripcion('');
            setPreviewUrl(null);
            setTipoResiduoId(1);
            setLatitud(-13.5319);
            setLongitud(-71.9675);
        } catch (error) {
            alert('Error al enviar reporte');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            {/* Navbar Premium */}
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
                        <Trash2 size={24} />
                    </div>
                    CITIZEN SMART
                </div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '10px 15px', borderRadius: '8px' }}>
                        <User size={18} /> {usuario?.nombres || 'Ciudadano'}
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            backgroundColor: colors.primary,
                            color: 'white',
                            border: 'none',
                            padding: '10px 18px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontWeight: '700',
                            fontSize: '14px'
                        }}
                    >
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </nav>

            <main style={{ padding: '40px 8%' }}>
                {/* Estadísticas Rápidas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                    <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `5px solid ${colors.primary}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.1)', padding: '12px', borderRadius: '8px' }}>
                                <AlertTriangle size={24} color={colors.primary} />
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Reportes Enviados</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: colors.secondary }}>5</p>
                    </div>

                    <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `5px solid ${colors.success}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)', padding: '12px', borderRadius: '8px' }}>
                                <TrendingUp size={24} color={colors.success} />
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Completados</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: colors.secondary }}>3</p>
                    </div>

                    <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `5px solid ${colors.warning}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', padding: '12px', borderRadius: '8px' }}>
                                <Clock size={24} color={colors.warning} />
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>En Proceso</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: colors.secondary }}>2</p>
                    </div>

                    <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `5px solid #3b82f6` }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '12px', borderRadius: '8px' }}>
                                <Bell size={24} color="#3b82f6" />
                            </div>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>Notificaciones</p>
                        </div>
                        <p style={{ margin: 0, fontSize: '28px', fontWeight: '800', color: colors.secondary }}>4</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '30px', borderBottom: `2px solid ${colors.lightBg}`, paddingBottom: '12px' }}>
                    <button
                        onClick={() => setActiveTab('reportar')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'reportar' ? colors.primary : 'transparent',
                            color: activeTab === 'reportar' ? 'white' : colors.text,
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '15px'
                        }}
                    >
                        <AlertTriangle size={18} /> Nuevo Reporte
                    </button>
                    <button
                        onClick={() => setActiveTab('mis-reportes')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'mis-reportes' ? colors.primary : 'transparent',
                            color: activeTab === 'mis-reportes' ? 'white' : colors.text,
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '15px'
                        }}
                    >
                        <History size={18} /> Mis Reportes
                    </button>
                    <button
                        onClick={() => setActiveTab('info')}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: activeTab === 'info' ? colors.primary : 'transparent',
                            color: activeTab === 'info' ? 'white' : colors.text,
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontSize: '15px'
                        }}
                    >
                        <Shield size={18} /> Información
                    </button>
                </div>

                {/* Tab: Reportar */}
                {activeTab === 'reportar' && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                        {/* Formulario */}
                        <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.secondary, marginTop: 0, fontSize: '20px', fontWeight: '800' }}>
                                <AlertTriangle color={colors.primary} size={24} /> Reportar Incidencia
                            </h2>
                            <p style={{ color: '#64748b', marginBottom: '25px' }}>Ayúdanos proporcionando detalles precisos de la situación.</p>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* Foto */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '10px', fontWeight: '700', fontSize: '14px', color: colors.secondary }}>Evidencia Fotográfica</label>
                                    <div
                                        onClick={() => document.getElementById('fileInput').click()}
                                        style={{
                                            width: '100%',
                                            height: '180px',
                                            border: `2px dashed ${colors.primary}`,
                                            borderRadius: '12px',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: 'rgba(249, 115, 22, 0.05)',
                                            transition: 'all 0.3s',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}
                                    >
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <>
                                                <Camera size={40} color={colors.primary} />
                                                <span style={{ color: colors.primary, marginTop: '8px', fontWeight: '700', fontSize: '14px' }}>Haz clic para subir</span>
                                            </>
                                        )}
                                    </div>
                                    <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </div>

                                {/* Tipo */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: colors.secondary }}>Tipo de Residuo</label>
                                    <select
                                        value={tipoResiduoId}
                                        onChange={(e) => setTipoResiduoId(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: `1px solid #cbd5e1`,
                                            fontSize: '14px',
                                            fontWeight: '500'
                                        }}
                                    >
                                        <option value={1}>🍃 Orgánico</option>
                                        <option value={2}>♻️ Reciclable</option>
                                        <option value={3}>🗑️ No Reciclable</option>
                                        <option value={4}>⚠️ Peligroso</option>
                                    </select>
                                </div>

                                {/* Descripción */}
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px', color: colors.secondary }}>Descripción Detallada</label>
                                    <textarea
                                        rows="4"
                                        placeholder="Describe la situación con detalle (cantidad, ubicación exacta, urgencia...)"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            borderRadius: '8px',
                                            border: '1px solid #cbd5e1',
                                            fontSize: '14px',
                                            resize: 'none',
                                            fontFamily: 'inherit'
                                        }}
                                        required
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        backgroundColor: colors.primary,
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '16px',
                                        fontWeight: '800',
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px',
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    <Send size={20} /> {loading ? 'Enviando...' : 'Enviar Reporte'}
                                </button>
                            </form>
                        </div>

                        {/* Mapa */}
                        <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.secondary, marginTop: 0, fontSize: '16px', fontWeight: '700' }}>
                                <MapPin color={colors.primary} size={20} /> Ubicación del Incidente
                            </h3>
                            <p style={{ color: '#64748b', marginBottom: '15px', fontSize: '14px' }}>Selecciona la ubicación haciendo clic en el mapa o usando GPS.</p>
                            <MapaPicker onChange={(lat, lng) => { setLatitud(lat); setLongitud(lng); }} />

                            <div style={{ marginTop: '25px', backgroundColor: colors.lightBg, padding: '20px', borderRadius: '10px' }}>
                                <h4 style={{ margin: '0 0 15px 0', fontSize: '14px', fontWeight: '700', color: colors.secondary }}>Zonas de Recolección</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    {[
                                        { zona: 'Centro Histórico', hora: 'Hoy 20:00', color: colors.primary },
                                        { zona: 'San Blas', hora: 'Mañana 19:00', color: colors.success },
                                        { zona: 'San Sebastián', hora: 'Jueves 18:00', color: colors.warning }
                                    ].map((item, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', backgroundColor: 'white', borderRadius: '8px', borderLeft: `4px solid ${item.color}` }}>
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>{item.zona}</p>
                                                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{item.hora}</p>
                                            </div>
                                            <Calendar size={16} color={item.color} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab: Mis Reportes */}
                {activeTab === 'mis-reportes' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                            {[
                                { id: 1, zona: 'Calle Plateros', estado: 'Completado', fecha: 'Ayer, 4:30 PM', tipo: 'Orgánico', badge: colors.success },
                                { id: 2, zona: 'Plaza San Blas', estado: 'En Proceso', fecha: '15 May', tipo: 'Reciclable', badge: colors.warning },
                                { id: 3, zona: 'Av. de la Cultura', estado: 'Enviado', fecha: '10 May', tipo: 'No Reciclable', badge: colors.primary }
                            ].map((rep) => (
                                <div key={rep.id} style={{ backgroundColor: colors.white, padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `5px solid ${rep.badge}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                                        <div>
                                            <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '800', color: colors.secondary }}>Reporte #{rep.id}</h3>
                                            <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>{rep.fecha}</p>
                                        </div>
                                        <span style={{ backgroundColor: rep.badge, color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                                            {rep.estado}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', padding: '10px', backgroundColor: colors.lightBg, borderRadius: '8px' }}>
                                        <MapPin size={16} color={colors.primary} />
                                        <span style={{ fontSize: '14px', fontWeight: '600' }}>{rep.zona}</span>
                                    </div>
                                    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>Tipo: <span style={{ fontWeight: '700', color: colors.secondary }}>{rep.tipo}</span></p>
                                    <button style={{ width: '100%', padding: '10px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                                        Ver Detalles
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Tab: Información */}
                {activeTab === 'info' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '25px' }}>
                        <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px', color: colors.secondary, fontSize: '16px', fontWeight: '800' }}>
                                <Shield color={colors.primary} size={20} /> ¿Cómo Reportar?
                            </h3>
                            <ol style={{ margin: 0, paddingLeft: '20px', color: '#64748b', lineHeight: '1.8', fontSize: '14px' }}>
                                <li>Toma una fotografía clara del problema</li>
                                <li>Selecciona el tipo de residuo</li>
                                <li>Describe la situación con detalle</li>
                                <li>Marca la ubicación en el mapa</li>
                                <li>¡Envía tu reporte!</li>
                            </ol>
                        </div>

                        <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px', color: colors.secondary, fontSize: '16px', fontWeight: '800' }}>
                                <TrendingUp color={colors.success} size={20} /> Tu Impacto
                            </h3>
                            <p style={{ margin: '0 0 15px 0', color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
                                Gracias a tu participación, Cusco es más limpio. Tus reportes han contribuido a:
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.primary }}></div>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>5 zonas limpias</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.success }}></div>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>500 kg recolectados</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.warning }}></div>
                                    <span style={{ fontSize: '13px', color: '#64748b' }}>50 árboles plantados</span>
                                </div>
                            </div>
                        </div>

                        <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px', color: colors.secondary, fontSize: '16px', fontWeight: '800' }}>
                                <Bell color={colors.primary} size={20} /> Próximas Recolecciones
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {[
                                    { zona: 'Tu Zona', tipo: 'Todos los tipos', hora: 'Hoy 20:00' },
                                    { zona: 'Orgánicos', tipo: 'Residuos', hora: 'Lunes 18:00' },
                                    { zona: 'Reciclables', tipo: 'Vidrio, Plástico', hora: 'Miércoles 19:00' }
                                ].map((item, i) => (
                                    <div key={i} style={{ padding: '12px', backgroundColor: colors.lightBg, borderRadius: '8px', borderLeft: `3px solid ${colors.primary}` }}>
                                        <p style={{ margin: '0 0 3px 0', fontSize: '14px', fontWeight: '700', color: colors.secondary }}>{item.zona}</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{item.tipo} · {item.hora}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default CitizenDashboard;
