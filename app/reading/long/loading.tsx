/** 긴 글 목록 로딩 시 스켈레톤 */
export default function LongListLoading() {
  return (
    <div className="w-full max-w-7xl animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200 mb-2" />
      <div className="h-5 w-full max-w-xl rounded bg-gray-100 mb-8" />
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <li key={i} className="flex flex-col rounded-xl border border-gray-200 bg-white min-w-0">
            <div className="aspect-video w-full rounded-t-xl bg-gray-200" />
            <div className="p-5 sm:p-6 flex flex-col flex-1">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="h-7 w-16 rounded-full bg-gray-100" />
                <span className="h-7 w-20 rounded-full bg-gray-100" />
              </div>
              <div className="h-7 w-full rounded bg-gray-200 mb-2" />
              <div className="h-7 w-3/4 rounded bg-gray-100 mb-5" />
              <div className="h-12 w-full rounded-lg bg-gray-200 mt-auto" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
