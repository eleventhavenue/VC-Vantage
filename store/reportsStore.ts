// store/reportsStore.ts

import { create } from 'zustand';

interface SearchParams {
  query: string;
  type: 'people' | 'company';
}

interface SearchResults {
  overview: string;
  marketAnalysis: string;
  financialAnalysis: string;
  strategicAnalysis: string;
  summary: string;
  keyQuestions: string[];
}

interface ReportsState {
  isLoading: boolean;
  results: SearchResults | null;
  error: string | null;
  currentSearch: SearchParams | null;
  fetchReport: (query: string, type: 'people' | 'company') => Promise<void>;
  resetReport: () => void;
  setError: (message: string) => void;
}

export const useReportsStore = create<ReportsState>((set, get) => {
  // Initialize from localStorage
  const initializeFromLocalStorage = () => {
    if (typeof window === 'undefined') return;

    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) {
      try {
        const { query, type } = JSON.parse(lastSearch);
        if (query && (type === 'people' || type === 'company')) {
          const storageKey = `report_${encodeURIComponent(query)}_${type}`;
          const storedData = localStorage.getItem(storageKey);
          if (storedData) {
            const results: SearchResults = JSON.parse(storedData);
            set({ currentSearch: { query, type }, results });
          }
        }
      } catch (e) {
        console.error('Error initializing store from localStorage:', e);
      }
    }
  };

  // Call the initialization function
  initializeFromLocalStorage();

  return {
    isLoading: false,
    results: null,
    error: null,
    currentSearch: null,
    
    fetchReport: async (query: string, type: 'people' | 'company') => {
      // Prevent duplicate fetches for the same query and type
      const { currentSearch, isLoading } = get();
      if (isLoading && currentSearch?.query === query && currentSearch.type === type) {
        return;
      }

      // Check if results for the current search already exist
      if (currentSearch?.query === query && currentSearch.type === type && get().results) {
        return;
      }

      set({ isLoading: true, error: null, currentSearch: { query, type }, results: null });

      try {
        const response = await fetch('/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query, type }),
        });

        const contentType = response.headers.get('content-type');
        if (!response.ok || !contentType?.includes('application/json')) {
          const text = await response.text();
          throw new Error(`Server error: ${response.status} ${response.statusText} - ${text}`);
        }

        const data: SearchResults = await response.json();

        set({ results: data, isLoading: false });

        // Store the latest search in localStorage
        localStorage.setItem('lastSearch', JSON.stringify({ query, type }));
        
        // Optionally, store the results with a unique key
        const storageKey = `report_${encodeURIComponent(query)}_${type}`;
        localStorage.setItem(storageKey, JSON.stringify(data));
      } catch (error: unknown) {
        console.error('Error fetching results:', error);
        if (error instanceof Error) {
          set({ error: error.message, isLoading: false });
        } else {
          set({ error: 'Failed to fetch results. Please try again later.', isLoading: false });
        }
      }
    },

    resetReport: () => {
      set({ isLoading: false, results: null, error: null, currentSearch: null });
    },

    setError: (message: string) => {
      set({ error: message, isLoading: false, results: null, currentSearch: null });
    },
  };
});
