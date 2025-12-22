-- Create profiles table with new fields
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  national_id TEXT,
  full_name TEXT,
  phone TEXT,
  gender TEXT CHECK (gender IN ('male', 'female')),
  field_of_study TEXT,
  education_level TEXT,
  university TEXT,
  residence TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create proposals table for tracking uploaded proposals
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Policies for proposals
CREATE POLICY "Users can view their own proposals" 
ON public.proposals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own proposals" 
ON public.proposals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own proposals" 
ON public.proposals FOR DELETE 
USING (auth.uid() = user_id);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  certificate_url TEXT
);

-- Enable RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Policies for certificates
CREATE POLICY "Users can view their own certificates" 
ON public.certificates FOR SELECT 
USING (auth.uid() = user_id);

-- Create storage bucket for proposals
INSERT INTO storage.buckets (id, name, public) VALUES ('proposals', 'proposals', false);

-- Storage policies for proposals
CREATE POLICY "Users can upload their own proposals" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'proposals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own proposals" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'proposals' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own proposals" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'proposals' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function for auto-creating profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();