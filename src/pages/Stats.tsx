import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Users, FileText, Calendar, BookOpen, Video, GraduationCap, Handshake, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatsData {
  totalUsers: number;
  totalProposals: number;
  totalWorkshops: number;
  totalWebinars: number;
  totalTrainings: number;
  upcomingSchedules: number;
  partnerCount: number;
  totalReservations: number;
  topUniversities: { name: string; count: number }[];
  topProvinces: { name: string; count: number }[];
}

const StatCard = ({ icon: Icon, label, value, color, delay }: {
  icon: any; label: string; value: number; color: string; delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="relative overflow-hidden border-none shadow-lg hover:shadow-xl transition-shadow">
      <div className={`absolute inset-0 opacity-10 ${color}`} />
      <CardContent className="p-6 flex items-center gap-4 relative z-10">
        <div className={`p-3 rounded-xl ${color} text-white`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-right flex-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold text-foreground">{value.toLocaleString('fa-IR')}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

const BarChart = ({ data, title, color }: {
  data: { name: string; count: number }[]; title: string; color: string;
}) => {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <Card className="border-none shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-4">داده‌ای موجود نیست</p>
        ) : (
          data.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 + 0.3 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm text-muted-foreground w-28 truncate text-right flex-shrink-0">
                {item.name}
              </span>
              <div className="flex-1 h-7 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(item.count / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.05 + 0.5 }}
                  className={`h-full rounded-full ${color} flex items-center justify-end px-2`}
                >
                  <span className="text-xs font-bold text-white">
                    {item.count.toLocaleString('fa-IR')}
                  </span>
                </motion.div>
              </div>
            </motion.div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const Stats = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('public-stats');
        if (error) throw error;
        setStats(data);
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-foreground text-xl animate-pulse">در حال بارگذاری آمار...</div>
        </div>
      </Layout>
    );
  }

  if (!stats) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-destructive text-xl">خطا در دریافت آمار</div>
        </div>
      </Layout>
    );
  }

  const mainStats = [
    { icon: Calendar, label: 'برنامه‌های پیش رو', value: stats.upcomingSchedules, color: 'bg-primary' },
    { icon: Handshake, label: 'انجمن‌های همکار', value: stats.partnerCount, color: 'bg-secondary' },
    { icon: FileText, label: 'تعداد پروپوزال', value: stats.totalProposals, color: 'bg-accent' },
    { icon: Users, label: 'تعداد افراد', value: stats.totalUsers, color: 'bg-primary' },
    { icon: BookOpen, label: 'کارگاه‌های برگزار شده', value: stats.totalWorkshops, color: 'bg-secondary' },
    { icon: Video, label: 'وبینارهای برگزار شده', value: stats.totalWebinars, color: 'bg-accent' },
    { icon: GraduationCap, label: 'دوره‌های آموزشی', value: stats.totalTrainings, color: 'bg-primary' },
    { icon: ShoppingCart, label: 'میزان رزرو دوره‌ها', value: stats.totalReservations, color: 'bg-secondary' },
  ];

  return (
    <Layout>
      <section className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-3"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              آمار رویداد
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              نگاهی به آمار و ارقام رویداد جوانه ثریا
            </p>
          </motion.div>

          {/* Main stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mainStats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.08} />
            ))}
          </div>

          {/* Distribution charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BarChart
              data={stats.topUniversities}
              title="جامعه آماری دانشگاهی"
              color="bg-primary"
            />
            <BarChart
              data={stats.topProvinces}
              title="جامعه آماری استانی"
              color="bg-secondary"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Stats;
