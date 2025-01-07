// components/Footer.tsx
import React from 'react';
import Link from 'next/link';
import { Box, Container, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styles from '../styles/Footer.module.css';

const theme = createTheme();

const Footer: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Box component="footer" py={3} className={styles.footer}>
        <Container>
          <Typography variant="body2" align="center" color="textSecondary" component="p">
            © {new Date().getFullYear()} Freelance Development Agency. All rights reserved.
          </Typography>
          <Box textAlign="center" mt={2}>
            <Link href="/privacy-policy" className={styles.footerLink}>
              Privacy Policy
            </Link>
            {' | '}
            <Link href="/terms-of-service" className={styles.footerLink}>
              Terms of Service
            </Link>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Footer;
