import { useState, useEffect } from 'react';
import { Clock, MapPin, User, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface ScheduleItem {
  id: string;
  title: string;
  time_slot: string;
  description: string | null;
  day_number: number;
  day_title: string;
  course_id: string | null;
}

interface DaySchedule {
  day_number: number;
  day_title: string;
  items: ScheduleItem[];
}

const Schedule = () => {
  const [activeDay, setActiveDay] = useState(1);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('time_slot', { ascending: true });

    if (!error && data) {
      setSchedules(data);
    }
    setLoading(false);
  };

  // Get unique days
  const days = [...new Map(schedules.map(s => [s.day_number, { day_number: s.day_number, day_title: s.day_title }])).values()]
    .sort((a, b) => a.day_number - b.day_number);

  const getSchedulesByDay = (dayNumber: number) => {
    return schedules.filter(s => s.day_number === dayNumber);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </Layout>
    );
  }

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
              برنامه کامل رویداد میکروالکترونیک
            </p>
          </div>

          {schedules.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">هنوز برنامه‌ای اضافه نشده است</p>
          ) : (
            <>
              {/* Day Tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {days.map((day) => (
                  <Button
                    key={day.day_number}
                    variant={activeDay === day.day_number ? 'default' : 'outline'}
                    onClick={() => setActiveDay(day.day_number)}
                    className="gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>{day.day_title}</span>
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
                    {getSchedulesByDay(activeDay).map((item, index) => (
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
                            <span className="text-xl font-bold text-primary">{item.time_slot}</span>
                            <Badge variant="secondary">برنامه</Badge>
                          </div>

                          <h3 className="text-lg font-semibold mb-3">{item.title}</h3>

                          {item.description && (
                            <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                          )}

                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {item.time_slot}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Schedule;
