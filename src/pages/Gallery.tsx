import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

interface GalleryItem {
  id: string;
  image_url: string;
  title: string | null;
  category: string | null;
  event_date: string | null;
  event_time: string | null;
}

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('event_date', { ascending: false });

    if (!error && data) {
      setGalleryItems(data);
    }
    setLoading(false);
  };

  const handlePrev = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? galleryItems.length - 1 : selectedImage - 1);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === galleryItems.length - 1 ? 0 : selectedImage + 1);
    }
  };

  // Group images by date
  const groupedByDate = galleryItems.reduce((acc, item) => {
    const date = item.event_date || 'بدون تاریخ';
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, GalleryItem[]>);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-lg">در حال بارگذاری...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">گالری</span> تصاویر
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              تصاویری از رویدادها و کارگاه‌های برگزار شده
            </p>
          </div>

          {galleryItems.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">هنوز تصویری اضافه نشده است</p>
          ) : (
            Object.entries(groupedByDate).map(([date, images]) => (
              <div key={date} className="mb-12">
                <h2 className="text-xl font-semibold mb-6 border-b border-border pb-2">
                  {date === 'بدون تاریخ' ? date : new Date(date).toLocaleDateString('fa-IR')}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {images.map((item) => {
                    const globalIndex = galleryItems.findIndex(g => g.id === item.id);
                    return (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group animate-fade-in"
                        onClick={() => setSelectedImage(globalIndex)}
                      >
                        <img
                          src={item.image_url}
                          alt={item.title || 'تصویر گالری'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 right-0 left-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <h3 className="font-semibold text-white">{item.title || 'بدون عنوان'}</h3>
                          <p className="text-sm text-white/70">{item.category || ''}</p>
                          {item.event_time && (
                            <p className="text-xs text-white/60 mt-1">ساعت: {item.event_time}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}

          {/* Lightbox */}
          {selectedImage !== null && galleryItems[selectedImage] && (
            <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center animate-fade-in">
              <button
                className="absolute top-4 left-4 p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-6 h-6" />
              </button>

              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={handlePrev}
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-secondary hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={handleNext}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="max-w-4xl w-full mx-4">
                <div className="aspect-video rounded-2xl overflow-hidden glow">
                  <img
                    src={galleryItems[selectedImage].image_url}
                    alt={galleryItems[selectedImage].title || 'تصویر'}
                    className="w-full h-full object-contain bg-black"
                  />
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-xl font-semibold">{galleryItems[selectedImage].title || 'بدون عنوان'}</h3>
                  <p className="text-muted-foreground">{galleryItems[selectedImage].category}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Gallery;
