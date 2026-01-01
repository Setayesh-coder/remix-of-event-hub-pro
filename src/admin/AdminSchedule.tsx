import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Calendar, Plus, Trash2, Edit, ArrowRight, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Schedule {
    id: string;
    day_number: number;
    day_title: string;
    time_slot: string;
    course_id: string | null;
    title: string;
    description: string | null;
}

interface Course {
    id: string;
    title: string;
}

const emptySchedule = {
    day_number: 1,
    day_title: 'روز اول',
    time_slot: '',
    course_id: null as string | null,
    title: '',
    description: '',
};

const AdminSchedule = () => {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [formData, setFormData] = useState(emptySchedule);
    const [activeDay, setActiveDay] = useState('1');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [schedulesRes, coursesRes] = await Promise.all([
            supabase.from('schedules').select('*').order('time_slot', { ascending: true }),
            supabase.from('courses').select('id, title'),
        ]);

        if (schedulesRes.error) {
            toast({ title: 'خطا', description: 'خطا در دریافت برنامه‌ها', variant: 'destructive' });
        } else {
            setSchedules(schedulesRes.data || []);
        }

        if (coursesRes.data) {
            setCourses(coursesRes.data);
        }

        setLoading(false);
    };

    const openAddDialog = (dayNumber: number) => {
        setEditingSchedule(null);
        setFormData({
            ...emptySchedule,
            day_number: dayNumber,
            day_title: getDayTitle(dayNumber),
        });
        setDialogOpen(true);
    };

    const openEditDialog = (schedule: Schedule) => {
        setEditingSchedule(schedule);
        setFormData({
            day_number: schedule.day_number,
            day_title: schedule.day_title,
            time_slot: schedule.time_slot,
            course_id: schedule.course_id,
            title: schedule.title,
            description: schedule.description || '',
        });
        setDialogOpen(true);
    };

    const getDayTitle = (dayNumber: number) => {
        switch (dayNumber) {
            case 1: return 'روز اول';
            case 2: return 'روز دوم';
            case 3: return 'روز سوم';
            default: return '';
        }
    };

    const handleSave = async () => {
        if (!formData.title || !formData.time_slot) {
            toast({ title: 'خطا', description: 'عنوان و ساعت الزامی است', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            const scheduleData = {
                day_number: formData.day_number,
                day_title: formData.day_title,
                time_slot: formData.time_slot,
                course_id: formData.course_id || null,
                title: formData.title,
                description: formData.description || null,
            };

            if (editingSchedule) {
                const { error } = await supabase
                    .from('schedules')
                    .update(scheduleData)
                    .eq('id', editingSchedule.id);
                if (error) throw error;
                toast({ title: 'موفق', description: 'برنامه ویرایش شد' });
            } else {
                const { error } = await supabase.from('schedules').insert(scheduleData);
                if (error) throw error;
                toast({ title: 'موفق', description: 'برنامه اضافه شد' });
            }

            setDialogOpen(false);
            fetchData();
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در ذخیره برنامه', variant: 'destructive' });
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('آیا از حذف این برنامه مطمئن هستید؟')) return;

        const { error } = await supabase.from('schedules').delete().eq('id', id);
        if (error) {
            toast({ title: 'خطا', description: 'خطا در حذف برنامه', variant: 'destructive' });
        } else {
            toast({ title: 'موفق', description: 'برنامه حذف شد' });
            fetchData();
        }
    };

    const getSchedulesByDay = (dayNumber: number) => {
        return schedules.filter(s => s.day_number === dayNumber);
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
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        مدیریت برنامه‌ها
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeDay} onValueChange={setActiveDay}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="1">روز اول</TabsTrigger>
                            <TabsTrigger value="2">روز دوم</TabsTrigger>
                            <TabsTrigger value="3">روز سوم</TabsTrigger>
                        </TabsList>

                        {[1, 2, 3].map((dayNumber) => (
                            <TabsContent key={dayNumber} value={String(dayNumber)} className="space-y-4">
                                <div className="flex justify-end">
                                    <Button onClick={() => openAddDialog(dayNumber)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        افزودن برنامه
                                    </Button>
                                </div>

                                {getSchedulesByDay(dayNumber).length === 0 ? (
                                    <p className="text-center text-muted-foreground py-8">
                                        هنوز برنامه‌ای برای این روز اضافه نشده است
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {getSchedulesByDay(dayNumber).map((schedule) => (
                                            <div
                                                key={schedule.id}
                                                className="flex items-center justify-between p-4 border rounded-lg"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-bold text-primary min-w-[60px]">
                                                        {schedule.time_slot}
                                                    </span>
                                                    <div>
                                                        <h4 className="font-medium">{schedule.title}</h4>
                                                        {schedule.description && (
                                                            <p className="text-sm text-muted-foreground">
                                                                {schedule.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(schedule)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => handleDelete(schedule.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingSchedule ? 'ویرایش برنامه' : 'افزودن برنامه جدید'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>روز</Label>
                                <Select
                                    value={String(formData.day_number)}
                                    onValueChange={(value) => setFormData(prev => ({ 
                                        ...prev, 
                                        day_number: parseInt(value),
                                        day_title: getDayTitle(parseInt(value))
                                    }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">روز اول</SelectItem>
                                        <SelectItem value="2">روز دوم</SelectItem>
                                        <SelectItem value="3">روز سوم</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>ساعت *</Label>
                                <Input
                                    value={formData.time_slot}
                                    onChange={(e) => setFormData(prev => ({ ...prev, time_slot: e.target.value }))}
                                    placeholder="مثلاً: ۰۹:۰۰"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>عنوان *</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="عنوان برنامه"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>توضیحات</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="توضیحات (اختیاری)"
                                rows={2}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>دوره مرتبط (اختیاری)</Label>
                            <Select
                                value={formData.course_id || 'none'}
                                onValueChange={(value) => setFormData(prev => ({ 
                                    ...prev, 
                                    course_id: value === 'none' ? null : value 
                                }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="انتخاب دوره" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">بدون دوره</SelectItem>
                                    {courses.map((course) => (
                                        <SelectItem key={course.id} value={course.id}>
                                            {course.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                            <Save className="h-4 w-4" />
                            {saving ? 'در حال ذخیره...' : 'ذخیره'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminSchedule;
