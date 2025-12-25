import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';
import { iranCities } from '@/data/iranCities';

interface CitySelectProps {
  value: string;
  onChange: (value: string) => void;
}

const CitySelect = ({ value, onChange }: CitySelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredCities = iranCities.filter(city =>
    city.includes(search)
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-lg bg-secondary border border-border focus:border-primary outline-none flex items-center justify-between text-right"
      >
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>
          {value || 'انتخاب شهر'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-xl max-h-64 overflow-hidden">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجوی شهر..."
                className="w-full pr-10 pl-4 py-2 rounded-md bg-secondary border border-border focus:border-primary outline-none text-sm"
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-48">
            {filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    onChange(city);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full px-4 py-2 text-right hover:bg-accent transition-colors ${
                    value === city ? 'bg-accent text-accent-foreground' : ''
                  }`}
                >
                  {city}
                </button>
              ))
            ) : (
              <div className="px-4 py-3 text-muted-foreground text-center text-sm">
                شهری یافت نشد
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitySelect;
