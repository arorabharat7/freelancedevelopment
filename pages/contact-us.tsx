// pages/contact-us.tsx
import React from 'react';
import Head from 'next/head';
import { Container, Typography, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const ContactUs: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Head>
                    <title>Contact Us - Freelance Development Agency</title>
                    <meta name="description" content="Contact Freelance Development Agency for any inquiries" />
                </Head>
                <Box my={4}>
                    <Typography variant="h1" component="h1" gutterBottom>
                        Contact Us
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        We’re here to help! If you have any questions, concerns, or need support, feel free to reach out to us via email.
                        
                        **Email**: info@freelancedevelopmentagency.com
                        
                        **Business Hours**:
                        Monday – Friday: 9:00 AM – 6:00 PM  
                        Saturday – Sunday: Closed
                        
                        We aim to respond to all inquiries within **24 hours** during business hours.
                    </Typography>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default ContactUs;
