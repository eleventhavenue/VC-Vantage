// store/reportsStore.ts

import { create } from 'zustand';

interface ReportSummary {
  id: string;
  query: string;
  type: 'people' | 'company';
  createdAt: string;
}

// UPDATED: Now includes an optional `linkedinUrl` field.
interface SearchParams {
  query: string;
  type: 'people' | 'company';
  company?: string;
  title?: string;
  linkedinUrl?: string;
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
  // UPDATED: fetchReport now accepts a 5th optional param.
  fetchReport: (
    query: string,
    type: 'people' | 'company',
    company?: string,
    title?: string,
    linkedinUrl?: string,
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
  // UPDATED: Accepts `linkedinUrl` as the 5th arg
  fetchReport: async (query, type, company, title, linkedinUrl) => {
    const { currentSearch, isLoading, results } = get();

    // Prevent duplicate fetches for the same query & type while loading
    if (
      isLoading &&
      currentSearch?.query === query &&
      currentSearch.type === type
    ) {
      return;
    }
    // If we already have results for the same search, skip
    if (
      currentSearch?.query === query &&
      currentSearch.type === type &&
      results
    ) {
      return;
    }

    // Update state: set isLoading, clear error & results,
    // store all five possible fields in currentSearch
    set({
      isLoading: true,
      error: null,
      currentSearch: { query, type, company, title, linkedinUrl },
      results: null,
    });

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Pass the optional linkedinUrl in context
        body: JSON.stringify({
          query,
          type,
          context: {
            company,
            title,
            linkedinUrl,
          },
        }),
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
        JSON.stringify({ query, type, company, title, linkedinUrl })
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
