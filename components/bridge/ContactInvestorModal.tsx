"use client"
import { useState, useEffect, useRef } from "react"
import type React from "react"

import { Mail, Paperclip, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Investor {
  id: string
  name: string
  logoUrl?: string
  aum?: number
  stages: string[]
  ticket?: { min?: number; max?: number }
  geos: string[]
  themes: string[]
  blurb?: string
}

interface ContactPayload {
  subject: string
  message: string
  includeAttachments: boolean
}

interface ContactInvestorModalProps {
  open: boolean
  investor: Investor | null
  onClose: () => void
  onSend: (payload: ContactPayload) => Promise<void>
  className?: string
}

export function ContactInvestorModal({ open, investor, onClose, onSend, className }: ContactInvestorModalProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [includeAttachments, setIncludeAttachments] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open && investor) {
      setSubject(`Partnership Inquiry - ${investor.name}`)
      setMessage(
        `Dear ${investor.name} team,

I hope this message finds you well. I am reaching out to explore potential partnership opportunities between our organizations.

Our company aligns with your investment focus areas, particularly in ${investor.themes.slice(0, 2).join(" and ")}. We believe there could be strong synergies between our sustainability goals and your investment criteria.

I would welcome the opportunity to discuss how we might work together to create meaningful impact while achieving strong returns.

Thank you for your time and consideration. I look forward to hearing from you.

Best regards,`,
      )
      setIncludeAttachments(false)
    } else if (!open) {
      // Reset form when closing
      setSubject("")
      setMessage("")
      setIncludeAttachments(false)
      setIsSending(false)
    }
  }, [open, investor])

  // Focus management
  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus()
    }
  }, [open])

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) return

    setIsSending(true)
    try {
      await onSend({
        subject: subject.trim(),
        message: message.trim(),
        includeAttachments,
      })
      onClose()
    } finally {
      setIsSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose()
    }
  }

  if (!investor) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-2xl bg-white/90 backdrop-blur-lg border border-gray-100 shadow-2xl shadow-[#3270a1]/10"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-[#3270a1]" />
            <span className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-text text-transparent">
              Contact {investor.name}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {/* Investor Info */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-[#8dcddb]/5 to-[#7e509c]/5 border border-[#3270a1]/10">
            <Avatar className="h-10 w-10">
              <AvatarImage src={investor.logoUrl || "/placeholder.svg"} alt={`${investor.name} logo`} />
              <AvatarFallback className="bg-gradient-to-br from-[#8dcddb]/10 to-[#7e509c]/10 text-[#3270a1] font-semibold">
                {investor.name
                  .split(" ")
                  .map((word) => word[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{investor.name}</h3>
              <p className="text-sm text-gray-600">
                Focus: {investor.themes.slice(0, 2).join(", ")}
                {investor.themes.length > 2 && ` +${investor.themes.length - 2}`}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-white/60 backdrop-blur-sm border-gray-200 focus:border-[#3270a1] focus:ring-[#3270a1]/20"
                placeholder="Enter subject line"
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={8}
                className="bg-white/60 backdrop-blur-sm border-gray-200 focus:border-[#3270a1] focus:ring-[#3270a1]/20 resize-none"
                placeholder="Write your message..."
              />
            </div>

            {/* Attachments Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 bg-white/30">
              <div className="flex items-center gap-3">
                <Paperclip className="h-4 w-4 text-gray-600" />
                <div>
                  <Label htmlFor="attachments" className="text-sm font-medium">
                    Include Company Profile & ESG Data
                  </Label>
                  <p className="text-xs text-gray-600">Attach relevant documents to support your inquiry</p>
                </div>
              </div>
              <Switch
                id="attachments"
                checked={includeAttachments}
                onCheckedChange={setIncludeAttachments}
                className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-[#8dcddb] data-[state=checked]:to-[#7e509c]"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent" disabled={isSending}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={!subject.trim() || !message.trim() || isSending}
              className="flex-1 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:shadow-lg hover:shadow-[#3270a1]/25 transition-all duration-200"
            >
              {isSending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>

          {/* Privacy Notice */}
          <div className="text-xs text-gray-500 p-3 bg-gray-50/50 rounded-lg">
            <p>
              Your contact information and message will be shared with {investor.name}. By sending this message, you
              consent to being contacted regarding potential investment opportunities.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
