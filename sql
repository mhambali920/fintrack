create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('income', 'expense')),
  icon text,
  color text,
  created_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('income', 'expense')),
  amount numeric not null check (amount > 0),
  description text,
  date date not null,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.transactions enable row level security;

create policy "categories_select_own"
on public.categories
for select
using (auth.uid() = user_id);

create policy "categories_insert_own"
on public.categories
for insert
with check (auth.uid() = user_id);

create policy "categories_update_own"
on public.categories
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "categories_delete_own"
on public.categories
for delete
using (auth.uid() = user_id);

create policy "transactions_select_own"
on public.transactions
for select
using (auth.uid() = user_id);

create policy "transactions_insert_own"
on public.transactions
for insert
with check (auth.uid() = user_id);

create policy "transactions_update_own"
on public.transactions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "transactions_delete_own"
on public.transactions
for delete
using (auth.uid() = user_id);