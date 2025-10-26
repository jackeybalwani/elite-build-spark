-- Security Fix Migration: Address Critical Authorization Issues
-- Fixed: Create has_role() function before policies that use it

-- 1. Create app_role enum for secure role management
CREATE TYPE public.app_role AS ENUM ('builder', 'sponsor', 'admin');

-- 2. Create user_roles table (not updateable by users)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 3. Create security definer function FIRST (before policies use it)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 4. Now create RLS policies on user_roles
-- Users can view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Only admins can manage roles
CREATE POLICY "Admins can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 5. Create helper function for assigning roles
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'builder'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-assign builder role on profile creation
CREATE TRIGGER on_profile_created_assign_role
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role();

-- 6. Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT id, role::app_role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- 7. Fix profiles UPDATE policy to prevent role changes
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND
  -- Prevent users from changing their role
  (role = (SELECT role FROM public.profiles WHERE id = auth.uid()) OR role IS NULL)
);

-- 8. Update challenges policies to use has_role() for sponsor checks
DROP POLICY IF EXISTS "Sponsors can create challenges" ON public.challenges;
CREATE POLICY "Sponsors can create challenges"
ON public.challenges FOR INSERT
WITH CHECK (
  auth.uid() = sponsor_id AND
  public.has_role(auth.uid(), 'sponsor'::app_role)
);

DROP POLICY IF EXISTS "Sponsors can update their challenges" ON public.challenges;
CREATE POLICY "Sponsors can update their challenges"
ON public.challenges FOR UPDATE
USING (
  auth.uid() = sponsor_id AND
  public.has_role(auth.uid(), 'sponsor'::app_role)
);

-- Admins can delete any challenge
CREATE POLICY "Admins can delete challenges"
ON public.challenges FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 9. Fix submission UPDATE policy to prevent score manipulation
DROP POLICY IF EXISTS "Users can update their pending submissions" ON public.submissions;
CREATE POLICY "Users can update their pending submissions"
ON public.submissions FOR UPDATE
USING (
  auth.uid() = user_id AND
  status = 'pending'
)
WITH CHECK (
  auth.uid() = user_id AND
  status = 'pending' AND
  -- Prevent manipulation of evaluation fields
  score IS NULL AND
  evaluation_feedback IS NULL AND
  evaluated_at IS NULL
);

-- Admins can delete submissions
CREATE POLICY "Admins can delete submissions"
ON public.submissions FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 10. Fix badge policies - only admins can manage badges
CREATE POLICY "Admins can insert badges"
ON public.badges FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update badges"
ON public.badges FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete badges"
ON public.badges FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));