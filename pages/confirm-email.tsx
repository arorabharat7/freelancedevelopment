import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios, { AxiosError } from 'axios';

const ConfirmEmail = () => {
  const router = useRouter();
  const { token } = router.query;

  useEffect(() => {
    const confirmEmail = async () => {
      if (token) {
        try {
          const response = await axios.get(`/api/auth/confirm-email?token=${token}`);
          const { message, token: jwtToken, userId } = response.data;
          alert(message);

          localStorage.setItem('token', jwtToken);
          localStorage.setItem('userId', userId);

          router.push(`/profile/${userId}`);
        } catch (error) {
          // Use a type guard to check if the error is an AxiosError
          if (error instanceof AxiosError) {
            router.push(`/`);
            alert(error.response?.data?.error || 'Email confirmation failed');
            console.error('Email confirmation error:', error);
          } else {
            alert('An unknown error occurred');
            console.error('Unknown error:', error);
          }
        }
      }
    };

    confirmEmail();
  }, [token, router]);

  return <div>Confirming your email...</div>;
};

export default ConfirmEmail;
