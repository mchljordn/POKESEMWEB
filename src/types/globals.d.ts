import 'next';

// Extend the Window interface for browser APIs
declare global {
  interface Window {
    ENV: {
      FUSEKI_URL: string;
      NEXT_PUBLIC_API_URL: string;
    };
  }
}

// Export as module
export {};
