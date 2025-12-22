import { useState } from 'react';
import { User, Mail, Phone, BookOpen, Settings, LogOut, Edit2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'settings'>('courses');

  // Sample user data
  const user = {
    name: 'علی محمدی',
    email: 'ali@example.com',
    phone: '۰۹۱۲۱۲۳۴۵۶۷',
    avatar: null,
    enrolledCourses: [
      {
        id: 1,
        title: 'طراحی مدار چاپی PCB',
        progress: 75,
        status: 'in-progress',
      },
      {
        id: 2,
        title: 'میکروکنترلر ARM',
        progress: 100,
        status: 'completed',
      },
      {
        id: 3,
        title: 'IoT و اینترنت اشیا',
        progress: 30,
        status: 'in-progress',
      },
    ],
  };

  const tabs = [
    { id: 'courses', label: 'دوره‌های من', icon: BookOpen },
    { id: 'settings', label: 'تنظیمات', icon: Settings },
  ] as const;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-primary/20 text-primary border-primary/30">تکمیل شده</Badge>;
      case 'in-progress':
        return <Badge variant="secondary">در حال یادگیری</Badge>;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="gradient-border rounded-2xl p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow">
                    <User className="w-12 h-12 sm:w-16 sm:h-16 text-primary-foreground" />
                  </div>
                  <button className="absolute bottom-0 left-0 w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-right space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">{user.name}</h1>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-muted-foreground">
                    <span className="flex items-center justify-center sm:justify-start gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </span>
                    <span className="flex items-center justify-center sm:justify-start gap-2">
                      <Phone className="w-4 h-4" />
                      {user.phone}
                    </span>
                  </div>
                </div>

                {/* Logout */}
                <Button variant="outline" className="gap-2">
                  <LogOut className="w-4 h-4" />
                  خروج
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? 'default' : 'outline'}
                  onClick={() => setActiveTab(tab.id)}
                  className="gap-2 shrink-0"
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Content */}
            {activeTab === 'courses' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold mb-4">دوره‌های ثبت نام شده</h2>
                {user.enrolledCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className="gradient-border rounded-xl p-5 hover:glow transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{course.title}</h3>
                          {getStatusBadge(course.status)}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden max-w-xs">
                            <div
                              className="h-full bg-gradient-to-l from-primary to-accent transition-all duration-500"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {course.progress}٪
                          </span>
                        </div>
                      </div>
                      <Button variant="neon" size="sm">
                        ادامه یادگیری
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="gradient-border rounded-xl p-6 space-y-6">
                <h2 className="text-xl font-semibold mb-4">تنظیمات حساب کاربری</h2>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">نام و نام خانوادگی</label>
                    <input
                      type="text"
                      defaultValue={user.name}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">ایمیل</label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-muted-foreground">شماره تماس</label>
                    <input
                      type="tel"
                      defaultValue={user.phone}
                      className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
                    />
                  </div>

                  <div className="pt-4">
                    <Button variant="gradient" className="w-full sm:w-auto">
                      ذخیره تغییرات
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
