import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

type Step = 'phone' | 'otp' | 'password';

const AdminLogin = () => {
    const [step, setStep] = useState<Step>('phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [error, setError] = useState('');

    const { isAdminLoggedIn } = useAdminAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (isAdminLoggedIn) {
            navigate('/admin', { replace: true });
        }
    }, [isAdminLoggedIn, navigate]);

    // Countdown timer
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const normalizePhone = (input: string) => {
        let normalized = input.replace(/[\s\-]/g, '');
        if (normalized.startsWith('+98')) {
            normalized = '0' + normalized.slice(3);
        } else if (normalized.startsWith('98')) {
            normalized = '0' + normalized.slice(2);
        }
        return normalized;
    };

    const handleRequestOTP = async () => {
        setError('');
        const normalizedPhone = normalizePhone(phone);

        if (!/^09\d{9}$/.test(normalizedPhone)) {
            setError('شماره تلفن باید با 09 شروع شود و 11 رقم باشد');
            return;
        }

        setLoading(true);

        try {
            const { data, error: invokeError } = await supabase.functions.invoke('request-otp', {
                body: { phone: normalizedPhone },
            });

            if (invokeError) throw invokeError;

            if (data?.success) {
                // Show dev OTP if available
                if (data?.devOtp) {
                    toast({ 
                        title: '🔧 حالت توسعه', 
                        description: `کد تأیید: ${data.devOtp}`,
                        duration: 30000
                    });
                    setOtp(data.devOtp); // Auto-fill
                } else {
                    toast({ title: 'کد تأیید ارسال شد', description: 'کد را وارد کنید' });
                }
                setStep('otp');
                setCountdown(120);
            } else {
                setError(data?.error || 'خطا در ارسال کد');
            }
        } catch (err: any) {
            console.error('Request OTP error:', err);
            setError('خطا در ارسال کد تأیید');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTPAndPassword = async () => {
        setError('');
        const normalizedPhone = normalizePhone(phone);

        if (otp.length !== 6) {
            setError('کد تأیید باید 6 رقم باشد');
            return;
        }

        if (!password || password.length < 6) {
            setError('رمز عبور باید حداقل 6 کاراکتر باشد');
            return;
        }

        setLoading(true);

        try {
            const { data, error: invokeError } = await supabase.functions.invoke('admin-verify-otp', {
                body: { phone: normalizedPhone, code: otp, password },
            });

            if (invokeError) throw invokeError;

            if (data?.success && data?.session) {
                // Set the session
                await supabase.auth.setSession({
                    access_token: data.session.access_token,
                    refresh_token: data.session.refresh_token,
                });

                toast({ title: 'ورود موفق', description: 'به پنل ادمین خوش آمدید' });
                navigate('/admin', { replace: true });
            } else {
                setError(data?.error || 'خطا در ورود');
            }
        } catch (err: any) {
            console.error('Admin verify error:', err);
            setError('خطا در ورود');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        if (countdown > 0) return;
        await handleRequestOTP();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">ورود ادمین</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                        {step === 'phone' && 'شماره تلفن خود را وارد کنید'}
                        {step === 'otp' && 'کد تأیید را وارد کنید'}
                        {step === 'password' && 'رمز عبور خود را وارد کنید'}
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Step 1: Phone */}
                        {step === 'phone' && (
                            <>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">شماره تلفن</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        disabled={loading}
                                        placeholder="09123456789"
                                        dir="ltr"
                                        className="text-left"
                                    />
                                </div>

                                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                                <Button onClick={handleRequestOTP} className="w-full" disabled={loading}>
                                    {loading ? 'در حال ارسال...' : 'دریافت کد تأیید'}
                                </Button>
                            </>
                        )}

                        {/* Step 2: OTP + Password */}
                        {step === 'otp' && (
                            <>
                                <div className="space-y-2">
                                    <Label>کد تأیید 6 رقمی</Label>
                                    <div className="flex justify-center" dir="ltr">
                                        <InputOTP
                                            maxLength={6}
                                            value={otp}
                                            onChange={(value) => setOtp(value)}
                                            disabled={loading}
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

                                <div className="space-y-2">
                                    <Label htmlFor="password">رمز عبور</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        placeholder="رمز عبور حساب ادمین"
                                    />
                                </div>

                                {error && <p className="text-sm text-destructive text-center">{error}</p>}

                                <Button onClick={handleVerifyOTPAndPassword} className="w-full" disabled={loading}>
                                    {loading ? 'در حال بررسی...' : 'ورود به پنل'}
                                </Button>

                                <div className="flex items-center justify-between text-sm">
                                    <button
                                        type="button"
                                        onClick={() => setStep('phone')}
                                        className="text-primary hover:underline"
                                    >
                                        تغییر شماره
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleResendOTP}
                                        disabled={countdown > 0}
                                        className={`${countdown > 0 ? 'text-muted-foreground' : 'text-primary hover:underline'}`}
                                    >
                                        {countdown > 0 ? `ارسال مجدد (${countdown}s)` : 'ارسال مجدد کد'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;
