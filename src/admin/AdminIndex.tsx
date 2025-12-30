import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label'; // اضافه شد
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SiteSettings = {
    background_url: string | null;
    main_h1: string | null;
    main_p: string | null;
    timer_end: string | null;
};

const AdminIndex = () => {
    const [settings, setSettings] = useState<SiteSettings>({
        background_url: '',
        main_h1: '',
        main_p: '',
        timer_end: '',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        const { data, error } = await supabase
            .from('site_settings')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching settings:', error);
        } else if (data) {
            setSettings({
                background_url: data.background_url || '',
                main_h1: data.main_h1 || '',
                main_p: data.main_p || '',
                timer_end: data.timer_end || '',
            });
        }
        setLoading(false);
    };

    const handleSave = async () => {
        const { error } = await supabase
            .from('site_settings')
            .upsert({
                id: 1, // چون فقط یک ردیف داریم
                background_url: settings.background_url,
                main_h1: settings.main_h1,
                main_p: settings.main_p,
                timer_end: settings.timer_end,
            });

        if (error) {
            alert('خطا در ذخیره: ' + error.message);
        } else {
            alert('تنظیمات با موفقیت ذخیره شد!');
        }
    };

    const handleUploadBackground = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `background/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images') // مطمئن شو bucket به اسم images داری
            .upload(filePath, file);

        if (uploadError) {
            alert('خطا در آپلود: ' + uploadError.message);
            return;
        }

        const { data } = supabase.storage.from('images').getPublicUrl(filePath);

        setSettings({ ...settings, background_url: data.publicUrl });
    };

    if (loading) return <p>در حال بارگذاری...</p>;

    return (
        <Card className="max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>مدیریت صفحه اصلی (Index)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label>عکس پس‌زمینه</Label>
                    <Input type="file" accept="image/*" onChange={handleUploadBackground} />
                    {settings.background_url && (
                        <img src={settings.background_url} alt="پیش‌نمایش" className="mt-4 max-h-64 rounded" />
                    )}
                </div>

                <div>
                    <Label htmlFor="h1">عنوان اصلی (H1)</Label>
                    <Input
                        id="h1"
                        value={settings.main_h1 || ''}
                        onChange={(e) => setSettings({ ...settings, main_h1: e.target.value })}
                    />
                </div>

                <div>
                    <Label htmlFor="p">توضیحات (P)</Label>
                    <Input
                        id="p"
                        value={settings.main_p || ''}
                        onChange={(e) => setSettings({ ...settings, main_p: e.target.value })}
                    />
                </div>

                <div>
                    <Label htmlFor="timer">زمان پایان تایمر</Label>
                    <Input
                        id="timer"
                        type="datetime-local"
                        value={settings.timer_end?.slice(0, 16) || ''}
                        onChange={(e) => setSettings({ ...settings, timer_end: e.target.value })}
                    />
                </div>

                <Button onClick={handleSave} className="w-full">
                    ذخیره تغییرات
                </Button>
            </CardContent>
        </Card>
    );
};

export default AdminIndex;