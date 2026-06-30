import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Plus, Edit2, Trash, MapPin, Truck, Navigation, X, BarChart3 } from 'lucide-react';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [usuario, setUsuario] = useState({ nombres: 'Admin User', rol: 3 });
    const [tab, setTab] = useState('zonas');
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({});

    const [zonas] = useState([
        { id: 1, nombre: 'Centro Histórico', descripcion: 'Zona monumental y comercial', estado: 'activo' },
        { id: 2, nombre: 'San Blas', descripcion: 'Barrio artesanal y turístico', estado: 'activo' },
        { id: 3, nombre: 'San Sebastián', descripcion: 'Distrito con alta densidad', estado: 'activo' }
    ]);

    const [camiones] = useState([
        { id: 1, placa: 'X1Y-888', modelo: 'Volvo FE', capacidad_kg: 15000, estado: 'disponible' },
        { id: 2, placa: 'A2B-999', modelo: 'Mercedes-Benz', capacidad_kg: 12000, estado: 'en_ruta' }
    ]);

    const [rutas] = useState([
        { id: 1, nombre: 'Ruta Centro 01', zona_id: 1, descripcion: 'Plaza de Armas y aledaños' },
        { id: 2, nombre: 'Ruta San Blas 02', zona_id: 2, descripcion: 'Calle Tandapata' }
    ]);

    const colors = {
        primary: '#f97316',
        secondary: '#0f172a',
        text: '#334155',
        lightBg: '#f8fafc',
        white: '#ffffff',
        success: '#22c55e',
        danger: '#ef4444'
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const openModal = (item = null) => {
        if (item) {
            setEditingId(item.id);
            setFormData(item);
        } else {
            setFormData({});
            setEditingId(null);
        }
        setShowModal(true);
    };

    const getData = () => tab === 'zonas' ? zonas : tab === 'camiones' ? camiones : rutas;
    const getIcon = () => tab === 'zonas' ? <MapPin size={20} /> : tab === 'camiones' ? <Truck size={20} /> : <Navigation size={20} />;
    const getLabel = () => tab === 'zonas' ? 'Zona' : tab === 'camiones' ? 'Camión' : 'Ruta';

    return (
        <div style={{ fontFamily: '"Inter", sans-serif', backgroundColor: colors.lightBg, minHeight: '100vh' }}>
            {/* Navbar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px 8%',
                backgroundColor: colors.secondary,
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '800', fontSize: '22px', color: 'white' }}>
                    <div style={{ backgroundColor: colors.primary, padding: '8px 12px', borderRadius: '8px' }}>
                        <Settings size={24} />
                    </div>
                    ADMIN PANEL
                </div>
                <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
                    <div style={{ color: 'white', textAlign: 'right' }}>
                        <p style={{ margin: '0 0 3px 0', fontWeight: '700' }}>{usuario.nombres}</p>
                        <p style={{ margin: 0, fontSize: '12px', opacity: 0.7 }}>Administrador</p>
                    </div>
                    <button onClick={handleLogout} style={{ backgroundColor: colors.primary, color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <LogOut size={16} /> Salir
                    </button>
                </div>
            </nav>

            <main style={{ padding: '40px 8%' }}>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '40px' }}>
                    <div style={{ backgroundColor: colors.white, padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: `4px solid ${colors.primary}` }}>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.primary }}>5</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Zonas Activas</p>
                    </div>
                    <div style={{ backgroundColor: colors.white, padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: `4px solid ${colors.success}` }}>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.success }}>8</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Camiones</p>
                    </div>
                    <div style={{ backgroundColor: colors.white, padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: `4px solid ${colors.warning}` }}>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: '#eab308' }}>12</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Rutas</p>
                    </div>
                    <div style={{ backgroundColor: colors.white, padding: '20px', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: `4px solid ${colors.primary}` }}>
                        <p style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: colors.primary }}>156</p>
                        <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#64748b', fontWeight: '700' }}>Usuarios</p>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: `2px solid ${colors.lightBg}`, paddingBottom: '15px' }}>
                    {['zonas', 'camiones', 'rutas'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            style={{
                                padding: '12px 24px',
                                backgroundColor: tab === t ? colors.primary : 'transparent',
                                color: tab === t ? 'white' : colors.text,
                                border: 'none',
                                borderRadius: '8px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab === t && getIcon()}
                            {t}
                        </button>
                    ))}
                </div>

                {/* Botón Nuevo */}
                <button
                    onClick={() => openModal()}
                    style={{
                        marginBottom: '20px',
                        padding: '12px 24px',
                        backgroundColor: colors.success,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    <Plus size={18} /> Nuevo {getLabel()}
                </button>

                {/* Tabla */}
                <div style={{ backgroundColor: colors.white, padding: '25px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: colors.lightBg, borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>ID</th>
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>
                                    {tab === 'zonas' ? 'Nombre' : tab === 'camiones' ? 'Placa' : 'Ruta'}
                                </th>
                                {tab === 'camiones' && <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Modelo</th>}
                                {tab === 'camiones' && <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Capacidad</th>}
                                {tab === 'camiones' && <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Estado</th>}
                                {tab === 'zonas' && <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Descripción</th>}
                                <th style={{ padding: '15px', textAlign: 'left', fontWeight: '700', fontSize: '13px', textTransform: 'uppercase', color: '#64748b' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getData().map((item, idx) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                    <td style={{ padding: '15px', fontSize: '13px', fontWeight: '700' }}>{item.id}</td>
                                    <td style={{ padding: '15px', fontSize: '13px', fontWeight: '700', color: colors.secondary }}>{item.nombre || item.placa}</td>
                                    {tab === 'camiones' && <td style={{ padding: '15px', fontSize: '13px' }}>{item.modelo}</td>}
                                    {tab === 'camiones' && <td style={{ padding: '15px', fontSize: '13px' }}>{item.capacidad_kg} kg</td>}
                                    {tab === 'camiones' && <td style={{ padding: '15px' }}><span style={{ backgroundColor: item.estado === 'disponible' ? colors.success : colors.warning, color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' }}>{item.estado}</span></td>}
                                    {tab === 'zonas' && <td style={{ padding: '15px', fontSize: '13px', color: '#64748b' }}>{item.descripcion}</td>}
                                    <td style={{ padding: '15px', display: 'flex', gap: '8px' }}>
                                        <button onClick={() => openModal(item)} style={{ padding: '6px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}>
                                            <Edit2 size={13} /> Editar
                                        </button>
                                        <button style={{ padding: '6px 12px', backgroundColor: colors.danger, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700' }}>
                                            <Trash size={13} /> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ backgroundColor: colors.white, padding: '30px', borderRadius: '12px', maxWidth: '500px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <h2 style={{ margin: 0, color: colors.secondary }}>{editingId ? 'Editar' : 'Nuevo'} {getLabel()}</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px' }}><X /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <input type="text" placeholder="Nombre" value={formData.nombre || ''} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />
                            {tab === 'camiones' && <input type="text" placeholder="Placa" value={formData.placa || ''} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />}
                            {tab === 'camiones' && <input type="number" placeholder="Capacidad (kg)" value={formData.capacidad_kg || ''} onChange={(e) => setFormData({ ...formData, capacidad_kg: e.target.value })} style={{ padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px' }} />}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button style={{ flex: 1, padding: '12px', backgroundColor: colors.primary, color: 'white', border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Guardar</button>
                                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: '12px', backgroundColor: '#cbd5e1', color: colors.secondary, border: 'none', borderRadius: '6px', fontWeight: '700', cursor: 'pointer' }}>Cancelar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
