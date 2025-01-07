import axios from 'axios';

export const checkTitleLength = (title: string) => {
  if (title.length < 50 || title.length > 60) {
    return {
      message: `Title should be between 50-60 characters. Current length: ${title.length}.`,
      isValid: false,
    };
  }
  return {
    message: `Title length is optimal. Current length: ${title.length}.`,
    isValid: true,
  };
};

export const checkMetaDescriptionLength = (description: string) => {
  if (description.length < 150 || description.length > 160) {
    return {
      message: `Meta description should be between 150-160 characters. Current length: ${description.length}.`,
      isValid: false,
    };
  }
  return {
    message: `Meta description length is optimal. Current length: ${description.length}.`,
    isValid: true,
  };
};

export const checkKeywordsPresence = (content: string, keywords: string[]) => {
  const missingKeywords = keywords.filter(keyword => !content.includes(keyword));
  if (missingKeywords.length > 0) {
    return {
      message: `Content is missing keywords: ${missingKeywords.join(', ')}.`,
      isValid: false,
    };
  }
  return {
    message: 'All keywords are present in the content.',
    isValid: true,
  };
};

export const checkKeywordSuggestionsPresence = (content: string, suggestions: string[]) => {
  const presentSuggestions = suggestions.filter(suggestion => content.includes(suggestion));
  const missingSuggestions = suggestions.filter(suggestion => !content.includes(suggestion));
  return {
    message: `Content has ${presentSuggestions.length} out of ${suggestions.length} keyword suggestions. Missing: ${missingSuggestions.join(', ')}.`,
    isValid: missingSuggestions.length === 0,
  };
};

export const fetchKeywordSuggestions = async (query: string) => {
  if (!query) return [];

  try {
    const response = await axios.get(`/api/keywords?query=${encodeURIComponent(query)}`);
    // console.log('API response:', response.data); // Add this line
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching keyword suggestions:', error.message);
    } else {
      console.error('Unknown error fetching keyword suggestions');
    }
    return [];
  }
};
