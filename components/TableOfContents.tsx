import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

interface TableOfContentsProps {
  content: string;
}

const TOCContainer = styled.nav`
  ul {
    list-style-type: none;
    padding-left: 0;
    margin-bottom: 1rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  a {
    color: #4a4a4a;
    text-decoration: none;

    &.active {
      font-weight: bold;
      color: #68b937; /* Highlight color */
    }

    &:hover {
      text-decoration: underline;
    }
  }
`;

const TOCListItem = styled.li<{ level: number }>`
  padding-left: ${({ level }) => level * .5}rem;
`;

const TableOfContents: React.FC<TableOfContentsProps> = ({ content }) => {
  const [headings, setHeadings] = useState<{ level: number, id: string, text: string }[]>([]);
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    const extractHeadings = (content: string) => {
      const div = document.createElement('div');
      div.innerHTML = content;
      const headingElements = Array.from(div.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      return headingElements.map((heading) => ({
        level: parseInt(heading.tagName[1]),
        id: heading.id,
        text: heading.textContent || '',
      }));
    };

    setHeadings(extractHeadings(content));
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      headings.forEach((heading) => {
        const element = document.getElementById(heading.id);
        if (element) {
          observer.unobserve(element);
        }
      });
    };
  }, [headings]);

  const handleClick = (id: string) => {
    const yOffset = -100;
    const element = document.getElementById(id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <TOCContainer>
      <ul>
        {headings.map((heading) => (
          <TOCListItem key={heading.id} level={heading.level}>
            <a
              href={`#${heading.id}`}
              className={activeId === heading.id ? 'active' : ''}
              onClick={(e) => {
                e.preventDefault();
                handleClick(heading.id);
              }}
            >
              {heading.text}
            </a>
          </TOCListItem>
        ))}
      </ul>
    </TOCContainer>
  );
};

export default TableOfContents;
