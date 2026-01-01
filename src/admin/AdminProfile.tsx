import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { User } from 'lucide-react';

type UserProfile = {
    id: string;
    user_id: string;
    full_name: string | null;
    phone: string | null;
    national_id: string | null;
};

const AdminProfile = () => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsersAndData();
    }, []);

    const fetchUsersAndData = async () => {
        setLoading(true);
        const { data: profiles } = await supabase.from('profiles').select('id, user_id, full_name, phone, national_id');
        if (profiles) {
            setUsers(profiles);
        }
        setLoading(false);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-6 w-6" />
                        مدیریت کاربران ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>در حال بارگذاری...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>نام</TableHead>
                                    <TableHead>تلفن</TableHead>
                                    <TableHead>کد ملی</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.full_name || 'بدون نام'}
                                        </TableCell>
                                        <TableCell>{user.phone || '-'}</TableCell>
                                        <TableCell>{user.national_id || '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminProfile;