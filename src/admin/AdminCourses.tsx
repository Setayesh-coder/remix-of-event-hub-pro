import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Trash2, Edit, Image as ImageIcon, Save, X, ArrowRight, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Course = {
    id: string;
    category: string;
    title: string;
    description: string | null;
    image_url: string | null;
    duration: string | null;
    instructor: string | null;
    price: number;
    original_price: number | null;
    skyroom_link: string | null;
};

const CATEGORIES = [
    { value: 'workshop', label: 'کارگاه' },
    { value: 'webinar', label: 'وبینار' },
    { value: 'training', label: 'دوره' },
];

const AdminCourses = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const [form, setForm] = useState<Partial<Course>>({
        category: 'workshop',
        title: '',
        description: '',
        duration: '',
        instructor: '',
        price: 0,
        original_price: null,
        skyroom_link: '',
    });
    const [posterFile, setPosterFile] = useState<File | null>(null);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast({ title: 'خطا', description: 'خطا در بارگذاری دوره‌ها', variant: 'destructive' });
            setCourses([]);
        } else {
            setCourses(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!form.title || !form.category) {
            toast({ title: 'خطا', description: 'عنوان و دسته‌بندی الزامی است', variant: 'destructive' });
            return;
        }

        let imageUrl = form.image_url;

        if (posterFile) {
            setUploading(true);
            const fileExt = posterFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `courses/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('admin-uploads')
                .upload(filePath, posterFile);

            if (uploadError) {
                toast({ title: 'خطا', description: 'خطا در آپلود پوستر', variant: 'destructive' });
                setUploading(false);
                return;
            }

            const { data: urlData } = supabase.storage.from('admin-uploads').getPublicUrl(filePath);
            imageUrl = urlData.publicUrl;
        }

        if (editingId) {
            const { error } = await supabase
                .from('courses')
                .update({
                    category: form.category,
                    title: form.title,
                    description: form.description,
                    image_url: imageUrl,
                    duration: form.duration,
                    instructor: form.instructor,
                    price: form.price || 0,
                    original_price: form.original_price,
                    skyroom_link: form.skyroom_link || null,
                })
                .eq('id', editingId);

            if (error) {
                toast({ title: 'خطا', description: 'خطا در ویرایش', variant: 'destructive' });
            } else {
                toast({ title: 'موفق', description: 'دوره با موفقیت ویرایش شد' });
                resetForm();
                fetchCourses();
            }
        } else {
            const { error } = await supabase.from('courses').insert({
                category: form.category,
                title: form.title,
                description: form.description,
                image_url: imageUrl,
                duration: form.duration,
                instructor: form.instructor,
                price: form.price || 0,
                original_price: form.original_price,
                skyroom_link: form.skyroom_link || null,
            });

            if (error) {
                toast({ title: 'خطا', description: 'خطا در افزودن', variant: 'destructive' });
            } else {
                toast({ title: 'موفق', description: 'دوره جدید با موفقیت اضافه شد! 🎉' });
                resetForm();
                fetchCourses();
            }
        }

        setUploading(false);
    };

    const startEdit = (course: Course) => {
        setEditingId(course.id);
        setForm(course);
        setPosterFile(null);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({
            category: 'workshop',
            title: '',
            description: '',
            duration: '',
            instructor: '',
            price: 0,
            original_price: null,
            skyroom_link: '',
        });
        setPosterFile(null);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('مطمئنید که می‌خواهید این دوره را حذف کنید؟')) return;

        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) {
            toast({ title: 'خطا', description: 'خطا در حذف', variant: 'destructive' });
        } else {
            toast({ title: 'موفق', description: 'دوره حذف شد' });
            fetchCourses();
        }
    };

    const getCategoryLabel = (category: string) => {
        return CATEGORIES.find(c => c.value === category)?.label || category;
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    بازگشت
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-6 w-6" />
                        {editingId ? 'ویرایش دوره' : 'افزودن دوره جدید'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>نوع آموزش *</Label>
                            <Select
                                value={form.category || 'workshop'}
                                onValueChange={(value) => setForm({ ...form, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="انتخاب نوع" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORIES.map((cat) => (
                                        <SelectItem key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">عنوان دوره *</Label>
                            <Input
                                id="title"
                                value={form.title || ''}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="مثلاً: آموزش پیشرفته ری‌اکت"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="desc">توضیحات</Label>
                        <Textarea
                            id="desc"
                            value={form.description || ''}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4}
                            placeholder="توضیح کامل درباره دوره..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="duration">مدت زمان</Label>
                            <Input
                                id="duration"
                                value={form.duration || ''}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                placeholder="مثلاً: ۱۰ ساعت"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="instructor">نام مدرس</Label>
                            <Input
                                id="instructor"
                                value={form.instructor || ''}
                                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">قیمت (تومان)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={form.price || 0}
                                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="original_price">قیمت اصلی (اختیاری)</Label>
                            <Input
                                id="original_price"
                                type="number"
                                value={form.original_price || ''}
                                onChange={(e) => setForm({ ...form, original_price: e.target.value ? Number(e.target.value) : null })}
                            />
                        </div>
                    </div>

                    {/* Skyroom Link - only for webinar */}
                    {form.category === 'webinar' && (
                        <div className="space-y-2">
                            <Label htmlFor="skyroom_link" className="flex items-center gap-2">
                                <Video className="h-4 w-4" />
                                لینک اسکای‌روم
                            </Label>
                            <Input
                                id="skyroom_link"
                                value={form.skyroom_link || ''}
                                onChange={(e) => setForm({ ...form, skyroom_link: e.target.value })}
                                placeholder="https://www.skyroom.online/..."
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>تصویر دوره (پوستر)</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                            disabled={uploading}
                        />
                        {posterFile && <p className="text-sm text-green-600 mt-1">فایل جدید: {posterFile.name}</p>}
                        {form.image_url && !posterFile && (
                            <img src={form.image_url} alt="پوستر فعلی" className="mt-4 max-h-64 rounded-lg shadow" />
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button onClick={handleSubmit} disabled={uploading} size="lg">
                            <Save className="ml-2 h-5 w-5" />
                            {editingId ? 'ذخیره تغییرات' : 'افزودن دوره'}
                        </Button>
                        {editingId && (
                            <Button variant="outline" onClick={resetForm}>
                                <X className="ml-2 h-4 w-4" />
                                لغو ویرایش
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>لیست دوره‌ها ({courses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8">در حال بارگذاری...</p>
                    ) : courses.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">هنوز دوره‌ای اضافه نشده است.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>تصویر</TableHead>
                                    <TableHead>نوع</TableHead>
                                    <TableHead>عنوان</TableHead>
                                    <TableHead>مدرس</TableHead>
                                    <TableHead>قیمت</TableHead>
                                    <TableHead className="text-center">عملیات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {courses.map((course) => (
                                    <TableRow key={course.id}>
                                        <TableCell>
                                            {course.image_url ? (
                                                <img src={course.image_url} alt={course.title} className="h-20 w-32 object-cover rounded" />
                                            ) : (
                                                <div className="bg-muted border-2 border-dashed rounded-xl w-32 h-20" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                                                {getCategoryLabel(course.category)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell>{course.instructor || '-'}</TableCell>
                                        <TableCell>{course.price === 0 ? 'رایگان' : `${course.price.toLocaleString()} تومان`}</TableCell>
                                        <TableCell className="text-center space-x-2">
                                            <Button size="sm" onClick={() => startEdit(course)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button size="sm" variant="destructive" onClick={() => handleDelete(course.id)}>
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

export default AdminCourses;
