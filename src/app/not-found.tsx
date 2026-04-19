import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <p className="text-[--color-neon-cyan] text-sm font-mono mb-4 glow-text-cyan">404</p>
      <h1 className="text-4xl font-bold mb-4">Page not found</h1>
      <p className="text-[--color-muted] mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="px-6 py-3 rounded-lg neon-border-purple text-[--color-neon-purple] font-semibold hover:glow-purple transition-all"
      >
        Back to home
      </Link>
    </div>
  );
}
