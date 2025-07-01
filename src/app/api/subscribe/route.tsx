export const runtime = 'edge';

export async function POST(req: Request) {
  const sub = await req.json();

  await fetch('https://api.sismosrd.com/save', {
    method: 'POST',
    body: JSON.stringify(sub)
  });

  return new Response('ok');
}
