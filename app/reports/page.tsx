// app/reports/page.tsx

'use client';

import React, { Suspense } from 'react';
import ReportsContent from './ReportsContent';
import Spinner from '@/components/ui/Spinner';

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
