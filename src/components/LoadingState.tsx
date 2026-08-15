"use client";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10" };
  return (
    <div className={`${sizes[size]} border-2 border-slate-600 border-t-blue-500 rounded-full animate-spin`} />
  );
}

export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-slate-400 max-w-md">{description}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="shimmer h-4 w-24 rounded" />
      <div className="shimmer h-5 w-3/4 rounded" />
      <div className="shimmer h-4 w-1/2 rounded" />
      <div className="flex gap-2 mt-3">
        <div className="shimmer h-6 w-16 rounded" />
        <div className="shimmer h-6 w-16 rounded" />
        <div className="shimmer h-6 w-16 rounded" />
      </div>
    </div>
  );
}
