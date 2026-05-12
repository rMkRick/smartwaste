import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Send, ArrowLeft, Trash2, Shield, MapPin as MapPinIcon } from 'lucide-react';
import { createReport } from '../services/api';

const GuestReportPage = () => {
    const [descripcion, setDescripcion] = useState('');
    const [tipoResiduoId, setTipoResiduoId] = useState(1);
    const navigate = useNavigate();

    // Paleta de colores consistente
    const colors = {
        primary: '#f97316',    // Naranja Optimo
        secondary: '#0f172a',  // Navy oscuro
        text: '#334155',
        lightBg: '#f8fafc',
        white: '#ffffff',
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const latitud = -13.5319; 
            const longitud = -71.9675;

            const { data } = await createReport({
                usuario_id: null,
                foto_url: 'https://via.placeholder.com/300',
                latitud,
                longitud,
                tipo_residuo_id: tipoResiduoId,
                descripcion
            });

            alert(`Reporte enviado con éxito. Su ticket es: ${data.numero_ticket}`);
            navigate('/');
        } catch (error) {
            alert('Error al enviar reporte');
        }
    };

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', color: colors.text, overflowX: 'hidden', margin: 0, padding: 0 }}>
            {/* Header / Navbar (Mismo que Landing) */}
            <nav style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '20px 10%', 
                backgroundColor: 'rgba(15, 23, 42, 0.95)', 
                position: 'fixed',
                width: '100%',
                left: 0,
                top: 0,
                zIndex: 1000,
                backdropFilter: 'blur(10px)',
                boxSizing: 'border-box'
            }}>
                <div 
                    onClick={() => navigate('/')}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.white, fontWeight: '800', fontSize: '24px', cursor: 'pointer' }}
                >
                    <Trash2 size={28} color={colors.primary} /> SMARTWASTE
                </div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <button 
                        onClick={() => navigate('/')}
                        style={{ 
                            padding: '12px 24px', 
                            backgroundColor: 'transparent', 
                            color: colors.white, 
                            border: '1px solid white', 
                            borderRadius: '6px', 
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <ArrowLeft size={18} /> Volver
                    </button>
                </div>
            </nav>

            {/* Hero Section para el Reporte */}
            <header style={{ 
                width: '100%',
                minHeight: '100vh',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url("https://images.unsplash.com/photo-1518173946687-a4c8a9b746f5?q=80&w=2000&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: colors.white,
                padding: '120px 10% 80px',
                boxSizing: 'border-box'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    justifyContent: 'space-between', 
                    width: '100%',
                    maxWidth: '1200px',
                    gap: '60px',
                    flexWrap: 'wrap'
                }}>
                    {/* Información Lateral */}
                    <div style={{ flex: '1 1 400px' }}>
                        <h1 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px', lineHeight: '1.2' }}>
                            Tu reporte hace la <span style={{ color: colors.primary }}>diferencia</span>
                        </h1>
                        <p style={{ fontSize: '18px', opacity: 0.9, lineHeight: '1.6', marginBottom: '30px' }}>
                            Ayúdanos a identificar puntos críticos de limpieza en Cusco. No necesitas cuenta para reportar una incidencia; tu reporte llegará directamente a nuestras unidades móviles.
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', padding: '10px', borderRadius: '50%' }}>
                                    <Shield size={24} color={colors.primary} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '18px' }}>Atención Prioritaria</h4>
                                    <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>Los reportes se procesan en menos de 24 horas.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ backgroundColor: 'rgba(249, 115, 22, 0.2)', padding: '10px', borderRadius: '50%' }}>
                                    <MapPinIcon size={24} color={colors.primary} />
                                </div>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '18px' }}>Geolocalización</h4>
                                    <p style={{ margin: 0, opacity: 0.7, fontSize: '14px' }}>Detectamos el punto exacto automáticamente.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Formulario de Reporte */}
                    <div style={{ 
                        flex: '0 1 500px',
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '16px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        color: colors.text
                    }}>
                        <h2 style={{ color: colors.secondary, fontSize: '28px', marginBottom: '10px', fontWeight: '800' }}>Nueva Incidencia</h2>
                        <p style={{ color: '#64748b', marginBottom: '30px' }}>Complete los datos para enviar a la municipalidad.</p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ 
                                border: '2px dashed #cbd5e1', 
                                borderRadius: '12px', 
                                padding: '30px', 
                                textAlign: 'center', 
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                backgroundColor: '#f8fafc'
                            }}>
                                <Camera size={40} color={colors.primary} style={{ marginBottom: '10px' }} />
                                <p style={{ margin: 0, fontWeight: '700', color: colors.secondary }}>Adjuntar Fotografía</p>
                                <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>JPG o PNG (máx. 5MB)</p>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>Tipo de Residuo</label>
                                <select 
                                    value={tipoResiduoId} 
                                    onChange={(e) => setTipoResiduoId(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', outline: 'none' }}
                                >
                                    <option value={1}>Orgánico</option>
                                    <option value={2}>Reciclable</option>
                                    <option value={3}>No Reciclable</option>
                                    <option value={4}>Peligroso</option>
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '700', fontSize: '14px' }}>Descripción del problema</label>
                                <textarea 
                                    rows="3" 
                                    placeholder="Ej: Gran cantidad de bolsas acumuladas..."
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                    style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', resize: 'none', outline: 'none' }}
                                ></textarea>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#f1f5f9', padding: '15px', borderRadius: '8px', color: '#475569', fontSize: '14px' }}>
                                <MapPin size={18} color={colors.primary} /> 
                                <span style={{ fontWeight: '500' }}>Ubicación: Plaza de Armas, Cusco</span>
                            </div>

                            <button type="submit" style={{ 
                                padding: '16px', 
                                backgroundColor: colors.primary, 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                fontSize: '18px', 
                                fontWeight: '800', 
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '10px',
                                boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.4)'
                            }}>
                                <Send size={20} /> Enviar Reporte
                            </button>
                        </form>
                    </div>
                </div>
            </header>

            {/* Footer (Consistente con Landing) */}
            <footer style={{ padding: '60px 10% 30px', backgroundColor: colors.secondary, color: 'white' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '15px', color: colors.primary }}>SMARTWASTE</div>
                    <p style={{ opacity: 0.6, maxWidth: '600px', margin: '0 auto 30px', lineHeight: '1.6' }}>
                        Gracias por contribuir a que Cusco sea una ciudad más limpia y sostenible para todos.
                    </p>
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', opacity: 0.4, fontSize: '13px' }}>
                        © 2026 SmartWaste Cusco. Tu participación es fundamental.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default GuestReportPage;
