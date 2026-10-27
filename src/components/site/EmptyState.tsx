type Props = {
  title?: string;
  message: string;
  action?: React.ReactNode;
};

export function EmptyState({
  title = "Nothing here yet",
  message,
  action,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-sm font-medium text-white/80">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-white/45">{message}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
