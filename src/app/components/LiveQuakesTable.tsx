'use client'
import { useEffect, useState } from 'react'

type QuakeRow = {
  date: string
  time: string
  mag: string | number
  place: string
}

export default function LiveQuakesTable() {
  const [rows, setRows] = useState<QuakeRow[]>([])

  useEffect(() => {
    const API = '/data/latest.json'

    const fetchRows = async () => {
      try {
        const res = await fetch(API)
        if (!res.ok) throw new Error(res.statusText)

        const raw: unknown = await res.json()

        if (Array.isArray(raw)) {
          // Validamos que los elementos tienen los campos necesarios
          const isValid = (obj: any): obj is QuakeRow =>
            typeof obj.date === 'string' &&
            typeof obj.time === 'string' &&
            (typeof obj.mag === 'number' || typeof obj.mag === 'string') &&
            typeof obj.place === 'string'

          const parsed = raw.filter(isValid)
          setRows(parsed)
        } else {
          console.error('Formato inesperado:', raw)
        }

      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('No se pudo cargar /latest.json:', err.message)
        } else {
          console.error('No se pudo cargar /latest.json:', err)
        }
      }
    }

    fetchRows()
    const id = setInterval(fetchRows, 15_000) // refresca cada 15s
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <h2 className="text-xl font-semibold mt-6 mb-2">Últimos sismos</h2>
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
            <tr key={i} className="border-t border-gray-700 hover:bg-gray-700 transition-colors duration-200">
              <td className="px-3 py-2">{q.date}</td>
              <td className="px-3 py-2">{q.time}</td>
              <td className={`px-3 py-2 text-center font-semibold ${
                +q.mag >= 5 ? 'text-red-400'
                : +q.mag >= 4 ? 'text-green-400'
                : 'text-white'
              }`}>
                {Number(q.mag).toFixed(1)}
              </td>
              <td className="px-3 py-2">{q.place}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
