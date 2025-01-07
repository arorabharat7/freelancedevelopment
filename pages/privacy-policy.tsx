// pages/privacy-policy.tsx
import React from 'react';
import Head from 'next/head';
import { Container, Typography, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const PrivacyPolicy: React.FC = () => {
    return (
        <ThemeProvider theme={theme}>
            <Container>
                <Head>
                    <title>Privacy Policy - Freelance Development Agency</title>
                    <meta name="description" content="Privacy Policy for Freelance Development Agency" />
                </Head>
                <Box my={4}>
                    <Typography variant="h1" component="h1" gutterBottom>
                        Privacy Policy
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                        {/* Insert your Privacy Policy content here */}
                        Welcome to Freelance Development Agency

                        Thank you for choosing Freelance Development Agency. Your privacy is critically important to us, and this policy provides detailed information about how your data is collected, used, and protected.
                        <Typography variant="h4" gutterBottom>
                            1. Information We Collect
                        </Typography>
                        Personal Information: This includes details provided by you such as your name, email address, and contact information when you register for our services.
                        Usage Data: We automatically collect data on how our services are accessed and used. This includes information like your computer&apos;s IP address, browser type, the pages of our service you visit, and other diagnostic data.
                        <Typography variant="h4" gutterBottom>
                            2. How We Use Your Information
                        </Typography>
                        We utilize the information we gather to:

                        Provide and maintain our service: This includes managing your account and responding to your inquiries.
                        Notify you about changes to our service: We communicate updates to ensure you are always informed.
                        Enhance your experience: We enable participation in interactive features of our services, customized to your preferences.
                        <Typography variant="h4" gutterBottom>
                            3. Protection of Your Information
                        </Typography>
                        We take the security of your data seriously. We employ:

                        Administrative, technical, and physical safeguards: These are designed to protect your personal information from unauthorized access, alteration, and destruction.
                        Data encryption and secure servers: To further enhance the security and confidentiality of your personal information.
                        <Typography variant="h4" gutterBottom>
                            4. Sharing Your Personal Information
                        </Typography>
                        We respect your privacy and:

                        Do not sell, trade, or rent your personal data to third parties.
                        May share generic aggregated demographic information with our business partners and trusted affiliates to enhance our services, which is not linked to any personally identifiable information.
                        <Typography variant="h4" gutterBottom>
                            5. Cookies and Tracking Technologies
                        </Typography>
                        We use cookies and similar tracking technologies to monitor activity on our services and store certain information. You can set your browser to refuse all cookies or to indicate when a cookie is sent.
                        <Typography variant="h4" gutterBottom>
                            6. Changes to This Privacy Policy
                        </Typography>
                        Our Privacy Policy may undergo periodic updates to reflect changes in our practices. We will notify you of any significant changes by posting the new policy on our website. We encourage you to review our Privacy Policy regularly to stay informed.
                        <Typography variant="h4" gutterBottom>
                            7. Contact Us
                        </Typography>
                        If you have any questions or suggestions regarding our Privacy Policy, please feel free to contact us. Your feedback is important to us.


                    </Typography>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default PrivacyPolicy;
