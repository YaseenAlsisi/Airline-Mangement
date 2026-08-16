import { useEffect } from 'react';

export const useDocumentTitle = (title) => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = `${title} | AAMS`;
    
    return () => {
      document.title = originalTitle;
    };
  }, [title]);
};
