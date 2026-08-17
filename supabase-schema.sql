
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('student', 'lecturer')) default 'student',
  university_email text not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view all profiles"
  on profiles for select
  using (true);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever someone signs up via Supabase Auth.
-- Reads full_name/role out of the signup metadata (see client code below).
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, university_email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Unnamed'),
    coalesce(new.raw_user_meta_data->>'role', 'student'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. COURSES
create table courses (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  code text not null unique,
  lecturer_id uuid references profiles(id) not null,
  join_code text not null unique default substr(md5(random()::text), 1, 6),
  created_at timestamptz default now()
);

alter table courses enable row level security;

create policy "Members can view their courses"
  on courses for select
  using (
    lecturer_id = auth.uid()
    or id in (select course_id from course_members where user_id = auth.uid())
  );

create policy "Lecturers can create courses"
  on courses for insert
  with check (lecturer_id = auth.uid());

-- 3. COURSE MEMBERS (enrollment)
create table course_members (
  course_id uuid references courses(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (course_id, user_id)
);

alter table course_members enable row level security;

create policy "Members can view enrollment for their courses"
  on course_members for select
  using (
    user_id = auth.uid()
    or course_id in (select id from courses where lecturer_id = auth.uid())
  );

create policy "Students can join a course themselves"
  on course_members for insert
  with check (user_id = auth.uid());

-- 4. MESSAGES (course group chat)
create table messages (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references courses(id) on delete cascade not null,
  sender_id uuid references profiles(id) not null,
  content text not null check (char_length(content) > 0 and char_length(content) <= 2000),
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Members can read messages in their courses"
  on messages for select
  using (
    course_id in (
      select id from courses where lecturer_id = auth.uid()
      union
      select course_id from course_members where user_id = auth.uid()
    )
  );

create policy "Members can send messages in their courses"
  on messages for insert
  with check (
    sender_id = auth.uid()
    and course_id in (
      select id from courses where lecturer_id = auth.uid()
      union
      select course_id from course_members where user_id = auth.uid()
    )
  );

-- 5. Realtime: turn on live updates for the chat
alter publication supabase_realtime add table messages;
