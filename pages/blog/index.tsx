import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import DOMPurify from 'dompurify';
import Header from './../../components/Header';
import Head from 'next/head';
import { TextField, CircularProgress, Button, Container, Typography, Box, Paper, Grid } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import styles from '../../styles/Blog.module.css'; // Ensure this file exists

interface Post {
  _id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
}

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

const containerStyles = {
  marginTop: '5rem',
  marginBottom: '2rem',
};

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get<Post[]>('/api/blog');
        setPosts(response.data);
      } catch (error) {
        console.error('Error fetching blog posts:', error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <Head>
        <title>Freelance Development Agency Blog - Latest Articles & Tips</title>
        <meta name="description" content="Read the latest articles and tips on web development, freelancing, and technology. Stay updated with Freelance Development Agency's insightful blogs." />
        <meta name="keywords" content="freelance development, web development, technology tips, blog, freelance tips, web development tutorials" />
        <meta property="og:title" content="Freelance Development Agency Blog" />
        <meta property="og:description" content="Explore the latest articles and resources on freelancing, development, and technology by Freelance Development Agency." />
        <meta property="og:image" content="https://www.freelancedevelopmentagency.com/og-image.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.freelancedevelopmentagency.com/blog" />
        <meta name="robots" content="index, follow" />
      </Head>
      <Header />
      <Container style={containerStyles} className={styles.container}>
        <div className="max-w-4xl mx-auto p-4">
          <h1 className="text-4xl font-bold mb-8">Blog</h1>
          <ul>
            {posts.map(post => (
              <li key={post._id} className="mb-8 border-b pb-4">
                <Link href={`/blog/${post.slug}`} legacyBehavior>
                  <a className="text-2xl font-semibold text-blue-600 hover:underline">
                    {post.title}
                  </a>
                </Link>
                {post.featuredImage && (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    width={500}
                    height={300}
                    layout="responsive"
                    className="rounded-md mt-4"
                    loading="lazy"
                  />
                )}
                <div
                  className="mt-4 text-gray-700"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content.substring(0, 100) + '...') }}
                />
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </ThemeProvider>
  );
};

export default Blog;
