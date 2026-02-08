export default function Loading() {
  return (
    <div className="min-h-screen bg-[#faf8f5]">
      {/* Spacer for fixed nav */}
      <div className="h-20" />
      
      {/* Skeleton content */}
      <div className="container mx-auto px-4 pt-12 pb-8 animate-pulse">
        {/* Title skeleton */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="h-4 w-24 bg-gray-200 rounded-full mx-auto mb-6" />
          <div className="h-10 w-3/4 bg-gray-200 rounded-xl mx-auto mb-4" />
          <div className="h-5 w-2/3 bg-gray-100 rounded-lg mx-auto" />
        </div>
        
        {/* Content skeletons */}
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-40 bg-gray-100 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-gray-100 rounded-2xl" />
            <div className="h-48 bg-gray-100 rounded-2xl" />
          </div>
          <div className="h-32 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
