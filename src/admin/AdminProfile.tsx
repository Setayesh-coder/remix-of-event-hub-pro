import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { User, FileText, Award, CreditCard, ArrowRight, Download, Upload, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface UserProfile {
    id: string;
    user_id: string;
    full_name: string | null;
    phone: string | null;
    national_id: string | null;
}

interface Proposal {
    id: string;
    user_id: string;
    file_name: string;
    file_url: string;
    status: string;
    template_url: string | null;
    uploaded_at: string;
}

interface Certificate {
    id: string;
    user_id: string;
    title: string;
    certificate_url: string | null;
    issued_at: string;
}

interface CardSettings {
    id: string;
    card_image_url: string | null;
}

interface CertificateSettings {
    id: string;
    certificate_image_url: string | null;
}

const AdminProfile = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
    const [cardSettings, setCardSettings] = useState<CardSettings | null>(null);
    const [certificateSettings, setCertificateSettings] = useState<CertificateSettings | null>(null);

    // Dialog states
    const [certDialogOpen, setCertDialogOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
    const [certTitle, setCertTitle] = useState('');
    const [certFile, setCertFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);

    // Template upload
    const [templateFile, setTemplateFile] = useState<File | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const [usersRes, proposalsRes, certsRes, cardRes, certSettingsRes] = await Promise.all([
            supabase.from('profiles').select('id, user_id, full_name, phone, national_id'),
            supabase.from('proposals').select('*').order('uploaded_at', { ascending: false }),
            supabase.from('certificates').select('*').order('issued_at', { ascending: false }),
            supabase.from('card_settings').select('*').limit(1).maybeSingle(),
            supabase.from('certificate_settings').select('*').limit(1).maybeSingle(),
        ]);

        if (usersRes.data) setUsers(usersRes.data);
        if (proposalsRes.data) setProposals(proposalsRes.data);
        if (certsRes.data) setCertificates(certsRes.data);
        if (cardRes.data) setCardSettings(cardRes.data);
        if (certSettingsRes.data) setCertificateSettings(certSettingsRes.data);

        setLoading(false);
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'pending_upload': return 'در انتظار آپلود';
            case 'pending_approval': return 'در انتظار تایید';
            case 'approved': return 'تایید شده';
            case 'rejected': return 'رد شده';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending_upload': return 'text-muted-foreground';
            case 'pending_approval': return 'text-yellow-600';
            case 'approved': return 'text-green-600';
            case 'rejected': return 'text-red-600';
            default: return '';
        }
    };

    const updateProposalStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from('proposals')
            .update({ status })
            .eq('id', id);

        if (error) {
            toast({ title: 'خطا', description: 'خطا در تغییر وضعیت', variant: 'destructive' });
        } else {
            toast({ title: 'موفق', description: 'وضعیت تغییر کرد' });
            fetchData();
        }
    };

    const uploadTemplate = async () => {
        if (!templateFile) return;

        try {
            const fileExt = templateFile.name.split('.').pop();
            const fileName = `proposal-template.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('admin-uploads')
                .upload(fileName, templateFile, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('admin-uploads')
                .getPublicUrl(fileName);

            toast({ title: 'موفق', description: 'فایل نمونه آپلود شد' });
            setTemplateFile(null);
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در آپلود', variant: 'destructive' });
        }
    };

    const openCertDialog = (userId: string) => {
        setSelectedUserId(userId);
        setCertTitle('');
        setCertFile(null);
        setCertDialogOpen(true);
    };

    const issueCertificate = async () => {
        if (!selectedUserId || !certTitle) {
            toast({ title: 'خطا', description: 'عنوان گواهی الزامی است', variant: 'destructive' });
            return;
        }

        setSaving(true);
        try {
            let certUrl = null;

            if (certFile) {
                const fileExt = certFile.name.split('.').pop();
                const fileName = `cert-${selectedUserId}-${Date.now()}.${fileExt}`;

                const { error: uploadError } = await supabase.storage
                    .from('admin-uploads')
                    .upload(fileName, certFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('admin-uploads')
                    .getPublicUrl(fileName);

                certUrl = publicUrl;
            }

            const { error } = await supabase.from('certificates').insert({
                user_id: selectedUserId,
                title: certTitle,
                certificate_url: certUrl,
            });

            if (error) throw error;

            toast({ title: 'موفق', description: 'گواهی صادر شد' });
            setCertDialogOpen(false);
            fetchData();
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در صدور گواهی', variant: 'destructive' });
        }
        setSaving(false);
    };

    const updateCardImage = async (file: File) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `participant-card.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('admin-uploads')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('admin-uploads')
                .getPublicUrl(fileName);

            if (cardSettings) {
                await supabase
                    .from('card_settings')
                    .update({ card_image_url: publicUrl, updated_at: new Date().toISOString() })
                    .eq('id', cardSettings.id);
            } else {
                // Create new card settings if none exists
                await supabase
                    .from('card_settings')
                    .insert({ card_image_url: publicUrl });
            }

            toast({ title: 'موفق', description: 'تصویر کارت آپدیت شد' });
            fetchData();
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در آپلود', variant: 'destructive' });
        }
    };

    const deleteCardImage = async () => {
        if (!cardSettings?.card_image_url) return;
        
        try {
            // Delete from storage
            const fileName = cardSettings.card_image_url.split('/').pop();
            if (fileName) {
                await supabase.storage
                    .from('admin-uploads')
                    .remove([fileName]);
            }

            // Update database
            await supabase
                .from('card_settings')
                .update({ card_image_url: null, updated_at: new Date().toISOString() })
                .eq('id', cardSettings.id);

            toast({ title: 'موفق', description: 'تصویر کارت حذف شد' });
            fetchData();
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در حذف تصویر', variant: 'destructive' });
        }
    };

    const updateCertificateImage = async (file: File) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `certificate-background.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('admin-uploads')
                .upload(fileName, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('admin-uploads')
                .getPublicUrl(fileName);

            if (certificateSettings) {
                await supabase
                    .from('certificate_settings')
                    .update({ certificate_image_url: publicUrl, updated_at: new Date().toISOString() })
                    .eq('id', certificateSettings.id);
            } else {
                await supabase
                    .from('certificate_settings')
                    .insert({ certificate_image_url: publicUrl });
            }

            toast({ title: 'موفق', description: 'تصویر گواهی آپدیت شد' });
            fetchData();
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در آپلود', variant: 'destructive' });
        }
    };

    const deleteCertificateImage = async () => {
        if (!certificateSettings?.certificate_image_url) return;
        
        try {
            const fileName = certificateSettings.certificate_image_url.split('/').pop();
            if (fileName) {
                await supabase.storage
                    .from('admin-uploads')
                    .remove([fileName]);
            }

            await supabase
                .from('certificate_settings')
                .update({ certificate_image_url: null, updated_at: new Date().toISOString() })
                .eq('id', certificateSettings.id);

            toast({ title: 'موفق', description: 'تصویر گواهی حذف شد' });
            fetchData();
        } catch (error) {
            toast({ title: 'خطا', description: 'خطا در حذف تصویر', variant: 'destructive' });
        }
    };

    // Generate signed URL for downloading proposals (private bucket)
    const getProposalSignedUrl = async (filePath: string): Promise<string | null> => {
        const { data, error } = await supabase.storage
            .from('proposals')
            .createSignedUrl(filePath, 3600); // 1 hour expiry
        
        if (error || !data) {
            console.error('Error creating signed URL:', error);
            return null;
        }
        return data.signedUrl;
    };

    const handleProposalDownload = async (proposal: Proposal) => {
        const signedUrl = await getProposalSignedUrl(proposal.file_url);
        if (signedUrl) {
            window.open(signedUrl, '_blank');
        } else {
            toast({ title: 'خطا', description: 'خطا در دریافت لینک دانلود', variant: 'destructive' });
        }
    };

    const getUserName = (userId: string) => {
        const user = users.find(u => u.user_id === userId);
        return user?.full_name || 'کاربر بدون نام';
    };

    if (loading) {
        return <div className="p-6 text-center">در حال بارگذاری...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate('/admin')} className="gap-2">
                    <ArrowRight className="h-4 w-4" />
                    بازگشت
                </Button>
            </div>

            <Tabs defaultValue="users">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="users" className="gap-2">
                        <User className="h-4 w-4" />
                        کاربران
                    </TabsTrigger>
                    <TabsTrigger value="proposals" className="gap-2">
                        <FileText className="h-4 w-4" />
                        پرپوزال‌ها
                    </TabsTrigger>
                    <TabsTrigger value="certificates" className="gap-2">
                        <Award className="h-4 w-4" />
                        گواهی‌ها
                    </TabsTrigger>
                    <TabsTrigger value="card" className="gap-2">
                        <CreditCard className="h-4 w-4" />
                        کارت
                    </TabsTrigger>
                    <TabsTrigger value="cert-settings" className="gap-2">
                        <Award className="h-4 w-4" />
                        تنظیمات گواهی
                    </TabsTrigger>
                </TabsList>

                {/* کاربران */}
                <TabsContent value="users">
                    <Card>
                        <CardHeader>
                            <CardTitle>کاربران ({users.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>نام</TableHead>
                                        <TableHead>تلفن</TableHead>
                                        <TableHead>کد ملی</TableHead>
                                        <TableHead>عملیات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.full_name || 'بدون نام'}</TableCell>
                                            <TableCell>{user.phone || '-'}</TableCell>
                                            <TableCell>{user.national_id || '-'}</TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openCertDialog(user.user_id)}
                                                >
                                                    <Award className="h-4 w-4 ml-1" />
                                                    صدور گواهی
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* پرپوزال‌ها */}
                <TabsContent value="proposals">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>پرپوزال‌ها ({proposals.length})</CardTitle>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="file"
                                    className="w-auto"
                                    onChange={(e) => setTemplateFile(e.target.files?.[0] || null)}
                                />
                                <Button onClick={uploadTemplate} disabled={!templateFile} size="sm">
                                    <Upload className="h-4 w-4 ml-1" />
                                    آپلود فایل نمونه
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>کاربر</TableHead>
                                        <TableHead>فایل</TableHead>
                                        <TableHead>وضعیت</TableHead>
                                        <TableHead>تاریخ</TableHead>
                                        <TableHead>عملیات</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {proposals.map((proposal) => (
                                        <TableRow key={proposal.id}>
                                            <TableCell>{getUserName(proposal.user_id)}</TableCell>
                                            <TableCell>{proposal.file_name}</TableCell>
                                            <TableCell className={getStatusColor(proposal.status)}>
                                                {getStatusLabel(proposal.status)}
                                            </TableCell>
                                            <TableCell>
                                                {new Date(proposal.uploaded_at).toLocaleDateString('fa-IR')}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleProposalDownload(proposal)}
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </Button>
                                                    <Select
                                                        value={proposal.status}
                                                        onValueChange={(value) => updateProposalStatus(proposal.id, value)}
                                                    >
                                                        <SelectTrigger className="w-32">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="pending_upload">در انتظار آپلود</SelectItem>
                                                            <SelectItem value="pending_approval">در انتظار تایید</SelectItem>
                                                            <SelectItem value="approved">تایید شده</SelectItem>
                                                            <SelectItem value="rejected">رد شده</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* گواهی‌ها */}
                <TabsContent value="certificates">
                    <Card>
                        <CardHeader>
                            <CardTitle>گواهی‌های صادر شده ({certificates.length})</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>کاربر</TableHead>
                                        <TableHead>عنوان</TableHead>
                                        <TableHead>تاریخ صدور</TableHead>
                                        <TableHead>فایل</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {certificates.map((cert) => (
                                        <TableRow key={cert.id}>
                                            <TableCell>{getUserName(cert.user_id)}</TableCell>
                                            <TableCell>{cert.title}</TableCell>
                                            <TableCell>
                                                {new Date(cert.issued_at).toLocaleDateString('fa-IR')}
                                            </TableCell>
                                            <TableCell>
                                                {cert.certificate_url ? (
                                                    <a
                                                        href={cert.certificate_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="h-4 w-4" />
                                                        </Button>
                                                    </a>
                                                ) : (
                                                    '-'
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* کارت شرکت‌کننده */}
                <TabsContent value="card">
                    <Card>
                        <CardHeader>
                            <CardTitle>تنظیمات کارت شرکت‌کننده</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>تصویر کارت فعلی</Label>
                                {cardSettings?.card_image_url ? (
                                    <div className="space-y-2">
                                        <img
                                            src={cardSettings.card_image_url}
                                            alt="کارت شرکت‌کننده"
                                            className="max-w-md rounded-lg border"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={deleteCardImage}
                                            className="gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            حذف تصویر
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">هنوز تصویری آپلود نشده</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>آپلود تصویر جدید</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) updateCardImage(file);
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* تنظیمات گواهی */}
                <TabsContent value="cert-settings">
                    <Card>
                        <CardHeader>
                            <CardTitle>تنظیمات پس‌زمینه گواهی</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>تصویر پس‌زمینه گواهی فعلی</Label>
                                {certificateSettings?.certificate_image_url ? (
                                    <div className="space-y-2">
                                        <img
                                            src={certificateSettings.certificate_image_url}
                                            alt="پس‌زمینه گواهی"
                                            className="max-w-md rounded-lg border"
                                        />
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={deleteCertificateImage}
                                            className="gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            حذف تصویر
                                        </Button>
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">هنوز تصویری آپلود نشده</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>آپلود تصویر جدید</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) updateCertificateImage(file);
                                    }}
                                />
                                <p className="text-sm text-muted-foreground">
                                    توصیه: تصویر با ابعاد 800x600 پیکسل برای بهترین نتیجه
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialog صدور گواهی */}
            <Dialog open={certDialogOpen} onOpenChange={setCertDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>صدور گواهی</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>عنوان گواهی *</Label>
                            <Input
                                value={certTitle}
                                onChange={(e) => setCertTitle(e.target.value)}
                                placeholder="مثلاً: گواهی شرکت در کارگاه PCB"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>فایل گواهی (اختیاری)</Label>
                            <Input
                                type="file"
                                accept=".pdf,.jpg,.png"
                                onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                            />
                        </div>

                        <Button onClick={issueCertificate} disabled={saving} className="w-full">
                            {saving ? 'در حال صدور...' : 'صدور گواهی'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminProfile;
