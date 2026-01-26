import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/Layout';

// Register page now redirects to Login since OTP handles both login and signup
const Register = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    } else {
      // Redirect to login page - OTP handles both login and registration
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <Layout>
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <p className="text-muted-foreground">در حال انتقال...</p>
      </div>
    </Layout>
  );
};

export default Register;
