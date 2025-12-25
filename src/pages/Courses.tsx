import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, Star, BookOpen, Video, Wrench, ShoppingCart, Check } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type CourseCategory = 'all' | 'workshop' | 'webinar' | 'training';

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  duration: string | null;
  category: 'workshop' | 'webinar' | 'training';
  instructor: string | null;
  image_url: string | null;
}

const Courses = () => {
  const [activeCategory, setActiveCategory] = useState<CourseCategory>('all');
  const [courses, setCourses] = useState<Course[]>([]);
  const [cartItems, setCartItems] = useState<string[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { id: 'all', label: 'همه', icon: BookOpen },
    { id: 'workshop', label: 'کارگاه', icon: Wrench },
    { id: 'webinar', label: 'وبینار', icon: Video },
    { id: 'training', label: 'دوره', icon: BookOpen },
  ] as const;

  useEffect(() => {
    fetchCourses();
    if (user) {
      fetchCartItems();
      fetchPurchasedCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setCourses(data as Course[]);
    }
    setLoading(false);
  };

  const fetchCartItems = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('cart_items')
      .select('course_id')
      .eq('user_id', user.id);

    if (data) {
      setCartItems(data.map(item => item.course_id));
    }
  };

  const fetchPurchasedCourses = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_courses')
      .select('course_id')
      .eq('user_id', user.id);

    if (data) {
      setPurchasedCourses(data.map(item => item.course_id));
    }
  };

  const addToCart = async (courseId: string) => {
    if (!user) {
      toast({ 
        title: 'ورود به سایت', 
        description: 'لطفاً ابتدا وارد حساب کاربری خود شوید',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .insert({
        user_id: user.id,
        course_id: courseId,
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'توجه', description: 'این دوره قبلاً به سبد خرید اضافه شده است' });
      } else {
        toast({ title: 'خطا', description: 'خطا در افزودن به سبد خرید', variant: 'destructive' });
      }
    } else {
      setCartItems(prev => [...prev, courseId]);
      toast({ title: 'موفق', description: 'دوره به سبد خرید اضافه شد' });
    }
  };

  const registerFreeCourse = async (courseId: string) => {
    if (!user) {
      toast({ 
        title: 'ورود به سایت', 
        description: 'لطفاً ابتدا وارد حساب کاربری خود شوید',
        variant: 'destructive'
      });
      navigate('/login');
      return;
    }

    const { error } = await supabase
      .from('user_courses')
      .insert({
        user_id: user.id,
        course_id: courseId,
      });

    if (error) {
      if (error.code === '23505') {
        toast({ title: 'توجه', description: 'شما قبلاً در این دوره ثبت نام کرده‌اید' });
      } else {
        toast({ title: 'خطا', description: 'خطا در ثبت نام', variant: 'destructive' });
      }
    } else {
      setPurchasedCourses(prev => [...prev, courseId]);
      toast({ title: 'موفق', description: 'ثبت نام با موفقیت انجام شد' });
    }
  };

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

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </Layout>
    );
  }

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
              const isInCart = cartItems.includes(course.id);
              const isPurchased = purchasedCourses.includes(course.id);

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
                    {course.original_price && (
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
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                      )}
                    </div>

                    {course.instructor && (
                      <p className="text-sm text-muted-foreground">
                        مدرس: {course.instructor}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="space-y-1">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(course.price)}
                        </span>
                        {course.original_price && (
                          <span className="block text-sm text-muted-foreground line-through">
                            {formatPrice(course.original_price)}
                          </span>
                        )}
                      </div>

                      {isPurchased ? (
                        <Button variant="outline" size="sm" disabled className="gap-2">
                          <Check className="w-4 h-4" />
                          ثبت نام شده
                        </Button>
                      ) : course.price === 0 ? (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90"
                          onClick={() => registerFreeCourse(course.id)}
                        >
                          ثبت نام رایگان
                        </Button>
                      ) : isInCart ? (
                        <Button variant="outline" size="sm" disabled className="gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          در سبد خرید
                        </Button>
                      ) : (
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="bg-primary hover:bg-primary/90 gap-2"
                          onClick={() => addToCart(course.id)}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          افزودن به سبد
                        </Button>
                      )}
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
