// components/CountdownTimer.tsx
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
  variant?: 'default' | 'hero';
}

const CountdownTimer = ({ targetDate, variant = 'default' }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (variant === 'hero') {
    return (
      <div className="flex items-center gap-2 text-primary-foreground">
        <span className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </span>
        <span className="text-4xl md:text-5xl lg:text-6xl font-light opacity-60">:</span>
        <span className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </span>
        <span className="text-4xl md:text-5xl lg:text-6xl font-light opacity-60">:</span>
        <span className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums">
          {timeLeft.hours.toString().padStart(2, '0')}
        </span>
        <span className="text-4xl md:text-5xl lg:text-6xl font-light opacity-60">:</span>
        <span className="text-5xl md:text-6xl lg:text-7xl font-bold tabular-nums">
          {timeLeft.days.toString().padStart(2, '0')}
        </span>
      </div>
    );
  }

  const timeUnits = [
    { label: 'ثانیه', value: timeLeft.seconds },
    { label: 'دقیقه', value: timeLeft.minutes },
    { label: 'ساعت', value: timeLeft.hours },
    { label: 'روز', value: timeLeft.days },
  ];


  return (
    <div className="grid grid-cols-4 gap-2">
      {timeUnits.map((unit) => (
        <div key={unit.label} className="flip-card group">
          <div className="flip-card-inner">
            {/* جلوی کارت - عدد */}
            <div className="flip-card-front liquid-glass-card">
              <span className="text-xl md:text-2xl font-bold text-white drop-shadow-lg">
                {unit.value.toString().padStart(2, '0')}
              </span>
            </div>
            {/* پشت کارت - برچسب */}
            <div className="flip-card-back">
              <span className="text-xs text-white/80 font-medium">{unit.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;