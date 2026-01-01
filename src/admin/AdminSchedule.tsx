import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';

const AdminSchedule = () => {
    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-6 w-6" />
                        مدیریت برنامه‌ها
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-12 text-muted-foreground">
                    این بخش در حال توسعه است.
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminSchedule;