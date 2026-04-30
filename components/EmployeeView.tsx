'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import Link from 'next/link'
import { getAvatarColor, getAvatarInitials } from '@/lib/avatar'

interface QuickAction {
  label: string
  prompt: string
}

interface Employee {
  id: string
  name: string
  role: string
  department: string
  quick_actions: QuickAction[]
}

const CONV_KEY = (employeeId: string) => `shiftai:conversationId:${employeeId}`

interface StoredMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface EmployeeViewProps {
  employee: Employee
}

export default function EmployeeView({ employee }: EmployeeViewProps) {
  const color = getAvatarColor(employee.id)
  const initials = getAvatarInitials(employee.name)

  const [conversationId, setConversationId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<StoredMessage[]>([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Load conversation history on mount
  useEffect(() => {
    const storedId = localStorage.getItem(CONV_KEY(employee.id))

    async function loadHistory() {
      if (!storedId) {
        setHistoryLoaded(true)
        return
      }

      try {
        const res = await fetch(`/api/messages?conversationId=${storedId}`)
        if (res.ok) {
          const data = await res.json()
          const msgs: StoredMessage[] = (data.messages ?? []).map(
            (m: { id: string; role: string; content: string }) => ({
              id: m.id,
              role: m.role as 'user' | 'assistant',
              content: m.content,
            })
          )
          setInitialMessages(msgs)
          setConversationId(storedId)
        }
      } catch {
        // Network error — start fresh
      }
      setHistoryLoaded(true)
    }

    loadHistory()
  }, [employee.id])

  const { messages, input, handleInputChange, handleSubmit, isLoading, data } =
    useChat({
      id: employee.id,
      initialMessages,
      body: { employeeId: employee.id, conversationId },
      onError: (err) => {
        console.error('[useChat] error:', err)
      },
    })

  // Extract conversationId from first data event
  useEffect(() => {
    if (data && data.length > 0) {
      const first = data[0] as { conversationId?: string }
      if (first?.conversationId && !conversationId) {
        setConversationId(first.conversationId)
        localStorage.setItem(CONV_KEY(employee.id), first.conversationId)
      }
    }
  }, [data, conversationId, employee.id])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function sendQuickAction(prompt: string) {
    const syntheticEvent = {
      preventDefault: () => {},
    } as React.FormEvent<HTMLFormElement>
    handleSubmit(syntheticEvent, { data: { overrideInput: prompt } })
  }

  if (!historyLoaded) {
    return (
      <div className="employee-view loading">
        <div className="loading-spinner" />
      </div>
    )
  }

  return (
    <div className="employee-view">
      {/* Left panel: Identity */}
      <aside className="identity-panel">
        <Link href="/" className="back-link">← All employees</Link>

        <div className="identity-avatar" style={{ backgroundColor: color }}>
          {initials}
        </div>

        <div className="identity-name">{employee.name}</div>
        <div className="identity-role">{employee.role}</div>
        <div className="identity-dept">{employee.department}</div>

        <div className="identity-divider" />

        <div className="identity-status">
          <span className="status-dot" />
          Available now
        </div>
      </aside>

      {/* Center panel: Chat */}
      <main className="chat-panel">
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="chat-empty">
              <p>Start a conversation with {employee.name}.</p>
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`chat-message chat-message--${msg.role}`}>
              {msg.role === 'assistant' && (
                <div
                  className="chat-message-avatar"
                  style={{ backgroundColor: color }}
                >
                  {initials}
                </div>
              )}
              <div className="chat-message-bubble">
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message chat-message--assistant">
              <div
                className="chat-message-avatar"
                style={{ backgroundColor: color }}
              >
                {initials}
              </div>
              <div className="chat-message-bubble chat-message-bubble--typing">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input-area">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={`Message ${employee.name}...`}
            disabled={isLoading}
            className="chat-input"
            autoFocus
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="chat-send-btn"
          >
            Send
          </button>
        </form>
      </main>

      {/* Right panel: Quick Actions */}
      <aside className="quick-actions-panel">
        <div className="quick-actions-title">Quick Actions</div>
        {employee.quick_actions && employee.quick_actions.length > 0 ? (
          <div className="quick-actions-list">
            {employee.quick_actions.map((action, i) => (
              <button
                key={i}
                className="quick-action-btn"
                onClick={() => sendQuickAction(action.prompt)}
                disabled={isLoading}
              >
                {action.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="quick-actions-empty">No quick actions configured.</p>
        )}
      </aside>
    </div>
  )
}
