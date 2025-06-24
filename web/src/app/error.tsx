'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Something went wrong!</h2>
      <details style={{ whiteSpace: 'pre-wrap', marginTop: '1rem' }}>
        <summary>Error details</summary>
        {error.message}
        {error.stack}
      </details>
      <button onClick={reset} style={{ marginTop: '1rem' }}>
        Try again
      </button>
    </div>
  );
}
