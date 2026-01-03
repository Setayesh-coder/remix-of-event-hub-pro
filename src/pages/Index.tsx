import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/liquidglass';
import { supabase } from '@/integrations/supabase/client';

interface SiteSettings {
  hero_title: string;
  hero_description: string;
  hero_background: string;
  countdown_target: string;
  logos: string[];
}

const Index = () => {
  const [settings, setSettings] = useState<SiteSettings>({
    hero_title: 'جوانه ثریا',
    hero_description: 'JAVANEH SORAYA PROBLEM DRIVEN EVENT',
    hero_background: 'https://wallpaperswide.com/download/breathtaking_nature-wallpaper-1920x1080.jpg',
    countdown_target: '2026-01-15T23:59:59',
    logos: ['/images/logos/logo1.png', '/images/logos/logo2.png', '/images/logos/logo3.png', '/images/logos/logo4.png'],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value');

    if (data) {
      const settingsMap: Record<string, string> = {};
      data.forEach(item => {
        settingsMap[item.key] = item.value || '';
      });

      setSettings(prev => ({
        hero_title: settingsMap.hero_title || prev.hero_title,
        hero_description: settingsMap.hero_description || prev.hero_description,
        hero_background: settingsMap.hero_background || prev.hero_background,
        countdown_target: settingsMap.countdown_target || prev.countdown_target,
        logos: settingsMap.logos ? JSON.parse(settingsMap.logos) : prev.logos,
      }));
    }
    setLoading(false);
  };

  const registrationDeadline = new Date(settings.countdown_target);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">در حال بارگذاری...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image + Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('${settings.hero_background}')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="relative z-10 w-full h-full flex flex-col justify-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col items-center justify-center gap-4 md:gap-6 lg:gap-8 max-w-7xl mx-auto">

              <div className="text-center space-y-3 md:space-y-5 lg:space-y-6 max-w-xl">
                {/* عنوان اصلی */}
                <div className="space-y-2 md:space-y-4">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white tracking-wider opacity-90 leading-tight">
                    {settings.hero_title.split(' ')[0]}
                    <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl opacity-80">
                      {settings.hero_title.split(' ').slice(1).join(' ')}
                    </span>
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white/90 opacity-80">
                    {settings.hero_description}
                  </p>
                </div>

                {/* تایمر  */}
                <div className="w-full max-w-[200px] sm:max-w-[240px] md:max-w-xs mx-auto">
                  <LiquidGlassCard
                    blurIntensity="lg"
                    glowIntensity="md"
                    shadowIntensity="lg"
                    borderRadius="24px"
                    draggable={false}
                    expandable={false}
                    className="p-2 sm:p-3 md:p-4 backdrop-blur-xl"
                  >
                    <div className="text-center space-y-1">
                      <h3 className="text-[10px] sm:text-xs md:text-sm font-medium text-white/80">
                        زمان باقی‌مانده فراخوان
                      </h3>
                      <CountdownTimer targetDate={registrationDeadline} />
                    </div>
                  </LiquidGlassCard>
                </div>

                <p className="text-sm sm:text-base md:text-lg text-white/80 leading-relaxed px-2">
                  جهت ثبت‌نام در رویداد لطفا کلیک کنید.
                </p>

                {/* دکمه‌ها*/}
                <div className="flex flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-center">
                  <Link to="/courses" className="inline-block">
                    <LiquidGlassCard
                      blurIntensity="xl"
                      glowIntensity="md"
                      shadowIntensity="lg"
                      borderRadius="9999px"
                      draggable={false}
                    >
                      <Button
                        size="sm"
                        className="px-4 sm:px-6 md:px-8 py-2 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg font-semibold bg-transparent border-0 text-white"
                      >
                        <span className="relative z-10 text-white">دوره‌ها</span>
                      </Button>
                    </LiquidGlassCard>
                  </Link>

                  <Link to="/register" className="inline-block">
                    <LiquidGlassCard
                      blurIntensity="lg"
                      glowIntensity="sm"
                      shadowIntensity="md"
                      borderRadius="9999px"
                      draggable={false}
                      className="border border-white/30"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-4 sm:px-6 md:px-8 py-2 sm:py-4 md:py-5 text-sm sm:text-base md:text-lg font-semibold bg-transparent border-0 text-white hover:bg-white/10"
                      >
                        <span className="flex items-center gap-1 sm:gap-2">
                          <span className="relative z-10 text-white">ثبت‌ نام</span>
                          <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 z-10" />
                        </span>
                      </Button>
                    </LiquidGlassCard>
                  </Link>
                </div>
              </div>

              {/* لوگوهای اسپانسر */}
              <div className="flex justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8 mt-2 md:mt-4">
                {settings.logos.map((logo, i) => (
                  <LiquidGlassCard
                    key={i}
                    blurIntensity="md"
                    glowIntensity="xs"
                    borderRadius="50%"
                    className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 lg:h-16 lg:w-16"
                    draggable={false}
                  >
                    <div className="h-full w-full rounded-full bg-white/10">
                      <img 
                        src={logo} 
                        alt={`Logo${i + 1}`} 
                        className="h-full w-full object-contain rounded-full p-1.5 sm:p-2 relative z-10"
                        draggable={false} 
                      />
                    </div>
                  </LiquidGlassCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
