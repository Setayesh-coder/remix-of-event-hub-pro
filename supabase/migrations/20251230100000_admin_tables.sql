-- جدول برای تنظیمات صفحه اصلی
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  background_url TEXT,
  main_h1 TEXT,
  main_p TEXT,
  timer_end TIMESTAMP
);

-- جدول گالری
CREATE TABLE IF NOT EXISTS gallery_images (
  id SERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  category_date DATE,
  category_time TIME,
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول دوره‌ها
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  type TEXT CHECK (type IN ('all', 'workshop', 'webinar', 'course')), -- دسته‌بندی
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  duration INTERVAL,
  instructor TEXT,
  price NUMERIC,
  skyroom_link TEXT, -- فقط برای webinar
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول برنامه‌ریزی
CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  day DATE NOT NULL,
  time_slot TIME NOT NULL,
  course_id INTEGER REFERENCES courses(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول پروپوزال‌ها (فرض کنیم users جدول Supabase auth داره)
CREATE TABLE IF NOT EXISTS proposals (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  file_url TEXT, -- URL فایل آپلود‌شده
  status TEXT CHECK (status IN ('pending_upload', 'pending_approval', 'approved', 'rejected')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- جدول گواهی‌ها
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  cert_url TEXT, -- URL گواهی صادرشده
  created_at TIMESTAMP DEFAULT NOW()
);

-- تنظیمات کارت شرکت‌کننده (فرض کنیم جهانی)
CREATE TABLE IF NOT EXISTS card_settings (
  id SERIAL PRIMARY KEY,
  card_image_url TEXT
);