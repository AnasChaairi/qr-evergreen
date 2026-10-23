// Three QR finder squares and a sun-coloured leaf: the codes stay alive.
export function Logo({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="9" fill="#0f6b45" />
      <rect x="6" y="6" width="7" height="7" rx="2" fill="#fff" />
      <rect x="19" y="6" width="7" height="7" rx="2" fill="#fff" />
      <rect x="6" y="19" width="7" height="7" rx="2" fill="#fff" />
      <path d="M26 16c-6 0-9.5 3.2-9.5 8.6 0 .8.1 1.6.3 2.3 1-3.1 3.1-5.4 6.1-6.9-2.4 1.7-4 4-4.7 6.9 5.6-.2 7.8-5.1 7.8-10.9z" fill="#ffd15c" />
    </svg>
  );
}
