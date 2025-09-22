export function WorkspaceHeaderSkeleton() {
  return (
    <div className="border-b border-gray-200 pb-6 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          {/* Logo Skeleton */}
          <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0"></div>
          
          {/* Workspace Info Skeleton */}
          <div className="flex-1 space-y-3">
            <div className="h-8 bg-gray-200 rounded w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-96"></div>
            <div className="flex items-center space-x-4">
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
              <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
        
        {/* Edit Button Skeleton */}
        <div className="h-9 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  );
}

export function MembersSectionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="h-9 bg-gray-200 rounded w-32"></div>
      </div>
      
      {/* Member Cards */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg px-6 py-5">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1 min-w-0">
                {/* Avatar */}
                <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
                
                {/* Member Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center space-x-3">
                    <div className="h-5 bg-gray-200 rounded w-32"></div>
                    {index === 0 && <div className="w-4 h-4 bg-gray-200 rounded"></div>}
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                  <div className="flex items-center space-x-4">
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MembersLoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 2 }).map((_, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg px-6 py-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1 min-w-0">
              {/* Avatar */}
              <div className="w-12 h-12 bg-gray-200 rounded-full shrink-0"></div>
              
              {/* Member Info */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="h-5 bg-gray-200 rounded w-32"></div>
                  {index === 0 && <div className="w-4 h-4 bg-gray-200 rounded"></div>}
                </div>
                <div className="h-4 bg-gray-200 rounded w-48"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkspaceSettingsSkeleton() {
  return (
    <div className="space-y-8">
      <WorkspaceHeaderSkeleton />
      <MembersSectionSkeleton />
    </div>
  );
}
