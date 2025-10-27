-- Create function to increment profile career score
CREATE OR REPLACE FUNCTION public.increment(row_id uuid, x integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET career_score = COALESCE(career_score, 0) + x
  WHERE id = row_id;
END;
$$;
