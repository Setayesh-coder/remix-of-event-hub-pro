// components/CountdownTimer.tsx
import { useState, useEffect } from 'react';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: Date;
}

const CountdownTimer = ({ targetDate }: CountdownTimerProps) => {
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

  const timeUnits = [
    { label: 'ثانیه', value: timeLeft.seconds },
    { label: 'دقیقه', value: timeLeft.minutes },
    { label: 'ساعت', value: timeLeft.hours },
    { label: 'روز', value: timeLeft.days },
  ];


  return (
    <div className="grid grid-cols-4 gap-4 md:gap-3">
      {timeUnits.map((unit) => (
        <div key={unit.label} className="flip-card group">
          <div className="flip-card-inner">
            {/* جلوی کارت - عدد */}
            <div className="flip-card-front liquid-glass-card">
              <span className="text-4xl md:text-4xl lg:text-4xl font-bold text-white drop-shadow-2xl">
                {unit.value.toString().padStart(2, '0')}
              </span>
            </div>
            {/* پشت کارت - برچسب */}
            <div className="flip-card-back">
              <span className="text-sm md:text-lg text-white/80 font-medium">{unit.label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;