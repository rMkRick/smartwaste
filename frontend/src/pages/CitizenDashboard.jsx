import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Camera, MapPin, Send, LogOut, History, Bell, User, Shield, AlertTriangle } from 'lucide-react';
import { createReport } from '../services/api';

const CitizenDashboard = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState(null);
    const [descripcion, setDescripcion] = useState('');
    const [tipoResiduoId, setTipoResiduoId] = useState(1);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    // Paleta de colores consistente
    const colors = {
        primary: '#f97316',
        secondary: '#0f172a',
        text: '#334155',
        lightBg: '#f8fafc',
        white: '#ffffff',
        success: '#22c55e'
    };

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        if (userStr) {
            const user = JSON.parse(userStr);
            // Verificar si es ciudadano (rol_id 1)
            if (user.rol !== 1) {
                // Si no es ciudadano, redirigir según su rol o al login
                // Por ahora lo dejamos pasar o redirigimos
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
            // Coordenadas simuladas de Cusco para el MVP
            const latitud = -13.5319; 
            const longitud = -71.9675;

            const { data } = await createReport({
                usuario_id: usuario.id,
                foto_url: previewUrl || 'https://via.placeholder.com/300', // En producción sería la URL de S3/Cloudinary
                latitud,
                longitud,
                tipo_residuo_id: tipoResiduoId,
                descripcion
            });

            alert(`¡Reporte registrado! Ticket: ${data.numero_ticket}`);
            // Limpiar formulario
            setDescripcion('');
            setPreviewUrl(null);
            setTipoResiduoId(1);
        } catch (error) {
            alert('Error al enviar reporte');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            {/* Header del Ciudadano */}
            <nav style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '15px 8%', 
                backgroundColor: colors.secondary, 
                color: colors.white,
                position: 'sticky',
                top: 0,
                zIndex: 1000
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800', fontSize: '20px' }}>
                    <Trash2 size={24} color={colors.primary} /> CIUDADANO SMART
                </div>
                <div style={{ display: 'flex', gap: '25px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.9 }}>
                        <User size={18} /> {usuario?.nombre || 'Ciudadano'}
                    </div>
                    <button 
                        onClick={handleLogout}
                        style={{ 
                            backgroundColor: 'rgba(255,255,255,0.1)', 
                            color: 'white', 
                            border: 'none', 
                            padding: '8px 15px', 
                            borderRadius: '6px', 
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                        }}
                    >
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </nav>

            <main style={{ padding: '40px 8%' }}>
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                    
                    {/* Columna Izquierda: Formulario de Reporte (HU-03) */}
                    <div style={{ flex: '1 1 500px' }}>
                        <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.secondary, marginTop: 0 }}>
                                <AlertTriangle color={colors.primary} /> Registrar Nuevo Reporte
                            </h2>
                            <p style={{ color: '#64748b', marginBottom: '25px' }}>
                                Use este formulario para reportar puntos de acumulación de residuos o basura en la vía pública.
                            </p>

                            <form onSubmit={handleSubmit}>
                                {/* Evidencia Visual */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Evidencia Fotográfica</label>
                                    <div 
                                        onClick={() => document.getElementById('fileInput').click()}
                                        style={{ 
                                            width: '100%', 
                                            height: '200px', 
                                            border: '2px dashed #cbd5e1', 
                                            borderRadius: '12px', 
                                            display: 'flex', 
                                            flexDirection: 'column',
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            backgroundColor: '#f8fafc',
                                            overflow: 'hidden',
                                            position: 'relative'
                                        }}
                                    >
                                        {previewUrl ? (
                                            <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <>
                                                <Camera size={40} color="#94a3b8" />
                                                <span style={{ color: '#64748b', marginTop: '10px' }}>Haga clic para subir o tomar foto</span>
                                            </>
                                        )}
                                    </div>
                                    <input id="fileInput" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                                </div>

                                {/* Tipo de Residuo */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Tipo de Residuo</label>
                                    <select 
                                        value={tipoResiduoId} 
                                        onChange={(e) => setTipoResiduoId(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                                    >
                                        <option value={1}>Orgánico</option>
                                        <option value={2}>Reciclable</option>
                                        <option value={3}>No Reciclable</option>
                                        <option value={4}>Peligroso</option>
                                    </select>
                                </div>

                                {/* Descripción */}
                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700' }}>Descripción Detallada</label>
                                    <textarea 
                                        rows="3" 
                                        placeholder="Describa la situación (ej. cantidad de basura, olor, urgencia...)"
                                        value={descripcion}
                                        onChange={(e) => setDescripcion(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', resize: 'none' }}
                                        required
                                    ></textarea>
                                </div>

                                {/* Mapa / Ubicación (Simulado HU-03) */}
                                <div style={{ marginBottom: '25px', backgroundColor: '#eff6ff', padding: '15px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#1e40af', marginBottom: '10px' }}>
                                        <MapPin size={20} /> <span style={{ fontWeight: '700' }}>Ubicación GPS Detectada</span>
                                    </div>
                                    <div style={{ height: '150px', backgroundColor: '#dbeafe', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyCenter: 'center', textAlign: 'center', color: '#3b82f6', fontWeight: '600', fontSize: '14px' }}>
                                        [ MAPA INTERACTIVO: Plaza de Armas, Cusco ]<br/>
                                        Coordenadas: -13.5319, -71.9675
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{ 
                                        width: '100%', 
                                        padding: '16px', 
                                        backgroundColor: colors.primary, 
                                        color: 'white', 
                                        border: 'none', 
                                        borderRadius: '8px', 
                                        fontSize: '18px', 
                                        fontWeight: '800', 
                                        cursor: loading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '10px'
                                    }}
                                >
                                    {loading ? 'Enviando...' : <><Send size={20} /> Enviar Reporte Oficial</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Columna Derecha: Información y Estado */}
                    <div style={{ flex: '0 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        {/* Notificaciones Rápidas */}
                        <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Bell size={20} color={colors.primary} /> Avisos de Recolección
                            </h3>
                            <div style={{ borderLeft: `4px solid ${colors.primary}`, paddingLeft: '15px', marginBottom: '15px' }}>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>Zona: Centro Histórico</p>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Próxima recolección: Hoy 8:00 PM</p>
                            </div>
                            <div style={{ borderLeft: '4px solid #cbd5e1', paddingLeft: '15px' }}>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '14px' }}>Reciclables</p>
                                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Mañana Miércoles 9:00 AM</p>
                            </div>
                        </div>

                        {/* Mis Reportes Recientes */}
                        <div style={{ backgroundColor: colors.secondary, padding: '25px', borderRadius: '12px', color: 'white' }}>
                            <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <History size={20} color={colors.primary} /> Mis Reportes
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: '700' }}>Ticket #SW-9921</span>
                                        <span style={{ color: colors.primary }}>Pendiente</span>
                                    </div>
                                    <p style={{ margin: 0, opacity: 0.7 }}>Ayer, 4:30 PM - Calle Plateros</p>
                                </div>
                                <div style={{ backgroundColor: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ fontWeight: '700' }}>Ticket #SW-8812</span>
                                        <span style={{ color: colors.success }}>Resuelto</span>
                                    </div>
                                    <p style={{ margin: 0, opacity: 0.7 }}>15 May - Plaza San Blas</p>
                                </div>
                            </div>
                        </div>

                        {/* Tips de Segregación */}
                        <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>¿Sabías qué?</h3>
                            <p style={{ fontSize: '14px', lineHeight: '1.5', color: colors.text }}>
                                Segregar tus residuos orgánicos ayuda a reducir los gases de efecto invernadero en el botadero de Haquira. ¡Cusco te lo agradece!
                            </p>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default CitizenDashboard;
