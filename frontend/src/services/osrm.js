// Traza el camino real por calles entre puntos usando el servidor público de OSRM
// (Open Source Routing Machine) — gratis, sin API key. Uso ligero recomendado.
const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

const distanciaMetros = (a, b) => {
    const R = 6371000;
    const dLat = (b.lat - a.lat) * Math.PI / 180;
    const dLng = (b.lng - a.lng) * Math.PI / 180;
    const s = Math.sin(dLat / 2) ** 2 +
        Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
};

// Reduce la cantidad de puntos que devuelve OSRM (puede traer cientos) dejando
// solo uno cada ~distMinima metros, para no saturar el mapa con puntos de curva.
const simplificar = (puntos, distMinima = 15) => {
    if (puntos.length <= 2) return puntos;
    const resultado = [puntos[0]];
    let ultimo = puntos[0];
    for (let i = 1; i < puntos.length - 1; i++) {
        if (distanciaMetros(ultimo, puntos[i]) >= distMinima) {
            resultado.push(puntos[i]);
            ultimo = puntos[i];
        }
    }
    resultado.push(puntos[puntos.length - 1]);
    return resultado;
};

const tramoPorCalles = async (a, b) => {
    const url = `${OSRM_BASE}/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Servicio de rutas no disponible');
    const data = await res.json();
    if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No se encontró una calle entre esos 2 puntos');
    return data.routes[0].geometry.coordinates.map(([lng, lat]) => ({ lat, lng }));
};

// Recibe los puntos PRINCIPALES de una ruta (en orden) y devuelve el arreglo completo
// de waypoints siguiendo las calles reales entre cada par consecutivo.
export const trazarPorCalles = async (principales) => {
    if (principales.length < 2) throw new Error('Se necesitan al menos 2 puntos principales');

    const resultado = [principales[0]];
    for (let i = 0; i < principales.length - 1; i++) {
        const coords = await tramoPorCalles(principales[i], principales[i + 1]);
        const intermedios = simplificar(coords.slice(1, -1))
            .map(p => ({ lat: p.lat, lng: p.lng, label: 'curva', tipo: 'curva' }));
        resultado.push(...intermedios, principales[i + 1]);
    }
    return resultado;
};
