/** 글 읽기 페이지 로딩 시 진행률 영역 자리 확보용 스켈레톤 */
export default function ReadingIdLoading() {
  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 w-full animate-pulse">
      {/* 모바일: 학습 진행률 자리 (sticky와 동일 높이) */}
      <div className="lg:hidden order-1 w-full shrink-0 sticky top-0 z-20 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between py-4 px-4 sm:px-5 min-h-[3.25rem]">
          <div className="h-5 w-24 rounded bg-gray-200" />
          <div className="h-5 w-20 rounded bg-gray-100" />
        </div>
      </div>
      {/* 본문 영역 스켈레톤 */}
      <div className="flex-1 min-w-0 pt-6 pb-4 lg:py-6 order-2 lg:order-1 max-w-3xl lg:max-w-none">
        <div className="h-8 w-3/4 rounded bg-gray-200 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-6 rounded bg-gray-100" style={{ width: `${90 - i * 5}%` }} />
          ))}
        </div>
      </div>
      {/* PC: 사이드바 자리 */}
      <div className="hidden lg:block lg:order-2 lg:shrink-0 lg:w-64 lg:max-w-[16rem]">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 h-64" />
      </div>
    </div>
  );
}
