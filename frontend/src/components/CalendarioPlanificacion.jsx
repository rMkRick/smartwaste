import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useMemo } from 'react';

const DIAS_SEMANA = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

const toISODate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// horarios: [{ruta_id, dia_semana, ruta_nombre}]  asignaciones: [{ruta_id, fecha_asignacion, estado}]
const CalendarioPlanificacion = ({ horarios, asignaciones, onClose, onCambiarMes }) => {
    const hoy = new Date();
    const [cursor, setCursor] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1));

    const cambiarMes = (delta) => {
        const nuevo = new Date(cursor.getFullYear(), cursor.getMonth() + delta, 1);
        setCursor(nuevo);
        onCambiarMes?.(nuevo.getFullYear(), nuevo.getMonth() + 1);
    };

    const dias = useMemo(() => {
        const anio = cursor.getFullYear();
        const mes = cursor.getMonth();
        const primerDia = new Date(anio, mes, 1);
        const ultimoDia = new Date(anio, mes + 1, 0);
        const inicioOffset = (primerDia.getDay() + 6) % 7; // semana empieza en Lunes

        const celdas = [];
        for (let i = 0; i < inicioOffset; i++) celdas.push(null);

        for (let d = 1; d <= ultimoDia.getDate(); d++) {
            const fecha = new Date(anio, mes, d);
            const nombreDia = DIAS_SEMANA[fecha.getDay()];
            const rutasDelDia = [...new Set(horarios.filter(h => h.dia_semana === nombreDia).map(h => h.ruta_id))];
            const fechaStr = toISODate(fecha);

            let estado = 'sin-recojo';
            if (rutasDelDia.length > 0) {
                const asignadas = rutasDelDia.filter(rid =>
                    asignaciones.some(a => a.ruta_id === rid && String(a.fecha_asignacion).slice(0, 10) === fechaStr)
                );
                estado = asignadas.length === rutasDelDia.length ? 'completo' : 'pendiente';
            }

            celdas.push({
                dia: d,
                fechaStr,
                esHoy: fechaStr === toISODate(hoy),
                totalRutas: rutasDelDia.length,
                estado,
            });
        }
        return celdas;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cursor, horarios, asignaciones]);

    const ESTILO = {
        completo:    { bg: 'rgba(34,197,94,0.15)',  border: '#22c55e', text: '#166534' },
        pendiente:   { bg: 'rgba(100,116,139,0.12)', border: '#64748b', text: '#334155' },
        'sin-recojo':{ bg: 'transparent',            border: '#e2e8f0', text: '#cbd5e1' },
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
            <div style={{ backgroundColor: 'white', borderRadius: '16px', width: '100%', maxWidth: '620px', maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.3)', padding: '24px 28px 28px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                    <div>
                        <h3 style={{ margin: '0 0 2px 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>Planificación del Mes</h3>
                        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>Verde = recojos del día ya asignados · Plomo = faltan por asignar</p>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                        <X size={22} />
                    </button>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '16px' }}>
                    <button onClick={() => cambiarMes(-1)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer' }}>
                        <ChevronLeft size={18} />
                    </button>
                    <span style={{ fontWeight: '800', fontSize: '15px', color: '#0f172a', minWidth: '160px', textAlign: 'center' }}>
                        {MESES[cursor.getMonth()]} {cursor.getFullYear()}
                    </span>
                    <button onClick={() => cambiarMes(1)} style={{ border: 'none', background: '#f1f5f9', borderRadius: '8px', padding: '6px 8px', cursor: 'pointer' }}>
                        <ChevronRight size={18} />
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', marginBottom: '6px' }}>
                    {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
                        <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>{d}</div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                    {dias.map((c, i) => c === null ? (
                        <div key={i} />
                    ) : (
                        <div key={i} title={c.totalRutas ? `${c.totalRutas} ruta(s) programada(s)` : 'Sin recojo programado'} style={{
                            aspectRatio: '1',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            borderRadius: '8px',
                            backgroundColor: ESTILO[c.estado].bg,
                            border: `1.5px solid ${c.esHoy ? '#f97316' : ESTILO[c.estado].border}`,
                            color: ESTILO[c.estado].text,
                            fontWeight: c.esHoy ? '800' : '600',
                            fontSize: '13px',
                        }}>
                            {c.dia}
                            {c.totalRutas > 0 && <span style={{ fontSize: '9px', opacity: 0.8 }}>{c.totalRutas} rutas</span>}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'flex', gap: '16px', marginTop: '18px', fontSize: '12px', color: '#64748b', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'rgba(34,197,94,0.15)', border: '1.5px solid #22c55e', display: 'inline-block' }} /> Asignado</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', backgroundColor: 'rgba(100,116,139,0.12)', border: '1.5px solid #64748b', display: 'inline-block' }} /> Falta asignar</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', border: '1.5px solid #e2e8f0', display: 'inline-block' }} /> Sin recojo</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: '12px', height: '12px', borderRadius: '4px', border: '1.5px solid #f97316', display: 'inline-block' }} /> Hoy</span>
                </div>
            </div>
        </div>
    );
};

export default CalendarioPlanificacion;
