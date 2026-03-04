export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="w-full max-w-md mx-auto overflow-y-auto max-h-full">
        {children}
      </div>
    </div>
  );
}
