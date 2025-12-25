import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('دکمه ورود زده شد!'); // برای تست – بعداً می‌تونی حذف کنی
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'خطا در ورود',
        description: error.message === 'Invalid login credentials'
          ? 'ایمیل یا رمز عبور اشتباه است'
          : error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'خوش آمدید!',
        description: 'با موفقیت وارد شدید'
      });
      navigate('/profile');
    }

    setLoading(false);
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          {/* کارت جدید بدون gradient-border مشکل‌دار */}
          <div className="relative rounded-2xl p-8 bg-card shadow-2xl overflow-hidden border border-border/50">
            {/* بک‌گراند gradient ملایم */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 pointer-events-none" />

            {/* محتوای اصلی با z-index بالاتر */}
            <div className="relative z-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">ورود</h1>
                <p className="text-muted-foreground">به حساب کاربری خود وارد شوید</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">ایمیل</label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <Button
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'در حال ورود...' : 'ورود'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">حساب کاربری ندارید؟</span>{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  ثبت نام کنید
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;