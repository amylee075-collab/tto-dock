export default function CoreWordLoading() {
  return (
    <div className="py-6">
      <div className="space-y-5 animate-pulse">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="h-7 w-48 rounded bg-gray-100" />
          <div className="mt-3 h-4 w-64 rounded bg-gray-100" />
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="h-40 rounded-3xl bg-gray-100" />
          <div className="mt-5 flex gap-3">
            <div className="h-12 flex-1 rounded-2xl bg-gray-100" />
            <div className="h-12 flex-1 rounded-2xl bg-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
