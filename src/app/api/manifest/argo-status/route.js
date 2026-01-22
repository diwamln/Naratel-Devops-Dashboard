import { NextResponse } from 'next/server';
import { getArgoAppStatus } from '@/lib/argocd';

export const dynamic = 'force-dynamic'; // Disable caching

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const appName = searchParams.get('appName');

  if (!appName) {
    return NextResponse.json({ error: 'App Name is required' }, { status: 400 });
  }

  // Jika env variable belum diset, return mock data untuk development agar UI tidak rusak
  if (!process.env.ARGOCD_URL) {
      // Mock random delay response
      return NextResponse.json({
          health: 'MissingConfig', // Indikator khusus
          sync: 'Unknown'
      });
  }

  try {
    const status = await getArgoAppStatus(appName);
    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
