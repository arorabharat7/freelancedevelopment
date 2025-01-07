import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import styles from './Header.module.css';

// Dynamically import modals
const LoginModal = dynamic(() => import('./LoginModal'));
const RegisterModal = dynamic(() => import('./RegisterModal'));

const Header: React.FC = React.memo(() => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
        const storedUserId = localStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
        }
      }
    }
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    setIsLoggedIn(false);
    window.location.href = '/';
  }, []);

  return (
    <div className={styles.mainHeader}>
      <header className={styles.header}>
        <Link href="/" passHref className={styles.desktopTitle}> 
            <Image
              src="/images/freelancedevelopmentagency.webp"
              alt="Freelance Development Agency"
              width={50}
              height={50}
              loading="lazy" 
            /> 
        </Link>
        <Link href="/" passHref className={styles.mobileTitle}> 
            <Image
              src="/images/freelancedevelopmentagency.webp"
              alt="Freelance Development Agency"
              width={50}
              height={50}
              loading="lazy"
            /> 
        </Link>
        <nav>
          <ul>
            <li>
              <Link href="/blog">Blogs</Link>
            </li>
            {isLoggedIn ? (
              <>
                <li>
                  <Link href={`/profile/${userId}`}>Profile</Link>
                </li>
                <li>
                  <button onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button onClick={() => setIsLoginOpen(true)}>Login</button>
                </li>
                <li>
                  <button onClick={() => setIsRegisterOpen(true)}>Register</button>
                </li>
              </>
            )}
          </ul>
        </nav>
        {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
        {isRegisterOpen && <RegisterModal onClose={() => setIsRegisterOpen(false)} />}
      </header>
    </div>
  );
});

// Add display name for React.memo component
Header.displayName = 'Header';

export default Header;
