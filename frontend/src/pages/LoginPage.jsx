import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [correo, setCorreo] = useState('');
    const [contrasena, setContrasena] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
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

    return (
        <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100vh', 
            backgroundColor: '#f4f7f6',
            fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
        }}>
            <form onSubmit={handleSubmit} style={{ 
                background: 'white', 
                padding: '40px', 
                borderRadius: '12px', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)', 
                width: '100%', 
                maxWidth: '450px',
                border: '1px solid #e1e4e8'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#1a73e8', margin: '0', fontSize: '28px' }}>SmartWaste</h1>
                    <p style={{ color: '#5f6368', marginTop: '5px' }}>Gestión Inteligente de Residuos - Cusco</p>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3c4043' }}>Correo Electrónico</label>
                    <input 
                        type="email" 
                        placeholder="ejemplo@correo.com"
                        value={correo} 
                        onChange={(e) => setCorreo(e.target.value)} 
                        required 
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            borderRadius: '6px', 
                            border: '1px solid #dadce0',
                            fontSize: '16px'
                        }} 
                    />
                </div>

                <div style={{ marginBottom: '25px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#3c4043' }}>Contraseña</label>
                    <input 
                        type="password" 
                        placeholder="••••••••"
                        value={contrasena} 
                        onChange={(e) => setContrasena(e.target.value)} 
                        required 
                        style={{ 
                            width: '100%', 
                            padding: '12px', 
                            borderRadius: '6px', 
                            border: '1px solid #dadce0',
                            fontSize: '16px'
                        }} 
                    />
                </div>

                <button type="submit" style={{ 
                    width: '100%', 
                    padding: '14px', 
                    backgroundColor: '#1a73e8', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '6px', 
                    cursor: 'pointer', 
                    fontSize: '16px',
                    fontWeight: '600',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '10px',
                    transition: 'background-color 0.2s'
                }}>
                    <LogIn size={20} /> Iniciar Sesión
                </button>

                <div style={{ textAlign: 'center', marginTop: '25px', borderTop: '1px solid #f1f3f4', paddingTop: '20px' }}>
                    <p style={{ color: '#5f6368', margin: '0' }}>
                        ¿No tienes una cuenta? 
                        <span 
                            onClick={() => navigate('/register')} 
                            style={{ color: '#1a73e8', cursor: 'pointer', marginLeft: '5px', fontWeight: '600' }}
                        >
                            Regístrate aquí
                        </span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;
