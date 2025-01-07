// pages/reset-password.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { TextField, Button, Container, Typography, Box, CircularProgress } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const ResetPasswordPage = () => {
  const router = useRouter();
  const { token } = router.query as { token: string };
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleResetPassword = async () => {
    setError(''); // Reset error state
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword,
      });
      alert('Password reset successful');
      router.push('/');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Box mt={5}>
          <Typography variant="h4" align="center" gutterBottom>
            Reset Password
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            fullWidth
            variant="outlined"
            margin="normal"
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleResetPassword}
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default ResetPasswordPage;
