'use client'
import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import LiveQuakesTable from '@/app/components/LiveQuakesTable'

type Feature = {
  id: string
  geometry: { coordinates: [number, number, number] }
  properties: { mag: number; place: string; time: number }
}

const Map = dynamic(() => import('@/app/components/Map'), { ssr: false })

export default function Home() {
  const [features, setFeatures] = useState<Feature[]>([])
  
  useEffect(() => {
    fetch('/data/latest.json')
      .then(r => r.json())
      .then(json => setFeatures(json.features))
      .catch(console.error)
  }, [])

  return (
    <main className="max-w-3xl mx-auto p-4">
    <h1 className="text-xl md:text-3xl text-bold mb-4" style={{ color: '#ffffff', mixBlendMode: 'normal' }}>
  Sismos recientes en República Dominicana
    </h1>


      {/* Mapa dinámico */}
      <Map earthquakes={features} />

      {/* Tabla en vivo debajo del mapa */}
      <LiveQuakesTable />
    </main>
  )
}
