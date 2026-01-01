
-- Create enum for app roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

INSERT INTO public.user_roles (user_id, role) 
VALUES ('60209425-b746-41fb-910f-a276d8cedf74', 'admin');


-- Create user_roles table for secure role management
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
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

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles" ON public.user_roles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create site_settings table
CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings" ON public.site_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON public.site_settings
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default site settings
INSERT INTO public.site_settings (key, value) VALUES
('hero_title', 'عنوان اصلی سایت'),
('hero_description', 'توضیحات سایت'),
('hero_background', ''),
('countdown_target', '2025-12-31T23:59:59');

-- Create gallery_images table
CREATE TABLE public.gallery_images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    category TEXT,
    event_date DATE,
    event_time TIME,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gallery images" ON public.gallery_images
FOR SELECT USING (true);

CREATE POLICY "Admins can manage gallery images" ON public.gallery_images
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create schedules table
CREATE TABLE public.schedules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 3),
    day_title TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view schedules" ON public.schedules
FOR SELECT USING (true);

CREATE POLICY "Admins can manage schedules" ON public.schedules
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add skyroom_link to courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS skyroom_link TEXT;

-- Update courses RLS for admin management
CREATE POLICY "Admins can manage courses" ON public.courses
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Add status to proposals table
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending_upload' 
CHECK (status IN ('pending_upload', 'pending_approval', 'approved', 'rejected'));

-- Add admin template file to proposals
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS template_url TEXT;

-- Update proposals RLS for admin
CREATE POLICY "Admins can view all proposals" ON public.proposals
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update proposals" ON public.proposals
FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));

-- Update certificates RLS for admin
CREATE POLICY "Admins can manage certificates" ON public.certificates
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create card_settings table for participant cards
CREATE TABLE public.card_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    card_image_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.card_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view card settings" ON public.card_settings
FOR SELECT USING (true);

CREATE POLICY "Admins can manage card settings" ON public.card_settings
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Insert default card settings
INSERT INTO public.card_settings (card_image_url) VALUES ('');

-- Create storage bucket for admin uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-uploads', 'admin-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for admin uploads
CREATE POLICY "Anyone can view admin uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'admin-uploads');

CREATE POLICY "Admins can upload to admin-uploads" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update admin-uploads" ON storage.objects
FOR UPDATE USING (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete from admin-uploads" ON storage.objects
FOR DELETE USING (bucket_id = 'admin-uploads' AND public.has_role(auth.uid(), 'admin'));

-- Update profiles RLS for admin viewing
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
