# 11 Labs Integration Implementation Guide

## Quick Start Checklist

1. [ ] Set up 11 Labs agent with conversation logging
2. [ ] Create webhook endpoint to receive conversation data
3. [ ] Set up Gemini API for data extraction
4. [ ] Create database tables for storing conversations
5. [ ] Implement data processing pipeline
6. [ ] Create API endpoints for frontend

## Detailed Implementation Steps

### 1. 11 Labs Agent Configuration

Configure your 11 Labs agent to use the prompt from `/docs/agent-prompt.md`. The agent should collect:
- Employee name
- Issue summary
- Urgency (1-5 scale)
- Meeting duration (15, 30, 45, or 60 minutes)
- Meeting agenda

### 2. 11 Labs Conversation Data

When a conversation ends, 11 Labs should provide:
```json
{
  "conversation_id": "conv_abc123",
  "agent_id": "agent_xyz",
  "start_time": "2024-01-20T14:30:00Z",
  "end_time": "2024-01-20T14:45:00Z",
  "duration_seconds": 900,
  "transcript": "Full conversation transcript...",
  "audio_url": "https://...",
  "metadata": {
    "caller_phone": "+1234567890"
  }
}
```

### 3. Data Extraction Prompt for Gemini

Use this exact prompt for consistent data extraction:

```
You are a data extraction assistant. Extract the following information from the conversation transcript below.

IMPORTANT: The agent (Nathan) should have collected these 5 data points during the conversation:
1. Employee name
2. Issue summary
3. Urgency (1-5 scale)
4. Meeting duration (15, 30, 45, or 60 minutes)
5. Meeting agenda

Additional information to extract if available:
- Job title/role
- Email address
- Phone number
- Detailed issue description

Categorize the issue type as one of:
- Technical Support (technical problems, system issues)
- Feature Request (new functionality, improvements)
- Bug Report (software defects, errors)
- Infrastructure (servers, deployment, DevOps)
- General Inquiry (questions, clarifications)
- Team Management (people issues, team dynamics)
- Process Improvement (workflow, efficiency)

Return ONLY valid JSON in this exact format:
{
  "callerName": "Full Name",
  "title": "Job Title",
  "issueType": "Category from list above",
  "meetingDuration": 30,
  "urgencyScore": 3,
  "email": "email@example.com",
  "phoneNumber": "+1234567890",
  "agenda": "Main topics to discuss",
  "issueSummary": "Brief description of the issue",
  "detailedDescription": "Full explanation of the issue"
}

If a field is not found in the transcript, use null.

Transcript:
[INSERT TRANSCRIPT HERE]
```

### 4. Complete Backend Implementation

```javascript
// server.js
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Webhook endpoint for 11 Labs
app.post('/api/webhook/elevenlabs', async (req, res) => {
  try {
    const conversation = req.body;
    
    // Verify webhook signature (implement based on 11 Labs docs)
    if (!verifyWebhookSignature(req)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Store raw conversation
    await db.conversations_raw.create({
      id: conversation.conversation_id,
      transcript: conversation.transcript,
      start_time: conversation.start_time,
      end_time: conversation.end_time,
      metadata: conversation.metadata
    });
    
    // Process asynchronously
    processConversation(conversation.conversation_id);
    
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Process conversation with Gemini
async function processConversation(conversationId) {
  try {
    const rawConv = await db.conversations_raw.findById(conversationId);
    
    // Extract data using Gemini
    const prompt = getExtractionPrompt(rawConv.transcript);
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const extractedData = JSON.parse(response.text());
    
    // Validate and process extracted data
    const processedData = {
      id: conversationId,
      callerName: extractedData.callerName || 'Unknown',
      title: extractedData.title || 'Not specified',
      issueType: extractedData.issueType || 'General Inquiry',
      meetingDuration: validateMeetingDuration(extractedData.meetingDuration),
      urgency: mapUrgencyScore(extractedData.urgencyScore),
      timeRequested: rawConv.start_time,
      createdAt: new Date().toISOString(),
      dateLabel: getDateLabel(new Date(rawConv.start_time)),
      displayTime: formatTime(rawConv.start_time),
      subtitle: extractedData.issueType || 'General',
      phoneNumber: extractedData.phoneNumber || rawConv.metadata?.caller_phone || 'Not provided',
      email: extractedData.email || 'Not provided',
      transcript: rawConv.transcript,
      agenda: extractedData.agenda || extractedData.issueSummary || 'No agenda specified'
    };
    
    // Store processed conversation
    await db.conversations_processed.create(processedData);
    
  } catch (error) {
    console.error('Processing error:', error);
    // Store failed processing for manual review
    await db.processing_errors.create({
      conversation_id: conversationId,
      error: error.message,
      timestamp: new Date()
    });
  }
}

// Validation helpers
function validateMeetingDuration(duration) {
  const valid = [15, 30, 45, 60];
  return valid.includes(duration) ? duration : 30;
}

function mapUrgencyScore(score) {
  const mapping = {
    5: 'Critical',
    4: 'High',
    3: 'Medium',
    2: 'Low',
    1: 'Low'
  };
  return mapping[score] || 'Medium';
}
```

### 5. API Implementation

```javascript
// GET /api/callers - Main endpoint for dashboard
app.get('/api/callers', async (req, res) => {
  try {
    // Get all processed conversations
    const conversations = await db.conversations_processed.findAll({
      order: [['timeRequested', 'DESC']],
      limit: 100 // Adjust as needed
    });
    
    // Group by date
    const grouped = conversations.reduce((acc, conv) => {
      const dateLabel = conv.dateLabel;
      if (!acc[dateLabel]) acc[dateLabel] = [];
      
      acc[dateLabel].push({
        id: conv.id,
        title: `${conv.issueType} - ${conv.callerName}`,
        subtitle: conv.subtitle,
        time: conv.displayTime,
        meetingDuration: conv.meetingDuration,
        urgency: conv.urgency,
        fullData: conv
      });
      
      return acc;
    }, {});
    
    // Sort date groups
    const sortedGroups = {};
    const dateOrder = ['Today', 'Yesterday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    dateOrder.forEach(date => {
      if (grouped[date]) {
        sortedGroups[date] = grouped[date];
      }
    });
    
    res.json({
      conversationsByDate: sortedGroups,
      allCallers: conversations,
      total: conversations.length
    });
    
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// GET /api/stats - Statistics endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const [callsCount, peopleCount] = await Promise.all([
      db.conversations_processed.count({
        where: {
          timeRequested: { $gte: oneWeekAgo }
        }
      }),
      db.conversations_processed.count({
        distinct: true,
        col: 'callerName',
        where: {
          timeRequested: { $gte: oneWeekAgo }
        }
      })
    ]);
    
    res.json({
      callsLastWeek: callsCount,
      peopleSpokenTo: peopleCount
    });
    
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});
```

### 6. Environment Variables

```env
# 11 Labs
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret

# Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Database
DATABASE_URL=your_database_connection_string

# Server
PORT=3001
NODE_ENV=production
```

### 7. Testing Your Integration

1. **Test Data Extraction**:
```javascript
// test-extraction.js
const testTranscript = `
[00:00] Nathan: Hi, this is Nathan, Neeraj's assistant. I understand you'd like to schedule a meeting. Can I get your name?
[00:05] Caller: Hi Nathan, I'm Sarah Johnson.
[00:10] Nathan: Great, Sarah. What's the main issue you'd like to discuss?
[00:15] Sarah: I need to talk about the deployment pipeline issues we're having.
[00:20] Nathan: I see. On a scale of 1-5, how urgent is this?
[00:25] Sarah: I'd say it's a 4 - pretty urgent.
[00:30] Nathan: How much time do you think you'll need? 15, 30, 45, or 60 minutes?
[00:35] Sarah: 30 minutes should be enough.
[00:40] Nathan: And what's the main agenda for the meeting?
[00:45] Sarah: Review the current pipeline issues and decide on immediate fixes.
`;

// Test your extraction
testDataExtraction(testTranscript);
```

2. **Test Webhook Locally**:
```bash
# Use ngrok for local testing
ngrok http 3001

# Update 11 Labs webhook URL to ngrok URL
```

3. **Verify Data Flow**:
- Make a test call to your 11 Labs agent
- Check webhook receipt
- Verify data extraction
- Confirm API response format

### 8. Monitoring and Debugging

Add logging at each step:
```javascript
// Add detailed logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Log extraction results
console.log('Extracted data:', JSON.stringify(extractedData, null, 2));

// Log processing errors
console.error('Failed to process conversation:', conversationId, error);
```

### 9. Production Considerations

1. **Rate Limiting**: Implement rate limiting for Gemini API calls
2. **Retry Logic**: Add retry mechanism for failed extractions
3. **Caching**: Cache processed conversations for faster API responses
4. **Backup**: Store raw transcripts even if processing fails
5. **Monitoring**: Set up alerts for processing failures

### 10. Frontend Integration

The frontend expects data in the exact format specified. Ensure your API returns:
- Conversations grouped by date (Today, Yesterday, weekdays)
- Each conversation has all required fields
- Meeting duration is always 15, 30, 45, or 60
- Urgency is one of: Critical, High, Medium, Low

## Next Steps

1. Deploy your backend API
2. Configure 11 Labs webhook
3. Test end-to-end flow
4. Update frontend API endpoints to point to your backend
5. Monitor and iterate based on real conversation data