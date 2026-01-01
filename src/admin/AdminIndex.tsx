import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AdminIndex = () => {
    return (
        <Card className="max-w-2xl mx-auto mt-8">
            <CardHeader>
                <CardTitle>پنل مدیریت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                    به پنل مدیریت خوش آمدید. از منوی سمت راست برای مدیریت بخش‌های مختلف استفاده کنید.
                </p>
            </CardContent>
        </Card>
    );
};

export default AdminIndex;