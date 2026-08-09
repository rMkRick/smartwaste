import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Settings, Plus, Edit2, UserX, UserCheck, Navigation, X, Users, Truck } from 'lucide-react';
import { getConductores, crearConductor, actualizarConductor, cambiarEstadoConductor, getCamiones, actualizarCamion, cambiarEstadoCamion, getRutasGestion } from '../services/api';

const C = {
    primary: '#f97316', secondary: '#0f172a', text: '#334155',
    bg: '#f8fafc', white: '#ffffff', success: '#22c55e',
    danger: '#ef4444', muted: '#64748b'
};

const estadoBadge = (e) => {
    const map = { activo:{bg:'#dcfce7',color:'#16a34a'}, inactivo:{bg:'#fee2e2',color:'#dc2626'}, suspendido:{bg:'#fef9c3',color:'#a16207'}, disponible:{bg:'#dcfce7',color:'#16a34a'}, en_ruta:{bg:'#dbeafe',color:'#1d4ed8'}, mantenimiento:{bg:'#fef9c3',color:'#a16207'}, de_baja:{bg:'#fee2e2',color:'#dc2626'} };
    const s = map[e] || { bg:'#e2e8f0', color:'#64748b' };
    const label = e === 'de_baja' ? 'Dado de baja' : e;
    return <span style={{ backgroundColor:s.bg, color:s.color, padding:'3px 10px', borderRadius:'20px', fontSize:'11px', fontWeight:'700' }}>{label}</span>;
};

const INPUT  = { padding:'10px 14px', border:'1.5px solid #cbd5e1', borderRadius:'8px', fontSize:'14px', width:'100%', boxSizing:'border-box' };
const btnStyle = (bg, fg='#fff') => ({ padding:'10px 18px', backgroundColor:bg, color:fg, border:'none', borderRadius:'8px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px', fontSize:'13px' });

const CATS = ['AI','AII','AIII','BI','BII','BIII','BIIIC'];
const F0   = { nombres:'', apellidos:'', dni:'', correo:'', contrasena:'', zona_id:'', licencia:'', categoria_licencia:'BIIIC', telefono:'', fecha_ingreso:'', estado:'activo' };
const CAM0 = { placa:'', modelo:'', capacidad_kg:'', estado:'disponible' };

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [usuario]    = useState(() => JSON.parse(localStorage.getItem('usuario') || '{}'));
    const [tab, setTab]         = useState('conductores');
    const [conductores, setCond] = useState([]);
    const [camiones, setCam]     = useState([]);
    const [rutas, setRutas]      = useState([]);
    const [cargando, setCarg]    = useState(false);
    const [error, setError]      = useState('');
    const [exito, setExito]      = useState('');
    const [modal, setModal]      = useState(null);
    const [selec, setSelec]      = useState(null);
    const [form, setForm]        = useState(F0);
    const [camForm, setCamForm]  = useState(CAM0);
    const [aForm, setAForm]      = useState({ ruta_id:'', camion_id:'', fecha: new Date().toISOString().split('T')[0] });
    const [saving, setSaving]    = useState(false);

    const cargar = async () => {
        setCarg(true); setError('');
        try {
            const [rc, cam, rut] = await Promise.all([getConductores(), getCamiones(), getRutasGestion()]);
            setCond(rc.data); setCam(cam.data); setRutas(rut.data);
        } catch { setError('Error al cargar datos'); }
        finally { setCarg(false); }
    };

    useEffect(() => { cargar(); }, []);

    const ok = (msg) => { setExito(msg); setTimeout(()=>setExito(''), 3000); };
    const cerrar = () => { setModal(null); setSelec(null); };

    const abrirCrear  = () => { setForm(F0); setSelec(null); setModal('form'); };
    const abrirEditar = (c) => {
        setSelec(c);
        setForm({ nombres:c.nombres, apellidos:c.apellidos, dni:c.dni||'', correo:c.correo, contrasena:'', zona_id:c.zona_id||'', licencia:c.licencia, categoria_licencia:c.categoria_licencia, telefono:c.telefono||'', fecha_ingreso:c.fecha_ingreso?.split('T')[0]||'', estado:c.conductor_estado });
        setModal('form');
    };
    const abrirAsig   = (c) => { setSelec(c); setAForm({ ruta_id:'', camion_id:'', fecha: new Date().toISOString().split('T')[0] }); setModal('asig'); };
    const abrirEditarCamion = (cam) => {
        setSelec(cam);
        setCamForm({ placa:cam.placa, modelo:cam.modelo||'', capacidad_kg:cam.capacidad_kg||'', estado:cam.estado });
        setModal('camion');
    };

    const guardarForm = async () => {
        setSaving(true);
        try {
            if (!selec) { await crearConductor(form); ok('Conductor creado'); }
            else        { await actualizarConductor(selec.id, form); ok('Conductor actualizado'); }
            cerrar(); cargar();
        } catch (err) { alert(err.response?.data?.mensaje || 'Error al guardar'); }
        finally { setSaving(false); }
    };

    const guardarCamion = async () => {
        setSaving(true);
        try {
            await actualizarCamion(selec.id, camForm);
            ok('Camión actualizado'); cerrar(); cargar();
        } catch (err) { alert(err.response?.data?.mensaje || 'Error al guardar camión'); }
        finally { setSaving(false); }
    };

    const cambiarEstado = async (c) => {
        const nuevoEstado = c.conductor_estado === 'activo' ? 'inactivo' : 'activo';
        const accion = nuevoEstado === 'activo' ? 'activar' : 'desactivar';
        if (!window.confirm(`¿Deseas ${accion} a ${c.nombres} ${c.apellidos}?`)) return;
        try { await cambiarEstadoConductor(c.id, nuevoEstado); ok(`Conductor ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'}`); cargar(); }
        catch { alert('Error al cambiar el estado'); }
    };

    const cambiarEstadoCam = async (cam, estado) => {
        try { await cambiarEstadoCamion(cam.id, estado); setCam(prev => prev.map(c => c.id === cam.id ? { ...c, estado } : c)); }
        catch { alert('Error al cambiar el estado del camión'); }
    };

    const guardarAsig = async () => {
        if (!aForm.ruta_id || !aForm.camion_id) { alert('Selecciona ruta y camión'); return; }
        setSaving(true);
        try {
            const api = (await import('../services/api')).default;
            await api.post('/rutas/asignar', { ruta_id:+aForm.ruta_id, camion_id:+aForm.camion_id, operador_id:selec.usuario_id, fecha_asignacion:aForm.fecha });
            ok('Ruta asignada al conductor'); cerrar(); cargar();
        } catch (err) { alert(err.response?.data?.mensaje || 'Error al asignar'); }
        finally { setSaving(false); }
    };

    const F = (label, key, type='text', extra={}) => (
        <div>
            <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>{label}</label>
            <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} style={INPUT} {...extra} />
        </div>
    );

    const TH = (h) => <th key={h} style={{ padding:'13px 16px', textAlign:'left', fontSize:'11px', fontWeight:'700', textTransform:'uppercase', color:C.muted, borderBottom:'2px solid #e2e8f0' }}>{h}</th>;
    const TD = (children, style={}) => <td style={{ padding:'13px 16px', fontSize:'13px', ...style }}>{children}</td>;

    return (
        <div style={{ fontFamily:'"Inter",sans-serif', backgroundColor:C.bg, minHeight:'100vh' }}>
            <nav style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 6%', backgroundColor:C.secondary }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px', fontWeight:'800', fontSize:'20px', color:'white' }}>
                    <div style={{ backgroundColor:C.primary, padding:'8px 12px', borderRadius:'8px' }}><Settings size={22}/></div>
                    PANEL ADMINISTRADOR
                </div>
                <div style={{ display:'flex', gap:'20px', alignItems:'center' }}>
                    <div style={{ color:'white', textAlign:'right' }}>
                        <p style={{ margin:0, fontWeight:'700' }}>{usuario.nombres||'Admin'}</p>
                        <p style={{ margin:0, fontSize:'11px', opacity:0.6 }}>Administrador</p>
                    </div>
                    <button onClick={()=>{localStorage.clear();navigate('/');}} style={btnStyle(C.primary)}>
                        <LogOut size={15}/> Salir
                    </button>
                </div>
            </nav>

            <main style={{ padding:'35px 6%' }}>
                {/* Stats */}
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'15px', marginBottom:'30px' }}>
                    {[
                        { label:'Conductores activos', val: conductores.filter(c=>c.conductor_estado==='activo').length, color:C.primary },
                        { label:'Camiones',            val: camiones.length,                                             color:C.success },
                        { label:'Rutas',               val: rutas.length,                                               color:'#8b5cf6' },
                        { label:'En ruta hoy',         val: conductores.filter(c=>c.ruta_actual).length,                color:'#0ea5e9' },
                    ].map(s=>(
                        <div key={s.label} style={{ backgroundColor:C.white, padding:'18px', borderRadius:'10px', boxShadow:'0 2px 8px rgba(0,0,0,0.06)', textAlign:'center', borderTop:`4px solid ${s.color}` }}>
                            <p style={{ margin:0, fontSize:'26px', fontWeight:'800', color:s.color }}>{s.val}</p>
                            <p style={{ margin:'4px 0 0', fontSize:'11px', color:C.muted, fontWeight:'700' }}>{s.label}</p>
                        </div>
                    ))}
                </div>

                {exito && <div style={{ backgroundColor:'#dcfce7', border:'1px solid #86efac', color:'#16a34a', padding:'12px 20px', borderRadius:'8px', marginBottom:'16px', fontWeight:'600' }}>{exito}</div>}
                {error && <div style={{ backgroundColor:'#fee2e2', color:'#dc2626', padding:'12px 20px', borderRadius:'8px', marginBottom:'16px' }}>{error}</div>}

                {/* Tabs */}
                <div style={{ display:'flex', gap:'8px', marginBottom:'22px', borderBottom:'2px solid #e2e8f0', paddingBottom:'12px' }}>
                    {[['conductores','Conductores',<Users size={15}/>],['camiones','Camiones',<Truck size={15}/>],['rutas','Rutas',<Navigation size={15}/>]].map(([id,lbl,icon])=>(
                        <button key={id} onClick={()=>setTab(id)} style={btnStyle(tab===id?C.primary:'transparent', tab===id?'white':C.text)}>
                            {icon}{lbl}
                        </button>
                    ))}
                </div>

                {/* ── CONDUCTORES ── */}
                {tab==='conductores' && <>
                    <button onClick={abrirCrear} style={{ ...btnStyle(C.success), marginBottom:'18px' }}><Plus size={16}/>Nuevo Conductor</button>
                    <div style={{ backgroundColor:C.white, borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.07)', overflowX:'auto' }}>
                        {cargando ? <p style={{ padding:'30px', textAlign:'center', color:C.muted }}>Cargando...</p> : (
                            <table style={{ width:'100%', borderCollapse:'collapse' }}>
                                <thead><tr style={{ backgroundColor:C.bg }}>{['Conductor','DNI','Licencia','Teléfono','Ruta Hoy','Camión Hoy','Estado','Acciones'].map(TH)}</tr></thead>
                                <tbody>
                                    {conductores.length===0
                                        ? <tr><td colSpan={8} style={{ padding:'30px', textAlign:'center', color:C.muted }}>No hay conductores registrados</td></tr>
                                        : conductores.map(c=>(
                                            <tr key={c.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                                                {TD(<><p style={{margin:0,fontWeight:'700'}}>{c.apellidos}, {c.nombres}</p><p style={{margin:0,fontSize:'12px',color:C.muted}}>{c.correo}</p></>)}
                                                {TD(c.dni||'—')}
                                                {TD(<><p style={{margin:0,fontWeight:'600'}}>{c.licencia}</p><p style={{margin:0,fontSize:'11px',color:C.muted}}>{c.categoria_licencia}</p></>)}
                                                {TD(c.telefono||'—')}
                                                {TD(c.ruta_actual||<span style={{color:C.muted}}>Sin asignar</span>)}
                                                {TD(c.camion_actual||'—')}
                                                {TD(estadoBadge(c.conductor_estado))}
                                                <td style={{ padding:'13px 16px' }}>
                                                    <div style={{ display:'flex', gap:'5px' }}>
                                                        <button onClick={()=>abrirAsig(c)} style={btnStyle('#8b5cf6')} title="Asignar ruta"><Navigation size={13}/></button>
                                                        <button onClick={()=>abrirEditar(c)} style={btnStyle('#3b82f6')} title="Editar"><Edit2 size={13}/></button>
                                                        {c.conductor_estado==='activo'
                                                            ? <button onClick={()=>cambiarEstado(c)} style={btnStyle(C.danger)} title="Marcar como inactivo"><UserX size={13}/></button>
                                                            : <button onClick={()=>cambiarEstado(c)} style={btnStyle(C.success)} title="Marcar como activo"><UserCheck size={13}/></button>
                                                        }
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        )}
                    </div>
                </>}

                {/* ── CAMIONES ── */}
                {tab==='camiones' && (
                    <div style={{ backgroundColor:C.white, borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.07)', overflowX:'auto' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse' }}>
                            <thead><tr style={{ backgroundColor:C.bg }}>{['Placa','Modelo','Capacidad (kg)','Estado','Cambiar estado','Acciones'].map(TH)}</tr></thead>
                            <tbody>
                                {camiones.map(cam=>(
                                    <tr key={cam.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                                        {TD(cam.placa,{fontWeight:'700'})}
                                        {TD(cam.modelo)}
                                        {TD(Number(cam.capacidad_kg).toLocaleString())}
                                        {TD(estadoBadge(cam.estado))}
                                        <td style={{ padding:'13px 16px' }}>
                                            <select value={cam.estado} onChange={e=>cambiarEstadoCam(cam, e.target.value)} style={{ padding:'7px 10px', borderRadius:'8px', border:'1.5px solid #cbd5e1', fontSize:'13px' }}>
                                                <option value="disponible">disponible</option>
                                                <option value="en_ruta">en_ruta</option>
                                                <option value="mantenimiento">mantenimiento</option>
                                                <option value="de_baja">dado de baja</option>
                                            </select>
                                        </td>
                                        <td style={{ padding:'13px 16px' }}>
                                            <button onClick={()=>abrirEditarCamion(cam)} style={btnStyle('#3b82f6')} title="Editar camión"><Edit2 size={13}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ── RUTAS ── */}
                {tab==='rutas' && (
                    <div style={{ backgroundColor:C.white, borderRadius:'12px', boxShadow:'0 4px 12px rgba(0,0,0,0.07)', overflowX:'auto' }}>
                        <table style={{ width:'100%', borderCollapse:'collapse' }}>
                            <thead><tr style={{ backgroundColor:C.bg }}>{['Ruta','Zona','Puntos GPS','Camión Hoy'].map(TH)}</tr></thead>
                            <tbody>
                                {rutas.map(r=>(
                                    <tr key={r.id} style={{ borderBottom:'1px solid #f1f5f9' }}>
                                        {TD(r.nombre,{fontWeight:'700'})}
                                        {TD(r.zona_nombre)}
                                        {TD(`${Array.isArray(r.waypoints)?r.waypoints.length:0} pts`)}
                                        {TD(r.placa||<span style={{color:C.muted}}>—</span>)}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* ── MODAL CREAR / EDITAR ── */}
            {modal==='form' && (
                <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px' }}>
                    <div style={{ backgroundColor:C.white, borderRadius:'14px', padding:'30px', width:'100%', maxWidth:'580px', maxHeight:'90vh', overflowY:'auto' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'22px' }}>
                            <h2 style={{ margin:0, color:C.secondary }}>{!selec?'Nuevo Conductor':'Editar Conductor'}</h2>
                            <button onClick={cerrar} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted }}><X size={22}/></button>
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                            {F('Nombres *','nombres')}
                            {F('Apellidos *','apellidos')}
                            {F('DNI','dni')}
                            {F('Correo *','correo','email')}
                            {!selec && F('Contraseña *','contrasena','password')}
                            {F('Teléfono','telefono','tel')}
                            {F('N° Licencia *','licencia')}
                            <div>
                                <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>Categoría</label>
                                <select value={form.categoria_licencia} onChange={e=>setForm({...form,categoria_licencia:e.target.value})} style={INPUT}>
                                    {CATS.map(cat=><option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>
                            {F('Fecha Ingreso','fecha_ingreso','date')}
                            {selec && (
                                <div>
                                    <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>Estado</label>
                                    <select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})} style={INPUT}>
                                        {['activo','inactivo','suspendido'].map(e=><option key={e} value={e}>{e}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>
                        <div style={{ display:'flex', gap:'10px', marginTop:'22px' }}>
                            <button onClick={guardarForm} disabled={saving} style={{ ...btnStyle(C.primary), flex:1, justifyContent:'center' }}>{saving?'Guardando...':'Guardar'}</button>
                            <button onClick={cerrar} style={{ ...btnStyle('#e2e8f0',C.text), flex:1, justifyContent:'center' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL ASIGNAR RUTA ── */}
            {modal==='asig' && selec && (
                <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px' }}>
                    <div style={{ backgroundColor:C.white, borderRadius:'14px', padding:'30px', width:'100%', maxWidth:'400px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'18px' }}>
                            <h2 style={{ margin:0, color:C.secondary, fontSize:'18px' }}>Asignar Ruta</h2>
                            <button onClick={cerrar} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted }}><X size={22}/></button>
                        </div>
                        <div style={{ backgroundColor:'#f0f9ff', borderRadius:'8px', padding:'12px', marginBottom:'18px' }}>
                            <p style={{ margin:0, fontWeight:'700' }}>{selec.apellidos}, {selec.nombres}</p>
                            <p style={{ margin:'2px 0 0', fontSize:'12px', color:C.muted }}>Lic: {selec.licencia} ({selec.categoria_licencia})</p>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                            <div>
                                <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>Ruta *</label>
                                <select value={aForm.ruta_id} onChange={e=>setAForm({...aForm,ruta_id:e.target.value})} style={INPUT}>
                                    <option value="">— Seleccionar ruta —</option>
                                    {rutas.map(r=><option key={r.id} value={r.id}>{r.nombre}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>Camión * (solo disponibles)</label>
                                <select value={aForm.camion_id} onChange={e=>setAForm({...aForm,camion_id:e.target.value})} style={INPUT}>
                                    <option value="">— Seleccionar camión —</option>
                                    {camiones.filter(cam=>cam.estado==='disponible').map(cam=>(
                                        <option key={cam.id} value={cam.id}>{cam.placa} — {cam.modelo}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>Fecha</label>
                                <input type="date" value={aForm.fecha} onChange={e=>setAForm({...aForm,fecha:e.target.value})} style={INPUT}/>
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:'10px', marginTop:'22px' }}>
                            <button onClick={guardarAsig} disabled={saving} style={{ ...btnStyle('#8b5cf6'), flex:1, justifyContent:'center' }}>{saving?'Asignando...':'Asignar'}</button>
                            <button onClick={cerrar} style={{ ...btnStyle('#e2e8f0',C.text), flex:1, justifyContent:'center' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── MODAL EDITAR CAMIÓN ── */}
            {modal==='camion' && selec && (
                <div style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:2000, padding:'20px' }}>
                    <div style={{ backgroundColor:C.white, borderRadius:'14px', padding:'30px', width:'100%', maxWidth:'420px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'22px' }}>
                            <h2 style={{ margin:0, color:C.secondary, fontSize:'18px' }}>Editar Camión</h2>
                            <button onClick={cerrar} style={{ background:'none', border:'none', cursor:'pointer', color:C.muted }}><X size={22}/></button>
                        </div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                            <div>
                                <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>Placa *</label>
                                <input type="text" value={camForm.placa} onChange={e=>setCamForm({...camForm,placa:e.target.value})} style={INPUT}/>
                            </div>
                            <div>
                                <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>Modelo</label>
                                <input type="text" value={camForm.modelo} onChange={e=>setCamForm({...camForm,modelo:e.target.value})} style={INPUT}/>
                            </div>
                            <div>
                                <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>Capacidad (kg)</label>
                                <input type="number" value={camForm.capacidad_kg} onChange={e=>setCamForm({...camForm,capacidad_kg:e.target.value})} style={INPUT}/>
                            </div>
                            <div>
                                <label style={{ fontSize:'12px', fontWeight:'700', color:C.muted, display:'block', marginBottom:'4px' }}>Estado</label>
                                <select value={camForm.estado} onChange={e=>setCamForm({...camForm,estado:e.target.value})} style={INPUT}>
                                    {['disponible','en_ruta','mantenimiento','de_baja'].map(e=><option key={e} value={e}>{e==='de_baja'?'dado de baja':e}</option>)}
                                </select>
                            </div>
                        </div>
                        <div style={{ display:'flex', gap:'10px', marginTop:'22px' }}>
                            <button onClick={guardarCamion} disabled={saving} style={{ ...btnStyle(C.primary), flex:1, justifyContent:'center' }}>{saving?'Guardando...':'Guardar'}</button>
                            <button onClick={cerrar} style={{ ...btnStyle('#e2e8f0',C.text), flex:1, justifyContent:'center' }}>Cancelar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
