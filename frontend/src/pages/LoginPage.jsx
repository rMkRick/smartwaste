import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { login, register, loginSocial } from '../services/api';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const validarDNI = (dni) => /^\d{8}$/.test(dni);
const validarCorreo = (correo) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
const validarContrasena = (c) => ({
    longitud: c.length >= 8,
    mayuscula: /[A-Z]/.test(c),
    numero: /[0-9]/.test(c),
});

const ZONAS = [
    { id: 1, nombre: 'Centro Histórico' },
    { id: 2, nombre: 'San Blas' },
    { id: 3, nombre: 'San Sebastián' },
    { id: 4, nombre: 'Santiago' },
    { id: 5, nombre: 'Wanchaq' },
];

const s = {
    page: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f4f7f6',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        padding: '20px',
    },
    card: {
        background: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '500px',
        border: '1px solid #e1e4e8',
    },
    header: { textAlign: 'center', marginBottom: '24px' },
    title: { color: '#1a73e8', margin: 0, fontSize: '28px' },
    subtitle: { color: '#5f6368', marginTop: '5px' },
    tabs: {
        display: 'flex',
        borderBottom: '2px solid #e1e4e8',
        marginBottom: '28px',
    },
    tab: (active) => ({
        flex: 1,
        padding: '10px',
        textAlign: 'center',
        cursor: 'pointer',
        fontWeight: '600',
        fontSize: '15px',
        color: active ? '#1a73e8' : '#5f6368',
        borderBottom: active ? '2px solid #1a73e8' : '2px solid transparent',
        marginBottom: '-2px',
        transition: 'all 0.2s',
        background: 'none',
        border: 'none',
        borderBottom: active ? '2px solid #1a73e8' : '2px solid transparent',
    }),
    row: { display: 'flex', gap: '16px' },
    field: { marginBottom: '18px', flex: 1 },
    label: { display: 'block', marginBottom: '6px', fontWeight: '600', color: '#3c4043', fontSize: '14px' },
    input: (error) => ({
        width: '100%',
        padding: '11px 12px',
        borderRadius: '6px',
        border: `1px solid ${error ? '#d93025' : '#dadce0'}`,
        fontSize: '15px',
        boxSizing: 'border-box',
        outline: 'none',
    }),
    select: (error) => ({
        width: '100%',
        padding: '11px 12px',
        borderRadius: '6px',
        border: `1px solid ${error ? '#d93025' : '#dadce0'}`,
        fontSize: '15px',
        boxSizing: 'border-box',
        backgroundColor: 'white',
        cursor: 'pointer',
        color: '#3c4043',
    }),
    errorText: { color: '#d93025', fontSize: '12px', marginTop: '4px' },
    passwordWrap: { position: 'relative' },
    eyeBtn: {
        position: 'absolute', right: '12px', top: '50%',
        transform: 'translateY(-50%)', background: 'none',
        border: 'none', cursor: 'pointer', color: '#5f6368', padding: 0,
    },
    strengthBox: {
        marginTop: '8px', padding: '10px 12px',
        backgroundColor: '#f8f9fa', borderRadius: '6px',
        fontSize: '12px',
    },
    strengthItem: (ok) => ({
        display: 'flex', alignItems: 'center', gap: '6px',
        color: ok ? '#137333' : '#80868b', marginBottom: '3px',
    }),
    dot: (ok) => ({
        width: '7px', height: '7px', borderRadius: '50%',
        backgroundColor: ok ? '#137333' : '#dadce0', flexShrink: 0,
    }),
    btn: (loading) => ({
        width: '100%', padding: '13px',
        backgroundColor: loading ? '#80868b' : '#1a73e8',
        color: 'white', border: 'none', borderRadius: '6px',
        cursor: loading ? 'not-allowed' : 'pointer',
        fontSize: '16px', fontWeight: '600',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        transition: 'background-color 0.2s', marginTop: '8px',
    }),
    successBox: {
        background: '#e6f4ea', border: '1px solid #137333',
        borderRadius: '8px', padding: '16px', textAlign: 'center',
        color: '#137333',
    },
};

// ── Formulario de Login ───────────────────────────────────────────────────────
const FormLogin = ({ onSwitch }) => {
    const navigate = useNavigate();
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');

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
                setError('Error al iniciar sesión con Google');
            }
        },
        onError: () => setError('El inicio de sesión con Google fue cancelado'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const { data } = await login({ correo, contrasena });
            localStorage.setItem('token', data.token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            const rol = data.usuario.rol;
            if (rol === 1) {
                navigate('/citizen-dashboard');
            } else if (rol === 2) {
                navigate('/operador-dashboard');
            } else if (rol === 3) {
                navigate('/admin-dashboard');
            } else if (rol === 4) {
                navigate('/supervisor-dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.mensaje || 'Credenciales inválidas');
        }
    };

    return (
        <form onSubmit={handleSubmit} noValidate>
            {error && <p style={{ ...s.errorText, fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>{error}</p>}

            <div style={s.field}>
                <label style={s.label}>Correo Electrónico</label>
                <input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    style={s.input(false)}
                />
            </div>

            <div style={s.field}>
                <label style={s.label}>Contraseña</label>
                <input
                    type="password"
                    placeholder="••••••••"
                    value={contrasena}
                    onChange={(e) => setContrasena(e.target.value)}
                    required
                    style={s.input(false)}
                />
            </div>

            <button type="submit" style={s.btn(false)}>
                <LogIn size={20} /> Iniciar Sesión
            </button>

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
                            flex: 1, padding: '11px', border: '1.5px solid #dadce0',
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
                            flex: 1, padding: '11px', border: '1.5px solid #dadce0',
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
        </form>
    );
};

// ── Formulario de Registro ────────────────────────────────────────────────────
const FormRegister = ({ onSwitch }) => {
    const [form, setForm] = useState({
        nombres: '', apellidos: '', dni: '',
        correo: '', contrasena: '', zona_id: '',
    });
    const [errores, setErrores] = useState({});
    const [verContrasena, setVerContrasena] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exito, setExito] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
    };

    const validar = () => {
        const e = {};
        if (!form.nombres.trim()) e.nombres = 'El nombre es requerido';
        if (!form.apellidos.trim()) e.apellidos = 'El apellido es requerido';
        if (!validarDNI(form.dni)) e.dni = 'El DNI debe tener exactamente 8 dígitos numéricos';
        if (!validarCorreo(form.correo)) e.correo = 'Ingresa un correo electrónico válido';
        if (!form.zona_id) e.zona_id = 'Selecciona tu zona de residencia';
        const fuerza = validarContrasena(form.contrasena);
        if (!fuerza.longitud || !fuerza.mayuscula || !fuerza.numero)
            e.contrasena = 'La contraseña no cumple los requisitos mínimos';
        return e;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const e_val = validar();
        if (Object.keys(e_val).length > 0) { setErrores(e_val); return; }

        setLoading(true);
        try {
            await register({
                nombres: form.nombres.trim(),
                apellidos: form.apellidos.trim(),
                dni: form.dni,
                correo: form.correo.trim().toLowerCase(),
                contrasena: form.contrasena,
                rol_id: 1,
                zona_id: parseInt(form.zona_id),
            });
            setExito(true);
            setTimeout(() => onSwitch('login'), 2500);
        } catch (error) {
            setErrores({ general: error.response?.data?.mensaje || 'Error al registrar usuario' });
        } finally {
            setLoading(false);
        }
    };

    const fuerza = validarContrasena(form.contrasena);

    if (exito) {
        return (
            <div style={s.successBox}>
                <h2 style={{ margin: '0 0 8px' }}>¡Registro exitoso!</h2>
                <p style={{ margin: 0 }}>Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} noValidate>
            {errores.general && (
                <p style={{ ...s.errorText, fontSize: '14px', textAlign: 'center', marginBottom: '16px' }}>
                    {errores.general}
                </p>
            )}

            <div style={s.row}>
                <div style={s.field}>
                    <label style={s.label}>Nombres *</label>
                    <input name="nombres" value={form.nombres} onChange={handleChange}
                        placeholder="Juan" style={s.input(errores.nombres)} />
                    {errores.nombres && <p style={s.errorText}>{errores.nombres}</p>}
                </div>
                <div style={s.field}>
                    <label style={s.label}>Apellidos *</label>
                    <input name="apellidos" value={form.apellidos} onChange={handleChange}
                        placeholder="Pérez" style={s.input(errores.apellidos)} />
                    {errores.apellidos && <p style={s.errorText}>{errores.apellidos}</p>}
                </div>
            </div>

            <div style={s.field}>
                <label style={s.label}>DNI *</label>
                <input name="dni" value={form.dni} onChange={handleChange}
                    placeholder="12345678" maxLength={8} style={s.input(errores.dni)} />
                {errores.dni && <p style={s.errorText}>{errores.dni}</p>}
            </div>

            <div style={s.field}>
                <label style={s.label}>Correo Electrónico *</label>
                <input type="email" name="correo" value={form.correo} onChange={handleChange}
                    placeholder="ejemplo@correo.com" style={s.input(errores.correo)} />
                {errores.correo && <p style={s.errorText}>{errores.correo}</p>}
            </div>

            <div style={s.field}>
                <label style={s.label}>Contraseña *</label>
                <div style={s.passwordWrap}>
                    <input
                        type={verContrasena ? 'text' : 'password'}
                        name="contrasena" value={form.contrasena} onChange={handleChange}
                        placeholder="••••••••"
                        style={{ ...s.input(errores.contrasena), paddingRight: '42px' }}
                    />
                    <button type="button" style={s.eyeBtn}
                        onClick={() => setVerContrasena(v => !v)}>
                        {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
                {form.contrasena.length > 0 && (
                    <div style={s.strengthBox}>
                        <div style={s.strengthItem(fuerza.longitud)}>
                            <span style={s.dot(fuerza.longitud)} /> Mínimo 8 caracteres
                        </div>
                        <div style={s.strengthItem(fuerza.mayuscula)}>
                            <span style={s.dot(fuerza.mayuscula)} /> Al menos una mayúscula
                        </div>
                        <div style={s.strengthItem(fuerza.numero)}>
                            <span style={s.dot(fuerza.numero)} /> Al menos un número
                        </div>
                    </div>
                )}
                {errores.contrasena && <p style={s.errorText}>{errores.contrasena}</p>}
            </div>

            <div style={s.field}>
                <label style={s.label}>Zona de Residencia *</label>
                <select name="zona_id" value={form.zona_id} onChange={handleChange}
                    style={s.select(errores.zona_id)}>
                    <option value="">Selecciona tu zona...</option>
                    {ZONAS.map(z => <option key={z.id} value={z.id}>{z.nombre}</option>)}
                </select>
                {errores.zona_id && <p style={s.errorText}>{errores.zona_id}</p>}
            </div>

            <button type="submit" style={s.btn(loading)} disabled={loading}>
                <UserPlus size={20} />
                {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
        </form>
    );
};

// ── Página principal ──────────────────────────────────────────────────────────
const LoginPage = () => {
    const [tab, setTab] = useState('login');

    return (
        <div style={s.page}>
            <div style={s.card}>
                <div style={s.header}>
                    <h1 style={s.title}>SmartWaste</h1>
                    <p style={s.subtitle}>Gestión Inteligente de Residuos - Cusco</p>
                </div>

                <div style={s.tabs}>
                    <button style={s.tab(tab === 'login')} onClick={() => setTab('login')}>
                        Iniciar Sesión
                    </button>
                    <button style={s.tab(tab === 'register')} onClick={() => setTab('register')}>
                        Crear Cuenta
                    </button>
                </div>

                {tab === 'login'
                    ? <FormLogin onSwitch={setTab} />
                    : <FormRegister onSwitch={setTab} />
                }
            </div>
        </div>
    );
};

export default LoginPage;
