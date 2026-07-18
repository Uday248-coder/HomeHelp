export default function Loading() {
  return (
    <main id="main" className="container-page section-padding" aria-busy="true" aria-live="polite">
      <div className="space-y-6">
        <div className="skeleton h-10 w-48" />
        <div className="skeleton h-6 w-72" />
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-64 rounded-2xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
