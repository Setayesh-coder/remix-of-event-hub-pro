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
    { label: 'روز', value: timeLeft.days },
    { label: 'ساعت', value: timeLeft.hours },
    { label: 'دقیقه', value: timeLeft.minutes },
    { label: 'ثانیه', value: timeLeft.seconds }
  ];

  return (
    <div className="flex flex-row-reverse gap-3 sm:gap-4 md:gap-6">
      {timeUnits.map((unit, index) => (
        <div
          key={unit.label}
          className="flex flex-col items-center animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="gradient-border glow w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary glow-text">
              {unit.value.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="mt-2 text-xs sm:text-sm text-muted-foreground">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;