import { Link } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const AdminDashboard = () => {
    const { logout } = useAdminAuth();

    return (
        <div className="p-4">
            <div className="flex justify-between mb-4">
                <h1 className="text-2xl">داشبورد ادمین</h1>
                <Button onClick={logout}>خروج</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader><CardTitle>مدیریت صفحه اصلی (Index)</CardTitle></CardHeader>
                    <CardContent><Link to="/admin/index">ویرایش</Link></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>مدیریت گالری</CardTitle></CardHeader>
                    <CardContent><Link to="/admin/gallery">ویرایش</Link></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>مدیریت دوره‌ها (Courses)</CardTitle></CardHeader>
                    <CardContent><Link to="/admin/courses">ویرایش</Link></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>مدیریت برنامه‌ها (Schedule)</CardTitle></CardHeader>
                    <CardContent><Link to="/admin/schedule">ویرایش</Link></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle>مدیریت پروفایل‌ها و کاربران</CardTitle></CardHeader>
                    <CardContent><Link to="/admin/profile">ویرایش</Link></CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;