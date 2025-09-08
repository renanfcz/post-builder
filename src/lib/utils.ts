import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { POST_CONFIG } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern approach using Clipboard API
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'absolute';
      textArea.style.opacity = '0';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy text to clipboard:', error);
    return false;
  }
};

export const formatPostContent = (content: string): string => {
  // Remove extra whitespace and normalize line breaks
  return content
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, '\n\n') // Normalize multiple line breaks
    .trim();
};

export const truncatePost = (content: string, maxLength: number = POST_CONFIG.MAX_LENGTH): string => {
  if (content.length <= maxLength) {
    return content;
  }
  
  // Find the last space before the limit to avoid cutting words
  const lastSpace = content.lastIndexOf(' ', maxLength - 3);
  const cutPoint = lastSpace > maxLength * 0.8 ? lastSpace : maxLength - 3;
  
  return content.substring(0, cutPoint) + '...';
};

export const extractHashtags = (content: string): string[] => {
  const hashtags = content.match(/#[\w\u00c0-\u024f\u1e00-\u1eff]+/gi) || [];
  return [...new Set(hashtags)]; // Remove duplicates
};

export const formatTimestamp = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};
