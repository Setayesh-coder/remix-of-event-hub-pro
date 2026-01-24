-- Add admin SELECT policy for user_courses
CREATE POLICY "Admins can view all user courses" 
ON public.user_courses 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

-- Add admin INSERT and DELETE policies for user_courses (for payment processing)
CREATE POLICY "Admins can manage user courses" 
ON public.user_courses 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Add national ID validation function and constraint
CREATE OR REPLACE FUNCTION public.validate_national_id(id TEXT) 
RETURNS BOOLEAN 
LANGUAGE plpgsql 
IMMUTABLE 
SET search_path = public
AS $$
DECLARE
  sum_val INT := 0;
  check_digit INT;
  remainder INT;
  i INT;
BEGIN
  -- Return true for NULL (optional field)
  IF id IS NULL THEN RETURN true; END IF;
  
  -- Check format: must be exactly 10 digits
  IF id !~ '^\d{10}$' THEN RETURN false; END IF;
  
  -- Check for repeated digits (e.g., 1111111111)
  IF id ~ '^(\d)\1{9}$' THEN RETURN false; END IF;
  
  -- Calculate checksum
  FOR i IN 0..8 LOOP
    sum_val := sum_val + CAST(SUBSTRING(id FROM i+1 FOR 1) AS INT) * (10 - i);
  END LOOP;
  
  remainder := sum_val % 11;
  check_digit := CAST(SUBSTRING(id FROM 10 FOR 1) AS INT);
  
  IF remainder < 2 THEN
    RETURN check_digit = remainder;
  ELSE
    RETURN check_digit = 11 - remainder;
  END IF;
END;
$$;

-- Add constraint to profiles table for national_id validation
ALTER TABLE public.profiles ADD CONSTRAINT check_national_id_valid
CHECK (validate_national_id(national_id));