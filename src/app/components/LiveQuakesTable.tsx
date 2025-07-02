'use client'
import { useEffect, useState } from 'react'

/* ----------------------------- Tipos internos ----------------------------- */

type QuakeRow = {
  date:  string
  time:  string
  mag:   number
  place: string
}

type UsgsFeature = {
  properties: {
    mag:   number
    place: string
    time:  number
  }
}
type UsgsFeed = {
  features: UsgsFeature[]
}

/* --------------------------- Componente principal ------------------------- */

export default function LiveQuakesTable() {
  const [rows, setRows] = useState<QuakeRow[]>([])

  useEffect(() => {
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

          const parsed: QuakeRow[] = feed.features
            .filter(f =>
              f.properties.place?.includes('Dominican Republic')
            )
            .map((f) => {
              const d = new Date(f.properties.time)
              return {
                date : d.toLocaleDateString('es-DO'),
                time : d.toLocaleTimeString('es-DO'),
                mag  : f.properties.mag,
                place: f.properties.place,
              }
            })

          // Agrupar por fecha y limitar a 5 sismos por día
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

          setRows(limited)
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
    const id = setInterval(fetchRows, 15_000) // refresca cada 15 s
    return () => clearInterval(id)
  }, [])

  /* -------------------------------- Render -------------------------------- */

  return (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-2">
        Últimos sismos
      </h2>

      <table className="w-full text-sm text-white border border-gray-700 rounded-lg overflow-hidden">
        <thead className="bg-gray-800 font-semibold">
          <tr>
            <th className="px-3 py-2 text-left">Fecha</th>
            <th className="px-3 py-2 text-left">Hora</th>
            <th className="px-3 py-2 text-center">Magnitud</th>
            <th className="px-3 py-2 text-left">Lugar</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((q, i) => (
            <tr
              key={i}
              className="border-t border-gray-700 hover:bg-gray-700 transition-colors duration-200"
            >
              <td className="px-3 py-2">{q.date}</td>
              <td className="px-3 py-2">{q.time}</td>
              <td
                className={`px-3 py-2 text-center font-semibold ${
                  q.mag >= 5
                    ? 'text-red-400'
                    : q.mag >= 4
                    ? 'text-green-400'
                    : 'text-white'
                }`}
              >
                {q.mag.toFixed(1)}
              </td>
              <td className="px-3 py-2">{q.place}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
