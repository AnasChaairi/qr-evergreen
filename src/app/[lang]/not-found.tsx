import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-16 text-center">
      <h1 className="text-3xl font-bold text-stone-900">Page not found · Page introuvable</h1>
      <p className="text-stone-600">
        <Link href="/" className="font-medium text-brand-700 underline">
          QR Evergreen
        </Link>
      </p>
    </main>
  );
}
