"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NovaLogo } from "@/components/nova-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth/auth-client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const { error: authError } = await authClient.signUp.email({
        name,
        email,
        password,
      });
      if (authError) {
        setError(authError.message ?? "Something went wrong. Please try again.");
      } else {
        router.push("/dashboard");
      }
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--nova-surface)] px-6 py-12">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle className="bg-[var(--nova-card)] border border-[var(--nova-border)] shadow-sm" />
      </div>

      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <NovaLogo size="md" />
          </Link>
        </div>

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[var(--nova-text)]">Create your account</h1>
          <p className="mt-1 text-sm text-[var(--nova-muted)]">
            Get started with NovaPOS for free
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-sm font-medium text-[var(--nova-muted)]">
              Full Name
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Jane Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="h-10 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)] focus:border-[var(--nova-accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-[var(--nova-muted)]">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="h-10 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)] focus:border-[var(--nova-accent)]"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-[var(--nova-muted)]">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                className="h-10 rounded-lg border-[var(--nova-border)] bg-[var(--nova-tint-2)] text-[var(--nova-text)] placeholder:text-[var(--nova-dim)] focus:border-[var(--nova-accent)] pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--nova-muted)] hover:text-[var(--nova-text)] transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-10 rounded-lg bg-[var(--nova-accent)] hover:bg-[var(--nova-accent)]/90 text-white font-medium mt-2"
          >
            {isPending && <Loader2 size={16} className="animate-spin mr-2" />}
            {isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-[var(--nova-muted)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[var(--nova-accent)] hover:opacity-80 font-medium transition-opacity"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-6 text-center text-[11px] text-[var(--nova-dim)]">
          By creating an account you agree to our{" "}
          <span className="text-[var(--nova-muted)]">Terms of Service</span> and{" "}
          <span className="text-[var(--nova-muted)]">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
