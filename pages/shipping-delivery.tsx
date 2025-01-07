// pages/shipping-delivery.tsx
import React from 'react';
import Head from 'next/head';
import { Container, Typography, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const ShippingDelivery: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Head>
                    <title>Shipping and Delivery Policy - Freelance Development Agency</title>
                    <meta name="description" content="Shipping and Delivery Policy for Freelance Development Agency" />
                </Head>
                <Box my={4}>
                    <Typography variant="h1" component="h1" gutterBottom>
                        Shipping and Delivery Policy
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        At Freelance Development Agency, we provide digital services, so there are no physical products to be shipped. Our services are delivered electronically.
                        
                        <Typography variant="h4" gutterBottom>
                            1. Delivery of Services
                        </Typography>
                        - Upon completion of the project, the freelancer will upload the deliverables directly through the platform. Clients will be notified once the project is marked as complete.
                        - Clients can download the deliverables from their account dashboard at any time after completion.
                        
                        <Typography variant="h4" gutterBottom>
                            2. Delivery Time
                        </Typography>
                        - Delivery timelines are agreed upon between the client and the freelancer before the project begins.
                        
                        If you experience any issues regarding the delivery of your project, please reach out to us at:
                        **Email**: info@freelancedevelopmentagency.com
                    </Typography>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default ShippingDelivery;
