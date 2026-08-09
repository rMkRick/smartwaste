import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CUSCO = [-13.5319, -71.9675];

const numberedIcon = (n, color = '#f97316') => L.divIcon({
    className: '',
    html: `<div style="
        background:${color};color:white;border-radius:50%;
        width:28px;height:28px;display:flex;align-items:center;
        justify-content:center;font-weight:800;font-size:13px;
        border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.4);"
    >${n}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
});

// Punto "de curva": solo dobla la línea para seguir la pista, sin número ni
// aparecer en la lista de puntos — pero sigue existiendo, arrastrable y borrable.
const curvaIcon = L.divIcon({
    className: '',
    html: `<div style="
        background:#f97316;border-radius:50%;
        width:9px;height:9px;opacity:0.55;
        border:1.5px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.35);"
    ></div>`,
    iconSize: [9, 9],
    iconAnchor: [4.5, 4.5],
});

// Marcador de la posición en vivo del operador/camión — visualmente distinto
// de los puntos numerados de la ruta (azul, con emoji de camión).
const camionIcon = L.divIcon({
    className: '',
    html: `<div style="
        background:#2563eb;color:white;border-radius:50%;
        width:34px;height:34px;display:flex;align-items:center;
        justify-content:center;font-size:16px;
        border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.5);"
    >🚛</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
});

// Distancia perpendicular EN PÍXELES de pantalla de un punto a un segmento a-b.
// Debe medirse en píxeles (no en grados lat/lng): con rutas de líneas rectas que se
// cruzan entre sí, un segmento lejano puede quedar "más cerca" en grados que el
// segmento que realmente se ve debajo del clic.
const distanciaASegmentoPx = (map, click, a, b) => {
    const p  = map.latLngToContainerPoint(click);
    const pa = map.latLngToContainerPoint([a.lat, a.lng]);
    const pb = map.latLngToContainerPoint([b.lat, b.lng]);
    const dx = pb.x - pa.x, dy = pb.y - pa.y;
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) return Math.hypot(p.x - pa.x, p.y - pa.y);
    let t = ((p.x - pa.x) * dx + (p.y - pa.y) * dy) / lengthSq;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (pa.x + t * dx), p.y - (pa.y + t * dy));
};

// Renumera las etiquetas genéricas "Punto N" según su posición entre los puntos
// PRINCIPALES (los de curva no cuentan ni se tocan). Conserva etiquetas descriptivas.
const RE_LABEL_GENERICO = /^Punto \d+$/;
const renumerarGenericos = (pts) => {
    let n = 0;
    return pts.map(p => {
        if (p.tipo === 'curva') return p;
        n++;
        return RE_LABEL_GENERICO.test(p.label) ? { ...p, label: `Punto ${n}` } : p;
    });
};

/**
 * Props:
 *  waypoints       — array de {lat, lng, label}
 *  editable        — boolean; si true el supervisor puede click para agregar puntos y arrastrar
 *  onChange        — callback(newWaypoints) llamado al modificar
 *  height          — string CSS (default '420px')
 *  ubicacionActual — {lat, lng} opcional; pinta un marcador de camión en vivo que
 *                     se mueve sin reencuadrar el mapa ni redibujar la ruta
 */
const MapaRuta = ({ waypoints = [], editable = false, onChange, height = '420px', ubicacionActual }) => {
    const containerRef  = useRef(null);
    const mapRef        = useRef(null);
    const markersRef    = useRef([]);
    const polylineRef   = useRef(null);
    const waypointsRef  = useRef(waypoints);
    const camionMarkerRef = useRef(null);

    const notify = useCallback((pts) => {
        waypointsRef.current = pts;
        onChange?.(pts);
    }, [onChange]);

    const redraw = useCallback((map, pts) => {
        // Limpiar marcadores y polilínea anteriores
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];
        if (polylineRef.current) { polylineRef.current.remove(); polylineRef.current = null; }

        if (!pts.length) return;

        const latlngs = pts.map(p => [p.lat, p.lng]);

        // Polilínea
        polylineRef.current = L.polyline(latlngs, {
            color: '#f97316', weight: 5, opacity: 0.85, dashArray: null,
        }).addTo(map);

        // Clic directo sobre la línea: inserta un punto exacto en ese lugar del trazo
        if (editable && pts.length > 1) {
            polylineRef.current.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                const actuales = waypointsRef.current;
                let mejorIdx = 0, mejorDist = Infinity;
                for (let i = 0; i < actuales.length - 1; i++) {
                    const d = distanciaASegmentoPx(map, e.latlng, actuales[i], actuales[i + 1]);
                    if (d < mejorDist) { mejorDist = d; mejorIdx = i; }
                }
                const nuevo = [...actuales];
                nuevo.splice(mejorIdx + 1, 0, { lat: e.latlng.lat, lng: e.latlng.lng, label: 'curva', tipo: 'curva' });
                const updated = renumerarGenericos(nuevo);
                notify(updated);
                redraw(map, updated);
            });
        }

        // Marcadores: numerados para puntos principales, punto pequeño para los de curva
        let numeroPrincipal = 0;
        pts.forEach((pt, i) => {
            const esCurva = pt.tipo === 'curva';
            const isFirst = i === 0;
            const isLast  = i === pts.length - 1;
            const color   = isFirst ? '#22c55e' : isLast ? '#ef4444' : '#f97316';

            if (!esCurva) numeroPrincipal++;

            const marker = L.marker([pt.lat, pt.lng], {
                icon: esCurva ? curvaIcon : numberedIcon(numeroPrincipal, color),
                draggable: editable,
                opacity: esCurva ? 0.9 : 1,
            }).addTo(map);

            marker.bindTooltip(esCurva ? 'Punto de curva (ajusta la forma)' : (pt.label || `Punto ${numeroPrincipal}`), { direction: 'top', offset: [0, -14] });

            if (editable) {
                marker.on('dragend', () => {
                    const { lat, lng } = marker.getLatLng();
                    const updated = waypointsRef.current.map((p, idx) =>
                        idx === i ? { ...p, lat, lng } : p
                    );
                    notify(updated);
                    redraw(map, updated);
                });

                // Click derecho para eliminar (el resto de la curva conserva su forma)
                marker.on('contextmenu', (e) => {
                    L.DomEvent.stopPropagation(e);
                    const updated = renumerarGenericos(waypointsRef.current.filter((_, idx) => idx !== i));
                    notify(updated);
                    redraw(map, updated);
                });
            }

            markersRef.current.push(marker);
        });

        // Ajustar vista a la ruta
        map.fitBounds(polylineRef.current.getBounds(), { padding: [30, 30] });
    }, [editable, notify]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || container._leaflet_id) return;

        const map = L.map(container).setView(CUSCO, 14);
        mapRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        if (editable) {
            map.on('click', (e) => {
                // Clic fuera de la línea: extiende la ruta agregando un punto al final
                const newPt = { lat: e.latlng.lat, lng: e.latlng.lng, label: `Punto ${waypointsRef.current.length + 1}` };
                const updated = renumerarGenericos([...waypointsRef.current, newPt]);
                notify(updated);
                redraw(map, updated);
            });

            // Instrucción flotante
            const info = L.control({ position: 'bottomleft' });
            info.onAdd = () => {
                const d = L.DomUtil.create('div');
                d.innerHTML = `<div style="background:rgba(255,255,255,0.92);padding:8px 12px;border-radius:8px;font-size:12px;color:#334155;box-shadow:0 2px 8px rgba(0,0,0,0.15);">
                    🖱️ <b>Clic en la línea</b> agrega un punto de curva (chiquito, no numerado) para seguir la pista · <b>Clic fuera</b> extiende la ruta con un punto principal · <b>Arrastrar</b> para ajustar · <b>Clic derecho</b> para eliminar
                </div>`;
                return d;
            };
            info.addTo(map);
        }

        redraw(map, waypoints);
        waypointsRef.current = waypoints;

        return () => { map.remove(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Cuando cambian waypoints desde el padre (modo vista)
    useEffect(() => {
        if (!mapRef.current) return;
        waypointsRef.current = waypoints;
        redraw(mapRef.current, waypoints);
    }, [waypoints, redraw]);

    // Ubicación en vivo: crea el marcador una sola vez y luego solo lo mueve,
    // sin tocar la polilínea ni el encuadre — así no "salta" la vista en cada tick de GPS.
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !ubicacionActual) return;
        const { lat, lng } = ubicacionActual;

        if (!camionMarkerRef.current) {
            camionMarkerRef.current = L.marker([lat, lng], { icon: camionIcon, zIndexOffset: 1000 })
                .addTo(map)
                .bindTooltip('Tú (en vivo)', { direction: 'top', offset: [0, -18] });

            const bounds = polylineRef.current
                ? polylineRef.current.getBounds().extend([lat, lng])
                : L.latLngBounds([[lat, lng]]);
            map.fitBounds(bounds, { padding: [30, 30] });
        } else {
            camionMarkerRef.current.setLatLng([lat, lng]);
        }
    }, [ubicacionActual]);

    // Limpia el marcador de ubicación en vivo si el mapa se desmonta
    useEffect(() => () => { camionMarkerRef.current = null; }, []);

    return (
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
            <div ref={containerRef} style={{ height, width: '100%' }} />
        </div>
    );
};

export default MapaRuta;
