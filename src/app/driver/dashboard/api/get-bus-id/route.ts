
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = cookies();
  const busId = cookieStore.get('busId')?.value;

  if (busId) {
    return NextResponse.json({ busId });
  } else {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
}
