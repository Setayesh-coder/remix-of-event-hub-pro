import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, CreditCard, FileText, Award, LogOut, Download, Upload, Trash2, ShoppingCart, X } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import CitySelect from '@/components/iranProvinces';

type TabId = 'personal' | 'cart' | 'courses' | 'card' | 'proposal' | 'certificates';

interface Profile {
  national_id: string | null;
  full_name: string | null;
  phone: string | null;
  gender: string | null;
  field_of_study: string | null;
  education_level: string | null;
  university: string | null;
  residence: string | null;
}

interface Proposal {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
}

interface Certificate {
  id: string;
  title: string;
  issued_at: string;
  certificate_url: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  duration: string | null;
  category: string;
  instructor: string | null;
}

interface CartItem {
  id: string;
  course_id: string;
  course: Course;
}

interface UserCourse {
  id: string;
  course_id: string;
  purchased_at: string;
  course: Course;
}

interface Proposal {
  id: string;
  file_name: string;
  file_url: string;
  uploaded_at: string;
  status: 'pending_upload' | 'pending_approval' | 'approved' | 'rejected';
  user_id?: string;
  template_url?: string;
}

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [userCourses, setUserCourses] = useState<UserCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [nationalIdError, setNationalIdError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'cart' as TabId, label: 'سبد خرید', icon: ShoppingCart },
    { id: 'personal' as TabId, label: 'اطلاعات شخصی', icon: User },
    { id: 'courses' as TabId, label: 'دوره‌های من', icon: BookOpen },
    { id: 'card' as TabId, label: 'دریافت کارت', icon: CreditCard },
    { id: 'proposal' as TabId, label: 'پروپوزال من', icon: FileText },
    { id: 'certificates' as TabId, label: 'گواهی‌های صادر شده', icon: Award },

  ];


  const validateNationalId = (nationalId: string): boolean => {
    const trimmed = nationalId.trim();
    if (trimmed.length !== 10) return false;
    if (!/^\d{10}$/.test(trimmed)) return false;
    if (/^(\d)\1{9}$/.test(trimmed)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(trimmed[i]) * (10 - i);
    }
    const remainder = sum % 11;
    const checkDigit = parseInt(trimmed[9]);

    return remainder < 2 ? checkDigit === remainder : checkDigit === 11 - remainder;
  };


  const validatePhone = (phone: string): boolean => {
    const trimmed = phone.trim();
    return /^09\d{9}$/.test(trimmed);
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchProposals();
    fetchCertificates();
    fetchCartItems();
    fetchUserCourses();
  }, [user, navigate]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
    } else if (data) {
      setProfile({
        national_id: data.national_id,
        full_name: data.full_name,
        phone: data.phone,
        gender: data.gender,
        field_of_study: data.field_of_study,
        education_level: data.education_level,
        university: data.university,
        residence: data.residence,
      });

      if (data.national_id) {
        if (validateNationalId(data.national_id)) {
          setNationalIdError(null);
        } else {
          setNationalIdError('کد ملی وارد شده معتبر نیست');
        }
      }
    }
    setLoading(false);
  };

  const fetchProposals = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error fetching proposals:', error);
      setProposals([]);
      return;
    }

    if (data) {

      const typedProposals: Proposal[] = data.map((item: any) => ({
        id: item.id,
        file_name: item.file_name,
        file_url: item.file_url,
        uploaded_at: item.uploaded_at,
        status: item.status as Proposal['status'],
        user_id: item.user_id,
        template_url: item.template_url,
      }));

      setProposals(typedProposals);
    } else {
      setProposals([]);
    }
  };

  const fetchCertificates = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.id)
      .order('issued_at', { ascending: false });

    if (!error && data) {
      setCertificates(data);
    }
  };

  const fetchCartItems = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('cart_items')
      .select('id, course_id')
      .eq('user_id', user.id);

    if (!error && data) {
      // Fetch course details for each cart item
      const courseIds = data.map(item => item.course_id);
      if (courseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);

        if (coursesData) {
          const cartWithCourses = data.map(item => ({
            ...item,
            course: coursesData.find(c => c.id === item.course_id) as Course
          }));
          setCartItems(cartWithCourses);
        }
      } else {
        setCartItems([]);
      }
    }
  };

  const fetchUserCourses = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_courses')
      .select('id, course_id, purchased_at')
      .eq('user_id', user.id)
      .order('purchased_at', { ascending: false });

    if (!error && data) {
      const courseIds = data.map(item => item.course_id);
      if (courseIds.length > 0) {
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', courseIds);

        if (coursesData) {
          const coursesWithDetails = data.map(item => ({
            ...item,
            course: coursesData.find(c => c.id === item.course_id) as Course
          }));
          setUserCourses(coursesWithDetails);
        }
      } else {
        setUserCourses([]);
      }
    }
  };

  const handleProfileChange = (field: keyof Profile, value: string) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);

    if (field === 'national_id') {
      const trimmed = value.replace(/[^\d]/g, '').slice(0, 10);
      setProfile(prev => prev ? { ...prev, national_id: trimmed } : null);

      if (trimmed.length === 0) {
        setNationalIdError(null);
      } else if (trimmed.length < 10) {
        setNationalIdError('کد ملی باید ۱۰ رقم باشد');
      } else if (!validateNationalId(trimmed)) {
        setNationalIdError('کد ملی وارد شده معتبر نیست');
      } else {
        setNationalIdError(null);
      }
    }

    if (field === 'phone') {
      const trimmed = value.replace(/[^\d]/g, '').slice(0, 11);
      setProfile(prev => prev ? { ...prev, phone: trimmed } : null);

      if (trimmed.length === 0) {
        setPhoneError(null);
      } else if (trimmed.length < 11) {
        setPhoneError('شماره تماس باید ۱۱ رقم باشد');
      } else if (!validatePhone(trimmed)) {
        setPhoneError('شماره تماس باید با ۰۹ شروع شود');
      } else {
        setPhoneError(null);
      }
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    if (profile.national_id && profile.national_id.length > 0 && nationalIdError) {
      toast({ title: 'خطا', description: 'لطفاً کد ملی معتبر وارد کنید', variant: 'destructive' });
      return;
    }
    if (profile.phone && profile.phone.length > 0 && phoneError) {
      toast({ title: 'خطا', description: 'لطفاً شماره تماس معتبر وارد کنید', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        national_id: profile.national_id || null,
        full_name: profile.full_name,
        phone: profile.phone,
        gender: profile.gender,
        field_of_study: profile.field_of_study,
        education_level: profile.education_level,
        university: profile.university,
        residence: profile.residence,
      })
      .eq('user_id', user.id);

    if (error) {
      toast({ title: 'خطا', description: 'خطا در ذخیره اطلاعات', variant: 'destructive' });
    } else {
      toast({ title: 'موفق', description: 'اطلاعات با موفقیت ذخیره شد' });
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: 'خروج موفق', description: 'با موفقیت از حساب خارج شدید' });
      navigate('/');
    } catch (error) {
      toast({ title: 'خطا', description: 'خطا در خروج از حساب', variant: 'destructive' });
    }
  };

  const uploadProposal = async (file: File) => {
    if (!user) return;
    setUploading(true);
    const fileName = `${user.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage
      .from('proposals')
      .upload(fileName, file);

    if (uploadError) {
      toast({ title: 'خطا', description: 'خطا در آپلود فایل', variant: 'destructive' });
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('proposals')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('proposals')
      .insert({
        user_id: user.id,
        file_name: file.name,
        file_url: publicUrl,
      });

    if (dbError) {
      toast({ title: 'خطا', description: 'خطا در ثبت فایل', variant: 'destructive' });
    } else {
      toast({ title: 'موفق', description: 'فایل با موفقیت آپلود شد' });
      fetchProposals();
    }
    setUploading(false);
  };

  const deleteProposal = async (proposal: Proposal) => {
    if (!user) return;
    const filePath = proposal.file_url.split('/storage/v1/object/public/proposals/')[1];
    await supabase.storage.from('proposals').remove([filePath]);

    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', proposal.id);

    if (!error) {
      toast({ title: 'حذف شد', description: 'فایل با موفقیت حذف شد' });
      fetchProposals();
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', cartItemId);

    if (!error) {
      setCartItems(prev => prev.filter(item => item.id !== cartItemId));
      toast({ title: 'حذف شد', description: 'دوره از سبد خرید حذف شد' });
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.course?.price || 0), 0);
  };

  const handlePayment = async () => {
    if (!user || cartItems.length === 0) return;

    setProcessing(true);

    // اضافه کردن دوره‌ها به لیست دوره‌های خریداری شده
    for (const item of cartItems) {
      await supabase
        .from('user_courses')
        .insert({
          user_id: user.id,
          course_id: item.course_id,
        });
    }

    // حذف آیتم‌ها از سبد خرید
    for (const item of cartItems) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', item.id);
    }

    setCartItems([]);
    await fetchUserCourses();
    setProcessing(false);

    toast({ title: 'پرداخت موفق', description: 'دوره‌ها با موفقیت به لیست دوره‌های شما اضافه شدند' });
    setActiveTab('courses');
  };

  const downloadCard = () => {
    if (!profile?.full_name || !profile?.phone) {
      toast({ title: 'توجه', description: 'لطفاً ابتدا اطلاعات شخصی را تکمیل کنید', variant: 'destructive' });
      return;
    }


    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, 400, 250);
    gradient.addColorStop(0, '#213b6e');
    gradient.addColorStop(1, '#5472d2');
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, 400, 250, 20);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Vazirmatn, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('کارت شرکت‌کننده', 380, 50);
    ctx.font = '18px Vazirmatn, sans-serif';
    ctx.fillText(`نام: ${profile.full_name}`, 380, 120);
    ctx.fillText(`تماس: ${profile.phone}`, 380, 160);

    const link = document.createElement('a');
    link.download = 'participant-card.png';
    link.href = canvas.toDataURL();
    link.click();
    toast({ title: 'موفق', description: 'کارت دانلود شد' });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'رایگان';
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  };
  const getStatusDisplay = (status: Proposal['status']) => {
    switch (status) {
      case 'pending_upload':
        return { text: 'آپلود نشده', color: 'text-muted-foreground', bg: 'bg-gray-200 dark:bg-gray-800' };
      case 'pending_approval':
        return { text: 'در انتظار بررسی', color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-100 dark:bg-orange-900/30' };
      case 'approved':
        return { text: 'تأیید شده ✅', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
      case 'rejected':
        return { text: 'رد شده ❌', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
      default:
        return { text: 'نامشخص', color: 'text-muted-foreground', bg: 'bg-gray-200 dark:bg-gray-800' };
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
          <div className="max-w-4xl mx-auto">
            {/* هدر پروفایل */}
            <div className="relative rounded-2xl p-6 sm:p-8 mb-8 bg-card shadow-xl overflow-hidden border border-border/50">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 pointer-events-none" />
              <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">{profile?.full_name || 'کاربر'}</h1>
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  خروج
                </Button>
              </div>
            </div>

            {/* تب‌ها */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="gap-2 shrink-0 relative"
                  size="sm"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'cart' && cartItems.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {cartItems.length}
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* تب اطلاعات شخصی */}
            {activeTab === 'personal' && (
              <div className="relative rounded-xl p-6 bg-card shadow-xl overflow-hidden border border-border/50 space-y-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold">اطلاعات شخصی</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">کد ملی</label>
                      <input
                        type="text"
                        value={profile?.national_id || ''}
                        onChange={(e) => handleProfileChange('national_id', e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg bg-secondary border ${nationalIdError ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                          } outline-none`}
                        dir="ltr"
                        placeholder="مثال: 0012345678"
                        maxLength={10}
                      />
                      {nationalIdError && (
                        <p className="text-sm text-destructive">{nationalIdError}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">نام و نام خانوادگی</label>
                      <input
                        type="text"
                        value={profile?.full_name || ''}
                        onChange={(e) => handleProfileChange('full_name', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">شماره تماس</label>
                      <input
                        type="tel"
                        value={profile?.phone || ''}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className={`w-full px-4 py-3 rounded-lg bg-secondary border ${phoneError ? 'border-destructive focus:border-destructive' : 'border-border focus:border-primary'
                          } outline-none`}
                        dir="ltr"
                        placeholder="مثال: 09123456789"
                        maxLength={11}
                      />
                      {phoneError && (
                        <p className="text-sm text-destructive">{phoneError}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">محل سکونت</label>
                      <CitySelect
                        value={profile?.residence || ''}
                        onChange={(value) => handleProfileChange('residence', value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">جنسیت</label>
                      <select
                        value={profile?.gender || ''}
                        onChange={(e) => handleProfileChange('gender', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="male">مرد</option>
                        <option value="female">زن</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">رشته تحصیلی</label>
                      <input
                        type="text"
                        value={profile?.field_of_study || ''}
                        onChange={(e) => handleProfileChange('field_of_study', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">مقطع تحصیلی</label>
                      <select
                        value={profile?.education_level || ''}
                        onChange={(e) => handleProfileChange('education_level', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                      >
                        <option value="">انتخاب کنید</option>
                        <option value="diploma">دیپلم</option>
                        <option value="associate">کاردانی</option>
                        <option value="bachelor">کارشناسی</option>
                        <option value="master">کارشناسی ارشد</option>
                        <option value="phd">دکتری</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">دانشگاه</label>
                      <input
                        type="text"
                        value={profile?.university || ''}
                        onChange={(e) => handleProfileChange('university', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                      />
                    </div>
                  </div>

                  <Button
                    variant="gradient"
                    onClick={saveProfile}
                    disabled={saving || !!nationalIdError || !!phoneError}
                    className="mt-6"
                  >
                    {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </Button>
                </div>
              </div>
            )}

            {/* تب سبد خرید */}
            {activeTab === 'cart' && (
              <div className="relative rounded-xl p-6 bg-card shadow-xl overflow-hidden border border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold mb-4">سبد خرید</h2>

                  {cartItems.length === 0 ? (
                    <p className="text-muted-foreground">خرید شما خالی است.</p>
                  ) : (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <div className="flex-1">
                            <h3 className="font-medium">{item.course?.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {item.course?.instructor && `مدرس: ${item.course.instructor}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-primary font-bold">
                              {formatPrice(item.course?.price || 0)}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFromCart(item.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="border-t border-border pt-4 mt-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-lg font-semibold">جمع کل:</span>
                          <span className="text-2xl font-bold text-primary">
                            {formatPrice(getCartTotal())}
                          </span>
                        </div>
                        <Button
                          variant="gradient"
                          className="w-full"
                          onClick={handlePayment}
                          disabled={processing}
                        >
                          {processing ? 'در حال پردازش...' : 'پرداخت و ثبت نام'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* تب دوره‌های من */}
            {activeTab === 'courses' && (
              <div className="relative rounded-xl p-6 bg-card shadow-xl overflow-hidden border border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold mb-4">دوره‌های ثبت نام شده</h2>

                  {userCourses.length === 0 ? (
                    <p className="text-muted-foreground">شما هنوز در هیچ دوره‌ای ثبت نام نکرده‌اید.</p>
                  ) : (
                    <div className="space-y-3">
                      {userCourses.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <div className="flex items-center gap-3">
                            <BookOpen className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{item.course?.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.course?.instructor && `مدرس: ${item.course.instructor}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(item.purchased_at).toLocaleDateString('fa-IR')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* تب دریافت کارت */}
            {activeTab === 'card' && (
              <div className="relative rounded-xl p-6 bg-card shadow-xl overflow-hidden border border-border/50 space-y-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold">دریافت کارت شرکت‌کننده</h2>
                  <div className="bg-gradient-to-br from-primary to-accent rounded-xl p-6 text-white max-w-sm mt-4">
                    <h3 className="text-lg font-bold mb-4">کارت شرکت‌کننده</h3>
                    <p className="mb-2">نام: {profile?.full_name || '---'}</p>
                    <p>تماس: {profile?.phone || '---'}</p>
                  </div>
                  <Button variant="gradient" onClick={downloadCard} className="gap-2 mt-4">
                    <Download className="w-4 h-4" />
                    دانلود کارت
                  </Button>
                </div>
              </div>
            )}

            {/* تب پروپوزال */}
            {activeTab === 'proposal' && (
              <div className="relative rounded-xl p-6 bg-card shadow-xl overflow-hidden border border-border/50 space-y-8">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold mb-6">پروپوزال من</h2>

                  {/* ویدیو آموزشی */}
                  <div className="p-5 bg-secondary/50 rounded-xl border border-border">
                    <h3 className="font-medium mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.5 16.5L15.5 12L9.5 7.5V16.5Z" fill="currentColor" />
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      ویدیوی آموزشی نحوه ارسال پروپوزال
                    </h3>
                    <div className="aspect-video rounded-lg overflow-hidden bg-black">
                      <iframe
                        className="w-full h-full"
                        src="https://www.aparat.com/video/video/embed/videohash/YOUR_VIDEO_ID/vt/frame"
                        title="آموزش ارسال پروپوزال"
                        allowFullScreen
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-3">
                      در این ویدیو نحوه تکمیل و ارسال فرم پروپوزال را مشاهده کنید.
                    </p>
                  </div>

                  {/* دکمه‌های دانلود قالب و آپلود */}
                  <div className="flex flex-wrap gap-4 pt-10">
                    <Button variant="outline" asChild className="gap-2">
                      <a href="/proposal-template.pdf" download>
                        <Download className="w-4 h-4" />
                        دانلود فرم پروپوزال
                      </a>
                    </Button>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => e.target.files?.[0] && uploadProposal(e.target.files[0])}
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                    />
                    <Button
                      variant="gradient"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      {uploading ? 'در حال آپلود...' : 'آپلود پروپوزال'}
                    </Button>
                  </div>

                  {/* نمایش وضعیت پروپوزال‌ها */}
                  {proposals.length === 0 ? (
                    <div className="mt-8 p-8 bg-secondary/30 rounded-xl text-center border border-dashed border-border">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        هنوز هیچ پروپوزالی آپلود نکرده‌اید.
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        پس از آپلود، وضعیت بررسی پروپوزال شما اینجا نمایش داده خواهد شد.
                      </p>
                    </div>
                  ) : (
                    <div className="mt-8 space-y-4">
                      <h3 className="font-medium text-lg">پروپوزال‌های ارسال شده</h3>
                      {proposals.map((proposal) => {
                        const statusInfo = getStatusDisplay(proposal.status);

                        return (
                          <div
                            key={proposal.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-secondary rounded-xl gap-4 border border-border/50"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <FileText className="w-8 h-8 text-primary flex-shrink-0" />
                              <div>
                                <p className="font-medium">{proposal.file_name}</p>
                                <p className="text-sm text-muted-foreground">
                                  آپلود شده در: {new Date(proposal.uploaded_at).toLocaleDateString('fa-IR')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 flex-wrap">
                              {/* وضعیت */}
                              <span
                                className={`px-4 py-2 rounded-full text-sm font-medium ${statusInfo.bg} ${statusInfo.color} min-w-32 text-center`}
                              >
                                {statusInfo.text}
                              </span>

                              {/* دانلود فایل */}
                              <Button variant="outline" size="sm" asChild>
                                <a href={proposal.file_url} target="_blank" rel="noopener noreferrer">
                                  <Download className="w-4 h-4" />
                                </a>
                              </Button>

                              {/* حذف فقط اگر هنوز در انتظار بررسی باشد */}
                              {proposal.status === 'pending_approval' && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => deleteProposal(proposal)}
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* تب گواهی‌ها */}
            {activeTab === 'certificates' && (
              <div className="relative rounded-xl p-6 bg-card shadow-xl overflow-hidden border border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold mb-4">گواهی‌های صادر شده</h2>
                  {certificates.length === 0 ? (
                    <p className="text-muted-foreground">هنوز گواهی‌ای برای شما صادر نشده است.</p>
                  ) : (
                    <div className="space-y-3">
                      {certificates.map((cert) => (
                        <div key={cert.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-primary" />
                            <div>
                              <p className="font-medium">{cert.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(cert.issued_at).toLocaleDateString('fa-IR')}
                              </p>
                            </div>
                          </div>
                          {cert.certificate_url && (
                            <Button variant="outline" size="sm" asChild>
                              <a href={cert.certificate_url} download>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
