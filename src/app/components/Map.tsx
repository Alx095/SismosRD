'use client';

import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import chroma from 'chroma-js'; 
import L, { LatLngExpression } from 'leaflet';

/* ---------- tipos ---------- */
type Props = {
  earthquakes: {
    id: string;
    geometry: { coordinates: [number, number, number] };
    properties: { mag: number; place: string; time: number };
  }[];
};

/* ---------- helpers ---------- */
// color: de verde (2.5) → amarillo (≈4.5) → rojo (7+)
const getColor = (mag: number) =>
  chroma
    .scale(['#4ade80', '#facc15', '#ef4444'])
    .domain([2.5, 7])(mag)
    .hex();

// radio: mínimo 4 px, luego 3 px por unidad de magnitud
const getRadius = (mag: number) => Math.max(4, mag * 3);

/* ---------- límites RD ---------- */
const center: LatLngExpression = [19.0, -70.5];
const bounds: L.LatLngBoundsExpression = [
  [17.2, -72], // suroeste
  [20.7, -68], // noreste
];

/* ---------- componente ---------- */
export default function Map({ earthquakes }: Props) {
  return (
    <div className="h-[400px] w-full mb-4">
      <MapContainer
        center={center}
        zoom={7}
        scrollWheelZoom={false}
        maxBounds={bounds}
        maxBoundsViscosity={0.8}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {earthquakes.map((eq) => {
          const [lon, lat] = eq.geometry.coordinates;
          const mag = eq.properties.mag;

          return (
            <CircleMarker
              key={eq.id}
              center={[lat, lon]}
              radius={getRadius(mag)}
              pathOptions={{ color: getColor(mag), weight: 2 }}
            >
              <Popup>
                <strong>{mag.toFixed(1)} Mw</strong>
                <br />
                {eq.properties.place}
                <br />
                {new Date(eq.properties.time).toLocaleString()}
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
