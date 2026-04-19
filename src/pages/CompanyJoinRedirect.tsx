import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFirebase } from '../contexts/FirebaseContext';
import LoadingAnimation from '../components/LoadingAnimation';

export default function CompanyJoinRedirect() {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useFirebase();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If logged in, we could theoretically auto-join them or show a "Confirm Join" page
        // For MVP, if already logged in, let's just send them to dashboard with the intent
        // Or redirect to register which will handle the logic if we modify it to check existing auth
        // But the simplest is:
        navigate(`/dashboard?joinCompanyId=${companyId}`);
      } else {
        // If not logged in, send to register page with companyId param
        navigate(`/register?companyId=${companyId}`);
      }
    }
  }, [user, loading, companyId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <LoadingAnimation />
    </div>
  );
}
