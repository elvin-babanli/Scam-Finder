import { ButtonLink } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <main className="mx-auto max-w-5xl px-4 py-14">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white text-zinc-950 grid place-items-center font-semibold">
            SF
          </div>
          <div>
            <div className="text-lg font-semibold">Scam Finder</div>
            <div className="text-sm text-zinc-400">
              Consent-based diagnostics and evidence organization.
            </div>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-zinc-950 ring-1 ring-inset ring-zinc-800 p-6">
            <div className="text-sm font-semibold">Admin dashboard</div>
            <div className="mt-2 text-sm text-zinc-400">
              Organize cases, evidence, transcripts, payment details, diagnostic
              sessions (consent-based), and export clean PDF reports.
            </div>
            <div className="mt-5 flex gap-3">
              <ButtonLink href="/login" variant="primary">
                Admin login
              </ButtonLink>
              <ButtonLink href="/dashboard" variant="secondary">
                Go to dashboard
              </ButtonLink>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-950 ring-1 ring-inset ring-zinc-800 p-6">
            <div className="text-sm font-semibold">Public diagnostic link</div>
            <div className="mt-2 text-sm text-zinc-400">
              A visitor can voluntarily share basic technical details after
              explicit consent. Optional tests (precise geolocation, camera,
              microphone) require separate opt-in and are disabled by default.
            </div>
            <div className="mt-5 text-sm text-zinc-500">
              Create a share link from the admin dashboard (Settings → Public
              diagnostic links).
            </div>
          </div>
        </div>

        <div className="mt-10 text-xs text-zinc-500">
          This tool is built for lawful, consent-based evidence organization and
          voluntary diagnostics only.
        </div>
      </main>
    </div>
  );
}
