import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // اگر از React Router استفاده می‌کنی، اگر نه، تنظیم کن
import { useAdminAuth } from '../hooks/useAdminAuth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAdminAuth();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (login(username, password)) {
            navigate('/admin'); // به صفحه اصلی ادمین برو
        } else {
            setError('نام کاربری یا رمز عبور اشتباه است');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>ورود ادمین</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="username">نام کاربری</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">رمز عبور</Label>
                                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>
                            {error && <p className="text-red-500">{error}</p>}
                            <Button type="submit">ورود</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminLogin;