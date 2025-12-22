import { Link } from 'react-router-dom';
import { ArrowLeft, Cpu, Zap, Users } from 'lucide-react';
import Layout from '@/components/Layout';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';

const Index = () => {
  // Set registration deadline - 30 days from now
  const registrationDeadline = new Date();
  registrationDeadline.setDate(registrationDeadline.getDate() + 30);

  const features = [
    {
      icon: Cpu,
      title: 'کارگاه‌های تخصصی',
      description: 'آموزش عملی با تجهیزات پیشرفته',
    },
    {
      icon: Zap,
      title: 'وبینارهای آنلاین',
      description: 'دسترسی از هر نقطه از جهان',
    },
    {
      icon: Users,
      title: 'اساتید برجسته',
      description: 'یادگیری از متخصصین صنعت',
    },
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden circuit-pattern">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border animate-fade-in">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-muted-foreground">ثبت نام آغاز شد</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight animate-fade-in" style={{ animationDelay: '100ms' }}>
              رویداد
              <span className="gradient-text block">میکروالکترونیک</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '200ms' }}>
              فرصتی استثنایی برای یادگیری جدیدترین تکنولوژی‌های الکترونیک و شبکه‌سازی با متخصصین صنعت
            </p>

            {/* Poster Placeholder */}
            <div className="relative max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '300ms' }}>
              <div className="aspect-[3/4] sm:aspect-video rounded-2xl gradient-border overflow-hidden glow">
                <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <div className="text-center p-8">
                    <Cpu className="w-16 h-16 mx-auto mb-4 text-primary animate-float" />
                    <p className="text-muted-foreground">پوستر رویداد</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">تصویر خود را اینجا قرار دهید</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Countdown */}
            <div className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <h2 className="text-lg text-muted-foreground">زمان باقی‌مانده تا پایان ثبت نام</h2>
              <div className="flex justify-center">
                <CountdownTimer targetDate={registrationDeadline} />
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '500ms' }}>
              <Button variant="gradient" size="xl" asChild>
                <Link to="/register" className="gap-2">
                  ثبت نام کنید
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/courses">مشاهده دوره‌ها</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">چرا این رویداد؟</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              با شرکت در رویداد میکروالکترونیک، به جمع علاقه‌مندان و متخصصین این حوزه بپیوندید
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="gradient-border p-6 rounded-xl hover:glow transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
