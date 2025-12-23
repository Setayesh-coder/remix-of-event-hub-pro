import { Link } from 'react-router-dom';
import { Instagram, Send, Phone, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-primary border-t border-primary/80 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <span className="text-white font-bold text-lg">ME</span>
              </div>
              <span className="text-lg font-bold text-white">میکروالکترونیک</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              رویداد میکروالکترونیک، فرصتی برای یادگیری و ارتقای مهارت‌های شما در حوزه الکترونیک و تکنولوژی
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">دسترسی سریع</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/gallery" className="text-white/70 hover:text-white transition-colors text-sm">
                  گالری
                </Link>
              </li>
              <li>
                <Link to="/courses" className="text-white/70 hover:text-white transition-colors text-sm">
                  دوره‌ها
                </Link>
              </li>
              <li>
                <Link to="/schedule" className="text-white/70 hover:text-white transition-colors text-sm">
                  برنامه‌ها و زمانبندی
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-white/70 hover:text-white transition-colors text-sm">
                  ثبت نام
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">تماس با ما</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Phone className="w-4 h-4 text-white" />
                ۰۲۱-۱۲۳۴۵۶۷۸
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <Mail className="w-4 h-4 text-white" />
                info@microelectronics.ir
              </li>
              <li className="flex items-center gap-2 text-white/70 text-sm">
                <MapPin className="w-4 h-4 text-white" />
                تهران، دانشگاه تهران
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">شبکه‌های اجتماعی</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center hover:bg-white hover:text-primary transition-all duration-300"
              >
                <Send className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/20 text-center">
          <p className="text-white/70 text-sm" >
            ساخته شده توسط <a href='https://supremetech.ir/'>SupremeTech</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
