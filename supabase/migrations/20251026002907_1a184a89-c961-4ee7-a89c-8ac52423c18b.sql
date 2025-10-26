-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'builder' CHECK (role IN ('builder', 'sponsor', 'admin')),
  github_url TEXT,
  portfolio_url TEXT,
  cv_url TEXT,
  career_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create challenges table
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  domain TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  sponsor_id UUID REFERENCES public.profiles(id),
  sponsor_name TEXT NOT NULL,
  prize_amount INTEGER,
  prize_description TEXT,
  rubric JSONB,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create submissions table
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  repo_url TEXT NOT NULL,
  pitch_deck_url TEXT,
  video_url TEXT,
  score INTEGER,
  evaluation_feedback JSONB,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'evaluating', 'scored', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  evaluated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('top_10_percent', 'category_winner', 'sponsor_favorite', 'first_submission', 'streak_3', 'streak_10')),
  challenge_id UUID REFERENCES public.challenges(id),
  awarded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Challenges policies
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (status = 'active' OR sponsor_id = auth.uid());
CREATE POLICY "Sponsors can create challenges" ON public.challenges FOR INSERT WITH CHECK (auth.uid() = sponsor_id);
CREATE POLICY "Sponsors can update their challenges" ON public.challenges FOR UPDATE USING (auth.uid() = sponsor_id);

-- Submissions policies
CREATE POLICY "Users can view their own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Sponsors can view submissions for their challenges" ON public.submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.challenges WHERE challenges.id = submissions.challenge_id AND challenges.sponsor_id = auth.uid())
);
CREATE POLICY "Users can create submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their pending submissions" ON public.submissions FOR UPDATE USING (auth.uid() = user_id AND status = 'pending');

-- Badges policies
CREATE POLICY "Badges are viewable by everyone" ON public.badges FOR SELECT USING (true);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'builder')
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample challenges for demo
INSERT INTO public.challenges (title, description, domain, difficulty, deadline, sponsor_name, prize_amount, prize_description, status)
VALUES 
  (
    'AI-Powered Customer Support Chatbot',
    'Build an intelligent chatbot that can handle customer inquiries, route complex issues to human agents, and learn from interactions. Must include natural language understanding, context management, and integration capabilities.',
    'NLP & Conversational AI',
    'intermediate',
    NOW() + INTERVAL '30 days',
    'TechCorp Solutions',
    5000,
    '$5,000 cash prize + Potential job interview',
    'active'
  ),
  (
    'Smart Code Review Assistant',
    'Create an AI tool that analyzes pull requests, identifies potential bugs, suggests improvements, and ensures code quality standards. Should support multiple programming languages and integrate with GitHub.',
    'Developer Tools',
    'advanced',
    NOW() + INTERVAL '45 days',
    'DevTools Inc',
    10000,
    '$10,000 cash prize + 6-month contract opportunity',
    'active'
  ),
  (
    'Automated Content Moderator',
    'Develop an AI system that can detect and flag inappropriate content across text, images, and videos. Must handle multiple languages and provide confidence scores with explanations.',
    'Computer Vision & Safety',
    'advanced',
    NOW() + INTERVAL '60 days',
    'SafeSpace Digital',
    7500,
    '$7,500 cash prize + Full-time position consideration',
    'active'
  ),
  (
    'Personal Finance AI Assistant',
    'Build a financial advisor bot that helps users track expenses, create budgets, and provides personalized savings recommendations based on spending patterns.',
    'FinTech & AI',
    'beginner',
    NOW() + INTERVAL '20 days',
    'FinWise Apps',
    3000,
    '$3,000 cash prize + Mentorship program',
    'active'
  );