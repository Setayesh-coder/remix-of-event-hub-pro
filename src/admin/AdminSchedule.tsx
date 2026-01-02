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

interface DayConfig {
    day_number: number;
    day_title: string;
}

const AdminSchedule = () => {
    const navigate = useNavigate();
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
    const [activeDay, setActiveDay] = useState('1');
    
    // Days management
    const [days, setDays] = useState<DayConfig[]>([
        { day_number: 1, day_title: 'روز اول' },
        { day_number: 2, day_title: 'روز دوم' },
        { day_number: 3, day_title: 'روز سوم' },
    ]);
    const [newDayTitle, setNewDayTitle] = useState('');
    const [dayDialogOpen, setDayDialogOpen] = useState(false);
    
    const [formData, setFormData] = useState({
        day_number: 1,
        day_title: 'روز اول',
        time_slot: '',
        course_id: null as string | null,
        title: '',
        description: '',
    });

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
            
            // Extract unique days from schedules
            const uniqueDays = [...new Map(
                (schedulesRes.data || []).map(s => [s.day_number, { day_number: s.day_number, day_title: s.day_title }])
            ).values()].sort((a, b) => a.day_number - b.day_number);
            
            if (uniqueDays.length > 0) {
                setDays(uniqueDays);
            }
        }

        if (coursesRes.data) {
            setCourses(coursesRes.data);
        }

        setLoading(false);
    };

    const addNewDay = () => {
        if (!newDayTitle.trim()) {
            toast({ title: 'خطا', description: 'عنوان روز الزامی است', variant: 'destructive' });
            return;
        }
        
        const newDayNumber = Math.max(...days.map(d => d.day_number), 0) + 1;
        setDays([...days, { day_number: newDayNumber, day_title: newDayTitle }]);
        setNewDayTitle('');
        setDayDialogOpen(false);
        toast({ title: 'موفق', description: 'روز جدید اضافه شد' });
    };

    const deleteDay = (dayNumber: number) => {
        const daySchedules = schedules.filter(s => s.day_number === dayNumber);
        if (daySchedules.length > 0) {
            if (!confirm('این روز دارای برنامه است. آیا از حذف مطمئنید؟')) return;
            
            // Delete all schedules for this day
            daySchedules.forEach(async (s) => {
                await supabase.from('schedules').delete().eq('id', s.id);
            });
        }
        
        setDays(days.filter(d => d.day_number !== dayNumber));
        if (activeDay === String(dayNumber)) {
            setActiveDay('1');
        }
        toast({ title: 'موفق', description: 'روز حذف شد' });
        fetchData();
    };

    const openAddDialog = (dayNumber: number) => {
        const day = days.find(d => d.day_number === dayNumber);
        setEditingSchedule(null);
        setFormData({
            day_number: dayNumber,
            day_title: day?.day_title || '',
            time_slot: '',
            course_id: null,
            title: '',
            description: '',
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
                
                <Button onClick={() => setDayDialogOpen(true)} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />
                    افزودن روز جدید
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
                    {days.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">هنوز روزی اضافه نشده است</p>
                    ) : (
                        <Tabs value={activeDay} onValueChange={setActiveDay}>
                            <div className="flex items-center gap-2 mb-4 flex-wrap">
                                <TabsList className="flex-wrap h-auto">
                                    {days.map((day) => (
                                        <TabsTrigger key={day.day_number} value={String(day.day_number)}>
                                            {day.day_title}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            {days.map((day) => (
                                <TabsContent key={day.day_number} value={String(day.day_number)} className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">{day.day_title}</h3>
                                        <div className="flex gap-2">
                                            <Button onClick={() => openAddDialog(day.day_number)} className="gap-2">
                                                <Plus className="h-4 w-4" />
                                                افزودن برنامه
                                            </Button>
                                            {days.length > 1 && (
                                                <Button 
                                                    variant="destructive" 
                                                    size="sm"
                                                    onClick={() => deleteDay(day.day_number)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {getSchedulesByDay(day.day_number).length === 0 ? (
                                        <p className="text-center text-muted-foreground py-8">
                                            هنوز برنامه‌ای برای این روز اضافه نشده است
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {getSchedulesByDay(day.day_number).map((schedule) => (
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
                    )}
                </CardContent>
            </Card>

            {/* Add Day Dialog */}
            <Dialog open={dayDialogOpen} onOpenChange={setDayDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>افزودن روز جدید</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>عنوان روز *</Label>
                            <Input
                                value={newDayTitle}
                                onChange={(e) => setNewDayTitle(e.target.value)}
                                placeholder="مثلاً: روز چهارم"
                            />
                        </div>
                        <Button onClick={addNewDay} className="w-full">
                            افزودن روز
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Add/Edit Schedule Dialog */}
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
                                    onValueChange={(value) => {
                                        const day = days.find(d => d.day_number === parseInt(value));
                                        setFormData(prev => ({ 
                                            ...prev, 
                                            day_number: parseInt(value),
                                            day_title: day?.day_title || ''
                                        }));
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {days.map((day) => (
                                            <SelectItem key={day.day_number} value={String(day.day_number)}>
                                                {day.day_title}
                                            </SelectItem>
                                        ))}
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
