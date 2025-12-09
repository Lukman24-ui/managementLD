-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create couples table for pairing
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_a_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  partner_b_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invite_code TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create shared transactions table
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category TEXT NOT NULL,
  description TEXT,
  transaction_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create shared habits table
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  icon TEXT DEFAULT '📌',
  color TEXT DEFAULT 'turquoise',
  target_per_day INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create habit completions table
CREATE TABLE public.habit_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  completed_at DATE DEFAULT CURRENT_DATE,
  UNIQUE(habit_id, user_id, completed_at)
);

-- Create journal entries table
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  mood_score INTEGER CHECK (mood_score >= 1 AND mood_score <= 10),
  gratitude TEXT,
  tags TEXT[],
  entry_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create goals table
CREATE TABLE public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '🎯',
  target_amount DECIMAL(15,2),
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create messages table for chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID REFERENCES public.couples(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'sticker', 'encouragement')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Function to get user's couple_id
CREATE OR REPLACE FUNCTION public.get_user_couple_id(user_uuid UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.couples 
  WHERE (partner_a_id = user_uuid OR partner_b_id = user_uuid) 
  AND status = 'active'
  LIMIT 1;
$$;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can view partner profile" ON public.profiles FOR SELECT USING (
  id IN (
    SELECT partner_a_id FROM public.couples WHERE partner_b_id = auth.uid() AND status = 'active'
    UNION
    SELECT partner_b_id FROM public.couples WHERE partner_a_id = auth.uid() AND status = 'active'
  )
);

-- Couples policies
CREATE POLICY "Users can view own couples" ON public.couples FOR SELECT USING (partner_a_id = auth.uid() OR partner_b_id = auth.uid());
CREATE POLICY "Users can create couples" ON public.couples FOR INSERT WITH CHECK (partner_a_id = auth.uid());
CREATE POLICY "Users can update own couples" ON public.couples FOR UPDATE USING (partner_a_id = auth.uid() OR partner_b_id = auth.uid());

-- Transactions policies
CREATE POLICY "Couple members can view transactions" ON public.transactions FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can insert transactions" ON public.transactions FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Users can update own transactions" ON public.transactions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own transactions" ON public.transactions FOR DELETE USING (user_id = auth.uid());

-- Habits policies
CREATE POLICY "Couple members can view habits" ON public.habits FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can insert habits" ON public.habits FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can update habits" ON public.habits FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can delete habits" ON public.habits FOR DELETE USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Habit completions policies
CREATE POLICY "Couple members can view completions" ON public.habit_completions FOR SELECT USING (
  habit_id IN (SELECT id FROM public.habits WHERE couple_id = public.get_user_couple_id(auth.uid()))
);
CREATE POLICY "Users can insert own completions" ON public.habit_completions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own completions" ON public.habit_completions FOR DELETE USING (user_id = auth.uid());

-- Journal entries policies
CREATE POLICY "Couple members can view journals" ON public.journal_entries FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Users can insert own journals" ON public.journal_entries FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND user_id = auth.uid());
CREATE POLICY "Users can update own journals" ON public.journal_entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own journals" ON public.journal_entries FOR DELETE USING (user_id = auth.uid());

-- Goals policies
CREATE POLICY "Couple members can view goals" ON public.goals FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can insert goals" ON public.goals FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can update goals" ON public.goals FOR UPDATE USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can delete goals" ON public.goals FOR DELETE USING (couple_id = public.get_user_couple_id(auth.uid()));

-- Messages policies
CREATE POLICY "Couple members can view messages" ON public.messages FOR SELECT USING (couple_id = public.get_user_couple_id(auth.uid()));
CREATE POLICY "Couple members can send messages" ON public.messages FOR INSERT WITH CHECK (couple_id = public.get_user_couple_id(auth.uid()) AND sender_id = auth.uid());

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_completions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.journal_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate invite code
CREATE OR REPLACE FUNCTION public.generate_invite_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  code TEXT;
BEGIN
  code := upper(substring(md5(random()::text) from 1 for 8));
  RETURN code;
END;
$$;