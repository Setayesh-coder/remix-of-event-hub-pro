import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Image, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';

interface GalleryImage {
    id: string;
    image_url: string;
    title: string | null;
    category: string | null;
    event_date: string | null;
    event_time: string | null;
}

const AdminGallery = () => {
    const navigate = useNavigate();
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [newImage, setNewImage] = useState({
        title: '',
        category: '',
        event_date: '',
        event_time: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        const { data, error } = await supabase
            .from('gallery_images')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: 'خطا', description: 'خطا در دریافت تصاویر', variant: 'destructive' });
        } else {
            setImages(data || []);
        }
        setLoading(false);
    };

    const handleUpload = async () => {
        if (!imageFile) {
            toast({ title: 'خطا', description: 'لطفاً یک تصویر انتخاب کنید', variant: 'destructive' });
            return;
        }

        setUploading(true);
        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `gallery-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('admin-uploads')
                .upload(fileName, imageFile);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('admin-uploads')
                .getPublicUrl(fileName);

            const { error: insertError } = await supabase
                .from('gallery_images')
                .insert({
                    image_url: publicUrl,
                    title: newImage.title || null,
                    category: newImage.category || null,
                    event_date: newImage.event_date || null,
                    event_time: newImage.event_time || null,
                });

            if (insertError) throw insertError;

            toast({ title: 'موفق', description: 'تصویر اضافه شد' });
            setDialogOpen(false);
            setNewImage({ title: '', category: '', event_date: '', event_time: '' });
            setImageFile(null);
            fetchImages();
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در آپلود تصویر', variant: 'destructive' });
        }
        setUploading(false);
    };

    const handleDelete = async (id: string, imageUrl: string) => {
        if (!confirm('آیا از حذف این تصویر مطمئن هستید؟')) return;

        try {
            // Delete from storage
            const fileName = imageUrl.split('/').pop();
            if (fileName) {
                await supabase.storage.from('admin-uploads').remove([fileName]);
            }

            // Delete from database
            const { error } = await supabase.from('gallery_images').delete().eq('id', id);
            if (error) throw error;

            toast({ title: 'موفق', description: 'تصویر حذف شد' });
            fetchImages();
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در حذف تصویر', variant: 'destructive' });
        }
    };

    if (loading) {
        return <div className="p-6 text-center">در حال بارگذاری...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    بازگشت
                </Button>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            افزودن تصویر
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>افزودن تصویر جدید</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>تصویر</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>عنوان</Label>
                                <Input
                                    value={newImage.title}
                                    onChange={(e) => setNewImage(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="عنوان تصویر"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>دسته‌بندی</Label>
                                <Input
                                    value={newImage.category}
                                    onChange={(e) => setNewImage(prev => ({ ...prev, category: e.target.value }))}
                                    placeholder="مثلاً: کارگاه، رویداد"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>تاریخ رویداد</Label>
                                    <Input
                                        type="date"
                                        value={newImage.event_date}
                                        onChange={(e) => setNewImage(prev => ({ ...prev, event_date: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>ساعت رویداد</Label>
                                    <Input
                                        type="time"
                                        value={newImage.event_time}
                                        onChange={(e) => setNewImage(prev => ({ ...prev, event_time: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <Button onClick={handleUpload} disabled={uploading} className="w-full">
                                {uploading ? 'در حال آپلود...' : 'افزودن'}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Image className="h-6 w-6" />
                        مدیریت گالری ({images.length} تصویر)
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {images.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">هنوز تصویری اضافه نشده است</p>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.map((image) => (
                                <div key={image.id} className="relative group rounded-lg overflow-hidden">
                                    <img
                                        src={image.image_url}
                                        alt={image.title || 'تصویر گالری'}
                                        className="w-full aspect-square object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                                        <p className="text-white text-sm text-center">{image.title}</p>
                                        <p className="text-white/70 text-xs">{image.category}</p>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleDelete(image.id, image.image_url)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminGallery;
