import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import Header from '../../../components/Header';
import { TextField, Button, Typography, Box, Modal } from '@mui/material';
import styles from '../../../styles/BlogCreate.module.css';
import Image from 'next/image';
import { fleschKincaid } from 'flesch-kincaid';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import ImageBrowser from '../../../components/ImageBrowser';
import TableOfContents from '../../../components/TableOfContents';

import {
  checkTitleLength,
  checkMetaDescriptionLength,
  checkKeywordsPresence,
  checkKeywordSuggestionsPresence,
  fetchKeywordSuggestions
} from '../../../utils/seoChecks';

const Editor = dynamic(() => import('../../../components/Editor'), { ssr: false });

const EditBlog: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;

  const editorRef = useRef(null);
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


  
  useEffect(() => {
    const checkAdmin = async () => {
      const token = localStorage.getItem('token');
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
        router.push('/login');
      }
    };
    checkAdmin();
  }, [router]);

  useEffect(() => {
    if (slug) {
      const fetchData = async () => {
        try {
          const response = await axios.get(`/api/blog/${slug}`);
          const blog = response.data;

          setTitle(blog.title);
          setContent(blog.content);
          setCategories(blog.categories);
          setTags(blog.tags);
          setFeaturedImage(blog.featuredImage);
          setSeoTitle(blog.seo.title);
          setSeoDescription(blog.seo.description);
          setSeoKeywords(blog.seo.keywords);
          setMetaDescription(blog.metaDescription);
          setAuthorBio(blog.authorBio);
          setAltText(blog.altText);
          setReferences(blog.references);

          // Manually call validation functions to set feedback
          setTitleFeedback(checkTitleLength(blog.title));
          setMetaDescriptionFeedback(checkMetaDescriptionLength(blog.metaDescription));
          setSeoTitleFeedback(checkTitleLength(blog.seo.title));
          setSeoDescriptionFeedback(checkMetaDescriptionLength(blog.seo.description));
          setSeoKeywordsFeedback(checkKeywordsPresence(blog.content, blog.seo.keywords));
        } catch (error) {
          console.error('Failed to fetch blog data:', error);
        }
      };

      fetchData();
    }
  }, [slug]);

  // Cloudinary image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      setUploading(true);
      const response = await axios.post('/api/blog/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Ensure the Cloudinary URL is set to the featuredImage field
      setFeaturedImage(response.data.url);  // Cloudinary URL is returned here
      setUploading(false);
    } catch (err) {
      console.error(err);
      setUploading(false);
    }
  };
  

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    const feedback = checkTitleLength(newTitle);
    setTitleFeedback(feedback);
  };

  const handleMetaDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDescription = e.target.value;
    setMetaDescription(newDescription);
    const feedback = checkMetaDescriptionLength(newDescription);
    setMetaDescriptionFeedback(feedback);
  };

  const handleSeoTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSeoTitle = e.target.value;
    setSeoTitle(newSeoTitle);
    const feedback = checkTitleLength(newSeoTitle);
    setSeoTitleFeedback(feedback);
  };

  const handleSeoDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newSeoDescription = e.target.value;
    setSeoDescription(newSeoDescription);
    const feedback = checkMetaDescriptionLength(newSeoDescription);
    setSeoDescriptionFeedback(feedback);
  };

  const handleKeywordsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newKeywords = e.target.value.split(', ');
    setSeoKeywords(newKeywords);
    const feedback = checkKeywordsPresence(content, newKeywords);
    setSeoKeywordsFeedback(feedback);
    handleKeywordSuggestion(e);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setSeoKeywordsFeedback(checkKeywordsPresence(value, seoKeywords));
    setKeywordSuggestionsFeedback(checkKeywordSuggestionsPresence(value, keywordSuggestions.map(s => s.keyword)));
    checkReadability(value);
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
        const word = line.split(' ').length;
        const syllable = syllableCount(line);
        const score = fleschKincaid({ sentence: 1, word: word, syllable: syllable });
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
  
    try {
      const token = localStorage.getItem('token');
      const postData = {
        title,
        content,
        categories,
        tags,
        featuredImage,  // Send the Cloudinary URL for the featured image
        seo: {
          title: seoTitle,
          description: seoDescription,
          keywords: seoKeywords,
        },
        metaDescription,
        authorBio,
        altText,
        references,
        status: isPublished ? 'published' : 'draft',
      };
  
      const response = await axios.put(`/api/blog/${slug}`, postData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      router.push('/blog');
    } catch (error) {
      console.error('Failed to update blog:', error);
      alert('Failed to update blog');
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
          <TableOfContents content={content} />
        </div>
        <div>
          <Typography variant="h4" component="h1" gutterBottom className={styles.title}>Edit Blog Post</Typography>
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
              <div id="editor">
                <Editor ref={editorRef} onChange={handleContentChange} value={content} />
              </div>
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
            <Typography>Featured Image</Typography>
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
              <Button type="submit" variant="contained" color="primary" fullWidth className={styles.button}>Update</Button>
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

export default EditBlog;
