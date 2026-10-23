import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-20 text-center">
      <p className="font-display text-7xl font-extrabold text-brand-700">404</p>
      <h1 className="text-3xl font-extrabold text-stone-900 sm:text-4xl">Page not found · Page introuvable</h1>
      <Link href="/" className="btn btn-primary">
        QR Evergreen
      </Link>
    </main>
  );
}
