import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Zap, Users } from 'lucide-react';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import heroBg from '@/assets/hero-bg.jpg';

const Index = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Set registration deadline - 30 days from now
  const registrationDeadline = new Date();
  registrationDeadline.setDate(registrationDeadline.getDate() + 30);

  const handleQuickRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to register page with pre-filled data
    navigate('/register', { state: { fullName, phone } });
  };

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
    <div className="min-h-screen">
      {/* Full-screen Hero Section */}
      <section 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-primary/60" />
        
        {/* Floating Navbar */}
        <nav className="absolute top-0 left-0 right-0 z-50 py-6 px-8">
          <div className="container mx-auto flex items-center justify-between">
            {/* Logo/Profile */}
            <Link to="/profile" className="w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/30 hover:bg-primary-foreground/30 transition-colors">
              <Cpu className="w-6 h-6 text-primary-foreground" />
            </Link>
            
            {/* Nav Items */}
            <div className="flex items-center gap-8">
              <Link to="/" className="text-primary-foreground hover:text-accent transition-colors font-medium">خانه</Link>
              <Link to="/gallery" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">رسانه</Link>
              <Link to="/schedule" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">اطلاعیه‌ها</Link>
              <Link to="/courses" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">تماس با ما</Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            {/* Right Side - Event Name & Logo */}
            <div className="text-right space-y-4 animate-fade-in order-1">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-primary-foreground leading-tight">
                رویداد
                <br />
                <span className="text-accent">میکرو</span>الکترونیک
              </h1>
              <div className="text-primary-foreground/60 text-xl md:text-2xl font-light tracking-widest">
                MICROELECTRONICS
                <br />
                EVENT
              </div>
            </div>

            {/* Center - Registration Form */}
            <div className="flex flex-col items-center justify-center space-y-6 order-3 lg:order-2 animate-fade-in" style={{ animationDelay: '200ms' }}>
              <p className="text-primary-foreground/90 text-lg text-center mb-2">
                جهت ثبت نام در رویداد
                <br />
                لطفا موارد را وارد کنید.
              </p>
              
              <form onSubmit={handleQuickRegister} className="w-full max-w-sm space-y-4">
                <Input
                  type="text"
                  placeholder="نام و نام خانوادگی"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 text-center text-lg rounded-xl"
                />
                <Input
                  type="tel"
                  placeholder="شماره تماس"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 bg-primary-foreground/10 backdrop-blur-md border-primary-foreground/30 text-primary-foreground placeholder:text-primary-foreground/50 text-center text-lg rounded-xl"
                />
                <Button 
                  type="submit" 
                  className="w-full h-14 bg-accent hover:bg-accent/90 text-accent-foreground text-lg font-semibold rounded-xl"
                >
                  ثبت نام
                </Button>
              </form>
            </div>

            {/* Left Side - Countdown */}
            <div className="text-left space-y-6 order-2 lg:order-3 animate-fade-in" style={{ animationDelay: '400ms' }}>
              <div className="space-y-2">
                <h2 className="text-primary-foreground/80 text-xl md:text-2xl">
                  مدت زمان باقیمانده
                </h2>
                <h3 className="text-primary-foreground text-2xl md:text-3xl font-bold">
                  فراخوان پژوهشی
                </h3>
              </div>
              <CountdownTimer targetDate={registrationDeadline} variant="hero" />
            </div>
          </div>
        </div>

        {/* Bottom Sponsors Bar */}
        <div className="absolute bottom-0 left-0 right-0 py-6 bg-gradient-to-t from-primary/80 to-transparent">
          <div className="container mx-auto px-8">
            <div className="flex items-center justify-center gap-8 md:gap-16">
              {/* Placeholder sponsor logos */}
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Cpu className="w-8 h-8 text-primary-foreground/60" />
              </div>
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Zap className="w-8 h-8 text-primary-foreground/60" />
              </div>
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Users className="w-8 h-8 text-primary-foreground/60" />
              </div>
              <div className="w-16 h-16 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center">
                <Cpu className="w-8 h-8 text-primary-foreground/60" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">چرا این رویداد؟</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              با شرکت در رویداد میکروالکترونیک، به جمع علاقه‌مندان و متخصصین این حوزه بپیوندید
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="gradient-border p-6 rounded-xl hover:glow transition-all duration-300 animate-fade-in bg-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;