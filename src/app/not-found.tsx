import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl ring-1 ring-inset ring-zinc-800 p-6">
        <div className="text-lg font-semibold">Not found</div>
        <div className="text-sm text-zinc-400 mt-2">
          The page you requested doesn’t exist, or you don’t have access.
        </div>
        <div className="mt-5">
          <ButtonLink href="/" variant="secondary">
            Back home
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}

