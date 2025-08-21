import { NextResponse } from 'next/server';
import type { Caller, ConversationItem } from '@/types/conversation';

// Helper: Get date labels for grouping
const getDateLabel = (date: Date): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  
  if (inputDate.getTime() === today.getTime()) return "Today";
  if (inputDate.getTime() === yesterday.getTime()) return "Yesterday";
  
  // For older dates, return day of week
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[inputDate.getDay()];
};

// Mock data for callers
const mockCallers: Caller[] = [
  {
    id: 1,
    callerName: "John Doe",
    title: "Software Engineer",
    issueType: "Technical Support",
    meetingDuration: 30,
    urgency: "High",
    timeRequested: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    createdAt: new Date().toISOString(),
    dateLabel: "Today",
    displayTime: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    subtitle: "Technical Support",
    phoneNumber: "+1 (555) 123-4567",
    email: "john.doe@example.com",
    transcript: `[00:00] John Doe: Hi, I'm having trouble with the deployment pipeline.

[00:15] Support: Hello John, I'd be happy to help you with that. Can you describe what specific issue you're encountering?

[00:30] John Doe: Yes, when I try to deploy to production, the build fails with a cryptic error message about missing environment variables.

[00:45] Support: I see. Have you checked if all the required environment variables are properly set in your deployment configuration?

[01:00] John Doe: I thought I had, but let me double-check. The error mentions DATABASE_URL and API_KEY.

[01:15] Support: Those are critical variables. Make sure they're properly configured in your production environment settings.

[01:30] John Doe: I just checked, and it looks like the API_KEY was accidentally removed in our last update. Can you help me restore it?

[01:45] Support: Of course. I'll need to escalate this to our DevOps team to securely restore your API_KEY. They'll contact you within the next hour.

[02:00] John Doe: That would be great. This is blocking our release, so the sooner the better.

[02:15] Support: I understand the urgency. I'm marking this as high priority. Is there anything else you need help with while we work on this?

[02:30] John Doe: No, that's the main issue. Thank you for your help.

[02:45] Support: You're welcome. You'll receive an email once the API_KEY is restored. Have a good day!`
  },
  {
    id: 2,
    callerName: "Jane Smith",
    title: "Product Manager",
    issueType: "Feature Request",
    meetingDuration: 45,
    urgency: "Medium",
    timeRequested: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // Yesterday
    createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    dateLabel: "Yesterday",
    displayTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    subtitle: "Product",
    phoneNumber: "+1 (555) 234-5678",
    email: "jane.smith@example.com",
    transcript: `[00:00] Jane Smith: Hello, I'd like to discuss a new feature request for our platform.

[00:10] Support: Hi Jane, I'd be happy to hear about your feature request. What did you have in mind?

[00:20] Jane Smith: We've been getting feedback from users about needing a bulk export functionality for their data.

[00:35] Support: That's interesting. Can you provide more details about what specific data they want to export?

[00:50] Jane Smith: They want to export all their transaction history, user analytics, and custom reports in CSV or Excel format.

[01:05] Support: I see. How many users have requested this feature?

[01:20] Jane Smith: We've had about 50+ requests in the last month alone. It's becoming a frequent ask.

[01:35] Support: That's significant demand. Let me document this request with all the details you've provided.

[01:50] Jane Smith: Great! When could we potentially see this implemented?

[02:05] Support: I'll need to discuss with our development team, but typically features like this take 4-6 weeks. I'll get back to you with a timeline.

[02:20] Jane Smith: That works. Please keep me updated on the progress.

[02:30] Support: Will do. I've created a feature request ticket for you. You'll receive updates via email.`
  },
  {
    id: 3,
    callerName: "Mike Johnson",
    title: "Customer Success Manager",
    issueType: "Bug Report",
    meetingDuration: 15,
    urgency: "Critical",
    timeRequested: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // Yesterday
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    dateLabel: "Yesterday",
    displayTime: new Date(Date.now() - 26 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    subtitle: "Bug Report",
    phoneNumber: "+1 (555) 345-6789",
    email: "mike.johnson@example.com",
    transcript: `[00:00] Mike Johnson: This is urgent! Our largest client can't access their dashboard!

[00:10] Support: I understand this is critical. Let me help you immediately. What error are they seeing?

[00:20] Mike Johnson: They get a 500 Internal Server Error when trying to log in. This is affecting their entire team.

[00:30] Support: I'm escalating this to our engineering team right now. Can you provide the client's account ID?

[00:40] Mike Johnson: Yes, it's ACC-78945. They have a big presentation in 30 minutes!

[00:50] Support: I see the issue in our logs. There was a database connection timeout. Our team is working on it now.

[01:05] Mike Johnson: How long will this take? They're getting really anxious.

[01:15] Support: We're restarting the affected services. It should be resolved within 5-10 minutes.

[01:30] Mike Johnson: Okay, I'll keep them updated. Please hurry!

[01:45] Support: Good news! The issue has been resolved. They should be able to access their dashboard now.

[02:00] Mike Johnson: Let me check... Yes! They're in! Thank you so much for the quick response!

[02:10] Support: You're welcome! We've also added additional monitoring to prevent this from happening again.`
  },
  {
    id: 4,
    callerName: "Sarah Wilson",
    title: "Marketing Director",
    issueType: "General Inquiry",
    meetingDuration: 60,
    urgency: "Low",
    timeRequested: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    dateLabel: getDateLabel(new Date(Date.now() - 48 * 60 * 60 * 1000)),
    displayTime: new Date(Date.now() - 48 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    subtitle: "Sales",
    phoneNumber: "+1 (555) 456-7890",
    email: "sarah.wilson@example.com",
    transcript: `[00:00] Sarah Wilson: Hi, I have some questions about your enterprise pricing plans.

[00:15] Support: Hello Sarah, I'd be happy to help you understand our enterprise offerings. What specific information are you looking for?

[00:30] Sarah Wilson: We're considering upgrading from our current plan. Can you explain the differences between Enterprise and Enterprise Plus?

[00:45] Support: Certainly! The main differences are in user limits, API call volumes, and support levels. Enterprise includes up to 500 users, while Enterprise Plus is unlimited.

[01:00] Sarah Wilson: What about API limits?

[01:15] Support: Enterprise includes 1 million API calls per month, Enterprise Plus offers 10 million calls with burst capacity.

[01:30] Sarah Wilson: That's helpful. What about custom integrations?

[01:45] Support: Enterprise Plus includes dedicated integration support and custom connector development. Enterprise has standard integrations only.

[02:00] Sarah Wilson: I see. Can you send me a detailed comparison sheet?

[02:15] Support: Of course! I'll email you our comprehensive comparison guide and pricing details.

[02:30] Sarah Wilson: Perfect, thank you for your help!

[02:40] Support: You're welcome! Feel free to reach out if you have any other questions.`
  },
  {
    id: 5,
    callerName: "David Brown",
    title: "DevOps Engineer",
    issueType: "Infrastructure",
    meetingDuration: 30,
    urgency: "Medium",
    timeRequested: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(), // 3 days ago
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    dateLabel: getDateLabel(new Date(Date.now() - 72 * 60 * 60 * 1000)),
    displayTime: new Date(Date.now() - 72 * 60 * 60 * 1000).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    subtitle: "DevOps",
    phoneNumber: "+1 (555) 567-8901",
    email: "david.brown@example.com",
    transcript: `[00:00] David Brown: We need to discuss scaling options for our infrastructure.

[00:12] Support: Hi David, I can help with that. What specific scaling challenges are you facing?

[00:25] David Brown: Our traffic has increased 300% in the last month, and we're seeing performance degradation during peak hours.

[00:40] Support: That's significant growth. Are you currently using auto-scaling, or are you on fixed instances?

[00:55] David Brown: We're on fixed instances, but clearly need to move to auto-scaling. What are our options?

[01:10] Support: We offer several auto-scaling configurations. You can scale based on CPU, memory, or custom metrics.

[01:25] David Brown: We'd probably need CPU-based scaling. Our app is compute-intensive.

[01:40] Support: That makes sense. I can help you set up CPU-based auto-scaling with thresholds at 70% utilization.

[01:55] David Brown: What about costs? How does auto-scaling affect our billing?

[02:10] Support: You only pay for the resources you use. During low traffic, costs decrease as instances scale down.

[02:25] David Brown: Sounds good. Can we schedule a call to implement this?

[02:35] Support: Absolutely! I'll send you a calendar invite for a implementation session tomorrow.`
  },
];

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Group conversations by date
  const conversationsByDate = mockCallers.reduce((acc, caller) => {
    const dateLabel = caller.dateLabel;
    if (!acc[dateLabel]) {
      acc[dateLabel] = [];
    }
    acc[dateLabel].push({
      id: caller.id.toString(),
      title: `${caller.issueType} - ${caller.callerName}`,
      subtitle: caller.subtitle,
      time: caller.displayTime,
      meetingDuration: caller.meetingDuration,
      urgency: caller.urgency,
      fullData: caller // Include full data for detail view
    });
    return acc;
  }, {} as Record<string, ConversationItem[]>);
  
  // Sort dates properly
  const sortedDates = Object.keys(conversationsByDate).sort((a, b) => {
    if (a === "Today") return -1;
    if (b === "Today") return 1;
    if (a === "Yesterday") return -1;
    if (b === "Yesterday") return 1;
    return 0;
  });
  
  const sortedConversationsByDate = sortedDates.reduce((acc, date) => {
    acc[date] = conversationsByDate[date];
    return acc;
  }, {} as Record<string, ConversationItem[]>);
  
  return NextResponse.json({
    conversationsByDate: sortedConversationsByDate,
    allCallers: mockCallers,
    total: mockCallers.length,
  });
}