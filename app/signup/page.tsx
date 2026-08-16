"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setLoading(true);
    setMessage(null);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        window.location.href = "/dashboard";
        return;
      }

      setMessage(
        "Account created. If email confirmation is enabled, check your inbox.",
      );
    } catch {
      setMessage("Unexpected error while creating the account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Image
            src="/brand/grounded-logo.png"
            alt="Grounded"
            width={200}
            height={100}
            sizes="(max-width: 640px) 160px, 200px"
            className="h-auto w-full max-w-[200px] object-contain"
            priority
          />
        </div>

        <h1 className="mb-6 text-sm text-gray-600">
          Create your Grounded account
        </h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-black px-4 py-2 text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {message ? (
          <p
            className="mt-4 text-sm text-gray-700"
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}

        <p className="mt-6 text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-2">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
