// app/reports/page.tsx

// Remove the 'use client' directive
import React, { Suspense } from 'react';
import ReportsClientComponent from './ReportsClientComponent';
import Spinner from '@/components/ui/Spinner';

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    }>
      <ReportsClientComponent />
    </Suspense>
  );
}
