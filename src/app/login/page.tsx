"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardBody, CardHeader } from "@/components/ui/card";

export default function LoginPage() {
  const [from, setFrom] = useState("/dashboard");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setFrom(p.get("from") ?? "/dashboard");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: from,
      });
      if (!res || res.error) {
        setError("Invalid admin credentials.");
        return;
      }
      window.location.href = res.url ?? from;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-zinc-950">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-lg font-semibold">Admin login</div>
          <div className="text-sm text-zinc-400">
            Sign in to access the investigation dashboard.
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-zinc-400">Email</label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-zinc-400">Password</label>
              <Input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error ? (
              <div className="text-sm text-red-300 bg-red-950/40 ring-1 ring-inset ring-red-900/40 rounded-md px-3 py-2">
                {error}
              </div>
            ) : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in…" : "Sign in"}
            </Button>
            <div className="text-xs text-zinc-500">
              Tip: set `ADMIN_EMAIL` and `ADMIN_PASSWORD`, run migrations, then
              run `npm run seed`.
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

