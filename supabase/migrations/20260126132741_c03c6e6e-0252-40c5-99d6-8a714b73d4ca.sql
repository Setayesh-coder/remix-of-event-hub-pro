-- Drop the permissive policy and create a proper one
DROP POLICY IF EXISTS "Service role can manage OTP codes" ON public.otp_codes;

-- OTP codes should only be accessible by service role (edge functions)
-- No user-facing policies needed - edge functions use service role key
-- RLS is enabled but no policies = only service role can access