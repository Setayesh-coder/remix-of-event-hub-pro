-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL DEFAULT 0,
  original_price INTEGER,
  duration TEXT,
  category TEXT NOT NULL CHECK (category IN ('workshop', 'webinar', 'training')),
  instructor TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Everyone can view courses
CREATE POLICY "Anyone can view courses" 
ON public.courses 
FOR SELECT 
USING (true);

-- Create cart items table
CREATE TABLE public.cart_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- Users can view their own cart
CREATE POLICY "Users can view their own cart" 
ON public.cart_items 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can add to their own cart
CREATE POLICY "Users can add to their own cart" 
ON public.cart_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can remove from their own cart
CREATE POLICY "Users can delete from their own cart" 
ON public.cart_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create user courses table (purchased courses)
CREATE TABLE public.user_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS
ALTER TABLE public.user_courses ENABLE ROW LEVEL SECURITY;

-- Users can view their own courses
CREATE POLICY "Users can view their own courses" 
ON public.user_courses 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can add to their own courses (after payment)
CREATE POLICY "Users can add their own courses" 
ON public.user_courses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Insert sample courses
INSERT INTO public.courses (title, description, price, original_price, duration, category, instructor) VALUES
('طراحی مدار چاپی PCB', 'آموزش کامل طراحی PCB با نرم‌افزار Altium Designer', 2500000, 3500000, '۱۲ ساعت', 'workshop', 'دکتر احمدی'),
('میکروکنترلر ARM', 'برنامه‌نویسی میکروکنترلرهای ARM Cortex-M', 1800000, NULL, '۸ ساعت', 'training', 'مهندس رضایی'),
('IoT و اینترنت اشیا', 'آشنایی با پروتکل‌های IoT و پیاده‌سازی پروژه', 0, NULL, '۲ ساعت', 'webinar', 'دکتر محمدی'),
('الکترونیک قدرت', 'طراحی منابع تغذیه سوئیچینگ', 3200000, 4000000, '۱۶ ساعت', 'workshop', 'مهندس کریمی'),
('FPGA و VHDL', 'برنامه‌نویسی FPGA با زبان VHDL', 2800000, NULL, '۱۰ ساعت', 'training', 'دکتر حسینی'),
('سنسورها و ابزار دقیق', 'آشنایی با انواع سنسورها و کاربردهای آن‌ها', 0, NULL, '۱.۵ ساعت', 'webinar', 'مهندس علوی');