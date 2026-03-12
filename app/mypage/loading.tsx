export default function MypageLoading() {
  return (
    <div className="py-8">
      <div className="space-y-6 animate-pulse">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="h-7 w-48 rounded bg-gray-100" />
          <div className="mt-3 h-4 w-32 rounded bg-gray-100" />
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="h-6 w-40 rounded bg-gray-100" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="h-28 rounded-3xl bg-gray-100" />
            <div className="h-28 rounded-3xl bg-gray-100" />
            <div className="h-28 rounded-3xl bg-gray-100" />
          </div>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="h-6 w-36 rounded bg-gray-100" />
          <div className="mt-6 h-52 rounded-3xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}
