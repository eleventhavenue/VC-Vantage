// app/store/reportsStore.ts

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
}

export const useReportsStore = create<ReportsState>((set, get) => ({
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
}));
