export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-muted-foreground mb-8">Page not found</p>
        <a href="/">
          <button className="btn-primary h-11 px-6 text-sm font-semibold rounded-xl text-white">
            Go Home
          </button>
        </a>
      </div>
    </div>
  );
}
