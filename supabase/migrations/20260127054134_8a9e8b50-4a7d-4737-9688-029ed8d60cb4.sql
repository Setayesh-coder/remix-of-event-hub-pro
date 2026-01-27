-- Create certificate settings table for admin to control certificate background
CREATE TABLE public.certificate_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    certificate_image_url text,
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certificate_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view certificate settings"
ON public.certificate_settings
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage certificate settings"
ON public.certificate_settings
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default row
INSERT INTO public.certificate_settings (id) VALUES (gen_random_uuid());