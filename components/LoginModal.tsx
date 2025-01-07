import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/Modal.module.css';

interface LoginModalProps {
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password.');
      return;
    }
    
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      
      // Optionally: Store the token in an HTTP-only cookie instead of localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userId', response.data.userId);

      onClose();
      router.push(`/profile/${response.data.userId}`);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        // Display specific error message from the server
        alert(error.response.data.error);
      } else {
        alert('An unexpected error occurred. Please try again.');
      }
    }
  };

  const handleForgotPassword = () => {
    onClose();
    router.push('/forgot-password');
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          aria-label="Email"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          aria-label="Password"
        />
        <button onClick={handleLogin}>Login</button>
        <button onClick={onClose}>Close</button>
        <button onClick={handleForgotPassword}>Forgot Password?</button>
      </div>
    </div>
  );
};

export default LoginModal;
