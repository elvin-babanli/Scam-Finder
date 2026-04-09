import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl ring-1 ring-zinc-800 bg-zinc-900/40 p-6 text-center">
        <div className="text-sm font-semibold text-zinc-200">TapLoop</div>
        <div className="mt-2 text-xs text-zinc-500">This page isn&apos;t available.</div>
        <div className="mt-5">
          <Link
            href="/"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-zinc-300 ring-1 ring-zinc-700 hover:bg-zinc-800/50"
          >
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
