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
      <div className="mt-6 p-4 bg-yellow-100 text-yellow-800 rounded-xl text-center shadow">
        <p className="text-lg font-medium">
          🌎 No se han registrado sismos en la región en las últimas 24 horas.
        </p>
      </div>
    );

  const sorted = [...quakes].sort(
    (a, b) => b.properties.time - a.properties.time
  );

  return (
    <table className="w-full text-sm text-left mt-4 border-t border-gray-700 text-white bg-black">
      <thead className="bg-gray-800 text-gray-200">
        <tr>
          <th className="px-2 py-2">Fecha</th>
          <th className="px-2 py-2">Hora (RD)</th>
          <th className="px-2 py-2">Magnitud</th>
          <th className="px-2 py-2">Lugar</th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((q) => {
          const fecha = new Date(q.properties.time);
          const mag = q.properties.mag;
          const emoji =
            mag >= 6
              ? '💥'
              : mag >= 5
              ? '🔴'
              : mag >= 4
              ? '🟠'
              : '🟢';

          const textColor =
            mag >= 6
              ? 'text-red-500'
              : mag >= 5
              ? 'text-orange-400'
              : mag >= 4
              ? 'text-yellow-300'
              : 'text-green-300';

          return (
            <tr
              key={q.id}
              className="border-b border-gray-700 hover:bg-gray-800 transition"
            >
              <td className="px-2 py-1">
                {format(fecha, 'dd/MM/yyyy', { locale: es })}
              </td>
              <td className="px-2 py-1">
                {format(fecha, 'HH:mm:ss', { locale: es })}
              </td>
              <td className={`px-2 py-1 font-semibold ${textColor}`}>
                {emoji} {mag.toFixed(1)}
              </td>
              <td className="px-2 py-1">{q.properties.place}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
