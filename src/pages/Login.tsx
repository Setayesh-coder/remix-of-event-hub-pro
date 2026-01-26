import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const { requestOTP, verifyOTP, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone
    if (!/^09\d{9}$/.test(phone)) {
      toast({
        title: 'خطا',
        description: 'شماره تلفن باید با 09 شروع شده و 11 رقم باشد',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error, expiresIn } = await requestOTP(phone);
    setLoading(false);

    if (error) {
      toast({
        title: 'خطا',
        description: error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'کد ارسال شد',
        description: 'کد تأیید به شماره شما پیامک شد'
      });
      setStep('otp');
      setCountdown(expiresIn || 300);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast({
        title: 'خطا',
        description: 'کد تأیید باید 6 رقم باشد',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    const { error, isNewUser } = await verifyOTP(phone, otp);
    setLoading(false);

    if (error) {
      toast({
        title: 'خطا',
        description: error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: isNewUser ? 'خوش آمدید!' : 'ورود موفق',
        description: isNewUser ? 'حساب کاربری شما ایجاد شد' : 'با موفقیت وارد شدید'
      });
      navigate('/profile');
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    
    setLoading(true);
    const { error, expiresIn } = await requestOTP(phone);
    setLoading(false);

    if (error) {
      toast({
        title: 'خطا',
        description: error,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'کد مجدداً ارسال شد',
        description: 'کد تأیید جدید پیامک شد'
      });
      setOtp('');
      setCountdown(expiresIn || 300);
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="relative rounded-2xl p-8 bg-card shadow-2xl overflow-hidden border border-border/50">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 pointer-events-none" />

            <div className="relative z-10">
              {step === 'otp' && (
                <button 
                  onClick={() => { setStep('phone'); setOtp(''); }}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>بازگشت</span>
                </button>
              )}

              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2">
                  {step === 'phone' ? 'ورود / ثبت نام' : 'تأیید شماره'}
                </h1>
                <p className="text-muted-foreground">
                  {step === 'phone' 
                    ? 'شماره موبایل خود را وارد کنید' 
                    : `کد ارسال شده به ${phone} را وارد کنید`}
                </p>
              </div>

              {step === 'phone' ? (
                <form onSubmit={handleRequestOTP} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">شماره موبایل</label>
                    <div className="relative">
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                        placeholder="09123456789"
                        className="w-full pr-10 pl-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors text-left"
                        dir="ltr"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    className="w-full"
                    size="lg"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-sm text-muted-foreground block text-center">کد تأیید ۶ رقمی</label>
                    <div className="flex justify-center" dir="ltr">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                  </div>

                  {countdown > 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      زمان باقیمانده: <span className="font-mono">{formatCountdown(countdown)}</span>
                    </p>
                  )}

                  <Button
                    variant="gradient"
                    className="w-full"
                    size="lg"
                    type="submit"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading ? 'در حال تأیید...' : 'ورود'}
                  </Button>

                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={countdown > 0 || loading}
                    className={`w-full text-sm ${countdown > 0 ? 'text-muted-foreground' : 'text-primary hover:underline'}`}
                  >
                    {countdown > 0 ? 'کد جدید پس از اتمام زمان' : 'ارسال مجدد کد'}
                  </button>
                </form>
              )}

              <div className="mt-6 text-center text-sm text-muted-foreground">
                با ورود، <Link to="/terms" className="text-primary hover:underline">قوانین و مقررات</Link> را می‌پذیرید
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
