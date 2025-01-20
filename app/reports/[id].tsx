// app/reports/[id].tsx

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import FeedbackModal from '@/components/FeedbackModal'; // Ensure the path is correct
import { CheckCircle } from 'lucide-react'; // Removed XCircle

// Define the Report interface
interface Report {
  id: string;
  query: string;
  type: 'people' | 'company';
  overview: string;
  marketAnalysis: string;
  financialAnalysis: string;
  strategicAnalysis: string;
  summary: string;
  keyQuestions: string[];
  // Add other fields if necessary
}

export default function ReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('id'); // Assuming report ID is passed as a query parameter

  const [report, setReport] = useState<Report | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) return;
      try {
        const response = await fetch(`/api/reports/${reportId}`);
        if (response.ok) {
          const data: Report = await response.json();
          setReport(data);
        } else {
          alert('Report not found.');
          router.push('/search');
        }
      } catch (error) {
        console.error('Error fetching report:', error);
        alert('An error occurred while fetching the report.');
        router.push('/search');
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [reportId, router]);

  const openFeedbackModal = () => {
    setIsFeedbackModalOpen(true);
  };

  const closeFeedbackModal = () => {
    setIsFeedbackModalOpen(false);
  };

  if (isLoading) {
    return <div className="text-center mt-10">Loading...</div>;
  }

  if (!report) {
    return <div className="text-center mt-10">Report not found.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
          Report for {report.query}
        </h1>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Overview
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{report.overview}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Market Analysis
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{report.marketAnalysis}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Financial Analysis
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{report.financialAnalysis}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Strategic Analysis
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{report.strategicAnalysis}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Summary
          </h2>
          <p className="text-gray-700 dark:text-gray-300">{report.summary}</p>
        </section>
        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Key Questions
          </h2>
          <ul className="list-disc list-inside text-gray-700 dark:text-gray-300">
            {report.keyQuestions.map((question: string, index: number) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </section>
        <div className="flex justify-end">
          <Button onClick={openFeedbackModal} className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Provide Feedback</span>
          </Button>
        </div>
      </div>

      {/* Feedback Modal */}
      {isFeedbackModalOpen && (
        <FeedbackModal onClose={closeFeedbackModal} reportId={report.id} />
      )}
    </div>
  );
}
