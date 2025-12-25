import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, BookOpen, CreditCard, FileText, Award, LogOut, Download, Upload, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import CitySelect from '@/components/iranProvinces';

type TabId = 'personal' | 'courses' | 'card' | 'proposal' | 'certificates';

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

const Profile = () => {
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const tabs = [
    { id: 'personal' as TabId, label: 'اطلاعات شخصی', icon: User },
    { id: 'courses' as TabId, label: 'دوره‌های من', icon: BookOpen },
    { id: 'card' as TabId, label: 'دریافت کارت', icon: CreditCard },
    { id: 'proposal' as TabId, label: 'پروپوزال من', icon: FileText },
    { id: 'certificates' as TabId, label: 'گواهی‌های صادر شده', icon: Award },
  ];

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchProfile();
    fetchProposals();
    fetchCertificates();
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

    if (!error && data) {
      setProposals(data);
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

  const handleProfileChange = (field: keyof Profile, value: string) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        national_id: profile.national_id,
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
    await signOut();
    navigate('/');
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
    // استخراج مسیر فایل از URL
    const filePath = proposal.file_url.split('/').slice(-2).join('/');
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
            {/* هدر پروفایل - فیکس شده */}
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
                  className="gap-2 shrink-0"
                  size="sm"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* محتوای تب‌ها - همه با کارت امن */}
            {activeTab === 'personal' && (
              <div className="relative rounded-xl p-6 bg-card shadow-xl overflow-hidden border border-border/50 space-y-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold">اطلاعات شخصی</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    {/* همه فیلدها مثل قبل */}
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">کد ملی</label>
                      <input
                        type="text"
                        value={profile?.national_id || ''}
                        onChange={(e) => handleProfileChange('national_id', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                        dir="ltr"
                      />
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
                    {/* بقیه فیلدها دقیقاً مثل کد اصلیت */}
                    <div className="space-y-2">
                      <label className="text-sm text-muted-foreground">شماره تماس</label>
                      <input
                        type="tel"
                        value={profile?.phone || ''}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary outline-none"
                        dir="ltr"
                      />
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
                  <Button variant="gradient" onClick={saveProfile} disabled={saving} className="mt-6">
                    {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                  </Button>
                </div>
              </div>
            )}

            {/* بقیه تب‌ها هم دقیقاً با همین ساختار (relative + z-10 + bg-card + shadow) */}
            {activeTab === 'courses' && (
              <div className="relative rounded-xl p-6 bg-card shadow-xl overflow-hidden border border-border/50">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold mb-4">دوره‌های ثبت نام شده</h2>
                  <p className="text-muted-foreground">شما هنوز در هیچ دوره‌ای ثبت نام نکرده‌اید.</p>
                </div>
              </div>
            )}

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

            {activeTab === 'proposal' && (
              <div className="relative rounded-xl p-6 bg-card shadow-xl overflow-hidden border border-border/50 space-y-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
                <div className="relative z-10">
                  <h2 className="text-xl font-semibold">پروپوزال من</h2>
                  <div className="flex gap-4 flex-wrap mt-4">
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

                  {proposals.length > 0 && (
                    <div className="space-y-3 mt-6">
                      <h3 className="font-medium">فایل‌های آپلود شده:</h3>
                      {proposals.map((proposal) => (
                        <div key={proposal.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-primary" />
                            <span className="text-sm">{proposal.file_name}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <a href={proposal.file_url} download>
                                <Download className="w-4 h-4" />
                              </a>
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => deleteProposal(proposal)}>
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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