// app/results/page.tsx

import React, { Suspense } from 'react';
import ResultsClientComponent from './ResultsClientComponent';
import Spinner from '@/components/ui/Spinner';

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    }>
      <ResultsClientComponent />
    </Suspense>
  );
}
