// pages/cancellation-refund.tsx
import React from 'react';
import Head from 'next/head';
import { Container, Typography, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const CancellationRefund: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Head>
                    <title>Cancellation and Refund Policy - Freelance Development Agency</title>
                    <meta name="description" content="Cancellation and Refund Policy for Freelance Development Agency" />
                </Head>
                <Box my={4}>
                    <Typography variant="h1" component="h1" gutterBottom>
                        Cancellation and Refund Policy
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        We at Freelance Development Agency aim to provide top-notch services to all our clients and freelancers. However, we understand that there may be circumstances where cancellations or refunds are necessary.
                        
                        <Typography variant="h4" gutterBottom>
                            1. Cancellation Policy
                        </Typography>
                        - **For Clients**: You may cancel a project before the freelancer starts working. If the freelancer has already started, cancellations will only be allowed with the freelancer’s consent.
                        - **For Freelancers**: Freelancers are encouraged to notify the client promptly if they need to cancel a project before starting work. Failure to complete the work after starting may result in a negative rating.
                        
                        <Typography variant="h4" gutterBottom>
                            2. Refund Policy
                        </Typography>
                        - **For Clients**: Refunds can be requested if the service delivered does not meet the agreed-upon scope. Requests must be made within **7 days** of receiving the deliverable.
                        - Refunds will be processed within **5 business days** and credited back to the original payment method.
                        
                        For any cancellation or refund inquiries, please contact us at:
                        **Email**: info@freelancedevelopmentagency.com
                    </Typography>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default CancellationRefund;
