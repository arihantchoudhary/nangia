"use client"

import * as React from "react"
import { FileText, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { TranscriptViewer } from "@/components/caller-table/transcript-viewer"
import type { Caller, ConversationItem, DashboardData } from "@/types/conversation"


export function ConversationDashboard() {
  const [isLoading, setIsLoading] = React.useState(true)
  const [selectedCaller, setSelectedCaller] = React.useState<Caller | null>(null)
  const [transcriptOpen, setTranscriptOpen] = React.useState(false)
  const [data, setData] = React.useState<DashboardData>({
    conversationsByDate: {},
    allCallers: [],
    total: 0
  })

  React.useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/callers")
      
      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const result = await response.json()
      setData(result)
    } catch (error) {
      toast.error("Failed to load dashboard data")
      console.error("Error fetching dashboard data:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleConversationClick = (conversation: ConversationItem) => {
    if (conversation.fullData) {
      setSelectedCaller(conversation.fullData)
      setTranscriptOpen(true)
    }
  }

  const getMeetingDurationColor = (duration?: number) => {
    switch (duration) {
      case 15: return "secondary"
      case 30: return "default"
      case 45: return "outline"
      case 60: return "destructive"
      default: return "outline"
    }
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case "Critical": return "text-red-600"
      case "High": return "text-orange-600"
      case "Medium": return "text-yellow-600"
      case "Low": return "text-green-600"
      default: return "text-gray-600"
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <>
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="space-y-8">
        {Object.entries(data.conversationsByDate).map(([date, conversations]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-muted-foreground mb-4">
              {date}
            </h3>
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => handleConversationClick(conversation)}
                >
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">
                          {conversation.title}
                        </h4>
                        {conversation.subtitle && (
                          <p className="text-sm text-muted-foreground">
                            {conversation.subtitle}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {conversation.meetingDuration && (
                          <Badge 
                            variant={getMeetingDurationColor(conversation.meetingDuration) as "default" | "secondary" | "destructive" | "outline"}
                            className="text-xs"
                          >
                            {conversation.meetingDuration} min
                          </Badge>
                        )}
                        {conversation.urgency && (
                          <span className={`text-xs font-medium ${getUrgencyColor(conversation.urgency)}`}>
                            {conversation.urgency}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <span className="text-sm text-muted-foreground">
                    {conversation.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
        </div>
      </div>
      
      <TranscriptViewer
        caller={selectedCaller}
        open={transcriptOpen}
        onOpenChange={setTranscriptOpen}
      />
    </>
  )
}