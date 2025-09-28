export function CredentialsControlsSkeleton() {
  return (
    <div className="flex items-center gap-3 animate-pulse">
      {/* Search Input Skeleton */}
      <div className="flex-1 max-w-md">
        <div className="h-10 bg-gray-200 rounded-lg"></div>
      </div>

      {/* Filter Button Skeleton */}
      <div className="h-10 bg-gray-200 rounded-lg w-20"></div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Add Button Skeleton */}
      <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
    </div>
  );
}

export function CredentialsTableSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Table Header */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3">
        <div className="grid grid-cols-6 gap-6">
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-4 bg-gray-200 rounded w-8"></div>
          <div className="h-4 bg-gray-200 rounded w-12"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-slate-200">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-6 gap-6 items-center">
              {/* Name Column */}
              <div className="flex items-center">
                <div className="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-lg"></div>
                <div className="ml-3 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>

              {/* Type Column */}
              <div className="h-6 bg-gray-200 rounded-full w-20"></div>

              {/* Status Column */}
              <div className="h-6 bg-gray-200 rounded-full w-16"></div>

              {/* Created Column */}
              <div className="h-4 bg-gray-200 rounded w-20"></div>

              {/* Last Used Column */}
              <div className="h-4 bg-gray-200 rounded w-16"></div>

              {/* Actions Column */}
              <div className="flex items-center justify-end space-x-2">
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
                <div className="h-6 w-6 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CredentialsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Section Header - Always show real text */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Credentials</h2>
        <p className="text-sm text-slate-600 mt-1">Manage your API keys, database connections, and other credentials</p>
      </div>

      {/* Controls Section */}
      <CredentialsControlsSkeleton />

      {/* Table Section */}
      <CredentialsTableSkeleton />

      {/* Results Summary */}
      <div className="text-center animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto"></div>
      </div>
    </div>
  );
}
