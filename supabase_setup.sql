-- ============================================================
-- SmartVocab Supabase Setup — TO'LIQ SQL
-- Supabase → SQL Editor → yangi query → paste → Run
-- ============================================================

-- 1. JADVALLAR

-- Foydalanuvchilar profili (auth.users ga qo'shimcha)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL DEFAULT '',
  email       TEXT,
  avatar_url  TEXT,
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  lang        TEXT NOT NULL DEFAULT 'uz',
  xp          INTEGER NOT NULL DEFAULT 0,
  streak      INTEGER NOT NULL DEFAULT 0,
  days_active INTEGER NOT NULL DEFAULT 0,
  level       TEXT NOT NULL DEFAULT 'Beginner',
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_wrong   INTEGER NOT NULL DEFAULT 0,
  last_seen   TIMESTAMPTZ DEFAULT NOW(),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Sessiyalar
CREATE TABLE IF NOT EXISTS public.sessions (
  id          TEXT PRIMARY KEY,
  user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name   TEXT,
  login_at    TIMESTAMPTZ DEFAULT NOW(),
  logout_at   TIMESTAMPTZ,
  last_ping   TIMESTAMPTZ DEFAULT NOW(),
  lang        TEXT DEFAULT 'uz',
  is_active   BOOLEAN DEFAULT TRUE,
  country     TEXT
);

-- 2. RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Profiles: foydalanuvchi o'z profilini ko'ra/o'zgartira oladi
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Service role (Netlify Functions) hammani ko'ra oladi
CREATE POLICY "profiles_service_all" ON public.profiles
  FOR ALL USING (true);

CREATE POLICY "sessions_service_all" ON public.sessions
  FOR ALL USING (true);

-- 3. TRIGGER: yangi user ro'yxatdan o'tganda profil avtomatik yaratilsin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Eski trigger ni o'chir (agar bo'lsa)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Yangi trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ADMIN foydalanuvchi (email sozlash — o'zingizni emailingizni yozing)
-- Bu pastdagi buyruqni Supabase → Authentication → Users da email bilan
-- ro'yxatdan o'tgandan KEYIN ishlatish kerak:
--
-- UPDATE public.profiles SET is_admin = TRUE WHERE email = 'admin@gmail.com';
--
-- Yoki hoziroq qo'shish (agar oldin auth.users da bo'lsa):
-- UPDATE public.profiles SET is_admin = TRUE WHERE email = 'sizning@email.com';

