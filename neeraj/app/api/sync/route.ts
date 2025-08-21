import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Call the backend sync endpoint
    const response = await fetch('https://elevenlabs-calendar-apis.onrender.com/api/sync-elevenlabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Sync failed with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error syncing with backend:', error);
    return NextResponse.json(
      { error: 'Failed to sync with ElevenLabs' },
      { status: 500 }
    );
  }
}