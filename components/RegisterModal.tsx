import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import styles from '../styles/Modal.module.css';

interface RegisterModalProps {
  onClose: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [userType, setUserType] = useState<string>('freelancer'); // default as freelancer
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleRegister = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', { email, password, userType });
      alert(response.data.message);
      localStorage.setItem('userId', response.data.userId);
      router.push(`/`);
      onClose();
    } catch (error) {
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h2>Register</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        {/* Radio buttons for user types */}
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="freelancer"
              checked={userType === 'freelancer'}
              onChange={() => setUserType('freelancer')}
            />
            <span className={styles.radioCustom}></span>
            Freelancer
          </label>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="client"
              checked={userType === 'client'}
              onChange={() => setUserType('client')}
            />
            <span className={styles.radioCustom}></span>
            Client
          </label>
          
        </div>

        <button onClick={handleRegister} disabled={loading || !email || !password}>
          {loading ? 'Registering...' : 'Register'}
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default RegisterModal;
