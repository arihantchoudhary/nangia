"use client"

import * as React from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Phone, Mail, AlertCircle, MessageCircle, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Caller } from "@/types/conversation"

interface TranscriptViewerProps {
  caller: Caller | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface Message {
  id: string
  content: string
  role: "user" | "assistant" | "support" | "caller"
  timestamp: string
  isAI?: boolean
}

// Mock AI responses
const getAIResponse = (question: string, transcript: string, callerName: string): string => {
  const q = question.toLowerCase()
  
  if (q.includes("status") || q.includes("update")) {
    return `Based on the conversation, ${callerName}'s issue has been escalated to the appropriate team. The support agent confirmed they will be contacted within the specified timeframe.`
  }
  
  if (q.includes("problem") || q.includes("issue")) {
    return `${callerName} is experiencing technical difficulties that require specialized assistance. The support team has identified the root cause and is working on a resolution.`
  }
  
  if (q.includes("next") || q.includes("action")) {
    return `The next steps are: 1) The assigned team will contact ${callerName} within the agreed timeframe, 2) They will provide the necessary solution, and 3) Follow up to ensure the issue is fully resolved.`
  }
  
  return `I can see from the conversation that ${callerName} contacted support regarding their issue. The support team has provided assistance and appropriate next steps. Is there something specific you'd like to know about this conversation?`
}

function IntegratedTranscriptChat({ transcript, callerName, showChat }: { 
  transcript: string
  callerName: string
  showChat: boolean 
}) {
  const [messages, setMessages] = React.useState<Message[]>([])
  const [inputValue, setInputValue] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  
  // Parse transcript into messages
  React.useEffect(() => {
    const transcriptMessages: Message[] = []
    const lines = transcript.split('\n')
    
    lines.forEach((line) => {
      if (!line.trim()) return
      
      const timestampMatch = line.match(/^\[(\d{2}:\d{2})\]\s*(.+)/)
      if (timestampMatch) {
        const [, timestamp, content] = timestampMatch
        const isCaller = content.includes(callerName)
        
        transcriptMessages.push({
          id: `transcript-${transcriptMessages.length}`,
          content: content.replace(`${callerName}: `, '').replace('Support: ', ''),
          role: isCaller ? 'caller' : 'support',
          timestamp,
        })
      }
    })
    
    setMessages(transcriptMessages)
  }, [transcript, callerName])
  
  React.useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])
  
  // Scroll to bottom and focus input when chat is opened
  React.useEffect(() => {
    if (showChat) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
        if (inputRef.current) {
          inputRef.current.focus()
        }
      }, 200)
    }
  }, [showChat])
  
  const handleSendMessage = async () => {
    if (!inputValue.trim() || !showChat) return
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      role: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAI: true
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue("")
    setIsTyping(true)
    
    // Simulate AI thinking
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))
    
    const aiMessage: Message = {
      id: `ai-${Date.now()}`,
      content: getAIResponse(userMessage.content, transcript, callerName),
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isAI: true
    }
    
    setIsTyping(false)
    setMessages(prev => [...prev, aiMessage])
  }
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }
  
  return (
    <div className="rounded-lg border">
      <div ref={containerRef} className="h-[400px] overflow-y-auto p-4">
        <div className="space-y-2 text-sm">
          {messages.map((message) => {
            const isUser = message.role === 'user'
            const showName = !message.isAI || message.role === 'assistant'
            
            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  {!isUser && showName && (
                    <span className="text-xs text-muted-foreground ml-2">
                      {message.role === 'caller' ? callerName : 
                       message.role === 'support' ? 'Support' : 'AI'}
                    </span>
                  )}
                  <div className={`px-3 py-2 rounded-2xl ${
                    isUser 
                      ? 'bg-primary text-primary-foreground rounded-br-sm' 
                      : 'bg-muted rounded-bl-sm'
                  }`}>
                    <p>{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground px-2">
                    {message.timestamp}
                  </span>
                </div>
              </div>
            )
          })}
          {isTyping && (
            <div className="flex justify-start">
              <div className="max-w-[70%] flex flex-col gap-1 items-start">
                <span className="text-xs text-muted-foreground ml-2">AI</span>
                <div className="px-3 py-2 rounded-2xl bg-muted rounded-bl-sm">
                  <span className="inline-flex gap-1">
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {showChat && (
        <div className="border-t p-3">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about this conversation..."
              className="flex-1"
              disabled={isTyping}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isTyping}
              size="icon"
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export function TranscriptViewer({ caller, open, onOpenChange }: TranscriptViewerProps) {
  const [showChat, setShowChat] = React.useState(false)
  
  if (!caller) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Critical": return "text-red-600 dark:text-red-400"
      case "High": return "text-orange-600 dark:text-orange-400"
      case "Medium": return "text-yellow-600 dark:text-yellow-400"
      case "Low": return "text-green-600 dark:text-green-400"
      default: return "text-gray-600 dark:text-gray-400"
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[800px] sm:max-w-[800px] p-0 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="p-6">
            <SheetHeader>
              <SheetTitle className="text-2xl font-semibold">Support Conversation</SheetTitle>
            </SheetHeader>
          </div>
        </div>
        
        <div className="px-6 pb-6 space-y-4">
          {/* Caller Information Card */}
          <div className="rounded-lg border bg-card p-4 mt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg">{caller.callerName}</h3>
                <p className="text-sm text-muted-foreground">{caller.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <a href={`tel:${caller.phoneNumber}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{caller.phoneNumber}</span>
                  </a>
                  <a href={`mailto:${caller.email}`} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{caller.email}</span>
                  </a>
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="flex items-center gap-2 justify-end">
                  <AlertCircle className={`h-4 w-4 ${getUrgencyColor(caller.urgency)}`} />
                  <span className={`text-sm font-medium ${getUrgencyColor(caller.urgency)}`}>
                    {caller.urgency} Priority
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatDate(caller.timeRequested)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Badge variant="outline" className="font-normal">{caller.issueType}</Badge>
              <Badge 
                variant="secondary"
                className="font-normal"
              >
                {caller.meetingDuration} min meeting
              </Badge>
            </div>
          </div>
          
          {/* Combined Transcript and Chat Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Conversation</h4>
              <button
                onClick={() => setShowChat(!showChat)}
                className={`text-sm px-3 py-1.5 rounded-md transition-all ${
                  showChat 
                    ? 'bg-primary text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <MessageCircle className="inline-block h-3.5 w-3.5 mr-1.5" />
                {showChat ? "Hide AI" : "Ask AI"}
              </button>
            </div>
            
            <IntegratedTranscriptChat 
              transcript={caller.transcript}
              callerName={caller.callerName}
              showChat={showChat}
            />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}