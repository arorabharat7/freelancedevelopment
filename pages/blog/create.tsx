import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Header from './../../components/Header';
import { TextField, Button, Typography, Box, Modal } from '@mui/material';
import styles from './../../styles/BlogCreate.module.css';
import Image from 'next/image';
import { fleschKincaid } from 'flesch-kincaid';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import ImageBrowser from './../../components/ImageBrowser';
import TableOfContents from './../../components/TableOfContents';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

import {
  checkTitleLength,
  checkMetaDescriptionLength,
  checkKeywordsPresence,
  checkKeywordSuggestionsPresence,
  fetchKeywordSuggestions
} from '../../utils/seoChecks';

const Editor = dynamic(() => import('../../components/Editor'), { ssr: false });

const CreateBlog: React.FC = () => {
  const [title, setTitle] = useState('');
  const [titleFeedback, setTitleFeedback] = useState<{ message: string, isValid: boolean } | null>(null);
  const [content, setContent] = useState('');
  const [readabilitySuggestions, setReadabilitySuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoTitleFeedback, setSeoTitleFeedback] = useState<{ message: string, isValid: boolean } | null>(null);
  const [seoDescription, setSeoDescription] = useState('');
  const [seoDescriptionFeedback, setSeoDescriptionFeedback] = useState<{ message: string, isValid: boolean } | null>(null);
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [seoKeywordsFeedback, setSeoKeywordsFeedback] = useState<{ message: string, isValid: boolean } | null>(null);
  const [metaDescription, setMetaDescription] = useState('');
  const [metaDescriptionFeedback, setMetaDescriptionFeedback] = useState<{ message: string, isValid: boolean } | null>(null);
  const [authorBio, setAuthorBio] = useState('');
  const [altText, setAltText] = useState('');
  const [references, setReferences] = useState('');
  const [uploading, setUploading] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState<{ keyword: string, searchVolume: number, cpc: string, competition: string, relatedKeywords: string[] }[]>([]);
  const [keywordSuggestionsFeedback, setKeywordSuggestionsFeedback] = useState<{ message: string, isValid: boolean } | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
      // console.log('token>>>>', token)
      if (!token) {
        router.push('/');
        return;
      }
      try {
        await axios.get('/api/admin/check', {
          
          headers: {
            Authorization: `Bearer ${token}`,
            
          }
        });
      } catch (error) {
        router.push('/');
      }
    };
    checkAdmin();
  }, [router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await axios.post('http://localhost:5000/upload', formData, { // Change the URL to match your server endpoint
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFeaturedImage(response.data.filePath);
      setUploading(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setTitleFeedback(checkTitleLength(newTitle));
  };

  const handleMetaDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setMetaDescription(newDescription);
    setMetaDescriptionFeedback(checkMetaDescriptionLength(newDescription));
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeywords = e.target.value.split(', ');
    setSeoKeywords(newKeywords);
    setSeoKeywordsFeedback(checkKeywordsPresence(content, newKeywords));
    handleKeywordSuggestion(e); // Fetch keyword suggestions when keywords change
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setSeoKeywordsFeedback(checkKeywordsPresence(value, seoKeywords));
    setKeywordSuggestionsFeedback(checkKeywordSuggestionsPresence(value, keywordSuggestions.map(s => s.keyword)));
    checkReadability(value); // Check readability when content changes
  };

  const handleSeoTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeoTitle = e.target.value;
    setSeoTitle(newSeoTitle);
    setSeoTitleFeedback(checkTitleLength(newSeoTitle));
  };

  const handleSeoDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSeoDescription = e.target.value;
    setSeoDescription(newSeoDescription);
    setSeoDescriptionFeedback(checkMetaDescriptionLength(newSeoDescription));
  };

  const handleKeywordSuggestion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    if (query.trim()) {
      const suggestions = await fetchKeywordSuggestions(query);
      setKeywordSuggestions(suggestions);
    } else {
      setKeywordSuggestions([]);
    }
  };

  const checkReadability = (content: string) => {
    const lines = content.split('\n');
    const suggestions: string[] = [];

    lines.forEach((line, index) => {
      if (line.trim().length > 0) {
        const sentence = line;
        const word = line.split(' ').length;
        const syllable = syllableCount(line);

        const score = fleschKincaid({ sentence: word, word: word, syllable: syllable });
        if (score > 12) {
          suggestions.push(`Line ${index + 1}: Consider simplifying this sentence for better readability.`);
        }
      }
    });

    setReadabilitySuggestions(suggestions);
  };

  const syllableCount = (word: string) => {
    word = word.toLowerCase();
    if (word.length <= 3) {
      return 1;
    }
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
    word = word.replace(/^y/, '');

    const matches = word.match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  };

  const handleSubmit = async (e: React.FormEvent, isPublished: boolean) => {
    e.preventDefault();

    if (!titleFeedback?.isValid || !metaDescriptionFeedback?.isValid || !seoTitleFeedback?.isValid || !seoDescriptionFeedback?.isValid || !seoKeywordsFeedback?.isValid) {
      alert('Please fix the SEO issues before submitting.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const postData = {
        title,
        content,
        categories,
        tags,
        featuredImage,
        seo: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords
        },
        metaDescription,
        authorBio,
        altText,
        references,
        status: isPublished ? 'published' : 'draft'
      };

      // console.log('Submitting Post Data:', postData);

      const response = await axios.post('/api/blog/create', postData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // console.log('Response:', response.data);
      router.push('/blog');
    } catch (error) {
      console.error('Failed to create blog:', error);
      alert('Failed to create blog');
    }
  };

  const insertImageToEditor = (url: string) => {
    setContent((prevContent) => `${prevContent}\n\n![Image](${url})`);
    setImageModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <Header />
      <main className={styles.main}>
        <div>
          <TableOfContents content={content} /> {/* Add this line for Table of Contents */}
        </div>
        <div>
          <Typography variant="h4" component="h1" gutterBottom className={styles.title}>Create Blog Post</Typography>
          <form onSubmit={(e) => handleSubmit(e, true)} className={styles.form}>
            <TextField
              label="Title"
              variant="outlined"
              fullWidth
              value={title}
              onChange={handleTitleChange}
              required
              className={styles.input}
            />
            {titleFeedback && (
              <Typography className={`${styles.feedback} ${titleFeedback.isValid ? styles.success : styles.error}`}>
                {titleFeedback.message}
              </Typography>
            )}
            <TextField
              label="Meta Description"
              variant="outlined"
              fullWidth
              value={metaDescription}
              onChange={handleMetaDescriptionChange}
              required
              className={styles.input}
            />
            {metaDescriptionFeedback && (
              <Typography className={`${styles.feedback} ${metaDescriptionFeedback.isValid ? styles.success : styles.error}`}>
                {metaDescriptionFeedback.message}
              </Typography>
            )}
            <Box sx={{}}>
              <Editor value='' onChange={handleContentChange} />
            </Box>

            {readabilitySuggestions.length > 0 && (
              <div className={styles.suggestions}>
                <Typography variant="h6" component="h2">Readability Suggestions:</Typography>
                <ul>
                  {readabilitySuggestions.map((suggestion, index) => (
                    <li key={index}>
                      <Typography>{suggestion}</Typography>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {seoKeywordsFeedback && (
              <Typography className={`${styles.feedback} ${seoKeywordsFeedback.isValid ? styles.success : styles.error}`}>
                {seoKeywordsFeedback.message}
              </Typography>
            )}
            {keywordSuggestionsFeedback && (
              <Typography className={`${styles.feedback} ${keywordSuggestionsFeedback.isValid ? styles.success : styles.error}`}>
                {keywordSuggestionsFeedback.message}
              </Typography>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className={styles.input}
            />
            {uploading && <Typography>Uploading image...</Typography>}
            {featuredImage && (
              <Box mt={2}>
                <Image src={featuredImage} alt="Featured" width={600} height={400} className={styles.imagePreview} loading="lazy" />
              </Box>
            )}
            <TextField
              label="Categories (comma separated)"
              variant="outlined"
              fullWidth
              value={categories.join(', ')}
              onChange={(e) => setCategories(e.target.value.split(', '))}
              className={styles.input}
            />
            <TextField
              label="Tags (comma separated)"
              variant="outlined"
              fullWidth
              value={tags.join(', ')}
              onChange={(e) => setTags(e.target.value.split(', '))}
              className={styles.input}
            />
            <TextField
              label="SEO Title"
              variant="outlined"
              fullWidth
              value={seoTitle}
              onChange={handleSeoTitleChange}
              className={styles.input}
            />
            {seoTitleFeedback && (
              <Typography className={`${styles.feedback} ${seoTitleFeedback.isValid ? styles.success : styles.error}`}>
                {seoTitleFeedback.message}
              </Typography>
            )}
            <TextField
              label="SEO Description"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              value={seoDescription}
              onChange={handleSeoDescriptionChange}
              className={styles.textarea}
            />
            {seoDescriptionFeedback && (
              <Typography className={`${styles.feedback} ${seoDescriptionFeedback.isValid ? styles.success : styles.error}`}>
                {seoDescriptionFeedback.message}
              </Typography>
            )}
            <TextField
              label="SEO Keywords (comma separated)"
              variant="outlined"
              fullWidth
              value={seoKeywords.join(', ')}
              onChange={handleKeywordsChange}
              className={styles.input}
            />
            <div className={styles.suggestions}>
              {keywordSuggestions.map((suggestion, index) => (
                <Typography
                  key={index}
                  className={styles.suggestion}
                  style={{ color: content.includes(suggestion.keyword) ? 'green' : 'red' }}
                >
                  {suggestion.keyword}
                </Typography>
              ))}
            </div>
            <TextField
              label="Author Bio"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              value={authorBio}
              onChange={(e) => setAuthorBio(e.target.value)}
              className={styles.textarea}
            />
            <TextField
              label="Image Alt Text"
              variant="outlined"
              fullWidth
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              className={styles.input}
            />
            <TextField
              label="References"
              variant="outlined"
              multiline
              rows={4}
              fullWidth
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              className={styles.textarea}
            />
            <Box display="flex" justifyContent="space-between">
              <Button type="button" variant="contained" color="secondary" fullWidth className={styles.button} onClick={(e) => handleSubmit(e, false)}>Save as Draft</Button>
              <Button type="submit" variant="contained" color="primary" fullWidth className={styles.button}>Publish</Button>
            </Box>
          </form>
        </div>
      </main>

      <Modal
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        aria-labelledby="image-browser-modal"
        aria-describedby="image-browser-modal-description"
      >
        <Box className={styles.modalBox}>
          <Typography id="image-browser-modal-description">Select an Image</Typography>
          <ImageBrowser onSelect={insertImageToEditor} />
        </Box>
      </Modal>
    </div>
  );
};

export default CreateBlog;
