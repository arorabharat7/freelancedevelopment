// pages/terms-of-service.tsx
import React from 'react';
import Head from 'next/head';
import { Container, Typography, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

const TermsOfService: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container>
        <Head>
          <title>Terms of Service - Freelance Development Agency</title>
          <meta name="description" content="Terms of Service for Freelance Development Agency" />
        </Head>
        <Box my={4}>
          <Typography variant="h2" component="h1" gutterBottom>
            Terms of Service
          </Typography>
          <Typography variant="body1" gutterBottom>
            {/* Insert your Terms of Service content here */}
            Terms of Service
            Welcome to Freelance Development Agency

            These terms and conditions outline the rules and regulations for the use of Freelance Development Agency&apos;s Website, located at https://www.freelancedevelopmentagency.com/.
            <Typography variant="h4" gutterBottom>
              1. Acceptance of Terms
            </Typography>
            By accessing this website, we assume you accept these terms and conditions. Do not continue to use Freelance Development Agency if you do not agree to all of the terms and conditions stated on this page.
            <Typography variant="h4" gutterBottom>
              2. Modifications to the Service and Prices
            </Typography>
            Prices for our services are subject to change without notice.
            We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
            <Typography variant="h4" gutterBottom>
              3. Copyright Policy
            </Typography>
            All content included on the site, such as text, graphics, logos, images, as well as the compilation thereof, and any software used on the site, is the property of Freelance Development Agency or its suppliers and protected by copyright and other laws that protect intellectual property and proprietary rights.
            <Typography variant="h4" gutterBottom>
              4. Your Account
            </Typography>
            If you use this site, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, and you agree to accept responsibility for all activities that occur under your account or password.
            <Typography variant="h4" gutterBottom>
              5. Linking to Our Content
            </Typography>
            You may link to our home page, to publications, or to other Website information so long as the link: (a) is not in any way deceptive; (b) does not falsely imply sponsorship, endorsement or approval of the linking party and its products and/or services; and (c) fits within the context of the linking party&apos;s site.
            <Typography variant="h4" gutterBottom>
              6. Disclaimer of Warranties; Limitation of Liability
            </Typography>
            We do not guarantee, represent or warrant that your use of our service will be uninterrupted, timely, secure, or error-free.
            We do not warrant that the results that may be obtained from the use of the service will be accurate or reliable.
            <Typography variant="h4" gutterBottom>
              7. Changes to Terms
            </Typography>
            We reserve the right, at our sole discretion, to update, change, or replace any part of these Terms of Service by posting updates and changes to our website. It is your responsibility to check our website periodically for changes.
            <Typography variant="h4" gutterBottom>
              8. Contact Us
            </Typography>
            For more information about our terms and services, or if you have any questions, please contact us.


          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default TermsOfService;
