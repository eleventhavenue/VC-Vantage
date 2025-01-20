// store/reportsStore.ts

import { create } from 'zustand';

interface ReportSummary {
  id: string;
  query: string;
  type: 'people' | 'company';
  createdAt: string;
}

interface SearchParams {
  query: string;
  type: 'people' | 'company';
  company?: string;
  title?: string;
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
  reports: ReportSummary[] | null;
  results: SearchResults | null;
  error: string | null;
  currentSearch: SearchParams | null;
  fetchReport: (
    query: string,
    type: 'people' | 'company',
    company?: string,
    title?: string
  ) => Promise<void>;
  fetchAllReports: () => Promise<void>;
  resetReport: () => void;
  setError: (message: string) => void;
}

export const useReportsStore = create<ReportsState>((set, get) => ({
  isLoading: false,
  reports: null,
  results: null,
  error: null,
  currentSearch: null,

  // Fetch a specific report based on search parameters
  fetchReport: async (query, type, company, title) => {
    // Prevent duplicate fetches for the same query and type
    const { currentSearch, isLoading, results } = get();
    if (
      isLoading &&
      currentSearch?.query === query &&
      currentSearch.type === type
    ) {
      return;
    }
    if (
      currentSearch?.query === query &&
      currentSearch.type === type &&
      results
    ) {
      return;
    }

    set({
      isLoading: true,
      error: null,
      currentSearch: { query, type, company, title },
      results: null,
    });

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, type, context: { company, title } }),
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          `Server error: ${response.status} ${response.statusText} - ${text}`
        );
      }

      const data: SearchResults = await response.json();

      set({ results: data, isLoading: false });

      // Store the latest search in localStorage
      localStorage.setItem(
        'lastSearch',
        JSON.stringify({ query, type, company, title })
      );

      // Optionally, store the results with a unique key
      const storageKey = `report_${encodeURIComponent(query)}_${type}`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error: unknown) {
      console.error('Error fetching results:', error);
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({
          error: 'Failed to fetch results. Please try again later.',
          isLoading: false,
        });
      }
    }
  },

  // Fetch all reports for listing
  fetchAllReports: async () => {
    set({ isLoading: true, error: null });

    try {
      const response = await fetch('/api/reports', {
        method: 'GET',
      });

      const contentType = response.headers.get('content-type');
      if (!response.ok || !contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          `Server error: ${response.status} ${response.statusText} - ${text}`
        );
      }

      const data: ReportSummary[] = await response.json();

      set({ reports: data, isLoading: false });

      // Optionally, cache reports in localStorage
      localStorage.setItem('reports', JSON.stringify(data));
    } catch (error: unknown) {
      console.error('Error fetching reports:', error);
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({
          error: 'Failed to fetch reports. Please try again later.',
          isLoading: false,
        });
      }
    }
  },

  resetReport: () => {
    set({ isLoading: false, results: null, error: null, currentSearch: null });
  },

  setError: (message: string) => {
    set({ error: message, isLoading: false, results: null, currentSearch: null });
  },
}));
