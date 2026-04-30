-- ShiftAI v1 schema

-- Clients table: one row per company/client
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  company_name text not null,
  created_at timestamptz not null default now()
);

-- AI Employees table: one or more per client
create table if not exists ai_employees (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  name text not null,
  role text not null,
  department text not null,
  model text not null,
  system_prompt text not null,
  quick_actions jsonb not null default '[]',
  avatar_seed text,
  created_at timestamptz not null default now(),
  constraint model_check check (
    model in (
      'claude-sonnet-4-6',
      'claude-haiku-4-5-20251001',
      'claude-opus-4-7',
      'gpt-4o',
      'gpt-4o-mini'
    )
  )
);

-- Conversations table
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references ai_employees(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Messages table
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  created_at timestamptz not null default now()
);

-- Index for efficient message fetching (ordered by time within a conversation)
create index if not exists messages_conv_time on messages(conversation_id, created_at);

-- Enable Row Level Security
alter table clients enable row level security;
alter table ai_employees enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- RLS: clients can read their own client row (matched by email)
create policy "client reads own row" on clients
  for select using (email = auth.email());

-- RLS: client can read their own employees
create policy "client reads own employees" on ai_employees
  for select using (
    client_id in (
      select id from clients where email = auth.email()
    )
  );

-- RLS: user can read/insert their own conversations
create policy "user reads own conversations" on conversations
  for select using (user_id = auth.uid());

create policy "user inserts own conversations" on conversations
  for insert with check (user_id = auth.uid());

-- RLS: user can read messages from their own conversations
create policy "user reads own messages" on messages
  for select using (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );

-- RLS: user can insert messages into their own conversations
create policy "user inserts own messages" on messages
  for insert with check (
    conversation_id in (
      select id from conversations where user_id = auth.uid()
    )
  );
