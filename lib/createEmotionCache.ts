import createCache from '@emotion/cache';

const isBrowser = typeof document !== 'undefined';

const createEmotionCache = () => {
  let insertionPoint;

  if (isBrowser) {
    const emotionInsertionPoint = document.querySelector('meta[name="emotion-insertion-point"]');
    insertionPoint = emotionInsertionPoint as HTMLElement | undefined;
  }

  return createCache({ key: 'css', insertionPoint });
};

export default createEmotionCache;
