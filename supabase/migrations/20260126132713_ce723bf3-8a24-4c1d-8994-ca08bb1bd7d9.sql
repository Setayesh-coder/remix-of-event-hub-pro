-- Create OTP codes table for phone verification
CREATE TABLE public.otp_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  code_hash text NOT NULL,
  attempts integer DEFAULT 0,
  max_attempts integer DEFAULT 3,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'expired')),
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_codes ENABLE ROW LEVEL SECURITY;

-- Only edge functions (service role) can manage OTP codes
CREATE POLICY "Service role can manage OTP codes"
ON public.otp_codes
FOR ALL
USING (true)
WITH CHECK (true);

-- Add phone column to profiles if not exists and make it usable for auth
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- Create index for faster lookups
CREATE INDEX idx_otp_codes_phone_status ON public.otp_codes(phone, status);
CREATE INDEX idx_otp_codes_expires_at ON public.otp_codes(expires_at);