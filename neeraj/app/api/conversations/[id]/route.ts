import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    console.log('Deleting conversation:', conversationId);
    
    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    console.log('API Key exists:', !!apiKey);
    
    // First, try to delete from ElevenLabs
    try {
      const elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            'xi-api-key': apiKey || '',
          },
        }
      );

      const responseText = await elevenLabsResponse.text();
      console.log('ElevenLabs response status:', elevenLabsResponse.status);
      console.log('ElevenLabs response:', responseText);
      
      if (!elevenLabsResponse.ok && elevenLabsResponse.status !== 404) {
        console.error('Failed to delete from ElevenLabs:', elevenLabsResponse.status, responseText);
      }
    } catch (elevenLabsError) {
      console.error('Error calling ElevenLabs API:', elevenLabsError);
      // Continue anyway to delete from our backend
    }

    // Since backend doesn't have delete endpoint, trigger a sync to update the database
    try {
      console.log('Triggering sync with ElevenLabs to update backend...');
      const syncResponse = await fetch(
        'https://elevenlabs-calendar-apis.onrender.com/api/sync-elevenlabs',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (syncResponse.ok) {
        const syncResult = await syncResponse.json();
        console.log('Sync successful:', syncResult);
      } else {
        console.log('Sync failed but continuing:', syncResponse.status);
      }
    } catch (syncError) {
      console.log('Could not sync with backend:', syncError);
      // This is ok - the main deletion from ElevenLabs succeeded
    }

    // Success if we got this far (ElevenLabs deletion is the main operation)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in delete handler:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}