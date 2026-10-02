export default function AdminPanelLoading(): React.JSX.Element {
  return (
    <div aria-hidden="true" className="space-y-6 animate-pulse">
      {/* Top Header Skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded-field bg-s1" />
          <div className="h-4 w-36 rounded-field bg-s2" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-28 rounded-btn bg-s1" />
          <div className="h-10 w-32 rounded-btn bg-s2" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex h-28 flex-col justify-between rounded-field border border-s1 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="h-4 w-20 rounded-field bg-s2" />
              <div className="size-8 rounded-field bg-s1" />
            </div>
            <div className="space-y-1">
              <div className="h-6 w-24 rounded-field bg-s1" />
              <div className="h-3 w-16 rounded-field bg-s2" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Chart and Lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="h-80 rounded-field border border-s1 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 h-5 w-32 rounded-field bg-s2" />
          <div className="h-60 w-full rounded-btn bg-cream/70" />
        </div>
        <div className="h-80 rounded-field border border-s1 bg-white p-6 shadow-sm">
          <div className="mb-4 h-5 w-28 rounded-field bg-s2" />
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="size-9 rounded-field bg-s1" />
                <div className="flex-1 space-y-1">
                  <div className="h-3.5 w-28 rounded-field bg-s2" />
                  <div className="h-2.5 w-16 rounded-field bg-s1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
