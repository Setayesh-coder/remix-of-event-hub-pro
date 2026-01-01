import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Image } from 'lucide-react';

const AdminGallery = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Image className="h-6 w-6" />
                        مدیریت گالری
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12 text-muted-foreground">
                    این بخش در حال توسعه است.
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminGallery;