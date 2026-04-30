import { StreamingTextResponse, StreamData, streamText } from 'ai'
import { waitUntil } from '@vercel/functions'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-admin'
import { getProvider } from '@/lib/model'
import { getRateLimitKey } from '@/lib/rateLimit'

export const maxDuration = 60

let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.fixedWindow(30, '1 h'),
  })
}

export async function POST(request: Request) {
  // 1. Verify user identity via JWT
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
  }

  const { messages, employeeId, conversationId: existingConversationId } = await request.json()

  if (!employeeId) {
    return new Response(JSON.stringify({ error: 'employeeId required' }), { status: 400 })
  }

  // 2. Verify employee ownership — use service role to fetch, but check client_id matches
  const adminClient = createAdminClient()
  const { data: employee, error: employeeError } = await adminClient
    .from('ai_employees')
    .select('*, clients!inner(email)')
    .eq('id', employeeId)
    .single()

  if (employeeError || !employee) {
    return new Response(JSON.stringify({ error: 'Employee not found' }), { status: 404 })
  }

  // Ownership check: the employee's client must match the authenticated user's email
  if ((employee.clients as { email: string }).email !== user.email) {
    return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 })
  }

  // 3. Rate limit
  if (ratelimit) {
    const { success } = await ratelimit.limit(getRateLimitKey(user.id))
    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Sending messages too quickly. Please wait a moment.' }),
        { status: 429 }
      )
    }
  }

  // 4. Create or reuse conversation BEFORE streaming
  let conversationId = existingConversationId
  if (!conversationId) {
    const { data: conv, error: convError } = await adminClient
      .from('conversations')
      .insert({ employee_id: employeeId, user_id: user.id })
      .select('id')
      .single()

    if (convError || !conv) {
      return new Response(JSON.stringify({ error: 'Failed to create conversation' }), { status: 500 })
    }
    conversationId = conv.id
  }

  // 5. Insert user message BEFORE streaming starts (ensures it's always persisted)
  const lastUserMessage = [...messages].reverse().find((m: { role: string }) => m.role === 'user')
  if (lastUserMessage) {
    await adminClient.from('messages').insert({
      conversation_id: conversationId,
      role: 'user',
      content: lastUserMessage.content,
    })
  }

  // 6. Build system prompt with employee context
  const systemPrompt = `You are ${employee.name}, ${employee.role} in the ${employee.department} department.

${employee.system_prompt}

Always respond as ${employee.name}. Be professional, helpful, and stay in character.`

  // 7. Stream response — send conversationId as first data event
  const streamData = new StreamData()
  streamData.append({ conversationId })

  const result = await streamText({
    model: getProvider(employee.model),
    system: systemPrompt,
    messages,
  })

  return new StreamingTextResponse(
    result.toAIStream({
      onFinal: (fullText) => {
        streamData.close()
        // 8. Persist assistant message — waitUntil keeps lambda alive after response
        if (fullText) {
          waitUntil(
            adminClient.from('messages').insert({
              conversation_id: conversationId,
              role: 'assistant',
              content: fullText,
            })
          )
        }
      },
    }),
    {},
    streamData
  )
}
