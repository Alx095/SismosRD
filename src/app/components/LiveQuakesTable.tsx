'use client'
import { useEffect, useState } from 'react'
import { CheckCircleIcon, GlobeAltIcon } from '@heroicons/react/20/solid'

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

        if (
          typeof raw === 'object' &&
          raw !== null &&
          Array.isArray((raw as UsgsFeed).features)
        ) {
          const feed = raw as UsgsFeed
          const now = Date.now()

          const parsed: QuakeRow[] = feed.features
            .filter(f =>
              f.properties.place?.includes('Dominican Republic') &&
              now - f.properties.time <= 24 * 60 * 60 * 1000
            )
            .map((f) => {
              const d = new Date(f.properties.time)
              return {
                date: d.toLocaleDateString('es-DO'),
                time: d.toLocaleTimeString('es-DO'),
                mag: f.properties.mag,
                place: f.properties.place,
              }
            })

          const grouped: Record<string, QuakeRow[]> = {}

          parsed.forEach((row) => {
            if (!grouped[row.date]) grouped[row.date] = []
            grouped[row.date].push(row)
          })

          const limited: QuakeRow[] = Object.values(grouped)
            .flatMap((rows) =>
              rows
                .sort((a, b) => b.time.localeCompare(a.time))
                .slice(0, 5)
            )

          limited.forEach((q) => {
            if (q.mag >= 5.5 && Notification.permission === 'granted') {
              new Notification('¡Sismo fuerte detectado!', {
                body: `${q.mag.toFixed(1)} - ${q.place} a las ${q.time}`,
              })
            }
          })

          setRows(limited)
          setLastUpdated(new Date().toLocaleTimeString('es-DO'))
        } else {
          console.error('Formato inesperado en latest.json:', raw)
        }
      } catch (err) {
        if (err instanceof Error) {
          console.error('No se pudo cargar /latest.json:', err.message)
        } else {
          console.error('No se pudo cargar /latest.json:', err)
        }
      }
    }

    fetchRows()
    const id = setInterval(fetchRows, 15_000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative p-4">
      {/* Título + hora en una sola línea */}
      <div className="flex items-center justify-between mt-6 mb-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-green-400 text-transparent bg-clip-text flex items-center gap-2">
          <GlobeAltIcon className="h-6 w-6" />
          Últimos sismos
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Última actualización: {lastUpdated}
        </p>
      </div>

      {/* Tabla o mensaje vacío */}
      {rows.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 italic mt-4 flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-green-400" />
          No se han registrado sismos en la República Dominicana en las últimas 24 horas.
        </p>
      ) : (
        <table className="w-full text-sm border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow">
          <thead className="bg-gray-200 dark:bg-gray-800 font-semibold">
            <tr>
              <th className="px-3 py-2 text-left">Fecha</th>
              <th className="px-3 py-2 text-left">Hora</th>
              <th className="px-3 py-2 text-center">Magnitud</th>
              <th className="px-3 py-2 text-center">⚠️</th>
              <th className="px-3 py-2 text-left">Lugar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((q, i) => (
              <tr
                key={i}
                className="border-t border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <td className="px-3 py-2">{q.date}</td>
                <td className="px-3 py-2">{q.time}</td>
                <td
                  className={`px-3 py-2 text-center font-semibold ${
                    q.mag >= 5
                      ? 'text-red-500'
                      : q.mag >= 4
                      ? 'text-yellow-400'
                      : 'text-green-400'
                  }`}
                >
                  {q.mag.toFixed(1)}
                </td>
                <td className="px-3 py-2 text-center">
                  {q.mag >= 5
                    ? '🔥'
                    : q.mag >= 4
                    ? '⚠️'
                    : '🟢'}
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
