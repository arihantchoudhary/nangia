export interface Caller {
  id: number
  callerName: string
  title: string
  issueType: string
  meetingDuration: 15 | 30 | 45 | 60
  urgency: "Critical" | "High" | "Medium" | "Low"
  timeRequested: string
  createdAt: string
  dateLabel: string
  displayTime: string
  subtitle: string
  phoneNumber: string
  email: string
  transcript: string
}

export interface ConversationItem {
  id: string
  title: string
  subtitle?: string
  time: string
  meetingDuration?: 15 | 30 | 45 | 60
  urgency?: string
  fullData?: Caller
}

export interface DashboardData {
  conversationsByDate: Record<string, ConversationItem[]>
  allCallers: Caller[]
  total: number
}