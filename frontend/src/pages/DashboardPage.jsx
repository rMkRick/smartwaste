import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, MapPin, Calendar } from 'lucide-react';
import api from '../services/api';

const Dashboard = () => {
    const [usuario, setUsuario] = useState(null);
    const [reportes, setReportes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const usuarioGuardado = localStorage.getItem('usuario');
        if (!usuarioGuardado) {
            navigate('/login');
        } else {
            setUsuario(JSON.parse(usuarioGuardado));
            cargarReportes();
        }
    }, [navigate]);

    const cargarReportes = async () => {
        try {
            const { data } = await api.get('/reports');
            setReportes(data);
        } catch (error) {
            console.error('Error al cargar reportes', error);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #e0e0e0', paddingBottom: '1rem' }}>
                <h1 style={{ color: '#1a73e8', display: 'flex', alignItems: 'center', gap: '10px' }}><Trash2 /> SmartWaste Cusco</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <span style={{ fontWeight: 'bold' }}>Bienvenido, {usuario?.nombre}</span>
                    <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', border: '1px solid #d93025', color: '#d93025', background: 'none', borderRadius: '4px', cursor: 'pointer' }}>Salir</button>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                <section>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h2>Mis Reportes</h2>
                        <button style={{ backgroundColor: '#34a853', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Plus size={18} /> Nuevo Reporte
                        </button>
                    </div>
                    {reportes.length === 0 ? (
                        <p>No has realizado ningún reporte aún.</p>
                    ) : (
                        reportes.map(reporte => (
                            <div key={reporte.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', background: '#fff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#5f6368' }}>
                                    <span>#{reporte.numero_ticket}</span>
                                    <span style={{ color: reporte.estado === 'pendiente' ? '#fbbc05' : '#34a853' }}>{reporte.estado.toUpperCase()}</span>
                                </div>
                                <p style={{ margin: '0.5rem 0' }}>{reporte.descripcion}</p>
                                <div style={{ fontSize: '0.85rem', color: '#70757a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <MapPin size={14} /> Lat: {reporte.latitud}, Lon: {reporte.longitud}
                                </div>
                            </div>
                        ))
                    )}
                </section>

                <section>
                    <h2>Información de mi Zona</h2>
                    <div style={{ background: '#e8f0fe', padding: '1.5rem', borderRadius: '8px' }}>
                        <h3 style={{ marginTop: 0 }}>Sectores y Horarios</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} /> Lunes: Residuos Orgánicos
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} /> Miércoles: Reciclables
                            </li>
                            <li style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Calendar size={18} /> Viernes: No Reciclables
                            </li>
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Dashboard;
