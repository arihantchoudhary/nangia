import { NextResponse } from 'next/server';
import type { Caller, ConversationItem } from '@/types/conversation';

interface ApiResponse {
  conversationsByDate: Record<string, ConversationItem[]>;
  allCallers: Caller[];
  total: number;
}

export async function GET() {
  try {
    // Proxy to localhost:3002
    const response = await fetch('https://elevenlabs-calendar-apis.onrender.com/api/callers', {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    
    // Transform the data to use issueSummary in title but keep issueType as subtitle
    if (data.conversationsByDate) {
      Object.keys(data.conversationsByDate).forEach(date => {
        data.conversationsByDate[date] = data.conversationsByDate[date].map((conv: ConversationItem) => {
          // Update the title to use issueSummary if available
          const summary = conv.fullData?.issueSummary || conv.fullData?.issueType || 'Meeting Request';
          const issueType = conv.fullData?.issueType || 'General Inquiry';
          return {
            ...conv,
            title: `${conv.fullData?.callerName || 'Unknown'} - ${summary}`,
            subtitle: issueType,
            fullData: conv.fullData ? {
              ...conv.fullData,
              title: `${conv.fullData.callerName || 'Unknown'} - ${summary}`,
              subtitle: issueType
            } : undefined
          };
        });
      });
    }
    
    // Also update allCallers array
    if (data.allCallers) {
      data.allCallers = data.allCallers.map((caller: Caller) => {
        const summary = caller.issueSummary || caller.issueType || 'Meeting Request';
        const issueType = caller.issueType || 'General Inquiry';
        return {
          ...caller,
          title: `${caller.callerName || 'Unknown'} - ${summary}`,
          subtitle: issueType
        };
      });
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error proxying to localhost:3002:', error);
    
    // Return empty data structure on error
    return NextResponse.json({
      conversationsByDate: {},
      allCallers: [],
      total: 0,
    }, { status: 500 });
  }
}
