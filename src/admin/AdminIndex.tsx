import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Home, Save, Upload, ArrowRight, Plus, Trash2, Image } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminIndex = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        hero_title: '',
        hero_description: '',
        hero_background: '',
        countdown_target: '',
        logos: [] as string[],
    });
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('site_settings')
            .select('key, value');

        if (error) {
            toast({ title: 'خطا', description: 'خطا در دریافت تنظیمات', variant: 'destructive' });
            setLoading(false);
            return;
        }

        const settingsMap: Record<string, string> = {};
        data?.forEach(item => {
            settingsMap[item.key] = item.value || '';
        });

        setSettings({
            hero_title: settingsMap.hero_title || '',
            hero_description: settingsMap.hero_description || '',
            hero_background: settingsMap.hero_background || '',
            countdown_target: settingsMap.countdown_target || '',
            logos: settingsMap.logos ? JSON.parse(settingsMap.logos) : [],
        });
        setLoading(false);
    };

    const handleBackgroundUpload = async () => {
        if (!backgroundFile) return null;

        const fileExt = backgroundFile.name.split('.').pop();
        const fileName = `hero-bg-${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('admin-uploads')
            .upload(fileName, backgroundFile);

        if (error) {
            throw new Error('خطا در آپلود تصویر');
        }

        const { data: { publicUrl } } = supabase.storage
            .from('admin-uploads')
            .getPublicUrl(fileName);

        return publicUrl;
    };

    const handleLogoUpload = async () => {
        if (!logoFile) return null;

        const fileExt = logoFile.name.split('.').pop();
        const fileName = `logo-${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
            .from('admin-uploads')
            .upload(fileName, logoFile);

        if (error) {
            throw new Error('خطا در آپلود لوگو');
        }

        const { data: { publicUrl } } = supabase.storage
            .from('admin-uploads')
            .getPublicUrl(fileName);

        return publicUrl;
    };

    const addLogo = async () => {
        if (!logoFile) {
            toast({ title: 'خطا', description: 'لطفاً یک لوگو انتخاب کنید', variant: 'destructive' });
            return;
        }

        try {
            const logoUrl = await handleLogoUpload();
            if (logoUrl) {
                const newLogos = [...settings.logos, logoUrl];
                setSettings(prev => ({ ...prev, logos: newLogos }));
                setLogoFile(null);
                toast({ title: 'موفق', description: 'لوگو اضافه شد - برای ذخیره دکمه ذخیره را بزنید' });
            }
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در آپلود لوگو', variant: 'destructive' });
        }
    };

    const removeLogo = (index: number) => {
        const newLogos = settings.logos.filter((_, i) => i !== index);
        setSettings(prev => ({ ...prev, logos: newLogos }));
    };

    const upsertSetting = async (key: string, value: string) => {
        // First try to update
        const { data: existing } = await supabase
            .from('site_settings')
            .select('id')
            .eq('key', key)
            .maybeSingle();

        if (existing) {
            const { error } = await supabase
                .from('site_settings')
                .update({ value, updated_at: new Date().toISOString() })
                .eq('key', key);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('site_settings')
                .insert({ key, value });
            if (error) throw error;
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            let backgroundUrl = settings.hero_background;

            if (backgroundFile) {
                backgroundUrl = await handleBackgroundUpload() || backgroundUrl;
            }

            await upsertSetting('hero_title', settings.hero_title);
            await upsertSetting('hero_description', settings.hero_description);
            await upsertSetting('hero_background', backgroundUrl);
            await upsertSetting('countdown_target', settings.countdown_target);
            await upsertSetting('logos', JSON.stringify(settings.logos));

            toast({ title: 'موفق', description: 'تنظیمات ذخیره شد' });
            setBackgroundFile(null);
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در ذخیره تنظیمات', variant: 'destructive' });
        }
        setSaving(false);
    };

    if (loading) {
        return <div className="p-6 text-center">در حال بارگذاری...</div>;
    }

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    بازگشت
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Home className="h-6 w-6" />
                        تنظیمات صفحه اصلی
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* عنوان اصلی */}
                    <div className="space-y-2">
                        <Label htmlFor="hero_title">عنوان اصلی (H1)</Label>
                        <Input
                            id="hero_title"
                            value={settings.hero_title}
                            onChange={(e) => setSettings(prev => ({ ...prev, hero_title: e.target.value }))}
                            placeholder="عنوان اصلی سایت"
                        />
                    </div>

                    {/* توضیحات */}
                    <div className="space-y-2">
                        <Label htmlFor="hero_description">توضیحات</Label>
                        <Textarea
                            id="hero_description"
                            value={settings.hero_description}
                            onChange={(e) => setSettings(prev => ({ ...prev, hero_description: e.target.value }))}
                            placeholder="SORAYA PROBLEM DRIVEN EVENT"
                            rows={3}
                        />
                    </div>

                    {/* تصویر پس‌زمینه */}
                    <div className="space-y-2">
                        <Label>تصویر پس‌زمینه</Label>
                        {settings.hero_background && (
                            <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted mb-2">
                                <img
                                    src={settings.hero_background}
                                    alt="پس‌زمینه فعلی"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setBackgroundFile(e.target.files?.[0] || null)}
                            />
                            {backgroundFile && (
                                <span className="text-sm text-muted-foreground">{backgroundFile.name}</span>
                            )}
                        </div>
                    </div>

                    {/* زمان تایمر */}
                    <div className="space-y-2">
                        <Label htmlFor="countdown_target">زمان پایان شمارش معکوس</Label>
                        <Input
                            id="countdown_target"
                            type="datetime-local"
                            value={settings.countdown_target ? settings.countdown_target.slice(0, 16) : ''}
                            onChange={(e) => setSettings(prev => ({
                                ...prev,
                                countdown_target: new Date(e.target.value).toISOString()
                            }))}
                        />
                    </div>

                    {/* لوگوها */}
                    <div className="space-y-4">
                        <Label className="flex items-center gap-2">
                            <Image className="h-4 w-4" />
                            لوگوهای اسپانسر
                        </Label>

                        <div className="grid grid-cols-4 gap-4">
                            {settings.logos.map((logo, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={logo}
                                        alt={`لوگو ${index + 1}`}
                                        className="w-full aspect-square object-contain border rounded-lg p-2"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => removeLogo(index)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2">
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                            />
                            <Button onClick={addLogo} disabled={!logoFile} variant="outline" className="gap-2">
                                <Plus className="h-4 w-4" />
                                افزودن لوگو
                            </Button>
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                        <Save className="h-4 w-4" />
                        {saving ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminIndex;
