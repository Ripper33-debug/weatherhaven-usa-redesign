/** Inline banner when a form saved but email delivery had issues. */
export function FormSubmitEmailWarning({ message }: { message: string }) {
  return (
    <p
      className="mt-6 max-w-md rounded border border-amber-500/30 bg-amber-950/30 px-4 py-3 text-sm text-amber-100"
      role="status"
    >
      {message}
    </p>
  );
}
