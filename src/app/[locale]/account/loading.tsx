export default function AccountLoading(): React.JSX.Element {
  return (
    <div aria-hidden="true" className="space-y-8 animate-pulse pt-4">
      {/* Welcome Banner Skeleton */}
      <div className="rounded-xl border border-s2 bg-cream p-6 sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-3 w-28 rounded-field bg-s2" />
            <div className="h-7 w-48 rounded-field bg-s1" />
            <div className="h-4 w-72 rounded-field bg-s2" />
          </div>
          <div className="h-7 w-40 rounded-pill bg-s2" />
        </div>

        {/* Quick Navigation Tiles Skeleton */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="flex h-32 flex-col justify-between rounded-btn border border-s2 bg-iv p-4"
            >
              <div className="flex items-center justify-between">
                <div className="size-10 rounded-field bg-s1" />
                <div className="h-6 w-8 rounded-field bg-s2" />
              </div>
              <div className="space-y-1.5">
                <div className="h-4 w-24 rounded-field bg-s2" />
                <div className="h-3 w-32 rounded-field bg-s1" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="space-y-4 rounded-xl border border-s2 bg-cream p-6 sm:p-8">
        <div className="h-5 w-36 rounded-field bg-s2" />
        <div className="h-28 w-full rounded-btn border border-s2 bg-iv" />
      </div>
    </div>
  );
}
