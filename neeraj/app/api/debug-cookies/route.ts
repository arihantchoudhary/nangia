import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  const stackCookies = allCookies.filter(cookie => 
    cookie.name.includes('stack') || 
    cookie.name.includes('auth') ||
    cookie.name.includes('session')
  );

  return NextResponse.json({
    allCookiesCount: allCookies.length,
    stackCookies: stackCookies.map(c => ({ name: c.name, value: c.value ? '***' : 'empty' })),
    hasCookies: allCookies.length > 0,
  });
}