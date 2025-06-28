'use client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

type Feature = {
  id: string;
  geometry: { coordinates: [number, number, number] };
  properties: { mag: number; place: string; time: number };
};

export default function Table({ quakes }: { quakes: Feature[] }) {
  if (!quakes.length)
    return (
      <p className="text-gray-400 mt-4">
        Sin sismos en la última hora.
      </p>
    );

  const sorted = [...quakes].sort(
    (a, b) => b.properties.time - a.properties.time
  );

  return (
    <table className="w-full text-sm text-left mt-4 border-t border-gray-700">
      <thead className="bg-gray-800 text-gray-300">
        <tr>
          {/* 👇 NUEVA COLUMNA */}
          <th className="px-2 py-1">Fecha</th>
          <th className="px-2 py-1">Hora (RD)</th>
          <th className="px-2 py-1">Magnitud</th>
          <th className="px-2 py-1">Lugar</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((q) => {
          const fecha = new Date(q.properties.time);
          return (
            <tr key={q.id} className="border-b border-gray-700">
              {/* 👇 CELDA FECHA */}
              <td className="px-2 py-1">
                {format(fecha, 'dd/MM/yyyy', { locale: es })}
              </td>
              <td className="px-2 py-1">
                {format(fecha, 'HH:mm:ss', { locale: es })}
              </td>
              <td className="px-2 py-1 font-semibold">
                {q.properties.mag.toFixed(1)}
              </td>
              <td className="px-2 py-1">{q.properties.place}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
