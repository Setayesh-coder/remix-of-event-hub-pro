import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('دکمه ثبت نام زده شد!'); // برای تست – بعداً حذف کن

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'خطا',
        description: 'رمز عبور و تکرار آن مطابقت ندارند',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: 'خطا',
        description: 'رمز عبور باید حداقل ۶ کاراکتر باشد',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password);

    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'این ایمیل قبلاً ثبت نام شده است';
      }
      toast({
        title: 'خطا در ثبت نام',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'ثبت نام موفق!',
        description: 'حساب کاربری شما ایجاد شد'
      });
      navigate('/profile');
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* کارت جدید بدون مشکل کلیک */}
          <div className="relative rounded-2xl p-8 bg-card shadow-2xl overflow-hidden border border-border/50">
            {/* پس‌زمینه gradient ملایم و زیبا */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 pointer-events-none" />

            {/* محتوای اصلی با لایه بالاتر */}
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">ثبت نام</h1>
                <p className="text-muted-foreground">حساب کاربری جدید بسازید</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">ایمیل</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="example@email.com"
                      className="w-full pr-10 pl-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-left"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">رمز عبور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pr-10 pl-12 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-left"
                      dir="ltr"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">تکرار رمز عبور</label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full pr-10 pl-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-left"
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* <label className="flex items-start gap-2 cursor-pointer text-sm">
                  <input type="checkbox" className="w-4 h-4 mt-1 rounded border-border bg-secondary" required />
                  <span className="text-muted-foreground">
                    با{' '}
                    <Link to="/terms" className="text-primary hover:underline">
                      قوانین و مقررات
                    </Link>{' '}
                    سایت موافقم
                  </span>
                </label> */}

                <Button
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'در حال ثبت نام...' : 'ثبت نام'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">حساب کاربری دارید؟</span>{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  وارد شوید
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;