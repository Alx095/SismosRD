'use client'
import { useEffect, useState } from 'react'
import { CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/20/solid'

/* ---------- Tipos ---------- */
type QuakeRow = {
  ts:   number
  date: string
  time: string
  mag:  number
  place:string
}
type UsgsFeature = {
  properties:{ mag:number; place:string; time:number }
}
type UsgsFeed = { features:UsgsFeature[] }

/* ---------- Helpers de color / nivel ---------- */
const colorForMag = (m:number) =>
  m >= 5.5 ? 'text-red-500'
  : m > 3.5 ? 'text-yellow-400'
  :           'text-green-400'

const levelBg = (m:number) =>
  m >= 5.5 ? 'bg-red-500'
  : m > 3.5 ? 'bg-yellow-400'
  :           'bg-green-400'

const levelLabel = (m:number) =>
  m >= 5.5 ? 'Sismo fuerte'
  : m > 3.5 ? 'Sismo moderado'
  :           'Sismo leve'

/* ---------- Componente ---------- */
export default function LiveQuakesTable() {
  const [rows, setRows] = useState<QuakeRow[]>([])
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    if (typeof Notification !== 'undefined') Notification.requestPermission()

    const fetchRows = async () => {
      try {
        const res = await fetch('/data/latest.json')
        const raw = await res.json()
        if (!Array.isArray(raw?.features)) return

        const now = Date.now()
        const parsed: QuakeRow[] = raw.features
          .filter(
            (f:UsgsFeature) =>
              f.properties.place?.includes('Dominican Republic') &&
              now - f.properties.time <= 86_400_000
          )
          .map((f:UsgsFeature) => {
            const d = new Date(f.properties.time)
            return {
              ts   : f.properties.time,
              date : d.toLocaleDateString('es-DO'),
              time : d.toLocaleTimeString('es-DO'),
              mag  : f.properties.mag,
              place: f.properties.place,
            }
          })
          .sort((a,b) => b.ts - a.ts)
          .slice(0, 5)

        parsed.forEach(q => {
          if (q.mag >= 5.5 && Notification.permission === 'granted') {
            new Notification('¡Sismo fuerte detectado!', {
              body: `${q.mag.toFixed(1)} · ${q.place} · ${q.time}`,
            })
          }
        })

        setRows(parsed)
        setLastUpdated(new Date().toLocaleTimeString('es-DO'))
      } catch (e) {
        console.error(e)
      }
    }

    fetchRows()
    const id = setInterval(fetchRows, 15_000)
    return () => clearInterval(id)
  }, [])

  /* ---------- UI ---------- */
  return (
    <div className="relative p-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between mt-6 mb-3">
        <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent flex items-center gap-2">
          <GlobeAltIcon className="h-6 w-6" />
          Últimos sismos
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Última actualización: {lastUpdated}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="flex items-center gap-2 italic text-gray-500 dark:text-gray-400">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
          No se han registrado sismos en la República Dominicana en las últimas 24 h.
        </p>
      ) : (
        <>
          {/* ===== Feed de alertas (móvil) ===== */}
          <div className="space-y-4 md:hidden">
            {rows.map(q => (
              <div
                key={q.ts}
                className={`border-l-4 ${levelBg(q.mag)}/50 p-3 rounded-md shadow-md bg-black/20 backdrop-blur-sm`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-lg font-bold ${colorForMag(q.mag)}`}>
                    {q.mag.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-400">{levelLabel(q.mag)}</span>
                </div>
                <p className="text-sm leading-snug">{q.place}</p>
                <p className="text-xs text-gray-400">
                  {q.date} · {q.time}
                </p>
              </div>
            ))}
          </div>

          {/* ===== Tabla tradicional (≥ md) ===== */}
          <div className="hidden md:block">
            <table className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow">
              <thead className="bg-gray-200 dark:bg-gray-800 font-semibold">
                <tr>
                  <th className="px-3 py-2 text-left">Fecha</th>
                  <th className="px-3 py-2 text-left">Hora</th>
                  <th className="px-3 py-2 text-center">Magnitud</th>
                  <th className="px-3 py-2 text-center">Nivel</th>
                  <th className="px-3 py-2 text-left">Lugar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(q => (
                  <tr key={q.ts} className="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-3 py-2">{q.date}</td>
                    <td className="px-3 py-2">{q.time}</td>
                    <td className={`px-3 py-2 text-center font-semibold ${colorForMag(q.mag)}`}>
                      {q.mag.toFixed(1)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div
                        title={levelLabel(q.mag)}
                        className={`mx-auto w-4 h-4 rounded-full ${levelBg(q.mag)}`}
                      />
                    </td>
                    <td className="px-3 py-2">{q.place}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
