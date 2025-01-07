import { useRouter } from 'next/router';
import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Header from '../../components/Header';
import Image from 'next/image';
import TableOfContents from '../../components/TableOfContents';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import styled from 'styled-components';
import Head from 'next/head';

// Dynamic import for Editor component
const Editor = dynamic(() => import('../../components/Editor'), { ssr: false });
const HeavyComponent = dynamic(() => import('../../components/HeavyComponent'), { ssr: false });

interface Post {
  _id: string;
  title: string;
  content: string;
  categories: string[];
  tags: string[];
  publishedAt: Date;
  featuredImage: string;
  altText: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  metaDescription: string;
  authorBio: string;
  references: string;
}

// Styled-components
const PageContainer = styled.div`
  background-color: #f9f9f9;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  margin: auto;
  max-width: 1200px;
  padding: 1rem;
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  margin-top: 100px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
  color: #333;
`;

const DateText = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin-bottom: 1.5rem;
`;

const Content = styled.div`
  .prose {
    max-width: none;
  }
  h1, h2, h3, h4, h5, h6 {
    color: #333;
  }
  p {
    color: #666;
  }
  a {
    color: #1e90ff;
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }
  ul, ol {
    padding-left: 1.5rem;
  }
  li {
    margin: 0.5rem 0;
  }
  img {
    max-width: 100%;
    height: auto;
    border-radius: 0.5rem;
  }
`;

const Sidebar = styled.div`
  display: none;

  @media (min-width: 768px) {
    display: block;
    width: 25%;
    min-width: 300px;
    position: -webkit-sticky; /* For Safari */
    position: sticky;
    top: 100px;
    padding: 1rem;
    background: #fff;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    margin-right: 2rem;
    max-height: calc(100vh - 40px); /* To handle max height with some padding */
    overflow: auto;
  }
`;

const Section = styled.div`
  margin-top: 2rem;
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  p, .prose {
    font-size: 1rem;
    color: #666;
  }
`;

const Heading1 = styled.h1`
  font-size: 2.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Heading2 = styled.h2`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Heading3 = styled.h3`
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Heading4 = styled.h4`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Heading5 = styled.h5`
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const Heading6 = styled.h6`
  font-size: 1rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const BlogDetail: React.FC = () => {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get<Post>(`/api/blog/${slug}`);
        setPost(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching blog post:', error);
        setError('Failed to load blog post');
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  useEffect(() => {
    const handleHashChange = () => {
      const yOffset = -100; // offset value for the fixed header
      const element = document.getElementById(window.location.hash.substring(1));
      if (element) {
        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current) return;

      const lastLi = sidebarRef.current.querySelector('li:last-child');
      if (lastLi) {
        const lastLiRect = lastLi.getBoundingClientRect();
        const sidebarRect = sidebarRef.current.getBoundingClientRect();
        const isLastLiVisible = lastLiRect.bottom <= window.innerHeight && lastLiRect.bottom >= sidebarRect.top;

        if (isLastLiVisible) {
          sidebarRef.current.style.overflow = 'hidden';
        } else {
          sidebarRef.current.style.overflow = 'auto';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (loading) return <div className="text-center text-lg">Loading...</div>;
  if (error) return <div className="text-center text-lg text-red-500">{error}</div>;

  if (!post) return <div className="text-center text-lg text-red-500">Post not found</div>;

  const addIdsToHeadings = (content: string) => {
    const regex = /<h([1-6])>(.*?)<\/h\1>/g;
    return content.replace(regex, (match, p1, p2) => {
      const id = p2.toLowerCase().replace(/\s+/g, '-');
      return `<h${p1} id="${id}">${p2}</h${p1}>`;
    });
  };

  const contentWithIds = addIdsToHeadings(post.content);

  const renderContentWithHeadings = (content: string) => {
    const div = document.createElement('div');
    div.innerHTML = content;
    const children = Array.from(div.childNodes);

    return children.map((child, index) => {
      if (child.nodeType === 1) {
        const element = child as HTMLElement;
        if (element.tagName === 'SPAN') {
          return null; // Hide span content for example
        }
        switch (element.tagName) {
          case 'H1':
            return <Heading1 key={index} id={element.id}>{element.innerHTML}</Heading1>;
          case 'H2':
            return <Heading2 key={index} id={element.id}>{element.innerHTML}</Heading2>;
          case 'H3':
            return <Heading3 key={index} id={element.id}>{element.innerHTML}</Heading3>;
          case 'H4':
            return <Heading4 key={index} id={element.id}>{element.innerHTML}</Heading4>;
          case 'H5':
            return <Heading5 key={index} id={element.id}>{element.innerHTML}</Heading5>;
          case 'H6':
            return <Heading6 key={index} id={element.id}>{element.innerHTML}</Heading6>;
          default:
            return <div key={index} dangerouslySetInnerHTML={{ __html: element.outerHTML }} />;
        }
      } else {
        return <div key={index} dangerouslySetInnerHTML={{ __html: (child as Text).textContent || '' }} />;
      }
    });
  };

  return (
    <PageContainer>
      <Head>
        <title>{post.seo.title}</title>
        <meta name="description" content={post.seo.description} />
        <meta name="keywords" content={post.seo.keywords.join(', ')} />
        <meta property="og:title" content={post.seo.title} />
        <meta property="og:description" content={post.seo.description} />
        <meta property="og:image" content={post.featuredImage} />
        <meta property="og:url" content={`https://www.freelancedevelopmentagency.com//blog/${slug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.seo.title} />
        <meta name="twitter:description" content={post.seo.description} />
        <meta name="twitter:image" content={post.featuredImage} />
      </Head>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <Sidebar ref={sidebarRef}>
          <TableOfContents content={contentWithIds} />
        </Sidebar>
        <MainContent>
          <Title>{post.title}</Title>
          <DateText>Published on {new Date(post.publishedAt).toLocaleDateString()}</DateText>
          {post.featuredImage && (
            <div className="mb-6">
              <Image
                src={post.featuredImage}
                alt={post.altText}
                width={800}
                height={450}
                layout="responsive"
                // priority={true} 
                className="rounded"
                loading="lazy"
              />
            </div>
          )}
          <Content>
            {renderContentWithHeadings(contentWithIds)}
          </Content>
          {post.references && (
            <Section>
              <h3>References</h3>
              <div className="prose prose-sm">
                <div dangerouslySetInnerHTML={{ __html: post.references }}></div>
              </div>
            </Section>
          )}
          {post.authorBio && (
            <Section>
              <h3>Author Bio</h3>
              <p className="prose prose-sm">{post.authorBio}</p>
            </Section>
          )}
          {/* <Section>
            <h3>Related Posts</h3>
            <ul className="list-disc list-inside"> 
              <li><Link href="/blog/related-post-1">Related Post 1</Link></li>
              <li><Link href="/blog/related-post-2">Related Post 2</Link></li>
              <li><Link href="/blog/related-post-3">Related Post 3</Link></li>
            </ul>
          </Section> */}
          {/* Example usage of HeavyComponent */}
          <HeavyComponent />
        </MainContent>
      </div>
    </PageContainer>
  );
};

export default BlogDetail;
