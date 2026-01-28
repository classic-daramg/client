'use client';

export default function PostSkeleton() {
  return (
    <div className="bg-[#f4f5f7] min-h-screen animate-pulse">
      <div className="bg-white w-full max-w-md mx-auto">
        <div className="px-5 py-3 flex items-center gap-1 border-b border-[#f4f5f7]">
          <div className="w-6 h-6 bg-gray-200 rounded" />
          <div className="flex-1 h-4 bg-gray-200 rounded mx-auto max-w-[120px]" />
          <div className="w-12 h-6 bg-gray-200 rounded-full" />
        </div>
        <div className="px-5 py-5">
          <div className="flex items-start gap-2 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-md" />
            <div className="flex-1">
              <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
              <div className="h-2 bg-gray-200 rounded w-24" />
            </div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-full mb-2" />
          <div className="h-3 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}
