import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Check if there's an error in the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (errorParam) {
          setError(`${errorParam}: ${decodeURIComponent(errorDescription)}`);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Get the session from the URL
        const { data, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          setError('Failed to authenticate. Please try again.');
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (data.session) {
          // Authentication successful - redirect to home
          navigate('/');
        } else {
          setError('No session found. Please try again.');
          setTimeout(() => navigate('/'), 3000);
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An error occurred during authentication.');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      {error ? (
        <div style={{ textAlign: 'center', color: '#d32f2f' }}>
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <p>Redirecting...</p>
        </div>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <h2>Completing authentication...</h2>
          <p>Please wait while we log you in.</p>
        </div>
      )}
    </div>
  );
}
