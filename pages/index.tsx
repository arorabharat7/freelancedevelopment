// Home.tsx
import dynamic from 'next/dynamic';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { TextField, Button, Container, Typography, Box, Paper, Grid, Skeleton, useMediaQuery } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styled from 'styled-components'; 
import LoginModal from '@/components/LoginModal'; 

// Lazy load components
const Footer = dynamic(() => import('../components/Footer'), { ssr: false });
const Header = dynamic(() => import('../components/Header'), { ssr: false });
const Chat = dynamic(() => import('../components/Chat'), { ssr: false });

// Dynamic imports for components
const HeavyComponent = dynamic(() => import('../components/HeavyComponent'), { ssr: false });

const theme = createTheme();

const UserImageWithEmail = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StyledImageWrapper = styled.div`
  position: relative;
  border-radius: 50%;
  overflow: hidden;
`;

const containerStyles = {
  marginTop: '4rem',
};

const inputStyles = {
  marginBottom: '1rem',
};

const heading2 = {
  fontWeight: 700,
  letterSpacing: -1,
  minHeight: '3rem',
  fontSize: { xs: '2.5rem', md: '3.5rem' }, // Responsive sizes
};

const userListStyles = {
  marginTop: '10px',
};

const userCardStyles = {
  padding: '1rem',
  borderRadius: 0,
  minHeight: '150px',
};

const spinnerStyles = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: '2rem',
};

const paginationStyles = {
  display: 'flex',
  justifyContent: 'center',
  marginTop: '2rem',
};

interface Skill {
  _id: string;
  skill: string;
  verified: boolean;
}

interface UserProfile {
  fullName: string;
  mobileNumber: string;
  profileImage: string;
  skills: Skill[];
  portfolioLinks: string[];
}

interface User {
  _id: string;
  email: string;
  profile: UserProfile;
}

const Home: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loggedIn, setLoggedIn] = useState(false); // State for login
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false); // State for login modal
  const [loggedInUserId, setLoggedInUserId] = useState<string | null>(null); // Store logged-in user ID
  const [chatUserId, setChatUserId] = useState<string | null>(null); // State to manage chat visibility

  // useEffect hook to fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get('/api/users', { params: { page, search } });
        if (page === 1) {
          setUsers(response.data);
        } else {
          setUsers((prevUsers) => [...prevUsers, ...response.data]);
        }
        setHasMore(response.data.length > 0);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
      setLoading(false);
    };

    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId'); // Retrieve userId from localStorage
    if (token && userId) {
      setLoggedIn(true);
      setLoggedInUserId(userId); // Set the logged-in user ID
    }

    // Fetch users on initial load
    fetchUsers();
  }, [page, search]);

  // Changes in handleSearchChange function (where you type in the search bar)
  const handleSearchChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.target.value;
    setSearch(searchValue);

    if (searchValue.length > 0) {
      setLoading(true);
      try {
        const response = await axios.get('/api/users', { params: { search: searchValue } });
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
      setLoading(false);
    } else {
      setSearchResults([]);
    }
  }, []);

  const loadMore = useCallback(() => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [hasMore]);

  const maskEmail = useCallback((email: string) => {
    if (!email) {
      console.error('Email is undefined or null:', email);
      return 'Invalid email';
    }
    return email.replace(/(.{3})(.*)(?=@)/, '$1***');
  }, []);

  const maskLink = useCallback((link: string) => {
    if (!link) {
      console.error('Link is undefined or null:', link);
      return 'Invalid link';
    }
    const pattern = /https:\/\/www\.(.{3})(.*?)/;
    const match = link.match(pattern);
    if (match) {
      return `${match[1]}***`;
    }
    return 'Invalid link';
  }, []);

  const maskMobileNumber = useCallback((number: string) => {
    if (!number) {
      console.error('Mobile number is undefined or null:', number);
      return 'Invalid number';
    }

    // Handle case where number starts with '+'
    if (number.startsWith('+')) {
      return number.replace(/(\+\d{2})(\d{4})(\d{4})(\d{2})/, '$1******$3');
    } else if (number.length === 10) {
      // Handle standard 10 digit numbers without '+'
      return number.replace(/(\d{2})(\d{6})(\d{2})/, '$1******$3');
    } else {
      return number.replace(/(\d{2})(\d+)(\d{2})/, '$1****$3'); // Mask any other format
    }
  }, []);

  const handleChatClick = useCallback((userId: string) => {
    if (loggedIn && loggedInUserId) {
      // Open chat with the selected user
      setChatUserId(userId);
    } else {
      setIsLoginOpen(true);
    }
  }, [loggedIn, loggedInUserId]);

  const handleSkillClick = useCallback(async (skill: string) => {
    setSearch(skill); // Set the search bar text to the selected skill
    setLoading(true);
    try {
      const response = await axios.get('/api/users', { params: { search: skill } });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
    setLoading(false);
  }, []);

  const displayUsers = search.length > 0 ? searchResults : users;

  return (
    <ThemeProvider theme={theme}>
      <Container style={containerStyles} className={styles.container}>
        <Head>
          <title>Freelance Development Agency</title>
          <meta name="description" content="Freelance Development Agency connects clients with skilled freelancers for various projects." />
          <meta name="keywords" content="freelance, freelancers, hire freelancers, freelance projects, freelance developers" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
          <link rel="icon" href="/favicon.ico" />
          <meta name="robots" content="index, follow" />
          <meta property="og:title" content="Freelance Development Agency" />
          <meta property="og:description" content="Your one-stop solution for hiring and managing freelancers." />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://www.freelancedevelopmentagency.com" />
          <meta property="og:image" content="https://www.freelancedevelopmentagency.com/og-image.png" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Freelance Development Agency" />
          <meta name="twitter:description" content="Your one-stop solution for hiring and managing freelancers." />
          <meta name="twitter:image" content="https://www.freelancedevelopmentagency.com/twitter-image.png" />
        </Head>

        <Header />

        <Box my={4}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            align="center"
            sx={{
              fontWeight: 700,
              letterSpacing: -1,
              minHeight: '3rem',
              fontSize: { xs: '2.5rem', md: '3.5rem' },  // Responsive font size
            }}
          >
            Welcome to <span className="text-green-600">Freelance Development</span> Agency
          </Typography>

          <Typography variant="h6" component="p" gutterBottom align="center">
            Your one-stop solution for hiring and managing freelancers.
          </Typography>
        </Box>

        <Box position="sticky" top={0} bgcolor="white" zIndex={10} style={{ minHeight: '60px' }}>
          <TextField
            placeholder="Search skills..."
            value={search}
            onChange={handleSearchChange}
            variant="outlined"
            sx={{
              marginBottom: '1rem',
            }}
            style={{ ...inputStyles, height: '40px' }}
            inputRef={searchInputRef}
            fullWidth
            aria-label="Search for freelancers by skills"
          />
          {searchResults.length > 0 && (
            <Paper elevation={3} className="absolute z-20 " style={{ maxHeight: '90px' }}>
              {searchResults.map((result) =>
                result.profile.skills
                  .filter((skill) => skill.skill.toLowerCase().includes(search.toLowerCase()))
                  .map((filteredSkill) => (
                    <Box
                      key={`${result._id}-${filteredSkill.skill}`}
                      p={2}
                      onClick={() => handleSkillClick(filteredSkill.skill)}
                    >
                      {filteredSkill.skill}
                    </Box>
                  ))
              )}
            </Paper>
          )}
        </Box>

        <Typography variant="h4" component="h2" gutterBottom className="mt-6">
          Freelancer List
        </Typography>

        {loading ? (
          <Grid container spacing={3} style={userListStyles}>
            {[1, 2, 3, 4].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Paper elevation={3} style={userCardStyles}>
                  <UserImageWithEmail>
                    <StyledImageWrapper>
                      <Skeleton variant="circular" width={40} height={40} />
                    </StyledImageWrapper>
                    <Typography variant="h6" component="h3">
                      <Skeleton width="60%" />
                    </Typography>
                  </UserImageWithEmail>
                  <Typography variant="subtitle1">
                    <Skeleton width="40%" />
                  </Typography>
                  <Typography>
                    <Skeleton width="80%" />
                  </Typography>
                  <Typography>
                    <Skeleton width="90%" />
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3} style={userListStyles}>
            {displayUsers.length === 0 && !loading ? (
              <div className="placeholder dynamic-container">
                <Typography variant="h6">No freelancers found. Please try a different search or load more results.</Typography>
              </div>
            ) : (
              displayUsers.map((user) => (
                <Grid item xs={12} md={6} key={user._id}>
                  <Paper elevation={3} style={userCardStyles}>
                    <UserImageWithEmail>
                      <StyledImageWrapper
                        style={{ objectFit: 'cover', width: '40px', minWidth: '40px', maxWidth: '40px', height: 'auto' }} // Responsive styling
                      >
                        <Image
                          src={user.profile.profileImage || "/images/freelancedevelopmentagency.webp"}
                          alt="Freelance Development Agency"
                          style={{ objectFit: 'cover', width: '40px', minWidth: '40px', maxWidth: '40px', height: 'auto' }} // Responsive styling
                          priority={true}
                          width={40}
                          height={40}
                         />
                      </StyledImageWrapper>
                      <div>
                        <Typography
                          sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word' // Ensure word breaks inside element
                          }}
                          variant="subtitle1">{user.profile.fullName}</Typography>
                        <Typography
                          sx={{
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word', // Ensure email breaks inside element
                            whiteSpace: 'normal'  // Allows wrapping on small screens
                          }}
                          variant="h6" component="h3">
                          {loggedIn ? (
                            <Link href={`/profile/${user._id}`}>
                              {user.email}
                            </Link>
                          ) : (
                            maskEmail(user.email)
                          )}
                        </Typography>
                      </div>
                    </UserImageWithEmail>
                    <Typography component="div">
                      Skills:
                      <Typography component="ul" sx={{ padding: 0, listStyle: 'none', margin: 0 }}>
                        {user.profile.skills && user.profile.skills.length ? (
                          user.profile.skills.map((skillObj) => (
                            <li
                              key={skillObj._id}
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
                              <span style={{ fontSize: '1rem' }}>{skillObj.skill}</span>
                              {skillObj.verified && (
                                <span style={{ marginLeft: '8px', color: 'green', fontSize: '1.2rem' }}>✓</span>
                              )}
                            </li>
                          ))
                        ) : (
                          <li>No skills listed.</li>
                        )}
                      </Typography>
                    </Typography>

                    <Typography>
                      Portfolio Links: {user.profile.portfolioLinks.map((link: string) => loggedIn ? link : maskLink(link)).join(', ')}
                    </Typography>
                    <Typography>
                      WhatsApp:{" "}
                      {loggedIn ? (
                        <Link href={`https://wa.me/${user.profile.mobileNumber}`} target="_blank">
                          {user.profile.mobileNumber}
                        </Link>
                      ) : (
                        maskMobileNumber(user.profile.mobileNumber)
                      )}
                    </Typography>
                  </Paper>
                </Grid>
              ))
            )}
          </Grid>
        )}

        {hasMore && search.length === 0 && (
          <div style={paginationStyles}>
            <Button style={{ marginRight: 10 }} variant="contained" color="primary" onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="contained" color="primary" onClick={loadMore} disabled={!hasMore}>
              Next
            </Button>
          </div>
        )}

        {/* Display chat component if a user is selected */}
        {chatUserId && (
          <Chat
            userId={chatUserId}
            loggedInUserId={loggedInUserId} // Pass logged-in user ID to the Chat component
            onClose={() => setChatUserId(null)}
          />
        )}

        <HeavyComponent />
        <Footer />

        {isLoginOpen && <LoginModal onClose={() => setIsLoginOpen(false)} />}
      </Container>
    </ThemeProvider>
  );
};

export default Home;
