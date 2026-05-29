import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { UserPlus, Eye, EyeOff, CheckCircle } from 'lucide-react';

// ── Validadores ──────────────────────────────────────────────────────────────
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

// ── Estilos base (mismo look que LoginPage) ───────────────────────────────────
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
    header: { textAlign: 'center', marginBottom: '28px' },
    title: { color: '#1a73e8', margin: 0, fontSize: '28px' },
    subtitle: { color: '#5f6368', marginTop: '5px' },
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
        transition: 'border-color 0.2s',
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
    divider: { borderTop: '1px solid #f1f3f4', paddingTop: '20px', textAlign: 'center', marginTop: '20px' },
    link: { color: '#1a73e8', cursor: 'pointer', marginLeft: '5px', fontWeight: '600' },
    successBox: {
        background: '#e6f4ea', border: '1px solid #137333',
        borderRadius: '8px', padding: '16px', textAlign: 'center',
        color: '#137333',
    },
};

// ── Componente ────────────────────────────────────────────────────────────────
const RegisterPage = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        nombres: '', apellidos: '', dni: '',
        correo: '', contrasena: '', zona_id: '',
    });
    const [errores, setErrores] = useState({});
    const [verContrasena, setVerContrasena] = useState(false);
    const [loading, setLoading] = useState(false);
    const [exito, setExito] = useState(false);

    // ── Actualizar campo ──────────────────────────────────────────────────────
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        // Limpiar error del campo al editar
        if (errores[name]) setErrores(prev => ({ ...prev, [name]: '' }));
    };

    // ── Validación completa antes de enviar ───────────────────────────────────
    const validar = () => {
        const e = {};
        if (!form.nombres.trim()) e.nombres = 'El nombre es requerido';
        if (!form.apellidos.trim()) e.apellidos = 'El apellido es requerido';
        if (!validarDNI(form.dni)) e.dni = 'El DNI debe tener exactamente 8 dígitos numéricos';
        if (!validarCorreo(form.correo)) e.correo = 'Ingresa un correo electrónico válido';
        if (!form.zona_id) e.zona_id = 'Selecciona tu zona de residencia';

        const fuerza = validarContrasena(form.contrasena);
        if (!fuerza.longitud || !fuerza.mayuscula || !fuerza.numero) {
            e.contrasena = 'La contraseña no cumple los requisitos mínimos';
        }

        return e;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        const e_val = validar();
        if (Object.keys(e_val).length > 0) {
            setErrores(e_val);
            return;
        }

        setLoading(true);
        try {
            await register({
                nombres: form.nombres.trim(),
                apellidos: form.apellidos.trim(),
                dni: form.dni,
                correo: form.correo.trim().toLowerCase(),
                contrasena: form.contrasena,
                rol_id: 1, // ciudadano por defecto
                zona_id: parseInt(form.zona_id),
            });

            setExito(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (error) {
            const msg = error.response?.data?.mensaje || 'Error al registrar usuario';
            setErrores({ general: msg });
        } finally {
            setLoading(false);
        }
    };

    const fuerza = validarContrasena(form.contrasena);

    // ── Pantalla de éxito ─────────────────────────────────────────────────────
    if (exito) {
        return (
            <div style={s.page}>
                <div style={s.card}>
                    <div style={s.successBox}>
                        <CheckCircle size={48} style={{ marginBottom: '12px' }} />
                        <h2 style={{ margin: '0 0 8px' }}>¡Registro exitoso!</h2>
                        <p style={{ margin: 0 }}>Tu cuenta ha sido creada. Redirigiendo al inicio de sesión...</p>
                    </div>
                </div>
            </div>
        );
    }

    // ── Formulario ────────────────────────────────────────────────────────────
    return (
        <div style={s.page}>
            <div style={s.card}>
                {/* Header */}
                <div style={s.header}>
                    <h1 style={s.title}>SmartWaste</h1>
                    <p style={s.subtitle}>Crear cuenta de ciudadano</p>
                </div>

                {/* Error general del servidor */}
                {errores.general && (
                    <div style={{ ...s.errorText, marginBottom: '16px', fontSize: '14px', textAlign: 'center' }}>
                        {errores.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                    {/* Nombres y Apellidos */}
                    <div style={s.row}>
                        <div style={s.field}>
                            <label style={s.label}>Nombres *</label>
                            <input
                                name="nombres"
                                value={form.nombres}
                                onChange={handleChange}
                                placeholder="Juan"
                                style={s.input(errores.nombres)}
                            />
                            {errores.nombres && <p style={s.errorText}>{errores.nombres}</p>}
                        </div>
                        <div style={s.field}>
                            <label style={s.label}>Apellidos *</label>
                            <input
                                name="apellidos"
                                value={form.apellidos}
                                onChange={handleChange}
                                placeholder="Pérez"
                                style={s.input(errores.apellidos)}
                            />
                            {errores.apellidos && <p style={s.errorText}>{errores.apellidos}</p>}
                        </div>
                    </div>

                    {/* DNI */}
                    <div style={s.field}>
                        <label style={s.label}>DNI *</label>
                        <input
                            name="dni"
                            value={form.dni}
                            onChange={handleChange}
                            placeholder="12345678"
                            maxLength={8}
                            style={s.input(errores.dni)}
                        />
                        {errores.dni && <p style={s.errorText}>{errores.dni}</p>}
                    </div>

                    {/* Correo */}
                    <div style={s.field}>
                        <label style={s.label}>Correo Electrónico *</label>
                        <input
                            type="email"
                            name="correo"
                            value={form.correo}
                            onChange={handleChange}
                            placeholder="ejemplo@correo.com"
                            style={s.input(errores.correo)}
                        />
                        {errores.correo && <p style={s.errorText}>{errores.correo}</p>}
                    </div>

                    {/* Contraseña */}
                    <div style={s.field}>
                        <label style={s.label}>Contraseña *</label>
                        <div style={s.passwordWrap}>
                            <input
                                type={verContrasena ? 'text' : 'password'}
                                name="contrasena"
                                value={form.contrasena}
                                onChange={handleChange}
                                placeholder="••••••••"
                                style={{ ...s.input(errores.contrasena), paddingRight: '42px' }}
                            />
                            <button
                                type="button"
                                style={s.eyeBtn}
                                onClick={() => setVerContrasena(v => !v)}
                                aria-label={verContrasena ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {verContrasena ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {/* Indicador de fortaleza */}
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

                    {/* Zona de residencia */}
                    <div style={s.field}>
                        <label style={s.label}>Zona de Residencia *</label>
                        <select
                            name="zona_id"
                            value={form.zona_id}
                            onChange={handleChange}
                            style={s.select(errores.zona_id)}
                        >
                            <option value="">Selecciona tu zona...</option>
                            {ZONAS.map(z => (
                                <option key={z.id} value={z.id}>{z.nombre}</option>
                            ))}
                        </select>
                        {errores.zona_id && <p style={s.errorText}>{errores.zona_id}</p>}
                    </div>

                    {/* Botón */}
                    <button type="submit" style={s.btn(loading)} disabled={loading}>
                        <UserPlus size={20} />
                        {loading ? 'Registrando...' : 'Crear Cuenta'}
                    </button>
                </form>

                {/* Link al login */}
                <div style={s.divider}>
                    <p style={{ color: '#5f6368', margin: 0 }}>
                        ¿Ya tienes una cuenta?
                        <span onClick={() => navigate('/login')} style={s.link}>
                            Inicia sesión
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
