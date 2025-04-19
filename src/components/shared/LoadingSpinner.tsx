export function LoadingSpinner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary-dark border-t-transparent" />
    </div>
  );
}