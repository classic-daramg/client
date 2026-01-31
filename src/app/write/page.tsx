import { Suspense } from 'react';
import WriteContent from './write-content';

function WriteSkeleton() {
  return (
    <div className="relative w-full max-w-md mx-auto min-h-screen bg-white flex flex-col">
      <div className="h-16 bg-gray-200 animate-pulse" />
      <div className="flex-1 space-y-4 p-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<WriteSkeleton />}>
      <WriteContent />
    </Suspense>
  );
}
