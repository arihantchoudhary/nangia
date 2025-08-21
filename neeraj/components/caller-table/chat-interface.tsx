"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Loader2 } from "lucide-react"

interface Message {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: Date
}

interface ChatInterfaceProps {
  transcript: string
  callerName: string
}

// Mock responses based on common queries and caller context
const getMockResponse = (userMessage: string, callerName: string, transcript: string): string => {
  const message = userMessage.toLowerCase()
  
  // Context-aware responses based on the actual transcript content
  if (transcript.includes("deployment pipeline")) {
    if (message.includes("status") || message.includes("update")) {
      return `Based on the transcript, ${callerName}'s deployment pipeline issue is currently being handled by the DevOps team. The API_KEY restoration was escalated as a high priority issue. The team should contact them within the hour as mentioned in the conversation.`
    }
    
    if (message.includes("problem") || message.includes("issue")) {
      return `The main issue ${callerName} is facing is with the deployment pipeline. Specifically, the build is failing due to missing environment variables - DATABASE_URL and API_KEY. The API_KEY was accidentally removed in their last update.`
    }
  }
  
  if (transcript.includes("Feature Request")) {
    if (message.includes("feature") || message.includes("request")) {
      return `${callerName} has requested a bulk export functionality for their platform. This feature would allow users to export transaction history, user analytics, and custom reports in CSV or Excel format. Over 50+ users have requested this feature in the last month.`
    }
    
    if (message.includes("timeline") || message.includes("when")) {
      return `The development team typically takes 4-6 weeks for features like this bulk export functionality. ${callerName} will receive updates via email as the feature progresses through development.`
    }
  }
  
  if (transcript.includes("dashboard") && transcript.includes("500 Internal Server Error")) {
    if (message.includes("resolved") || message.includes("fixed")) {
      return `Yes! The dashboard access issue for ${callerName}'s client (Account ID: ACC-78945) has been resolved. The problem was a database connection timeout, and the engineering team restarted the affected services. Access was restored before their presentation.`
    }
  }
  
  if (transcript.includes("pricing plans")) {
    if (message.includes("enterprise") || message.includes("pricing")) {
      return `${callerName} inquired about upgrading from their current plan. The key differences discussed were:
- Enterprise: Up to 500 users, 1M API calls/month, standard integrations
- Enterprise Plus: Unlimited users, 10M API calls/month with burst capacity, custom integrations
A detailed comparison sheet was sent to them via email.`
    }
  }
  
  if (transcript.includes("scaling") || transcript.includes("infrastructure")) {
    if (message.includes("solution") || message.includes("recommendation")) {
      return `For ${callerName}'s 300% traffic increase, the recommended solution is CPU-based auto-scaling with thresholds at 70% utilization. This will help handle peak hour performance degradation while optimizing costs during low traffic periods. An implementation session has been scheduled.`
    }
  }
  
  if (message.includes("summary")) {
    return `Based on the transcript analysis, here's a summary of ${callerName}'s conversation:
    
Issue Type: ${transcript.includes("Technical Support") ? "Technical Support" : transcript.includes("Feature Request") ? "Feature Request" : transcript.includes("Bug Report") ? "Bug Report" : "General Inquiry"}
Key Points: The conversation covers the main concern, proposed solutions, and next steps as outlined in the transcript.
Resolution: ${transcript.includes("resolved") ? "The issue has been successfully resolved" : "The issue is being actively worked on with a clear action plan"}
Follow-up: Appropriate escalations and timelines have been communicated.`
  }
  
  if (message.includes("next") || message.includes("action")) {
    return `Based on the transcript, the next actions for ${callerName}'s case are:
1. The assigned team will follow up within the communicated timeframe
2. ${callerName} will receive updates via their registered email
3. Any additional requirements will be addressed in the follow-up communication
4. The ticket remains open for tracking until full resolution`
  }
  
  return `I understand you're asking about "${userMessage}". Based on my analysis of ${callerName}'s transcript, I can provide insights about their specific situation. Could you please be more specific about what aspect of their conversation you'd like to explore? For example, you could ask about the issue status, resolution timeline, or technical details.`
}

export function ChatInterface({ transcript, callerName }: ChatInterfaceProps) {
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "1",
      content: `Hello! I'm here to help you understand and analyze the conversation with ${callerName}. Feel free to ask me anything about the transcript, issue status, or next steps.`,
      role: "assistant",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const scrollAreaRef = React.useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  React.useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)

    // Simulate AI typing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      content: getMockResponse(inputValue, callerName, transcript),
      role: "assistant",
      timestamp: new Date()
    }

    setIsTyping(false)
    setMessages(prev => [...prev, assistantMessage])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-[450px] rounded-lg bg-muted/10 border">
      {/* Messages Area */}
      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div className={`group flex gap-2 max-w-[85%] ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}>
                <div
                  className={`px-3 py-2 rounded-2xl text-sm ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-background border rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                <span className="text-[10px] text-muted-foreground self-end mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-background border rounded-2xl rounded-bl-sm px-4 py-2">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-3 border-t bg-background/50">
        <div className="flex gap-2 items-center">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the conversation..."
            className="flex-1 border-0 bg-background focus-visible:ring-0 focus-visible:ring-offset-0 px-3"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isTyping}
            className={`p-2 rounded-full transition-all ${
              !inputValue.trim() || isTyping
                ? "text-muted-foreground"
                : "text-primary hover:bg-primary/10"
            }`}
          >
            {isTyping ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}