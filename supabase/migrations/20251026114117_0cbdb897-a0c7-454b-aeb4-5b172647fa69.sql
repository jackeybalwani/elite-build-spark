-- Update signup flow to support role selection
-- This allows users to select their role during signup

-- Update handle_new_user to respect role from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  selected_role text;
BEGIN
  -- Get role from signup metadata, default to 'builder'
  selected_role := COALESCE(NEW.raw_user_meta_data->>'role', 'builder');
  
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    selected_role
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update assign_default_role to use the role from signup
CREATE OR REPLACE FUNCTION public.assign_default_role()
RETURNS TRIGGER AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Get the role from the profile that was just created
  SELECT role::app_role INTO user_role
  FROM public.profiles
  WHERE id = NEW.id;
  
  -- Assign the selected role to user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;