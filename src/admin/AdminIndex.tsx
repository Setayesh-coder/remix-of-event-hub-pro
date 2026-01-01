import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Home, Save, Upload, ArrowRight } from 'lucide-react';
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
    });
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

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

    const handleSave = async () => {
        setSaving(true);
        try {
            let backgroundUrl = settings.hero_background;

            if (backgroundFile) {
                backgroundUrl = await handleBackgroundUpload() || backgroundUrl;
            }

            const updates = [
                { key: 'hero_title', value: settings.hero_title },
                { key: 'hero_description', value: settings.hero_description },
                { key: 'hero_background', value: backgroundUrl },
                { key: 'countdown_target', value: settings.countdown_target },
            ];

            for (const update of updates) {
                const { error } = await supabase
                    .from('site_settings')
                    .update({ value: update.value, updated_at: new Date().toISOString() })
                    .eq('key', update.key);

                if (error) throw error;
            }

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
                            placeholder="توضیحات صفحه اصلی"
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
                            value={settings.countdown_target.slice(0, 16)}
                            onChange={(e) => setSettings(prev => ({ 
                                ...prev, 
                                countdown_target: new Date(e.target.value).toISOString() 
                            }))}
                        />
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
