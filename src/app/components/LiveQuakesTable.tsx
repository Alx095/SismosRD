'use client'
import { useEffect, useState } from 'react'

type QuakeRow = {
  date:  string
  time:  string
  mag:   string | number
  place: string
}

export default function LiveQuakesTable() {
  const [rows, setRows] = useState<QuakeRow[]>([])

  useEffect(() => {
    const API = '/recent'        // cambia si tu Worker está en otro dominio

    const fetchRows = async () => {
      try {
        const res = await fetch(API)
        if (!res.ok) throw new Error(res.statusText)
        const data: QuakeRow[] = await res.json()
        setRows(data)
      } catch (err) {
        console.error('No se pudo cargar /recent', err)
      }
    }

    fetchRows()
    const id = setInterval(fetchRows, 15_000) // refresca cada 15 s
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-2">
        Últimos sismos (archivo local)
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
