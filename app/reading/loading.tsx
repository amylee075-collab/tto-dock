export default function ReadingLoading() {
  return (
    <div className="py-6">
      <div className="space-y-5 animate-pulse">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="h-7 w-40 rounded bg-gray-100" />
          <div className="mt-3 h-4 w-72 rounded bg-gray-100" />
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="h-52 rounded-3xl bg-white shadow-sm" />
          <div className="h-52 rounded-3xl bg-white shadow-sm" />
          <div className="h-52 rounded-3xl bg-white shadow-sm" />
          <div className="h-52 rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    </div>
  );
}
