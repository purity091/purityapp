-- Create Bookings Table
create table public.bookings (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  customer_name text not null,
  phone_number text not null,
  neighborhood text not null,
  
  service_id text not null,
  service_name text not null,
  
  date text not null,
  time text not null,
  hours integer not null default 0,
  
  number_of_workers integer not null default 1,
  number_of_rooms integer,
  number_of_carpets integer,
  number_of_single_mattresses integer,
  number_of_large_mattresses integer,
  number_of_sofa_seats integer,
  number_of_curtains integer,
  
  include_chemicals boolean default false,
  notes text,
  
  total_price numeric not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'completed', 'cancelled'))
);

-- Enable RLS (Row Level Security)
alter table public.bookings enable row level security;

-- Create Policy: Allow anyone to insert (create booking)
create policy "Enable insert for everyone" 
on public.bookings for insert 
with check (true);

-- Create Policy: Allow admins to select/update/delete
-- Assuming admin has authenticated role or specific email
-- For simplicity in this dev phase, we might allow public read? 
-- No, that leaks data. 
-- Let's allow authenticated users (Admins) to do everything.
create policy "Enable all for authenticated users" 
on public.bookings for all 
using (auth.role() = 'authenticated');
