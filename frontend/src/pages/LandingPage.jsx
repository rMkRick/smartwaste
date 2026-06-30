import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Shield, MapPin, BarChart3, Bell, ArrowRight, Camera, X, LogIn } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { login, loginSocial } from '../services/api';

const LandingPage = () => {
    const navigate = useNavigate();
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');

    // Paleta de colores OptimoRoute
    const colors = {
        primary: '#f97316',    // Naranja Optimo
        secondary: '#0f172a',  // Navy oscuro
        text: '#334155',
        lightBg: '#f8fafc',
        white: '#ffffff',
        accent: '#1a73e8'      // Azul para login
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await login({ correo, contrasena });
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            
            // Redirección basada en Rol
            if (data.usuario.rol === 1) {
                navigate('/citizen-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            alert('Error al iniciar sesión: ' + (error.response?.data?.mensaje || 'Credenciales inválidas'));
        }
    };

    const scrollToLogin = () => {
        document.getElementById('login-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const redirigirPorRol = (rol) => {
        if (rol === 1) navigate('/citizen-dashboard');
        else if (rol === 2) navigate('/operador-dashboard');
        else if (rol === 3) navigate('/admin-dashboard');
        else if (rol === 4) navigate('/supervisor-dashboard');
        else navigate('/dashboard');
    };

    const loginConGoogle = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const perfil = await res.json();
                const { data } = await loginSocial({
                    nombres: perfil.given_name || perfil.name,
                    apellidos: perfil.family_name || '',
                    correo: perfil.email,
                    foto_perfil: perfil.picture,
                    proveedor_social: 'google',
                    proveedor_id: perfil.id,
                });
                localStorage.setItem('token', data.token);
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                redirigirPorRol(data.usuario.rol);
            } catch {
                alert('Error al iniciar sesión con Google');
            }
        },
        onError: () => alert('El inicio de sesión con Google fue cancelado'),
    });

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', color: colors.text, overflowX: 'hidden', margin: 0, padding: 0 }}>
            {/* Header / Navbar */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: colors.white, fontWeight: '800', fontSize: '24px' }}>
                    <Trash2 size={28} color={colors.primary} /> SMARTWASTE
                </div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <a href="#solucion" style={{ textDecoration: 'none', color: colors.white, fontWeight: '500', fontSize: '15px' }}>Soluciones</a>
                    <a href="#mapas" style={{ textDecoration: 'none', color: colors.white, fontWeight: '500', fontSize: '15px' }}>Mapas</a>
                    <button 
                        onClick={() => navigate('/register')}
                        style={{ 
                            padding: '12px 24px', 
                            backgroundColor: 'transparent', 
                            color: colors.white, 
                            border: `2px solid ${colors.primary}`, 
                            borderRadius: '6px', 
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        Registrarse
                    </button>   
                   
                   
                    <button 
                        onClick={scrollToLogin}
                        style={{ 
                            padding: '12px 24px', 
                            backgroundColor: colors.primary, 
                            color: colors.white, 
                            border: 'none', 
                            borderRadius: '6px', 
                            fontWeight: '700',
                            cursor: 'pointer'
                        }}
                    >
                        Acceso Sistema
                    </button>
                </div>
            </nav>

            {/* Hero Section con Imagen de Cusco y Login Integrado */}
            <header id="login-section" style={{ 
                width: '100%',
                minHeight: '100vh',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundImage: 'linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.7)), url("https://images.unsplash.com/photo-1526392060635-9d6019884377?q=80&w=2000&auto=format&fit=crop")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed',
                color: colors.white,
                padding: '100px 10% 50px',
                margin: 0,
                boxSizing: 'border-box'
            }}>
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    width: '100%',
                    maxWidth: '1200px',
                    gap: '50px',
                    flexWrap: 'wrap'
                }}>
                    {/* Columna Izquierda: Mensaje */}
                    <div style={{ flex: '1 1 500px', textAlign: 'left' }}>
                        <h1 style={{ fontSize: '56px', fontWeight: '900', marginBottom: '25px', lineHeight: '1.1' }}>
                            Software de Recolección de Residuos <br/>
                            <span style={{ color: colors.primary }}>Impulsando un Cusco Limpio</span>
                        </h1>
                        <p style={{ fontSize: '20px', marginBottom: '40px', opacity: 0.9, lineHeight: '1.6' }}>
                            Optimice sus rutas de recolección, reduzca emisiones en la ciudad imperial y mejore la calidad de vida de todos los cusqueños.
                        </p>
                        <div style={{ display: 'flex', gap: '20px' }}>
                            <button 
                                onClick={() => navigate('/reportar-invitado')}
                                style={{ 
                                    padding: '18px 40px', 
                                    backgroundColor: colors.primary, 
                                    color: colors.white, 
                                    border: 'none', 
                                    borderRadius: '6px', 
                                    fontSize: '18px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                }}
                            >
                                Reportar Basura Ahora
                            </button>
                        </div>
                    </div>

                    {/* Columna Derecha: Formulario de Login */}
                    <div style={{ 
                        flex: '0 1 400px',
                        backgroundColor: 'white',
                        padding: '40px',
                        borderRadius: '12px',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
                        color: colors.text
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                            <Trash2 size={40} color={colors.primary} style={{ marginBottom: '10px' }} />
                            <h2 style={{ margin: 0, color: colors.secondary, fontSize: '24px' }}>Acceso al Sistema</h2>
                            <p style={{ color: '#64748b', fontSize: '14px' }}>Inicie sesión para gestionar la recolección</p>
                        </div>

                        <form onSubmit={handleLoginSubmit}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Correo Electrónico</label>
                                <input 
                                    type="email" 
                                    value={correo}
                                    onChange={(e) => setCorreo(e.target.value)}
                                    placeholder="admin@smartwaste.com"
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                                    required
                                />
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Contraseña</label>
                                <input 
                                    type="password" 
                                    value={contrasena}
                                    onChange={(e) => setContrasena(e.target.value)}
                                    placeholder="••••••••"
                                    style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '16px' }}
                                    required
                                />
                            </div>
                            <button type="submit" style={{ 
                                width: '100%', 
                                padding: '14px', 
                                backgroundColor: colors.primary, 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '6px', 
                                fontWeight: '700', 
                                cursor: 'pointer',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                            }}>
                                <LogIn size={20} /> Entrar
                            </button>
                        </form>
                        {/* Social Login */}
                        <div style={{ marginTop: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                                <span style={{ color: '#94a3b8', fontSize: '13px', whiteSpace: 'nowrap' }}>o continúa con</span>
                                <div style={{ flex: 1, height: '1px', backgroundColor: '#e2e8f0' }} />
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    type="button"
                                    onClick={() => loginConGoogle()}
                                    style={{
                                        flex: 1, padding: '11px', border: '1.5px solid #e2e8f0',
                                        borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontWeight: '600', fontSize: '14px', color: '#3c4043',
                                        transition: 'box-shadow 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    <svg width="18" height="18" viewBox="0 0 18 18">
                                        <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.076 17.64 11.768 17.64 9.2z"/>
                                        <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                                        <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                                        <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                                    </svg>
                                    Google
                                </button>
                                <button
                                    type="button"
                                    onClick={() => alert('Integración con Facebook próximamente')}
                                    style={{
                                        flex: 1, padding: '11px', border: '1.5px solid #e2e8f0',
                                        borderRadius: '8px', backgroundColor: 'white', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                        fontWeight: '600', fontSize: '14px', color: '#1877F2',
                                        transition: 'box-shadow 0.2s',
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)'}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                                    </svg>
                                    Facebook
                                </button>
                            </div>
                        </div>

                        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
                            <span style={{ color: '#64748b' }}>¿No tienes cuenta? </span>
                            <span
                                onClick={() => navigate('/register')}
                                style={{ color: colors.primary, cursor: 'pointer', fontWeight: '700' }}
                            >
                                Regístrate aquí
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Statistics Section */}
            <section style={{ padding: '80px 10%', backgroundColor: colors.white, textAlign: 'center', display: 'flex', justifyContent: 'space-around', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '48px', color: colors.primary, margin: '0' }}>-30%</h2>
                    <p style={{ fontWeight: '600', color: colors.secondary }}>Tiempo de Ruta</p>
                </div>
                <div>
                    <h2 style={{ fontSize: '48px', color: colors.primary, margin: '0' }}>-25%</h2>
                    <p style={{ fontWeight: '600', color: colors.secondary }}>Emisiones de CO2</p>
                </div>
                <div>
                    <h2 style={{ fontSize: '48px', color: colors.primary, margin: '0' }}>98%</h2>
                    <p style={{ fontWeight: '600', color: colors.secondary }}>Cumplimiento de Horarios</p>
                </div>
            </section>

            {/* NUEVA SECCIÓN: Mapas de Recolección (Inspirado en OptimoRoute) */}
            <section id="mapas" style={{ padding: '100px 10%', backgroundColor: colors.lightBg }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <h2 style={{ color: colors.primary, fontSize: '18px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px' }}>Tecnología de Mapeo</h2>
                    <h3 style={{ fontSize: '42px', color: colors.secondary, fontWeight: '900', marginBottom: '20px' }}>Mapas de Recolección Inteligentes</h3>
                    <p style={{ maxWidth: '800px', margin: '0 auto', fontSize: '18px', color: colors.text }}>
                        Visualice toda su operación en tiempo real. Nuestros mapas no solo muestran dónde están los camiones, sino que optimizan cada giro para maximizar la eficiencia en las calles de Cusco.
                    </p>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    {[
                        {
                            title: "Optimización de Rutas",
                            desc: "Algoritmos avanzados que calculan la secuencia más rápida de paradas considerando el tráfico y la geografía de Cusco.",
                            icon: <MapPin size={32} color={colors.primary} />
                        },
                        {
                            title: "Monitoreo en Tiempo Real",
                            desc: "Siga cada vehículo en el mapa con actualizaciones cada 30 segundos. Sepa exactamente qué zonas ya fueron atendidas.",
                            icon: <BarChart3 size={32} color={colors.primary} />
                        },
                        {
                            title: "Zonificación Inteligente",
                            desc: "Defina áreas de servicio digitales (geofencing) para asegurar que ningún rincón de la ciudad se quede sin recolección.",
                            icon: <Shield size={32} color={colors.primary} />
                        }
                    ].map((feature, idx) => (
                        <div key={idx} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <div style={{ marginBottom: '20px' }}>{feature.icon}</div>
                            <h4 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '15px', color: colors.secondary }}>{feature.title}</h4>
                            <p style={{ lineHeight: '1.6', color: colors.text }}>{feature.desc}</p>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '80px', position: 'relative', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}>
                    <img 
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop" 
                        alt="Dashboard de Mapas" 
                        style={{ width: '100%', display: 'block' }}
                    />
                    <div style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        background: 'radial-gradient(circle, rgba(15,23,42,0.1) 0%, rgba(15,23,42,0.4) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <div style={{ backgroundColor: 'white', padding: '20px 40px', borderRadius: '50px', fontWeight: '800', fontSize: '20px', color: colors.secondary, boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
                            Panel de Control Interactivo
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección: Planificación de Rutas */}
            <section id="solucion" style={{ padding: '100px 10%', display: 'flex', alignItems: 'center', backgroundColor: colors.white, gap: '50px', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 400px' }}>
                    <h2 style={{ color: colors.primary, fontSize: '18px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '15px' }}>Eficiencia Máxima</h2>
                    <h3 style={{ fontSize: '42px', color: colors.secondary, fontWeight: '900', marginBottom: '25px', lineHeight: '1.2' }}>
                        Planificación Automática de Rutas
                    </h3>
                    <p style={{ fontSize: '18px', lineHeight: '1.8', color: colors.text, marginBottom: '30px' }}>
                        Nuestro motor de optimización calcula las rutas de recolección más eficientes en segundos. Reduzca el kilometraje y mejore la cobertura en los distritos más densos de Cusco.
                    </p>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                        {['Carga equilibrada por vehículo', 'Consideración de pendientes y calles estrechas', 'Ventanas de tiempo garantizadas'].map((item, i) => (
                            <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', fontWeight: '600' }}>
                                <Shield size={20} color={colors.primary} /> {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div style={{ flex: '1 1 500px' }}>
                    <img 
                        src="https://images.unsplash.com/photo-1554344728-77ad90d6ed3e?q=80&w=2000&auto=format&fit=crop" 
                        alt="Ruta Optimizada" 
                        style={{ width: '100%', borderRadius: '12px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
                    />
                </div>
            </section>

            {/* CTA Final */}
            <section style={{ padding: '100px 10%', backgroundColor: colors.primary, textAlign: 'center', color: 'white' }}>
                <h2 style={{ fontSize: '48px', fontWeight: '900', marginBottom: '20px' }}>¿Listo para optimizar Cusco?</h2>
                <p style={{ fontSize: '22px', marginBottom: '40px', opacity: 0.9 }}>Comience hoy mismo a gestionar sus residuos de manera inteligente.</p>
                <button 
                    onClick={scrollToLogin}
                    style={{ padding: '20px 50px', backgroundColor: colors.secondary, color: 'white', border: 'none', borderRadius: '6px', fontSize: '20px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' }}
                >
                    Probar ahora
                </button>
            </section>

            {/* Footer */}
            <footer style={{ padding: '80px 10% 40px', backgroundColor: colors.secondary, color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '40px' }}>
                    <div style={{ maxWidth: '400px' }}>
                        <div style={{ fontSize: '24px', fontWeight: '900', marginBottom: '20px', color: colors.primary }}>SMARTWASTE</div>
                        <p style={{ opacity: 0.8, lineHeight: '1.8' }}>Transformando la recolección de residuos en Cusco a través de la optimización de rutas y la participación ciudadana.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '80px' }}>
                        <div>
                            <h4 style={{ marginBottom: '20px' }}>Producto</h4>
                            <ul style={{ listStyle: 'none', padding: 0, opacity: 0.7, lineHeight: '2.5' }}>
                                <li>Rutas</li>
                                <li>Mapas</li>
                                <li>Analítica</li>
                            </ul>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: '20px' }}>Legal</h4>
                            <ul style={{ listStyle: 'none', padding: 0, opacity: 0.7, lineHeight: '2.5' }}>
                                <li>Privacidad</li>
                                <li>Términos</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '60px', paddingTop: '30px', textAlign: 'center', opacity: 0.5, fontSize: '14px' }}>
                    © 2026 SmartWaste Cusco. Inspirado en la eficiencia de OptimoRoute.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

