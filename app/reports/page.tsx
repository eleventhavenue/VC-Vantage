// app/reports/page.tsx

'use client';

import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Spinner from '@/components/ui/Spinner';

const ReportsContent = dynamic(() => import('./ReportsContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen">
      <Spinner />
    </div>
  ),
});

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}
