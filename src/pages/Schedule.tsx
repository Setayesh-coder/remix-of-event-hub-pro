import { useState } from 'react';
import { Clock, MapPin, User, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ScheduleItem {
  id: number;
  title: string;
  time: string;
  duration: string;
  speaker: string;
  location: string;
  type: 'workshop' | 'webinar' | 'keynote' | 'break';
}

interface DaySchedule {
  date: string;
  dayName: string;
  items: ScheduleItem[];
}

const Schedule = () => {
  const [activeDay, setActiveDay] = useState(0);

  const schedule: DaySchedule[] = [
    {
      date: '۱۵ بهمن ۱۴۰۳',
      dayName: 'روز اول',
      items: [
        { id: 1, title: 'افتتاحیه و خوش‌آمدگویی', time: '۰۹:۰۰', duration: '۳۰ دقیقه', speaker: 'دکتر احمدی', location: 'سالن اصلی', type: 'keynote' },
        { id: 2, title: 'کارگاه طراحی PCB - بخش اول', time: '۰۹:۳۰', duration: '۲ ساعت', speaker: 'مهندس رضایی', location: 'کلاس ۱۰۱', type: 'workshop' },
        { id: 3, title: 'استراحت و پذیرایی', time: '۱۱:۳۰', duration: '۳۰ دقیقه', speaker: '', location: 'سالن پذیرایی', type: 'break' },
        { id: 4, title: 'وبینار IoT و کاربردها', time: '۱۲:۰۰', duration: '۱.۵ ساعت', speaker: 'دکتر محمدی', location: 'آنلاین', type: 'webinar' },
        { id: 5, title: 'کارگاه میکروکنترلر ARM', time: '۱۴:۰۰', duration: '۳ ساعت', speaker: 'مهندس کریمی', location: 'کلاس ۱۰۲', type: 'workshop' },
      ],
    },
    {
      date: '۱۶ بهمن ۱۴۰۳',
      dayName: 'روز دوم',
      items: [
        { id: 6, title: 'کارگاه FPGA - مقدماتی', time: '۰۹:۰۰', duration: '۲ ساعت', speaker: 'دکتر حسینی', location: 'کلاس ۱۰۱', type: 'workshop' },
        { id: 7, title: 'وبینار الکترونیک قدرت', time: '۱۱:۰۰', duration: '۱ ساعت', speaker: 'مهندس علوی', location: 'آنلاین', type: 'webinar' },
        { id: 8, title: 'ناهار', time: '۱۲:۰۰', duration: '۱ ساعت', speaker: '', location: 'رستوران', type: 'break' },
        { id: 9, title: 'پنل تخصصی صنعت', time: '۱۳:۰۰', duration: '۲ ساعت', speaker: 'پنل کارشناسان', location: 'سالن اصلی', type: 'keynote' },
        { id: 10, title: 'مسابقه رباتیک', time: '۱۵:۰۰', duration: '۳ ساعت', speaker: 'تیم داوری', location: 'سالن ورزشی', type: 'workshop' },
      ],
    },
    {
      date: '۱۷ بهمن ۱۴۰۳',
      dayName: 'روز سوم',
      items: [
        { id: 11, title: 'کارگاه پیشرفته PCB', time: '۰۹:۰۰', duration: '۳ ساعت', speaker: 'مهندس رضایی', location: 'کلاس ۱۰۱', type: 'workshop' },
        { id: 12, title: 'استراحت', time: '۱۲:۰۰', duration: '۳۰ دقیقه', speaker: '', location: 'سالن پذیرایی', type: 'break' },
        { id: 13, title: 'اختتامیه و اهدای جوایز', time: '۱۲:۳۰', duration: '۱.۵ ساعت', speaker: 'کمیته برگزاری', location: 'سالن اصلی', type: 'keynote' },
      ],
    },
  ];

  const getTypeBadge = (type: ScheduleItem['type']) => {
    switch (type) {
      case 'workshop':
        return <Badge className="bg-primary/20 text-primary border-primary/30">کارگاه</Badge>;
      case 'webinar':
        return <Badge className="bg-accent/20 text-accent border-accent/30">وبینار</Badge>;
      case 'keynote':
        return <Badge variant="secondary">سخنرانی</Badge>;
      case 'break':
        return <Badge variant="outline">استراحت</Badge>;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              برنامه‌ها و <span className="gradient-text">زمانبندی</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              برنامه کامل سه روزه رویداد میکروالکترونیک
            </p>
          </div>

          {/* Day Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {schedule.map((day, index) => (
              <Button
                key={index}
                variant={activeDay === index ? 'default' : 'outline'}
                onClick={() => setActiveDay(index)}
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>{day.dayName}</span>
                <span className="hidden sm:inline text-muted-foreground">({day.date})</span>
              </Button>
            ))}
          </div>

          {/* Schedule Timeline */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-0 bottom-0 right-4 sm:right-8 w-px bg-border" />

              {/* Schedule Items */}
              <div className="space-y-6">
                {schedule[activeDay].items.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative pr-12 sm:pr-20 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Timeline Dot */}
                    <div className="absolute right-2 sm:right-6 top-4 w-4 h-4 rounded-full bg-primary glow" />

                    {/* Card */}
                    <div className="gradient-border rounded-xl p-5 hover:glow transition-all duration-300">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <span className="text-xl font-bold text-primary">{item.time}</span>
                        {getTypeBadge(item.type)}
                      </div>

                      <h3 className="text-lg font-semibold mb-3">{item.title}</h3>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {item.duration}
                        </span>
                        {item.speaker && (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {item.speaker}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {item.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
