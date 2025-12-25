import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import CountdownTimer from '@/components/CountdownTimer';
import { Button } from '@/components/ui/button';
import { LiquidGlassCard } from '@/components/ui/liquidglass';

const Index = () => {
  const registrationDeadline = new Date('2026-01-15T23:59:59');

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image + Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('src/assets/hero-bg.jpg')`,
          }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>


        <div className="relative z-10 w-full">
          <div className="container mx-auto px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center gap-12 lg:gap-20 max-w-7xl mx-auto">

              <div className="text-center space-y-10 max-w-xl">
                {/* عنوان اصلی */}
                <div className="space-y-6">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white tracking-wider opacity-90 leading-tight">
                    جوانه<span className="block text-4xl md:text-6xl lg:text-7xl opacity-80">ثریا</span>
                  </h1>
                  <div className="text-4xl md:text-6xl lg:text-7xl font-bold text-white/90 space-y-2 opacity-80 leading-tight">
                    <p className="text-5xl md:text-7xl lg:text-8xl">JAVANEH</p>
                    <p className="text-3xl md:text-5xl lg:text-6xl">SORAYA</p>
                    <p className="text-4xl md:text-6xl lg:text-7xl">PROBLEM</p>
                    <p className="text-4xl md:text-6xl lg:text-7xl">DRIVEN</p>
                    <p className="text-4xl md:text-6xl lg:text-7xl">EVENT</p>
                  </div>
                </div>
                {/* تایمر  */}
                <div className="w-full max-w-xs mx-auto">
                  <LiquidGlassCard
                    blurIntensity="lg"
                    glowIntensity="md"
                    shadowIntensity="lg"
                    borderRadius="24px"
                    draggable={false}
                    expandable={false}
                    className="p-4 md:p-5 backdrop-blur-xl"
                  >
                    <div className="text-center space-y-2">
                      <h3 className="text-xs md:text-sm font-medium text-white/80">
                        زمان باقی‌مانده فراخوان
                      </h3>
                      <CountdownTimer targetDate={registrationDeadline} />
                    </div>
                  </LiquidGlassCard>
                </div>
                <p className="text-lg md:text-xl lg:text-2xl text-white/80 leading-relaxed px-4">
                  جهت ثبت‌نام در رویداد لطفا کلیک کنید.
                </p>

                {/* دکمه‌ها*/}
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">

                  <Link to="/courses" className="inline-block">
                    <LiquidGlassCard
                      blurIntensity="xl"
                      glowIntensity="md"
                      shadowIntensity="lg"
                      borderRadius="9999px"
                      draggable={false}
                    >
                      <Button
                        size="lg"
                        className="px-10 py-7 text-lg font-semibold bg-transparent border-0 text-white"
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
                        size="lg"
                        variant="outline"
                        className="px-10 py-7 text-lg font-semibold bg-transparent border-0 text-white hover:bg-white/10"
                      >
                        <span className="flex items-center gap-2">
                          <span className="relative z-10 text-white">ثبت‌نام</span>
                          <ArrowLeft className="h-5 w-5 z-10" />
                        </span>
                      </Button>
                    </LiquidGlassCard>
                  </Link>

                </div></div>
            </div>
            {/* لوگوهای اسپانسر */}
            <div className="flex justify-center gap-8 pt-20 pb-10">
              {[1, 2, 3, 4].map((i) => (
                <LiquidGlassCard
                  key={i}
                  blurIntensity="md"
                  glowIntensity="xs"
                  borderRadius="50%"
                  className="h-16 w-16"
                  draggable={false}
                >
                  <div className="h-full w-full rounded-full bg-white/10" />
                </LiquidGlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;