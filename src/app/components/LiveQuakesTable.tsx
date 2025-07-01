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
    const API = 'http://127.0.0.1:8787/recent'
       // cambia si tu Worker está en otro dominio

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
        Últimos sismos (en vivo)
      </h2>

      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2">Fecha</th>
            <th className="p-2">Hora</th>
            <th className="p-2 text-center">Mag.</th>
            <th className="p-2">Lugar</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((q, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{q.date}</td>
              <td className="p-2">{q.time}</td>
              <td className="p-2 text-center">{q.mag}</td>
              <td className="p-2">{q.place}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
