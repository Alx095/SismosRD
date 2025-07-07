'use client'
import { useEffect, useState } from 'react'
import { CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/20/solid'

// ----------------------- Tipos -----------------------
type QuakeRow = {
  date: string
  time: string
  mag: number
  place: string
}

type UsgsFeature = {
  properties: {
    mag: number
    place: string
    time: number
  }
  geometry: {
    coordinates: [number, number, number]
  }
}

type UsgsFeed = {
  features: UsgsFeature[]
}

// ------------------- Componente ----------------------
export default function LiveQuakesTable() {
  const [rows, setRows] = useState<QuakeRow[]>([])
  const [lastUpdated, setLastUpdated] = useState<string>('')

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      Notification.requestPermission()
    }

    const API = '/data/latest.json'

    const fetchRows = async () => {
      try {
        const res = await fetch(API)
        if (!res.ok) throw new Error(res.statusText)

        const raw = (await res.json()) as unknown
        if (typeof raw !== 'object' || raw === null) return
        if (!Array.isArray((raw as UsgsFeed).features)) return

        const feed = raw as UsgsFeed
        const now = Date.now()

        // Parseo y filtro (24 h y RD)
        const parsed: QuakeRow[] = feed.features
          .filter(
            f =>
              f.properties.place?.includes('Dominican Republic') &&
              now - f.properties.time <= 24 * 60 * 60 * 1000
          )
          .map(f => {
            const d = new Date(f.properties.time)
            return {
              date: d.toLocaleDateString('es-DO'),
              time: d.toLocaleTimeString('es-DO'),
              mag: f.properties.mag,
              place: f.properties.place,
            }
          })

        // Ordenar desc y limitar a 5
        const limited = parsed
          .sort(
            (a, b) =>
              new Date(`${b.date} ${b.time}`).getTime() -
              new Date(`${a.date} ${a.time}`).getTime()
          )
          .slice(0, 5)

        // Notificación solo si ≥ 5.5 (fuerte)
        limited.forEach(q => {
          if (q.mag >= 5.5 && Notification.permission === 'granted') {
            new Notification('¡Sismo fuerte detectado!', {
              body: `${q.mag.toFixed(1)} - ${q.place} a las ${q.time}`,
            })
          }
        })

        setRows(limited)
        setLastUpdated(new Date().toLocaleTimeString('es-DO'))
      } catch (err) {
        console.error(err)
      }
    }

    fetchRows()
    const id = setInterval(fetchRows, 15_000)
    return () => clearInterval(id)
  }, [])

  // ------------------- Helpers -----------------------
  const colorForMag = (mag: number) =>
    mag >= 5.5 ? 'text-red-500' : mag > 3.5 ? 'text-yellow-400' : 'text-green-400'

  const levelTitle = (mag: number) =>
    mag >= 5.5 ? 'Sismo fuerte' : mag > 3.5 ? 'Sismo moderado' : 'Sismo leve'

  const levelBg = (mag: number) =>
    mag >= 5.5 ? 'bg-red-500' : mag > 3.5 ? 'bg-yellow-400' : 'bg-green-400'

  // -------------------- UI ---------------------------
  return (
    <div className="relative p-4">
      {/* Cabecera */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 text-transparent bg-clip-text flex items-center gap-2">
          <GlobeAltIcon className="h-6 w-6" /> Últimos sismos
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Última actualización: {lastUpdated}
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic mt-4 flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-green-400" /> No se han registrado sismos en la República Dominicana en las últimas 24 horas.
        </p>
      ) : (
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
            {rows.map((q, i) => (
              <tr key={i} className="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <td className="px-3 py-2">{q.date}</td>
                <td className="px-3 py-2">{q.time}</td>
                <td className={`px-3 py-2 text-center font-semibold ${colorForMag(q.mag)}`}>{q.mag.toFixed(1)}</td>
                <td className="px-3 py-2 text-center">
                  <div title={levelTitle(q.mag)} className={`mx-auto w-4 h-4 rounded-full ${levelBg(q.mag)}`}></div>
                </td>
                <td className="px-3 py-2">{q.place}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
