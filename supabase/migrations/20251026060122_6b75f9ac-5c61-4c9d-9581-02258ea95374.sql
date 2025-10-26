-- Fix 1: Add search_path to handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix 2: Add URL validation constraints for security
-- Validate URLs are https:// only and have reasonable length limits

-- Add URL length constraints for profiles table
ALTER TABLE public.profiles 
  ADD CONSTRAINT github_url_length CHECK (github_url IS NULL OR (char_length(github_url) <= 500 AND github_url ~ '^https://'));

ALTER TABLE public.profiles 
  ADD CONSTRAINT portfolio_url_length CHECK (portfolio_url IS NULL OR (char_length(portfolio_url) <= 500 AND portfolio_url ~ '^https://'));

ALTER TABLE public.profiles 
  ADD CONSTRAINT cv_url_length CHECK (cv_url IS NULL OR (char_length(cv_url) <= 500 AND cv_url ~ '^https://'));

-- Add URL length constraints for submissions table  
ALTER TABLE public.submissions 
  ADD CONSTRAINT repo_url_valid CHECK (repo_url IS NOT NULL AND char_length(repo_url) <= 500 AND repo_url ~ '^https://');

ALTER TABLE public.submissions 
  ADD CONSTRAINT pitch_deck_url_valid CHECK (pitch_deck_url IS NULL OR (char_length(pitch_deck_url) <= 500 AND pitch_deck_url ~ '^https://'));

ALTER TABLE public.submissions 
  ADD CONSTRAINT video_url_valid CHECK (video_url IS NULL OR (char_length(video_url) <= 500 AND video_url ~ '^https://'));

-- Fix 3: Add profile visibility controls
-- Add profile_visibility field with default 'public'
ALTER TABLE public.profiles 
  ADD COLUMN profile_visibility text NOT NULL DEFAULT 'public';

-- Add check constraint for valid visibility values
ALTER TABLE public.profiles 
  ADD CONSTRAINT valid_profile_visibility CHECK (profile_visibility IN ('public', 'private'));

-- Update RLS policy for profiles to respect visibility settings
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Profiles are viewable based on visibility settings" 
  ON public.profiles 
  FOR SELECT 
  USING (
    profile_visibility = 'public' 
    OR auth.uid() = id 
    OR has_role(auth.uid(), 'admin'::app_role)
  );