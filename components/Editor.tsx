import React, { useRef, useState, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor = forwardRef<HTMLDivElement, EditorProps>(({ value, onChange }, ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [imageAttributes, setImageAttributes] = useState({ src: '', width: '', height: '', alt: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<HTMLImageElement | null>(null);
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({ visible: false, x: 0, y: 0 });
  const [wordCount, setWordCount] = useState(0);

  // Setting the initial content of the editor
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Updating value and word count when the content changes
  useEffect(() => {
    const handleInput = () => {
      const newContent = editorRef.current?.innerHTML || '';
      onChange(newContent);
      setWordCount(editorRef.current?.innerText.split(/\s+/).filter(word => word.length > 0).length || 0);
    };

    if (editorRef.current) {
      editorRef.current.addEventListener('input', handleInput);
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.removeEventListener('input', handleInput);
      }
    };
  }, [onChange]);

  const handleCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
    // Syncing the new content after executing the command
    const newContent = editorRef.current?.innerHTML || '';
    onChange(newContent);
  };

  const handleLink = () => {
    const url = prompt('Enter the URL');
    if (url && editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.target = '_blank';
        anchor.appendChild(range.extractContents());
        range.insertNode(anchor);
        // Apply blue color to the link
        anchor.style.color = 'blue';
        // Syncing the new content after link insertion
        const newContent = editorRef.current?.innerHTML || '';
        onChange(newContent);
      }
    }
  };

  const handleInsertHTML = () => {
    const html = prompt('Enter the HTML code');
    if (html && editorRef.current) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const fragment = document.createRange().createContextualFragment(html);
        range.deleteContents();
        range.insertNode(fragment);
        // Syncing the new content after HTML insertion
        const newContent = editorRef.current?.innerHTML || '';
        onChange(newContent);
      }
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result) {
            const img = document.createElement('img');
            img.src = reader.result as string;
            img.alt = '';
            img.className = 'max-w-full h-auto resize';
            img.addEventListener('click', () => handleImageClick(img));
            if (editorRef.current) {
              const selection = window.getSelection();
              if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                range.insertNode(img);
                // Syncing the new content after image insertion
                const newContent = editorRef.current?.innerHTML || '';
                onChange(newContent);
              }
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleImageClick = (img: HTMLImageElement) => {
    setCurrentImage(img);
    setImageAttributes({
      src: img.src,
      width: img.width ? img.width.toString() : '',
      height: img.height ? img.height.toString() : '',
      alt: img.alt,
    });
    setShowEditModal(true);
  };

  const handleSaveImageAttributes = () => {
    if (currentImage) {
      currentImage.src = imageAttributes.src;
      currentImage.alt = imageAttributes.alt;
      currentImage.width = imageAttributes.width ? parseInt(imageAttributes.width) : currentImage.width;
      currentImage.height = imageAttributes.height ? parseInt(imageAttributes.height) : currentImage.height;
    }
    setShowEditModal(false);
  };

  const handleHeadingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    handleCommand('formatBlock', value);
  };

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setContextMenu({
      visible: true,
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleRemoveLink = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      let anchor = container as HTMLElement;
      if (anchor.nodeType === 3) {
        anchor = anchor.parentElement as HTMLElement;
      }
      if (anchor.tagName === 'A') {
        const textNode = document.createTextNode(anchor.textContent || '');
        anchor.replaceWith(textNode);
        // Syncing the new content after link removal
        const newContent = editorRef.current?.innerHTML || '';
        onChange(newContent);
      }
    }
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.ctrlKey) {
      switch (event.key) {
        case 'b':
          event.preventDefault();
          handleCommand('bold');
          break;
        case 'i':
          event.preventDefault();
          handleCommand('italic');
          break;
        case 'u':
          event.preventDefault();
          handleCommand('underline');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div className="container mx-auto mt-10">
      <div className="flex space-x-2 mb-4">
        <button
          type="button"
          onClick={() => handleCommand('bold')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
          title="Bold (Ctrl+B)"
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => handleCommand('italic')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
          title="Italic (Ctrl+I)"
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => handleCommand('underline')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
          title="Underline (Ctrl+U)"
        >
          Underline
        </button>
        <button
          type="button"
          onClick={() => handleCommand('insertOrderedList')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          OL
        </button>
        <button
          type="button"
          onClick={() => handleCommand('insertUnorderedList')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          UL
        </button>
        <button
          type="button"
          onClick={() => handleCommand('justifyLeft')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Align Left
        </button>
        <button
          type="button"
          onClick={() => handleCommand('justifyCenter')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Align Center
        </button>
        <button
          type="button"
          onClick={() => handleCommand('justifyRight')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Align Right
        </button>
        <button
          type="button"
          onClick={() => handleCommand('justifyFull')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Justify
        </button>
        <select
          onChange={handleHeadingChange}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          <option value="">Heading</option>
          <option value="H1">H1</option>
          <option value="H2">H2</option>
          <option value="H3">H3</option>
          <option value="H4">H4</option>
          <option value="H5">H5</option>
          <option value="H6">H6</option>
        </select>
        <button
          type="button"
          onClick={() => handleCommand('insertHorizontalRule')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          HR
        </button>
        <button
          type="button"
          onClick={() => handleCommand('insertHTML', '<code>code</code>')}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Code
        </button>
        <button
          type="button"
          onClick={handleLink}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Link
        </button>
        <button
          type="button"
          onClick={handleInsertHTML}
          className="px-1 py-1 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Insert HTML
        </button>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="px-4 py-2"
        />
      </div>
      <div
        ref={ref as React.RefObject<HTMLDivElement>}
        contentEditable={true}
        className="border border-gray-300 min-h-[300px] p-4 mt-2 rounded"
        onContextMenu={handleContextMenu}
        onKeyDown={handleKeyDown}
        // placeholder="Start typing here..."
      ></div>
      <div className="text-right text-gray-500 mt-2">Word Count: {wordCount}</div>

      {contextMenu.visible && (
        <div
          className="absolute bg-white border shadow-md"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleRemoveLink}
            className="block px-4 py-2 text-black hover:bg-gray-200"
          >
            Remove Link
          </button>
        </div>
      )}

      {showEditModal && createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-4 rounded shadow-lg">
            <h2 className="text-xl mb-4">Edit Image</h2>
            <input
              type="text"
              placeholder="Width (px)"
              value={imageAttributes.width}
              onChange={(e) => setImageAttributes({ ...imageAttributes, width: e.target.value })}
              className="border border-gray-300 p-2 rounded mb-2 w-full"
            />
            <input
              type="text"
              placeholder="Height (px)"
              value={imageAttributes.height}
              onChange={(e) => setImageAttributes({ ...imageAttributes, height: e.target.value })}
              className="border border-gray-300 p-2 rounded mb-2 w-full"
            />
            <input
              type="text"
              placeholder="Alt Text"
              value={imageAttributes.alt}
              onChange={(e) => setImageAttributes({ ...imageAttributes, alt: e.target.value })}
              className="border border-gray-300 p-2 rounded mb-2 w-full"
            />
            <button
              type="button"
              onClick={handleSaveImageAttributes}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mr-2"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
            >
              Cancel
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
});
Editor.displayName = 'Editor';

export default Editor;
