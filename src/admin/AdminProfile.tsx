import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, FileText, Award, User } from 'lucide-react';

type UserProfile = {
    id: string;
    email: string;
    full_name?: string;
};

type Proposal = {
    id: number;
    user_id: string;
    file_url: string | null;
    status: 'pending_upload' | 'pending_approval' | 'approved' | 'rejected';
};

type Certificate = {
    certificate_url: string | null;
};

type CardSetting = {
    card_image_url: string | null;
};

const statusLabels = {
    pending_upload: { label: 'در انتظار آپلود', color: 'bg-gray-500' },
    pending_approval: { label: 'در انتظار تایید', color: 'bg-yellow-500' },
    approved: { label: 'تایید شد', color: 'bg-green-500' },
    rejected: { label: 'رد شد', color: 'bg-red-500' },
};

const AdminProfile = () => {
    const [users, setUsers] = useState<(UserProfile & { proposal?: Proposal; certificate?: Certificate })[]>([]);
    const [cardSetting, setCardSetting] = useState<CardSetting>({ card_image_url: '' });
    const [loading, setLoading] = useState(true);
    const [uploadingCard, setUploadingCard] = useState(false);
    const [uploadingCert, setUploadingCert] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    useEffect(() => {
        fetchUsersAndData();
        fetchCardSetting();
    }, []);

    const fetchUsersAndData = async () => {
        setLoading(true);

        // دریافت لیست کاربران از auth (با Supabase Admin API نمی‌تونیم مستقیم، پس از profiles اگر داری استفاده کن، یا فرض می‌کنیم جدول profiles داری)
        // اگر جدول profiles نداری، از auth.users با service_role نمی‌تونیم در کلاینت، پس فعلاً از proposals و certificates جوین می‌کنیم
        const { data: proposals } = await supabase.from('proposals').select('user_id, file_url, status');
        const { data: certs } = await supabase.from('certificates').select('user_id, certificate_url');

        // دریافت کاربران (فرض کنیم جدول public.profiles داری با full_name و email)
        const { data: profiles } = await supabase.from('profiles').select('id, email, full_name');

        if (profiles) {
            const usersWithData = profiles.map((profile: any) => {
                const proposal = proposals?.find((p: any) => p.user_id === profile.id);
                const certificate = certs?.find((c: any) => c.user_id === profile.id);
                return {
                    ...profile,
                    proposal,
                    certificate: certificate ? { certificate_url: certificate.certificate_url } : { certificate_url: null },
                };
            });
            setUsers(usersWithData);
        } else {
            alert('جدول profiles پیدا نشد. اگر وجود نداره، بگو تا راه‌حل دیگه بدم.');
        }

        setLoading(false);
    };

    const fetchCardSetting = async () => {
        const { data } = await supabase.from('card_settings').select('*').single();
        if (data) setCardSetting({ card_image_url: data.card_image_url });
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        const { data: existing } = await supabase.from('proposals').select('id').eq('user_id', userId).single();

        if (existing) {
            await supabase.from('proposals').update({ status: newStatus }).eq('user_id', userId);
        } else {
            await supabase.from('proposals').insert({ user_id: userId, status: newStatus });
        }
        fetchUsersAndData();
    };

    const handleUploadCard = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingCard(true);
        const fileName = `card.${file.name.split('.').pop()}`;
        const { error } = await supabase.storage.from('images').upload(fileName, file, { upsert: true });

        if (error) {
            alert('خطا در آپلود کارت: ' + error.message);
        } else {
            const { data } = supabase.storage.from('images').getPublicUrl(fileName);
            await supabase.from('card_settings').upsert({ card_image_url: data.publicUrl });
            setCardSetting({ card_image_url: data.publicUrl });
            alert('تصویر کارت شرکت‌کننده بروزرسانی شد!');
        }
        setUploadingCard(false);
    };

    const handleIssueCertificate = async () => {
        if (!selectedUserId) {
            alert('لطفاً یک کاربر انتخاب کنید');
            return;
        }

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.pdf,image/*';
        fileInput.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setUploadingCert(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${selectedUserId}_certificate.${fileExt}`;
            const { error } = await supabase.storage.from('certificates').upload(fileName, file, { upsert: true });

            if (error) {
                alert('خطا: ' + error.message);
            } else {
                const { data } = supabase.storage.from('certificates').getPublicUrl(fileName);
                const { error: dbError } = await supabase.from('certificates').upsert({
                    user_id: selectedUserId,
                    certificate_url: data.publicUrl,
                });

                if (dbError) {
                    alert('خطا در ذخیره: ' + dbError.message);
                } else {
                    alert('گواهی با موفقیت صادر شد!');
                    fetchUsersAndData();
                }
            }
            setUploadingCert(false);
        };
        fileInput.click();
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8">
            {/* کارت شرکت‌کننده */}
            <Card>
                <CardHeader>
                    <CardTitle>تصویر کارت شرکت‌کننده</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input type="file" accept="image/*" onChange={handleUploadCard} disabled={uploadingCard} />
                    {cardSetting.card_image_url && (
                        <img src={cardSetting.card_image_url} alt="کارت شرکت‌کننده" className="max-w-md rounded-lg shadow" />
                    )}
                </CardContent>
            </Card>

            {/* صدور گواهی */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-6 w-6" />
                        صدور گواهی شرکت
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-4 items-end">
                        <div>
                            <Label>کاربر</Label>
                            <Select onValueChange={setSelectedUserId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="انتخاب کاربر" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map((user) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.full_name || user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button onClick={handleIssueCertificate} disabled={uploadingCert}>
                            <Upload className="ml-2 h-4 w-4" />
                            آپلود و صدور گواهی
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* لیست کاربران */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-6 w-6" />
                        مدیریت کاربران و پرپوزال‌ها ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>در حال بارگذاری...</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>نام / ایمیل</TableHead>
                                    <TableHead>پرپوزال</TableHead>
                                    <TableHead>وضعیت</TableHead>
                                    <TableHead>گواهی</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">
                                            {user.full_name || user.email}
                                        </TableCell>
                                        <TableCell>
                                            {user.proposal?.file_url ? (
                                                <a href={user.proposal.file_url} target="_blank" className="flex items-center gap-1 text-blue-600">
                                                    <Download className="h-4 w-4" />
                                                    دانلود فایل
                                                </a>
                                            ) : (
                                                'آپلود نشده'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Badge className={statusLabels[user.proposal?.status || 'pending_upload'].color + ' text-white'}>
                                                    {statusLabels[user.proposal?.status || 'pending_upload'].label}
                                                </Badge>
                                                <Select
                                                    value={user.proposal?.status || 'pending_upload'}
                                                    onValueChange={(val) => handleStatusChange(user.id, val)}
                                                >
                                                    <SelectTrigger className="w-40">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending_upload">در انتظار آپلود</SelectItem>
                                                        <SelectItem value="pending_approval">در انتظار تایید</SelectItem>
                                                        <SelectItem value="approved">تایید شد</SelectItem>
                                                        <SelectItem value="rejected">رد شد</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.certificate?.certificate_url ? (
                                                <a href={user.certificate.certificate_url} target="_blank" className="text-green-600 flex items-center gap-1">
                                                    <FileText className="h-4 w-4" />
                                                    مشاهده گواهی
                                                </a>
                                            ) : (
                                                'صادر نشده'
                                            )}
                                        </TableCell>
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