import { useEffect, useState } from 'react'
import { Send, MessageCircle } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { LoadingBlock, ErrorBlock } from '@/components/data-state'
import { useAsyncData } from '@/hooks/use-async-data'
import {
  fetchSupportConversations,
  fetchSupportMessages,
  markSupportConversationRead,
  sendSupportReply,
  type SupportConversation,
  type SupportMessage,
} from '@/lib/api'

function formatDate(date: string | null) {
  if (!date) return ''
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function senderLabel(message: SupportMessage) {
  if (message.senderType === 'admin') return message.senderName || 'Blorbify Support'
  if (message.senderType === 'bot') return 'Blorbify Bot'
  return message.senderName || 'Seller'
}

function ConversationThread({
  sellerId,
  conversation,
  onReplySent,
}: {
  sellerId: string
  conversation: SupportConversation
  onReplySent: () => void
}) {
  const { data: messages, loading, error, reload } = useAsyncData(() => fetchSupportMessages(sellerId))
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)

  useEffect(() => {
    markSupportConversationRead(sellerId).catch(() => {})
  }, [sellerId])

  useEffect(() => {
    const interval = setInterval(() => reload(), 8000)
    return () => clearInterval(interval)
  }, [reload])

  const handleSend = async () => {
    const text = reply.trim()
    if (!text || sending) return

    setSending(true)
    try {
      await sendSupportReply(sellerId, text)
      setReply('')
      reload()
      onReplySent()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send the reply.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4">
        <p className="font-medium">{conversation.storeName || 'Untitled store'}</p>
        <p className="text-sm text-muted-foreground">
          {conversation.ownerName} {conversation.email ? `· ${conversation.email}` : ''}
        </p>
      </div>
      <ScrollArea className="flex-1 p-4">
        {loading ? (
          <LoadingBlock rows={3} />
        ) : error ? (
          <ErrorBlock message={error} onRetry={reload} />
        ) : !messages || messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No messages yet.</p>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isAdmin = message.senderType === 'admin'
              const isBot = message.senderType === 'bot'
              return (
                <div
                  key={message.id}
                  className={`flex ${isAdmin || isBot ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-lg border p-3 ${
                      isAdmin
                        ? 'bg-primary text-primary-foreground'
                        : isBot
                          ? 'bg-muted'
                          : 'bg-background'
                    }`}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-xs font-semibold opacity-80">{senderLabel(message)}</span>
                      <span className="text-[10px] opacity-60">{formatDate(message.createdAt)}</span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </ScrollArea>
      <div className="flex items-end gap-2 border-t p-4">
        <Textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Reply to this seller…"
          className="min-h-16"
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              handleSend()
            }
          }}
        />
        <Button onClick={handleSend} disabled={sending || !reply.trim()}>
          <Send className="size-4" />
          Send
        </Button>
      </div>
    </div>
  )
}

export function SupportPage() {
  const { data: conversations, loading, error, reload } = useAsyncData(() => fetchSupportConversations())
  const [selectedSellerId, setSelectedSellerId] = useState<string | null>(null)

  const items = conversations ?? []
  const selected = items.find((item) => item.sellerId === selectedSellerId) ?? null

  const handleSelect = (sellerId: string) => {
    setSelectedSellerId(sellerId)
  }

  return (
    <div className="grid h-[calc(100vh-8rem)] grid-cols-1 gap-4 md:grid-cols-[340px_1fr]">
      <Card className="flex flex-col overflow-hidden">
        <CardHeader>
          <CardTitle>Support conversations</CardTitle>
          <CardDescription>Sellers messaging Blorbify support</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full px-4 pb-4">
            {loading ? (
              <LoadingBlock rows={4} />
            ) : error ? (
              <ErrorBlock message={error} onRetry={reload} />
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">No support conversations yet.</p>
            ) : (
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.sellerId}
                    type="button"
                    onClick={() => handleSelect(item.sellerId)}
                    className={`flex w-full flex-col gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-accent ${
                      item.sellerId === selectedSellerId ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate font-medium">{item.storeName || 'Untitled store'}</span>
                      {item.unreadByAdmin && (
                        <Badge variant="default" className="text-[10px]">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {item.lastMessageSender === 'admin' ? 'You: ' : ''}
                      {item.lastMessageText || 'No messages yet'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{formatDate(item.lastMessageAt)}</p>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="flex flex-col overflow-hidden">
        {selected ? (
          <ConversationThread key={selected.sellerId} sellerId={selected.sellerId} conversation={selected} onReplySent={reload} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <MessageCircle className="size-8" />
            <p className="text-sm">Select a conversation to view messages</p>
          </div>
        )}
      </Card>
    </div>
  )
}
