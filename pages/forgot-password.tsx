import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/Modal.module.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const router = useRouter();

  const handleResetPasswordRequest = async () => {
    try {
      const response = await axios.post('/api/auth/request-reset-password', { email });
      setMessage('Password reset link has been sent to your email.');
    } catch (error) {
      setMessage('Failed to send password reset link.');
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Forgot Password</h2>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleResetPasswordRequest}>Send Reset Link</button>
        {message && <p>{message}</p>}
        <button onClick={() => router.push('/login')}>Back to Login</button>
      </div>
    </div>
  );
};

export default ForgotPassword;
