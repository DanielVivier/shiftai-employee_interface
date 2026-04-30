import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const conversationId = searchParams.get('conversationId')

  if (!conversationId) {
    return Response.json({ error: 'conversationId required' }, { status: 400 })
  }

  // Use user JWT client — RLS enforces ownership (only returns user's own conversations)
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: messages, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[/api/messages] fetch error:', error)
    return Response.json({ messages: [] })
  }

  return Response.json({ messages: messages ?? [] })
}
