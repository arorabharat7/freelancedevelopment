// pages/profile/[userId].tsx

import React, { useState, useEffect, ChangeEvent, useRef } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';
import { useRouter } from 'next/router';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  IconButton,
  Snackbar,
  Alert,
  Grid,
  Paper
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Image from 'next/image';
import jwt from 'jsonwebtoken';
import styles from './../../styles/Profile.module.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
const Header = dynamic(() => import('../../components/Header'), { ssr: false });
const theme = createTheme();

interface Skill {
  skill: string;
  verified?: boolean;
  _id?: string;
}

interface ProfileData {
  fullName?: string;
  bio?: string;
  skills: Skill[];
  portfolioLinks?: string[];
  mobileNumber?: string;
  profileImage?: string;
  mobileNumberVerified?: boolean;
  profileVerified?: boolean;
}

const ProfilePage = () => {
  const router = useRouter();
  const { userId } = router.query as { userId: string };
  const [data, setData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState<Skill[]>([]);
  const [portfolioLinks, setPortfolioLinks] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const inputFileRef = useRef<HTMLInputElement>(null);
  const [userType, setUserType] = useState<string | null>(null); // Change role to userType

  const [countryCode, setCountryCode] = useState<string | null>(null); // Change role to userType

  useEffect(() => {
    // Detect country code using IP-based service
    const fetchCountryCode = async () => {
      try {
        const response = await axios.get('https://ipapi.co/json/'); // You can replace with any IP-to-country API
        const { country_calling_code } = response.data;
        setCountryCode(country_calling_code.replace('+', '')); // Set default country code without '+'
      } catch (error) {
        console.error('Error detecting country code:', error);
      }
    };

    fetchCountryCode();
  }, []);


  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decode the token and extract the userType instead of role
        const decodedToken = jwt.decode(token) as { id: string, userType: string };
        setLoggedInUserId(decodedToken.id);
        setUserType(decodedToken.userType); // Change 'role' to 'userType' for consistency
        console.log('decodedToken.userType', decodedToken.userType)
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`/api/profile/${userId}`);
        const profileData: ProfileData = response.data;
        console.log('Fetched Profile Data:', profileData);
        setSkills(profileData.skills);
        setData(profileData);
        setFullName(profileData.fullName || '');
        setBio(profileData.bio || '');
        setPortfolioLinks(profileData.portfolioLinks?.join(', ') || '');
        setMobileNumber(profileData.mobileNumber || '');
        setProfileImage(profileData.profileImage || '');
        setOtpVerified(profileData.mobileNumberVerified || false);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [userId]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSave = async () => {
    if (!userId) {
      console.error('User ID is missing in the URL');
      setSnackbarMessage('User ID is missing');
      setShowSnackbar(true);
      return;
    }

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('fullName', fullName);
    formData.append('bio', bio);
    formData.append(
      'skills',
      skills.map((skillObj) => skillObj.skill.trim()).join(',')
    );
    formData.append('portfolioLinks', portfolioLinks);
    formData.append('profileImage', profileImage);
    if (file) {
      formData.append('file', file);
    }
    formData.append('mobileNumber', mobileNumber); // Ensure mobile number is saved

    try {
      const response = await axios.post('/api/profile/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Updated Profile Response:', response.data);
      setSnackbarMessage(response.data.message || 'Profile updated successfully');
      setShowSnackbar(true);
      setData(response.data.profile);
      setProfileImage(response.data.profile.profileImage);
      setIsEditing(false);
      setOtpVerified(response.data.profile.mobileNumberVerified);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbarMessage('Error updating profile');
      setShowSnackbar(true);
    }
  };

  // Function to handle sending OTP
  const handleSendOtp = async () => {
    if (!mobileNumber || mobileNumber.trim() === '') {
      setSnackbarMessage('Please enter a valid mobile number.');
      setShowSnackbar(true);
      return;
    }
    try {
      const response = await axios.post('/api/profile/send-otp', { userId });
      if (response.data.success) {
        setOtpSent(true);
        setSnackbarMessage('OTP sent to your mobile number.');
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setSnackbarMessage('Error sending OTP');
      setShowSnackbar(true);
    }
  };

  const handleVerifyProfile = async () => {
    if (userType !== 'admin') { // Admin check
      setSnackbarMessage('Only admin can verify profiles.');
      setShowSnackbar(true);
      return;
    }
    try {
      const response = await axios.post('/api/profile/verify-profile', { userId });
      if (response.data.success) {
        setSnackbarMessage('Profile verified successfully');
        setShowSnackbar(true);
        setData(response.data.profile);
      } else {
        setSnackbarMessage('Failed to verify profile');
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error verifying profile:', error);
      setSnackbarMessage('Error verifying profile');
      setShowSnackbar(true);
    }
  };

  const handleRequestVerification = async (skill: string) => {
    try {
      console.log('Requesting verification for skill:', skill);
      console.log('User ID:', userId);
      // Send a request to admin to verify the skill
      const response = await axios.post('/api/profile/request-skill-verification', { userId, skill });
      console.log('Verification request response:', response.data);
      setSnackbarMessage(`Verification request for '${skill}' sent to admin.`);
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error sending verification request:', error);
    
      // Type check for Axios error
      if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error('Error response:', error.response);
        }
      } else {
        console.error('An unexpected error occurred:', error);
      }
      
      setSnackbarMessage('Failed to send verification request.');
      setShowSnackbar(true);
    }
  };

 

  const handleRequestProfileVerification = async () => {
    try {
      // Send a request to admin to verify the profile
      const response = await axios.post('/api/profile/request-profile-verification', { userId });
      setSnackbarMessage('Verification request for profile sent to admin.');
      setShowSnackbar(true);
    } catch (error) {
      console.error('Error sending profile verification request:', error);
      setSnackbarMessage('Failed to send profile verification request.');
      setShowSnackbar(true);
    }
  };


  const handleVerifyOtp = async () => {
    try {
      const response = await axios.post('/api/profile/verify-otp', {
        mobileNumber,
        otp,
      });
      if (response.data.message === 'OTP verified successfully') {
        setOtpVerified(true);
        setIsEditingMobile(false);
        setSnackbarMessage('OTP verified successfully.');
        setShowSnackbar(true);
      } else {
        setSnackbarMessage('Invalid OTP. Please try again.');
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setSnackbarMessage('An error occurred during OTP verification');
      setShowSnackbar(true);
    }
  };

  const handleSkillChange = (index: number, value: string) => {
    const updatedSkills = skills.map((skill, i) =>
      i === index ? { ...skill, skill: value } : skill
    );

    setSkills(updatedSkills);
  };

  const addSkillInput = () => {
    setSkills([...skills, { skill: '' }]);
  };

  const removeSkillInput = (index: number) => {
    const updatedSkills = skills.filter((_, i) => i !== index);
    setSkills(updatedSkills);
  };

  const handleDeleteImage = async () => {
    try {
      const response = await axios.post('/api/profile/delete-image', { userId });
      setSnackbarMessage('Image deleted successfully');
      setShowSnackbar(true);
      setProfileImage('');
      setData((prevData) =>
        prevData ? { ...prevData, profileImage: '' } : null
      );
    } catch (error) {
      console.error('Error deleting image:', error);
      setSnackbarMessage('Error deleting image');
      setShowSnackbar(true);
    }
  };

  const handleVerifySkill = async (skill: string, index: number) => {
    if (userType !== 'admin') {  // Admin check
      setSnackbarMessage('Only admin can verify skills.');
      setShowSnackbar(true);
      return;
    }
    try {
      const response = await axios.post('/api/profile/verify-skill', {
        userId,
        skill,
      });
      if (response.data.success) {
        setSnackbarMessage(`Skill '${skill}' verified successfully`);
        setShowSnackbar(true);

        const updatedSkills = skills.map((s, i) =>
          i === index ? { ...s, verified: true } : s
        );
        setSkills(updatedSkills);
        setData((prevData) => ({
          ...prevData,
          skills: updatedSkills,
        }) as ProfileData);
      } else {
        setSnackbarMessage(`Failed to verify skill '${skill}'`);
        setShowSnackbar(true);
      }
    } catch (error) {
      console.error('Error verifying skill:', error);
      setSnackbarMessage(`Error verifying skill '${skill}'`);
      setShowSnackbar(true);
    }
  };

  if (!data) return <div>Loading...</div>;

  return (
    <ThemeProvider theme={theme}>
      <Container className="min-h-screen mt-10 flex flex-col items-center">
        <Header />
        <main className="flex flex-col items-center w-full py-10">
          {loggedInUserId === userId && (
            <>
              {data?.mobileNumber && data.mobileNumber.trim() !== '' && (
                <>
                  {mobileNumber && !otpVerified && (
                    <Alert severity="warning" className="mb-4">
                      Please verify your mobile number with WhatsApp.
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setIsEditing(true)}
                        className="ml-2"
                      >
                        Verify Mobile
                      </Button>
                    </Alert>
                  )}
                </>
              )}
            </>
          )}
          <Paper elevation={3} className="p-6 w-full max-w-2xl mb-4">
            {isEditing ? (
              <Grid container spacing={2}>
                <Grid item xs={12} className="mb-4">
                  <Typography variant="h6" className="font-medium">
                    Edit Profile
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} className="mb-4">
                  <Typography className="font-medium mb-2">Profile Image:</Typography>
                  {profileImage && profileImage !== '' ? (
                    <>
                      <Image
                        src={profileImage}
                        alt="Profile"
                        width={100}
                        height={100}
                        className="rounded-full object-cover"
                        loading="lazy"
                      />
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleDeleteImage}
                        className="mt-4"
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <input
                      name="file"
                      ref={inputFileRef}
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6} className="mb-4">
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                  />
                </Grid>
                <Grid item xs={12} className="mb-4">
                  {/* <TextField
                    fullWidth
                    variant="outlined"
                    label="Mobile Number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                  /> */}
                  <PhoneInput
                    country={countryCode || 'us'}
                    value={mobileNumber}
                    onChange={setMobileNumber}
                    inputProps={{
                      name: 'phone',
                      required: true,
                      autoFocus: true,
                    }}
                  />
                  {/* Render Send OTP and Verify OTP buttons only if mobileNumber is not blank in the database */}
                  {data?.mobileNumber && data.mobileNumber.trim() !== '' && (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSendOtp}
                        className="mt-2"
                      >
                        Send OTP
                      </Button>
                      {otpSent && !otpVerified && (
                        <Box className="mt-2">
                          <TextField
                            fullWidth
                            variant="outlined"
                            label="Enter OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                          />
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleVerifyOtp}
                            className="mt-2"
                          >
                            Verify OTP
                          </Button>
                        </Box>
                      )}
                    </>
                  )}
                </Grid>
                <Grid item xs={12} className="mb-4">
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Bio"
                    multiline
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself"
                  />
                </Grid>
                <Grid item xs={12} className="mb-4">
                  <Typography className="font-medium mb-2">Skills:</Typography>
                  {skills.map((skillObj, index) => (
                    <div key={index} className="flex items-center mb-2">
                      <TextField
                        fullWidth
                        variant="outlined"
                        value={skillObj.skill}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        placeholder="Enter skill"
                      />
                      <IconButton
                        onClick={() => removeSkillInput(index)}
                        color="secondary"
                        className="ml-2"
                      >
                        <RemoveIcon />
                      </IconButton>
                    </div>
                  ))}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={addSkillInput}
                    startIcon={<AddIcon />}
                  >
                    Add Skill
                  </Button>
                </Grid>
                <Grid item xs={12} className="mb-4">
                  <TextField
                    fullWidth
                    variant="outlined"
                    label="Portfolio Links"
                    value={portfolioLinks}
                    onChange={(e) => setPortfolioLinks(e.target.value)}
                    placeholder="Enter your portfolio links, separated by commas"
                  />
                </Grid>
                <Grid item xs={12} className="flex justify-end">
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    color="secondary"
                    onClick={() => setIsEditing(false)}
                    className="ml-2"
                  >
                    Cancel
                  </Button>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2}>
                <Grid item xs={12} className="text-center mb-4">
                  {profileImage && (
                    <Image
                      src={profileImage}
                      alt="Profile"
                      width={100}
                      height={100}
                      loading="lazy"
                      className="rounded-full object-cover"
                    />
                  )}
                </Grid>
                <Grid item xs={12} className="text-center">
                {userType === 'admin' && !data?.profileVerified && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleVerifyProfile}
                  >
                    Verify Profile
                  </Button>
                )}

                {loggedInUserId === userId && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleRequestProfileVerification()}
                  >
                    Request Profile Verification
                  </Button>
                )}
                </Grid>
                <Grid item xs={12} className="mb-4">
                  <Typography variant="h5" className="font-medium">
                    Full Name
                  </Typography>
                  <Typography variant="body1">{fullName}</Typography>
                </Grid>
                <Grid item xs={12} className="mb-4">
                  <Typography variant="h5" className="font-medium">
                    Mobile Number
                  </Typography>
                  <Typography variant="body1">
                    {mobileNumber}
                    {otpVerified && (
                      <CheckCircleIcon
                        className="ml-2"
                        style={{ color: 'green' }}
                      />
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} className="mb-4">
                  <Typography variant="h5" className="font-medium">
                    Bio
                  </Typography>
                  <Typography variant="body1">{bio}</Typography>
                </Grid>
                <Grid item xs={12} className="mb-4">
                  <Typography variant="h5" className="font-medium">
                    Skills
                  </Typography>
                  <ul className="list-none p-0">
                    {skills.length ? (
                      skills.map((skillObj, index) => (
                        <li
                          key={index}
                          className="bg-gray-100 my-2 py-2 px-4 rounded-md flex items-center"
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap', // Make items wrap on smaller screens
                            justifyContent: 'space-between',
                            padding: '8px',
                            margin: '8px 0',
                            borderRadius: '8px',
                          }}
                        >
                          {skillObj.skill}
                          {skillObj.verified ? (
                            <CheckCircleIcon
                              className="ml-2"
                              style={{ color: 'green' }}
                            />
                          ) : (
                            <>
                              {/* Show "Verify This Skill" link only if userType is admin */}
                              {userType === 'admin' && !skillObj.verified && (
                                <a
                                  href="#"
                                  onClick={() => handleVerifySkill(skillObj.skill, index)}
                                  style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                  Verify This Skill
                                </a>
                              )}

                              {/* Show "Request Skill Verification" link for non-admins */}
                              {loggedInUserId === userId && (
                                <a
                                  href="#"
                                  onClick={() => handleRequestVerification(skillObj.skill)}
                                  style={{ color: '#1976d2', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                  Request Skill Verification
                                </a>
                              )}
                            </>
                          )}
                        </li>
                      ))
                    ) : (
                      <li>No skills listed.</li>
                    )}
                  </ul>
                </Grid>
                <Grid item xs={12} className="mb-4">
                  <Typography variant="h5" className="font-medium">
                    Portfolio Links
                  </Typography>
                  <ul className="list-none p-0">
                    {portfolioLinks.split(', ').map((link, index) => (
                      <li
                        key={index}
                        className="bg-gray-100 my-2 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors duration-200 ease-in-out sm:my-2 md:my-3 lg:my-4"
                      >
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline break-all"
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </Grid>


                {loggedInUserId === userId && (
                  <Grid item xs={12} className="flex justify-center mt-4">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit Profile
                    </Button>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
        </main>
      </Container>
      <Snackbar
        open={showSnackbar}
        message={snackbarMessage}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
      />
    </ThemeProvider>
  );
};

export default ProfilePage;
