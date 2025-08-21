import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy to localhost:3002
    const response = await fetch('https://elevenlabs-calendar-apis.onrender.com/api/stats', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to localhost:3002:', error);
    
    // Return default stats on error
    return NextResponse.json({
      callsLastWeek: 0,
      peopleSpokenTo: 0
    }, { status: 500 });
  }
}