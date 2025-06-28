'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Table from '@/app/components/Table';

type Feature = {
  id: string;
  geometry: { coordinates: [number, number, number] };
  properties: { mag: number; place: string; time: number };
};

const Map = dynamic(() => import('@/app/components/Map'), { ssr: false });

export default function Home() {
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    fetch('/data/latest.json')
      .then((r) => r.json())
      .then((json) => setFeatures(json.features))
      .catch(console.error);
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Sismos recientes en RD y el Caribe
      </h1>

      <Map earthquakes={features} />
      <Table quakes={features} />
    </main>
  );
}
