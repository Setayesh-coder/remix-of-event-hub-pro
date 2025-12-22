import { useState } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  // Sample gallery items
  const galleryItems = [
    { id: 1, title: 'کارگاه PCB', category: 'کارگاه' },
    { id: 2, title: 'وبینار IoT', category: 'وبینار' },
    { id: 3, title: 'آزمایشگاه', category: 'تجهیزات' },
    { id: 4, title: 'تیم برگزارکنندگان', category: 'تیم' },
    { id: 5, title: 'مسابقات', category: 'رویداد' },
    { id: 6, title: 'نمایشگاه', category: 'رویداد' },
    { id: 7, title: 'کارگاه ARM', category: 'کارگاه' },
    { id: 8, title: 'جوایز', category: 'رویداد' },
  ];

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

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {galleryItems.map((item, index) => (
              <div
                key={item.id}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedImage(index)}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 group-hover:opacity-0 transition-opacity duration-300" />
                <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                  <span className="text-4xl text-primary/50">{item.id}</span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 right-0 left-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.category}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Lightbox */}
          {selectedImage !== null && (
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
                  <div className="w-full h-full bg-gradient-to-br from-secondary to-muted flex items-center justify-center">
                    <span className="text-6xl text-primary/50">{galleryItems[selectedImage].id}</span>
                  </div>
                </div>
                <div className="text-center mt-4">
                  <h3 className="text-xl font-semibold">{galleryItems[selectedImage].title}</h3>
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
