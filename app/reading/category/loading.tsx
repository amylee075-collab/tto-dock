/** 분야별 글 목록 로딩 시 스켈레톤 */
export default function CategoryListLoading() {
  return (
    <div className="w-full max-w-7xl animate-pulse">
      <div className="h-8 w-56 rounded bg-gray-200 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((col) => (
          <div
            key={col}
            className="min-w-0 flex flex-col rounded-2xl bg-gray-50 shadow-sm p-6 sm:p-8"
          >
            <div className="h-8 w-24 rounded bg-gray-200 mb-6" />
            <ul className="flex flex-col gap-6">
              {[1, 2].map((i) => (
                <li key={i} className="flex flex-col rounded-xl border border-gray-200 bg-white">
                  <div className="aspect-video w-full rounded-t-xl bg-gray-200" />
                  <div className="p-5 flex flex-col">
                    <div className="flex gap-2 mb-3">
                      <span className="h-7 w-14 rounded-full bg-gray-100" />
                      <span className="h-7 w-16 rounded-full bg-gray-100" />
                    </div>
                    <div className="h-6 w-full rounded bg-gray-200 mb-5" />
                    <div className="h-11 w-full rounded-lg bg-gray-200" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
