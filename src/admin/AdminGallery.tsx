import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2, Upload, Image as ImageIcon } from 'lucide-react';

type GalleryImage = {
    id: number;
    image_url: string;
    event_date: string; // YYYY-MM-DD
    event_time: string; // HH:MM
    caption?: string | null;
    created_at?: string;
};

const AdminGallery = () => {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    // فرم آپلود
    const [file, setFile] = useState<File | null>(null);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [caption, setCaption] = useState('');

    // دریافت همه تصاویر از دیتابیس
    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('خطا در بارگذاری تصاویر:', error);
            alert('خطا در دریافت گالری: ' + error.message);
            setImages([]);
        } else {
            setImages(data || []);
        }
        setLoading(false);
    };

    // آپلود عکس + ذخیره اطلاعات در دیتابیس
    const handleUpload = async () => {
        if (!file) {
            alert('لطفاً یک عکس انتخاب کنید');
            return;
        }
        if (!date || !time) {
            alert('تاریخ و ساعت رویداد را وارد کنید');
            return;
        }

        setUploading(true);

        try {
            // 1. آپلود فایل به Supabase Storage
            const fileExt = file.name.split('.').pop()?.toLowerCase();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `gallery/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images') // نام bucket باید "images" باشه
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                throw uploadError;
            }

            // 2. گرفتن URL عمومی عکس
            const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
            const publicUrl = urlData.publicUrl;

            // 3. ذخیره اطلاعات در جدول gallery_images
            const { error: dbError } = await supabase.from('gallery_images').insert({
                image_url: publicUrl,
                event_date: date,
                event_time: time,
                caption: caption || null,
            });

            if (dbError) {
                throw dbError;
            }

            alert('عکس با موفقیت به گالری اضافه شد! 🎉');
            // ریست فرم
            setFile(null);
            setDate('');
            setTime('');
            setCaption('');
            // رفرش لیست
            fetchImages();
        } catch (err: any) {
            alert('خطا در آپلود: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    // حذف عکس
    const handleDelete = async (id: number, imageUrl: string) => {
        if (!confirm('مطمئنید که می‌خواهید این عکس را حذف کنید؟')) return;

        try {
            // حذف از دیتابیس
            const { error: dbError } = await supabase.from('gallery_images').delete().eq('id', id);
            if (dbError) throw dbError;

            // استخراج مسیر فایل از URL و حذف از Storage
            const pathParts = imageUrl.split('/gallery/');
            if (pathParts.length > 1) {
                const filePath = 'gallery/' + pathParts[1].split('?')[0]; // حذف پارامترهای URL
                await supabase.storage.from('images').remove([filePath]);
            }

            fetchImages();
            alert('عکس با موفقیت حذف شد');
        } catch (err: any) {
            alert('خطا در حذف: ' + err.message);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* بخش آپلود عکس */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-6 w-6" />
                        افزودن عکس جدید به گالری
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <Label htmlFor="image">انتخاب عکس</Label>
                        <Input
                            id="image"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            disabled={uploading}
                        />
                        {file && (
                            <p className="text-sm text-green-600 mt-2">فایل انتخاب شده: {file.name}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="date">تاریخ رویداد</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                disabled={uploading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="time">ساعت رویداد</Label>
                            <Input
                                id="time"
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                disabled={uploading}
                            />
                        </div>
                        <div>
                            <Label htmlFor="caption">کپشن (اختیاری)</Label>
                            <Input
                                id="caption"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="مثلاً: روز اول - افتتاحیه"
                                disabled={uploading}
                            />
                        </div>
                    </div>

                    <Button
                        onClick={handleUpload}
                        disabled={uploading || !file || !date || !time}
                        className="w-full"
                        size="lg"
                    >
                        {uploading ? (
                            'در حال آپلود...'
                        ) : (
                            <>
                                <ImageIcon className="ml-2 h-5 w-5" />
                                آپلود و افزودن به گالری
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* لیست تصاویر */}
            <Card>
                <CardHeader>
                    <CardTitle>تصاویر گالری ({images.length} عکس)</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8">در حال بارگذاری...</p>
                    ) : images.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">هنوز عکسی در گالری اضافه نشده است.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>پیش‌نمایش</TableHead>
                                    <TableHead>تاریخ</TableHead>
                                    <TableHead>ساعت</TableHead>
                                    <TableHead>کپشن</TableHead>
                                    <TableHead className="text-center">عملیات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {images.map((img) => (
                                    <TableRow key={img.id}>
                                        <TableCell>
                                            <img
                                                src={img.image_url}
                                                alt={img.caption || 'گالری'}
                                                className="h-24 w-40 object-cover rounded-lg shadow"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{img.event_date}</TableCell>
                                        <TableCell>{img.event_time?.slice(0, 5)}</TableCell>
                                        <TableCell>{img.caption || '—'}</TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDelete(img.id, img.image_url)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminGallery;