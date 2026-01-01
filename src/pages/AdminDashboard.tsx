import { useAdminAuth } from '../hooks/useAdminAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useNavigate } from 'react-router-dom';
import { LogOut, Home, Image, BookOpen, Calendar, Users } from 'lucide-react';

const AdminDashboard = () => {
    const { logout, user } = useAdminAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/admin/login', { replace: true });
    };

    const menuItems = [
        {
            title: 'مدیریت صفحه اصلی',
            description: 'عوض کردن بکگراند، عنوان اصلی و زمان تایمر',
            icon: Home,
            path: '/admin/index'
        },
        {
            title: 'مدیریت گالری',
            description: 'اضافه، حذف و دسته‌بندی عکس‌ها',
            icon: Image,
            path: '/admin/gallery'
        },
        {
            title: 'مدیریت دوره‌ها',
            description: 'اضافه، ویرایش و حذف دوره‌ها، کارگاه‌ها و وبینارها',
            icon: BookOpen,
            path: '/admin/courses'
        },
        {
            title: 'مدیریت برنامه‌ها',
            description: 'تنظیم برنامه سه روز رویداد',
            icon: Calendar,
            path: '/admin/schedule'
        },
        {
            title: 'مدیریت کاربران',
            description: 'دیدن کاربران، مدیریت پرپوزال، گواهی و کارت',
            icon: Users,
            path: '/admin/profile'
        }
    ];

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold">داشبورد ادمین</h1>
                    {user && (
                        <p className="text-muted-foreground mt-1">{user.email}</p>
                    )}
                </div>

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
                {menuItems.map((item) => (
                    <Card 
                        key={item.path}
                        className="hover:shadow-lg transition-shadow cursor-pointer" 
                        onClick={() => navigate(item.path)}
                    >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <item.icon className="h-5 w-5" />
                                {item.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
