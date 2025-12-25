import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, Video, Wrench } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type CourseCategory = 'all' | 'workshop' | 'webinar' | 'training';

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  duration: string;
  students: number;
  rating: number;
  category: 'workshop' | 'webinar' | 'training';
  instructor: string;
  image?: string;
}

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState<CourseCategory>('all');

  const categories = [
    { id: 'all', label: 'همه', icon: BookOpen },
    { id: 'workshop', label: 'کارگاه', icon: Wrench },
    { id: 'webinar', label: 'وبینار', icon: Video },
    { id: 'training', label: 'دوره', icon: BookOpen },
  ] as const;

  const courses: Course[] = [
    {
      id: 1,
      title: 'طراحی مدار چاپی PCB',
      description: 'آموزش کامل طراحی PCB با نرم‌افزار Altium Designer',
      price: 2500000,
      originalPrice: 3500000,
      duration: '۱۲ ساعت',
      students: 156,
      rating: 4.8,
      category: 'workshop',
      instructor: 'دکتر احمدی',
    },
    {
      id: 2,
      title: 'میکروکنترلر ARM',
      description: 'برنامه‌نویسی میکروکنترلرهای ARM Cortex-M',
      price: 1800000,
      duration: '۸ ساعت',
      students: 234,
      rating: 4.9,
      category: 'training',
      instructor: 'مهندس رضایی',
    },
    {
      id: 3,
      title: 'IoT و اینترنت اشیا',
      description: 'آشنایی با پروتکل‌های IoT و پیاده‌سازی پروژه',
      price: 0,
      duration: '۲ ساعت',
      students: 512,
      rating: 4.7,
      category: 'webinar',
      instructor: 'دکتر محمدی',
    },
    {
      id: 4,
      title: 'الکترونیک قدرت',
      description: 'طراحی منابع تغذیه سوئیچینگ',
      price: 3200000,
      originalPrice: 4000000,
      duration: '۱۶ ساعت',
      students: 89,
      rating: 4.6,
      category: 'workshop',
      instructor: 'مهندس کریمی',
    },
    {
      id: 5,
      title: 'FPGA و VHDL',
      description: 'برنامه‌نویسی FPGA با زبان VHDL',
      price: 2800000,
      duration: '۱۰ ساعت',
      students: 67,
      rating: 4.9,
      category: 'training',
      instructor: 'دکتر حسینی',
    },
    {
      id: 6,
      title: 'سنسورها و ابزار دقیق',
      description: 'آشنایی با انواع سنسورها و کاربردهای آن‌ها',
      price: 0,
      duration: '۱.۵ ساعت',
      students: 423,
      rating: 4.5,
      category: 'webinar',
      instructor: 'مهندس علوی',
    },
  ];

  const filteredCourses = activeCategory === 'all'
    ? courses
    : courses.filter((course) => course.category === activeCategory);

  const formatPrice = (price: number) => {
    if (price === 0) return 'رایگان';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };

  const getCategoryIcon = (category: Course['category']) => {
    switch (category) {
      case 'workshop':
        return Wrench;
      case 'webinar':
        return Video;
      case 'training':
        return BookOpen;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              دوره‌های <span className="text-primary">آموزشی</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              با شرکت در دوره‌های تخصصی ما، مهارت‌های خود را در حوزه میکروالکترونیک ارتقا دهید
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(cat.id)}
                className="gap-2"
              >
                <cat.icon className="w-4 h-4" />
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Courses Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => {
              const CategoryIcon = getCategoryIcon(course.category);
              return (
                <div
                  key={course.id}
                  className="relative rounded-xl overflow-hidden bg-card shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* پس‌زمینه gradient ملایم برای افکت glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* تصویر / آیکون */}
                  <div className="aspect-video bg-gradient-to-br from-secondary to-muted flex items-center justify-center relative overflow-hidden">
                    <CategoryIcon className="w-16 h-16 text-primary/50 group-hover:scale-110 transition-transform duration-300" />
                    {course.price === 0 && (
                      <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground">
                        رایگان
                      </Badge>
                    )}
                    {course.originalPrice && (
                      <Badge className="absolute top-3 right-3 bg-destructive">
                        تخفیف
                      </Badge>
                    )}
                  </div>

                  {/* محتوای کارت */}
                  <div className="p-5 space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {categories.find((c) => c.id === course.category)?.label}
                      </Badge>
                    </div>

                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {course.students} نفر
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-primary text-primary" />
                        {course.rating}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      مدرس: {course.instructor}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="space-y-1">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(course.price)}
                        </span>
                        {course.originalPrice && (
                          <span className="block text-sm text-muted-foreground line-through">
                            {formatPrice(course.originalPrice)}
                          </span>
                        )}
                      </div>
                      <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">
                        ثبت نام
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Courses;