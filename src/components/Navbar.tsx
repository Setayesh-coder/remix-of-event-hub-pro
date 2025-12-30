import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X, User, Image, BookOpen, Calendar, LogIn, HomeIcon, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: 'رویداد', href: '/', icon: Ticket },
    { label: 'گالری', href: '/gallery', icon: Image },
    { label: 'آموزش', href: '/courses', icon: BookOpen },
    { label: 'برنامه‌ها و زمانبندی', href: '/schedule', icon: Calendar },
  ];

  return (
    <nav className="fixed top-0 right-0 left-0 z-50 bg-primary backdrop-blur-xl border-b border-primary/80">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="https://microinnovate.ir/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <span className="text-white font-bold text-lg">ME</span>
            </div>
            <span className="hidden sm:block text-lg font-bold text-white">میکروالکترونیک</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1 pl-10">
            {navItems.map((item) => (
              <Button key={item.label} variant="ghost" className="text-white hover:bg-white/10 hover:text-white" asChild>
                <Link to={item.href} className="gap-1">
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              </Button>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button className="bg-white text-primary hover:bg-white/90" asChild>
              <Link to="/Profile"> <User /></Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-white/20 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 px-4">
                <Button className="w-full bg-white text-primary hover:bg-white/90" asChild>
                  <Link to="/Profile" onClick={() => setIsOpen(false)}>
                    پروفایل
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
