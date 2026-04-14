-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- AGENCIES TABLE
-- ============================================
create table agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text default 'starter',
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- USERS TABLE
-- ============================================
create table users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  full_name text,
  role text default 'editor',
  agency_id uuid references agencies(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- ============================================
-- CLIENTS TABLE
-- ============================================
create table clients (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade,
  name text not null,
  industry text,
  website text,
  instagram text,
  facebook text,
  linkedin text,
  twitter text,
  brand_colors text[],
  target_audience text,
  brand_voice text,
  status text default 'active',
  health_score integer default 0,
  created_at timestamp with time zone default now()
);

-- ============================================
-- POSTS TABLE
-- ============================================
create table posts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  platform text not null,
  caption text,
  image_url text,
  design_data jsonb,
  scheduled_at timestamp with time zone,
  published_at timestamp with time zone,
  status text default 'draft',
  likes integer default 0,
  comments integer default 0,
  reach integer default 0,
  approved_by uuid references users(id) on delete set null,
  created_by uuid references users(id) on delete set null,
  created_at timestamp with time zone default now()
);

-- ============================================
-- METRICS TABLE
-- ============================================
create table metrics (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  platform text not null,
  followers integer default 0,
  engagement_rate decimal default 0,
  reach integer default 0,
  impressions integer default 0,
  recorded_at timestamp with time zone default now()
);

-- ============================================
-- SEO_DATA TABLE
-- ============================================
create table seo_data (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  score integer default 0,
  keywords jsonb,
  competitors jsonb,
  recommendations jsonb,
  recorded_at timestamp with time zone default now()
);

-- ============================================
-- REPORTS TABLE
-- ============================================
create table reports (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  month text not null,
  content jsonb,
  pdf_url text,
  sent_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- ============================================
-- TASKS TABLE
-- ============================================
create table tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id) on delete cascade,
  assigned_to uuid references users(id) on delete set null,
  title text not null,
  description text,
  due_date timestamp with time zone,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
alter table agencies enable row level security;
alter table users enable row level security;
alter table clients enable row level security;
alter table posts enable row level security;
alter table metrics enable row level security;
alter table seo_data enable row level security;
alter table reports enable row level security;
alter table tasks enable row level security;

-- Users can view and update their own agency
create policy "Users can view own agency"
  on agencies for select
  using (
    id in (
      select agency_id from users where id = auth.uid()
    )
  );

create policy "Agency owners can update agency"
  on agencies for update
  using (
    id in (
      select agency_id from users where id = auth.uid() and role = 'owner'
    )
  );

-- Users can view and update their own profile
create policy "Users can view own profile"
  on users for select
  using (
    agency_id in (
      select agency_id from users where id = auth.uid()
    )
  );

create policy "Users can update own profile"
  on users for update
  using (id = auth.uid());

-- Clients are scoped to agency
create policy "Agency members can view clients"
  on clients for select
  using (
    agency_id in (
      select agency_id from users where id = auth.uid()
    )
  );

create policy "Agency members can insert clients"
  on clients for insert
  with check (
    agency_id in (
      select agency_id from users where id = auth.uid()
    )
  );

create policy "Agency members can update clients"
  on clients for update
  using (
    agency_id in (
      select agency_id from users where id = auth.uid()
    )
  );

create policy "Agency admins can delete clients"
  on clients for delete
  using (
    agency_id in (
      select agency_id from users where id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- Posts are scoped to agency via clients
create policy "Agency members can view posts"
  on posts for select
  using (
    client_id in (
      select id from clients where agency_id in (
        select agency_id from users where id = auth.uid()
      )
    )
  );

create policy "Agency members can insert posts"
  on posts for insert
  with check (
    client_id in (
      select id from clients where agency_id in (
        select agency_id from users where id = auth.uid()
      )
    )
  );

create policy "Agency members can update posts"
  on posts for update
  using (
    client_id in (
      select id from clients where agency_id in (
        select agency_id from users where id = auth.uid()
      )
    )
  );

create policy "Agency members can delete posts"
  on posts for delete
  using (
    client_id in (
      select id from clients where agency_id in (
        select agency_id from users where id = auth.uid()
      )
    )
  );

-- Metrics, SEO, reports, tasks follow same pattern
create policy "Agency members can manage metrics"
  on metrics for all
  using (
    client_id in (
      select id from clients where agency_id in (
        select agency_id from users where id = auth.uid()
      )
    )
  );

create policy "Agency members can manage seo_data"
  on seo_data for all
  using (
    client_id in (
      select id from clients where agency_id in (
        select agency_id from users where id = auth.uid()
      )
    )
  );

create policy "Agency members can manage reports"
  on reports for all
  using (
    client_id in (
      select id from clients where agency_id in (
        select agency_id from users where id = auth.uid()
      )
    )
  );

create policy "Agency members can manage tasks"
  on tasks for all
  using (
    client_id in (
      select id from clients where agency_id in (
        select agency_id from users where id = auth.uid()
      )
    )
  );

-- ============================================
-- LEADS TABLE
-- ============================================
create table leads (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade,
  email text not null,
  full_name text,
  company text,
  phone text,
  website text,
  source text default 'manual',
  status text default 'new',        -- new, contacted, qualified, converted, unsubscribed
  tags text[],
  notes text,
  last_contacted_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- ============================================
-- EMAIL CAMPAIGNS TABLE
-- ============================================
create table email_campaigns (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references agencies(id) on delete cascade,
  name text not null,
  subject text not null,
  body text not null,               -- HTML body
  template text default 'default',
  status text default 'draft',      -- draft, active, paused, completed
  daily_limit integer default 30,
  sent_count integer default 0,
  scheduled_at timestamp with time zone,
  created_by uuid references users(id),
  created_at timestamp with time zone default now()
);

-- ============================================
-- EMAIL LOGS TABLE (tracking)
-- ============================================
create table email_logs (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references email_campaigns(id) on delete cascade,
  lead_id uuid references leads(id) on delete cascade,
  agency_id uuid references agencies(id) on delete cascade,
  email text not null,
  status text default 'queued',     -- queued, sent, delivered, opened, clicked, bounced, failed
  resend_id text,
  opened_at timestamp with time zone,
  clicked_at timestamp with time zone,
  sent_at timestamp with time zone,
  error text,
  created_at timestamp with time zone default now()
);

-- RLS for leads
alter table leads enable row level security;
alter table email_campaigns enable row level security;
alter table email_logs enable row level security;

create policy "Agency members can manage leads"
  on leads for all
  using (agency_id in (select agency_id from users where id = auth.uid()));

create policy "Agency members can manage email_campaigns"
  on email_campaigns for all
  using (agency_id in (select agency_id from users where id = auth.uid()));

create policy "Agency members can manage email_logs"
  on email_logs for all
  using (agency_id in (select agency_id from users where id = auth.uid()));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-create user record on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, full_name, role)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'owner'
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Seed sample data for demo purposes
-- (Remove in production)
