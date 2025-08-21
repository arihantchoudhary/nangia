"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface EmailEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  caller: {
    id: number
    callerName: string
    title: string
    issueType: string
  }
  onSend: (callerId: number) => void
}

export function EmailEditor({ open, onOpenChange, caller, onSend }: EmailEditorProps) {
  const [recipients, setRecipients] = React.useState<string[]>([])
  const [recipientInput, setRecipientInput] = React.useState("")
  const [subject, setSubject] = React.useState("")
  const [message, setMessage] = React.useState("")
  const [priority, setPriority] = React.useState("normal")
  const [isSending, setIsSending] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      // Pre-fill subject based on issue type
      setSubject(`RE: ${caller.issueType} - ${caller.callerName}`)
      setMessage(`Dear Team,\n\nI am delegating the following issue:\n\nCaller: ${caller.callerName}\nTitle: ${caller.title}\nIssue Type: ${caller.issueType}\n\nPlease handle this request and update the status accordingly.\n\nBest regards,`)
    }
  }, [open, caller])

  const handleAddRecipient = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && recipientInput.trim()) {
      e.preventDefault()
      if (!recipients.includes(recipientInput.trim())) {
        setRecipients([...recipients, recipientInput.trim()])
        setRecipientInput("")
      }
    }
  }

  const removeRecipient = (recipient: string) => {
    setRecipients(recipients.filter(r => r !== recipient))
  }

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient")
      return
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject")
      return
    }

    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    setIsSending(true)

    // Simulate sending email
    await new Promise(resolve => setTimeout(resolve, 1500))

    setIsSending(false)
    onSend(caller.id)
    onOpenChange(false)
    
    // Reset form
    setRecipients([])
    setRecipientInput("")
    setSubject("")
    setMessage("")
    setPriority("normal")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Delegate Issue</DialogTitle>
          <DialogDescription>
            Compose a message to delegate this issue to your team members.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipients">Recipients</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {recipients.map((recipient) => (
                <Badge key={recipient} variant="secondary" className="gap-1">
                  {recipient}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeRecipient(recipient)}
                  />
                </Badge>
              ))}
            </div>
            <Input
              id="recipients"
              placeholder="Type email and press Enter to add"
              value={recipientInput}
              onChange={(e) => setRecipientInput(e.target.value)}
              onKeyDown={handleAddRecipient}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger id="priority">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              className="min-h-[200px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
            />
          </div>

          <div className="rounded-lg border bg-muted/50 p-3">
            <p className="text-sm text-muted-foreground">
              <strong>Issue Details:</strong><br />
              Caller: {caller.callerName}<br />
              Title: {caller.title}<br />
              Issue Type: {caller.issueType}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send & Delegate
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}