import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DashboardRedirect = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const userStr = localStorage.getItem('usuario');
        if (!userStr) {
            navigate('/login');
            return;
        }

        const user = JSON.parse(userStr);
        const rol = user.rol;

        if (rol === 1) {
            navigate('/citizen-dashboard');
        } else if (rol === 2) {
            navigate('/operador-dashboard');
        } else if (rol === 3) {
            navigate('/admin-dashboard');
        } else if (rol === 4) {
            navigate('/supervisor-dashboard');
        } else {
            navigate('/');
        }
    }, [navigate]);

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
                <p style={{ fontSize: '16px', color: '#64748b' }}>Redirigiendo...</p>
            </div>
        </div>
    );
};

export default DashboardRedirect;
