import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    console.log('=== STARTING DELETE OPERATION ===');
    console.log('Conversation ID:', conversationId);
    
    const apiKey = process.env.ELEVEN_LABS_API_KEY;
    let elevenLabsDeleted = false;
    let backendDeleted = false;
    
    // Step 1: Delete from backend first (it's faster and more reliable)
    try {
      console.log('Step 1: Deleting from backend...');
      const backendResponse = await fetch(
        `https://elevenlabs-calendar-apis.onrender.com/api/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const backendData = await backendResponse.json();
      
      if (backendResponse.ok && backendData.success) {
        backendDeleted = true;
        console.log('✅ Successfully deleted from backend');
      } else if (backendResponse.status === 404) {
        console.log('⚠️  Conversation not found in backend (already deleted?)');
        backendDeleted = true; // Consider it deleted
      } else {
        console.error('❌ Backend deletion failed:', backendResponse.status, backendData);
      }
    } catch (backendError) {
      console.error('❌ Error calling backend delete:', backendError);
    }
    
    // Step 2: Delete from ElevenLabs
    try {
      console.log('Step 2: Deleting from ElevenLabs...');
      const elevenLabsResponse = await fetch(
        `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: {
            'xi-api-key': apiKey || '',
          },
        }
      );

      if (elevenLabsResponse.ok) {
        elevenLabsDeleted = true;
        console.log('✅ Successfully deleted from ElevenLabs');
      } else if (elevenLabsResponse.status === 404) {
        console.log('⚠️  Conversation not found in ElevenLabs (already deleted?)');
        elevenLabsDeleted = true; // Consider it deleted
      } else {
        const errorText = await elevenLabsResponse.text();
        console.error('❌ ElevenLabs deletion failed:', elevenLabsResponse.status, errorText);
      }
    } catch (elevenLabsError) {
      console.error('❌ Error calling ElevenLabs API:', elevenLabsError);
    }

    // Step 3: If backend deletion failed but ElevenLabs succeeded, trigger sync
    if (!backendDeleted && elevenLabsDeleted) {
      try {
        console.log('Step 3: Backend delete failed, triggering sync...');
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
          console.log('✅ Sync completed - backend should be updated');
          backendDeleted = true;
        }
      } catch (syncError) {
        console.error('❌ Sync failed:', syncError);
      }
    }

    // Return results
    console.log('=== DELETE OPERATION COMPLETE ===');
    console.log(`Backend deleted: ${backendDeleted}`);
    console.log(`ElevenLabs deleted: ${elevenLabsDeleted}`);
    
    if (backendDeleted || elevenLabsDeleted) {
      return NextResponse.json({ 
        success: true,
        backendDeleted,
        elevenLabsDeleted,
        message: 'Conversation deleted successfully'
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to delete from both backend and ElevenLabs',
          backendDeleted,
          elevenLabsDeleted
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Critical error in delete handler:', error);
    return NextResponse.json(
      { error: 'Failed to delete conversation', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}