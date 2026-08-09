import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Search } from 'lucide-react';

// Fix iconos default de Leaflet con Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const CUSCO_CENTER = [-13.5319, -71.9675];
// left,top,right,bottom (minLon,maxLat,maxLon,minLat) — acota la búsqueda al área de Cusco
const CUSCO_VIEWBOX = '-72.05,-13.45,-71.88,-13.60';

const MapaPicker = ({ onChange }) => {
    const [pos, setPos] = useState(null);
    const [gpsError, setGpsError] = useState('');
    const [loadingGps, setLoadingGps] = useState(false);
    const [query, setQuery] = useState('');
    const [resultados, setResultados] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [busquedaError, setBusquedaError] = useState('');
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
        const container = mapRef.current;
        if (!container || container._leaflet_id) return;

        const map = L.map(container).setView(pos || CUSCO_CENTER, 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(map);

        map.on('click', (e) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            handlePick(lat, lng);
        });

        if (pos) {
            if (markerRef.current) markerRef.current.remove();
            markerRef.current = L.marker(pos).addTo(map);
            map.setView(pos, 15);
        }

        return () => {
            map.remove();
        };
    }, [pos]);

    const handlePick = (lat, lng) => {
        setPos([lat, lng]);
        onChange(lat, lng);
        setGpsError('');
    };

    const buscarDireccion = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;
        setBuscando(true);
        setBusquedaError('');
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&viewbox=${CUSCO_VIEWBOX}&bounded=1&limit=5`;
            const res = await fetch(url);
            const data = await res.json();
            if (!data.length) setBusquedaError('No se encontraron resultados. Intenta con otra dirección o selecciona en el mapa.');
            setResultados(data);
        } catch {
            setBusquedaError('No se pudo buscar la dirección. Intenta seleccionar en el mapa.');
        } finally {
            setBuscando(false);
        }
    };

    const elegirResultado = (r) => {
        handlePick(parseFloat(r.lat), parseFloat(r.lon));
        setQuery(r.display_name);
        setResultados([]);
    };

    const usarGPS = () => {
        if (!navigator.geolocation) {
            setGpsError('Tu navegador no soporta geolocalización.');
            return;
        }
        setLoadingGps(true);
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                handlePick(coords.latitude, coords.longitude);
                setLoadingGps(false);
            },
            () => {
                setGpsError('No se pudo obtener tu ubicación. Haz clic en el mapa para seleccionarla.');
                setLoadingGps(false);
            },
            { timeout: 8000 }
        );
    };

    return (
        <div>
            <form onSubmit={buscarDireccion} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar dirección o lugar en Cusco..."
                    style={{
                        flex: 1, padding: '8px 12px', borderRadius: '6px',
                        border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box',
                    }}
                />
                <button
                    type="submit"
                    disabled={buscando}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 14px', backgroundColor: buscando ? '#94a3b8' : '#334155',
                        color: 'white', border: 'none', borderRadius: '6px',
                        fontWeight: '600', fontSize: '14px', whiteSpace: 'nowrap',
                        cursor: buscando ? 'not-allowed' : 'pointer'
                    }}
                >
                    <Search size={16} />
                    {buscando ? 'Buscando...' : 'Buscar'}
                </button>
            </form>

            {resultados.length > 0 && (
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '10px', overflow: 'hidden' }}>
                    {resultados.map((r, i) => (
                        <div
                            key={i}
                            onClick={() => elegirResultado(r)}
                            style={{
                                padding: '9px 12px', fontSize: '13px', cursor: 'pointer',
                                borderBottom: i < resultados.length - 1 ? '1px solid #f1f5f9' : 'none',
                                color: '#334155',
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                        >
                            {r.display_name}
                        </div>
                    ))}
                </div>
            )}

            {busquedaError && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '8px' }}>{busquedaError}</p>
            )}

            <button
                type="button"
                onClick={usarGPS}
                disabled={loadingGps}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '10px', padding: '8px 16px',
                    backgroundColor: loadingGps ? '#94a3b8' : '#0ea5e9',
                    color: 'white', border: 'none', borderRadius: '6px',
                    fontWeight: '600', fontSize: '14px',
                    cursor: loadingGps ? 'not-allowed' : 'pointer'
                }}
            >
                <Navigation size={16} />
                {loadingGps ? 'Obteniendo ubicación...' : 'Usar mi ubicación GPS'}
            </button>

            {gpsError && (
                <p style={{ color: '#ef4444', fontSize: '13px', marginBottom: '8px' }}>{gpsError}</p>
            )}

            <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <div ref={mapRef} style={{ height: '260px', width: '100%' }} />
            </div>

            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                marginTop: '8px', fontSize: '13px',
                color: pos ? '#16a34a' : '#94a3b8', fontWeight: '500'
            }}>
                <MapPin size={14} />
                {pos
                    ? `Ubicación seleccionada: ${pos[0].toFixed(6)}, ${pos[1].toFixed(6)}`
                    : 'Haz clic en el mapa para fijar tu ubicación'}
            </div>
        </div>
    );
};

export default MapaPicker;
