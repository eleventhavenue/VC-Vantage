// app/reports/saved/page.tsx
import React, { Suspense } from 'react'
import ReportsList from '../saved/ReportsList' // or wherever your ReportsList is
import Spinner from '@/components/ui/Spinner'

export const dynamic = 'force-dynamic';

export default function SavedReportsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen">
          <Spinner />
        </div>
      }
    >
      <ReportsList />
    </Suspense>
  );
}
