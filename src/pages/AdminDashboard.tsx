import { Link } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const AdminDashboard = () => {
    const { logout } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // پاک کردن localStorage و state
        navigate('/admin/login', { replace: true }); // انتقال فوری به صفحه لاگین
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold">داشبورد ادمین</h1>

                <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    خروج
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/index')}>
                    <CardHeader>
                        <CardTitle>مدیریت صفحه اصلی (Index)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">عوض کردن بکگراند، عنوان اصلی و زمان تایمر</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/gallery')}>
                    <CardHeader>
                        <CardTitle>مدیریت گالری</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">اضافه، حذف و دسته‌بندی عکس‌ها</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/courses')}>
                    <CardHeader>
                        <CardTitle>مدیریت دوره‌ها (Courses)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">اضافه، ویرایش و حذف دوره‌ها، کارگاه‌ها و وبینارها</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/schedule')}>
                    <CardHeader>
                        <CardTitle>مدیریت برنامه‌ها (Schedule)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">تنظیم برنامه سه روز رویداد</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/admin/profile')}>
                    <CardHeader>
                        <CardTitle>مدیریت کاربران و پروفایل‌ها</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">دیدن کاربران، مدیریت پرپوزال، گواهی و کارت شرکت‌کننده</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;