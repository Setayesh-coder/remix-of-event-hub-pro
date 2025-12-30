import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Trash2, Plus, Calendar } from 'lucide-react';
import { format } from 'date-fns';

type Course = {
    id: number;
    title: string;
    type: string;
};

type ScheduleItem = {
    id: number;
    event_day: string; // YYYY-MM-DD
    time_slot: string; // HH:MM:SS
    course_id: number | null;
    title_override: string | null;
    course?: Course | null;
};

const AdminSchedule = () => {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    // فرم اضافه کردن برنامه جدید
    const [day, setDay] = useState('');
    const [time, setTime] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState<string>('none');
    const [titleOverride, setTitleOverride] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // دریافت دوره‌ها
        const { data: courseData } = await supabase.from('courses').select('id, title, type');
        setCourses(courseData || []);

        // دریافت برنامه‌ها با جوین روی دوره
        const { data, error } = await supabase
            .from('schedules')
            .select('*, course: courses(id, title, type)')
            .order('event_day', { ascending: true })
            .order('time_slot', { ascending: true });

        if (error) {
            alert('خطا در بارگذاری برنامه: ' + error.message);
            setSchedules([]);
        } else {
            setSchedules(
                data?.map((item: any) => ({
                    ...item,
                    course: item.course,
                })) || []
            );
        }
        setLoading(false);
    };

    const handleAdd = async () => {
        if (!day || !time) {
            alert('تاریخ و ساعت را انتخاب کنید');
            return;
        }

        const courseId = selectedCourseId === 'none' ? null : Number(selectedCourseId);

        const { error } = await supabase.from('schedules').insert({
            event_day: day,
            time_slot: time + ':00',
            course_id: courseId,
            title_override: titleOverride || null,
        });

        if (error) {
            alert('خطا در افزودن: ' + error.message);
        } else {
            alert('برنامه با موفقیت اضافه شد!');
            setDay('');
            setTime('');
            setSelectedCourseId('none');
            setTitleOverride('');
            fetchData();
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('مطمئنید که می‌خواهید این برنامه را حذف کنید؟')) return;

        const { error } = await supabase.from('schedules').delete().eq('id', id);
        if (error) {
            alert('خطا در حذف: ' + error.message);
        } else {
            alert('برنامه حذف شد');
            fetchData();
        }
    };

    // گروه‌بندی برنامه‌ها بر اساس روز
    const groupedSchedules = schedules.reduce((acc, item) => {
        if (!acc[item.event_day]) acc[item.event_day] = [];
        acc[item.event_day].push(item);
        return acc;
    }, {} as Record<string, ScheduleItem[]>);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* فرم افزودن برنامه جدید */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Plus className="h-6 w-6" />
                        افزودن برنامه جدید
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <Label>روز رویداد</Label>
                            <Input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
                        </div>
                        <div>
                            <Label>ساعت شروع</Label>
                            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                        </div>
                        <div>
                            <Label>دوره مرتبط</Label>
                            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="انتخاب کنید یا بدون دوره" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">بدون دوره (مثل افتتاحیه)</SelectItem>
                                    {courses.map((c) => (
                                        <SelectItem key={c.id} value={c.id.toString()}>
                                            {c.title} ({c.type === 'webinar' ? 'وبینار' : c.type === 'workshop' ? 'کارگاه' : 'دوره'})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>عنوان دلخواه (اختیاری)</Label>
                            <Input
                                value={titleOverride}
                                onChange={(e) => setTitleOverride(e.target.value)}
                                placeholder="مثلاً: افتتاحیه، استراحت"
                            />
                        </div>
                    </div>
                    <Button onClick={handleAdd} className="mt-6" size="lg">
                        <Calendar className="ml-2 h-5 w-5" />
                        افزودن به برنامه
                    </Button>
                </CardContent>
            </Card>

            {/* نمایش برنامه بر اساس روز */}
            <div className="space-y-8">
                {loading ? (
                    <p className="text-center">در حال بارگذاری برنامه...</p>
                ) : Object.keys(groupedSchedules).length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12 text-gray-500">
                            هنوز برنامه‌ای اضافه نشده است.
                        </CardContent>
                    </Card>
                ) : (
                    Object.entries(groupedSchedules).map(([day, items]) => (
                        <Card key={day}>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    برنامه روز {format(new Date(day), 'dddd d MMMM yyyy', { locale: require('date-fns/locale/fa-IR') })}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ساعت</TableHead>
                                            <TableHead>عنوان</TableHead>
                                            <TableHead>دوره مرتبط</TableHead>
                                            <TableHead className="text-center">عملیات</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.time_slot.slice(0, 5)}</TableCell>
                                                <TableCell>{item.title_override || item.course?.title || '—'}</TableCell>
                                                <TableCell>
                                                    {item.course ? (
                                                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {item.course.title}
                                                        </span>
                                                    ) : (
                                                        '—'
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(item.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminSchedule;