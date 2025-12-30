import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2, Edit, Image as ImageIcon, Save, X } from 'lucide-react';

type Course = {
    id: number;
    type: 'course' | 'workshop' | 'webinar';
    title: string;
    description: string | null;
    poster_url: string | null;
    duration: string | null;
    instructor: string;
    price: number;
    skyroom_link: string | null;
};

const AdminCourses = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [uploading, setUploading] = useState(false);

    // فرم برای اضافه/ویرایش
    const [form, setForm] = useState<Partial<Course>>({
        type: 'course',
        title: '',
        description: '',
        duration: '',
        instructor: '',
        price: 0,
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
            alert('خطا در بارگذاری دوره‌ها: ' + error.message);
            setCourses([]);
        } else {
            setCourses(data || []);
        }
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!form.title || !form.instructor) {
            alert('عنوان و نام مدرس الزامی است');
            return;
        }

        let posterUrl = form.poster_url;

        // آپلود پوستر اگر فایل جدید انتخاب شده
        if (posterFile) {
            setUploading(true);
            const fileExt = posterFile.name.split('.').pop();
            const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `courses/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, posterFile);

            if (uploadError) {
                alert('خطا در آپلود پوستر: ' + uploadError.message);
                setUploading(false);
                return;
            }

            const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);
            posterUrl = urlData.publicUrl;
        }

        // اضافه یا ویرایش
        if (editingId) {
            // ویرایش
            const { error } = await supabase
                .from('courses')
                .update({
                    ...form,
                    poster_url: posterUrl,
                    skyroom_link: form.type === 'webinar' ? form.skyroom_link : null,
                })
                .eq('id', editingId);

            if (error) {
                alert('خطا در ویرایش: ' + error.message);
            } else {
                alert('دوره با موفقیت ویرایش شد');
                resetForm();
                fetchCourses();
            }
        } else {
            // اضافه جدید
            const { error } = await supabase.from('courses').insert({
                type: form.type,
                title: form.title,
                description: form.description,
                poster_url: posterUrl,
                duration: form.duration,
                instructor: form.instructor,
                price: form.price || 0,
                skyroom_link: form.type === 'webinar' ? form.skyroom_link : null,
            });

            if (error) {
                alert('خطا در افزودن: ' + error.message);
            } else {
                alert('دوره جدید با موفقیت اضافه شد! 🎉');
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
            type: 'course',
            title: '',
            description: '',
            duration: '',
            instructor: '',
            price: 0,
            skyroom_link: '',
        });
        setPosterFile(null);
    };

    const handleDelete = async (id: number) => {
        if (!confirm('مطمئنید که می‌خواهید این دوره را حذف کنید؟')) return;

        const { error } = await supabase.from('courses').delete().eq('id', id);
        if (error) {
            alert('خطا در حذف: ' + error.message);
        } else {
            alert('دوره حذف شد');
            fetchCourses();
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* فرم اضافه/ویرایش دوره */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ImageIcon className="h-6 w-6" />
                        {editingId ? 'ویرایش دوره' : 'افزودن دوره جدید'}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>نوع دوره</Label>
                            <Select
                                value={form.type}
                                onValueChange={(value: any) => setForm({ ...form, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="course">دوره جامع</SelectItem>
                                    <SelectItem value="workshop">کارگاه</SelectItem>
                                    <SelectItem value="webinar">وبینار</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="title">عنوان دوره</Label>
                            <Input
                                id="title"
                                value={form.title || ''}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="مثلاً: آموزش پیشرفته ری‌اکت"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="desc">توضیحات</Label>
                        <Textarea
                            id="desc"
                            value={form.description || ''}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={4}
                            placeholder="توضیح کامل درباره دوره..."
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="duration">مدت زمان</Label>
                            <Input
                                id="duration"
                                value={form.duration || ''}
                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                placeholder="مثلاً: ۱۰ ساعت"
                            />
                        </div>
                        <div>
                            <Label htmlFor="instructor">نام مدرس</Label>
                            <Input
                                id="instructor"
                                value={form.instructor || ''}
                                onChange={(e) => setForm({ ...form, instructor: e.target.value })}
                            />
                        </div>
                        <div>
                            <Label htmlFor="price">قیمت (تومان)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={form.price || 0}
                                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    {form.type === 'webinar' && (
                        <div>
                            <Label htmlFor="skyroom">لینک اسکای‌روم</Label>
                            <Input
                                id="skyroom"
                                value={form.skyroom_link || ''}
                                onChange={(e) => setForm({ ...form, skyroom_link: e.target.value })}
                                placeholder="https://www.skyroom.online/..."
                            />
                        </div>
                    )}

                    <div>
                        <Label>پوستر دوره</Label>
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPosterFile(e.target.files?.[0] || null)}
                            disabled={uploading}
                        />
                        {posterFile && <p className="text-sm text-green-600 mt-1">فایل جدید: {posterFile.name}</p>}
                        {form.poster_url && !posterFile && (
                            <img src={form.poster_url} alt="پوستر فعلی" className="mt-4 max-h-64 rounded-lg shadow" />
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

            {/* لیست دوره‌ها */}
            <Card>
                <CardHeader>
                    <CardTitle>لیست دوره‌ها ({courses.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8">در حال بارگذاری...</p>
                    ) : courses.length === 0 ? (
                        <p className="text-center py-8 text-gray-500">هنوز دوره‌ای اضافه نشده است.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>پوستر</TableHead>
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
                                            {course.poster_url ? (
                                                <img src={course.poster_url} alt={course.title} className="h-20 w-32 object-cover rounded" />
                                            ) : (
                                                <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-20" />
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                                                {course.type === 'course' ? 'دوره' : course.type === 'workshop' ? 'کارگاه' : 'وبینار'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-medium">{course.title}</TableCell>
                                        <TableCell>{course.instructor}</TableCell>
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