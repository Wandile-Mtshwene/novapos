"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CalendarDays, CreditCard, Users2, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NovaLogo } from "@/components/nova-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { authClient } from "@/lib/auth/auth-client";

const DEMO = { email: "demo@novapos.app", password: "demo1234" };

const FEATURES = [
  { icon: CalendarDays, text: "Book appointments and manage your calendar" },
  { icon: CreditCard, text: "Process payments with a modern POS checkout" },
  { icon: Users2, text: "Build customer profiles and track visit history" },
  { icon: BarChart3, text: "Understand your business with real-time reports" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function signIn(emailVal: string, passwordVal: string) {
    setError(null);
    startTransition(async () => {
      const { error: authError } = await authClient.signIn.email({
        email: emailVal,
        password: passwordVal,
      });
      if (authError) {
        setError(authError.message ?? "Invalid email or password.");
      } else {
        router.push("/dashboard");
      }
    });
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    signIn(email, password);
  }

  function handleDemoLogin() {
    setEmail(DEMO.email);
    setPassword(DEMO.password);
    signIn(DEMO.email, DEMO.password);
  }

  return (
    <div className="min-h-screen flex bg-[var(--nova-surface)]">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-10">
        <ThemeToggle className="bg-[var(--nova-card)] border border-[var(--nova-border)] shadow-sm" />
      </div>

      {/* Left branding panel */}
      <div className="hidden md:flex md:w-[45%] relative flex-col justify-between p-10 overflow-hidden bg-[var(--nova-deep)]">
        {/* Gradient orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-[var(--nova-accent)]/20 blur-[100px]" />
          <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[var(--nova-accent)]/10 blur-[80px]" />
        </div>

        <div className="relative">
          <Link href="/">
            <NovaLogo size="md" />
          </Link>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-[var(--nova-text)] leading-snug">
              The operating system<br />for service businesses.
            </h2>
            <p className="mt-3 text-sm text-[var(--nova-muted)] leading-relaxed max-w-xs">
              Bookings, POS, inventory, customers, and staff management, all in one beautifully designed platform.
            </p>
          </div>

          <ul className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--nova-accent-dim)]">
                  <Icon size={14} className="text-[var(--nova-accent)]" />
                </div>
                <span className="text-sm text-[var(--nova-muted)]">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-[11px] text-[var(--nova-dim)]">
          &copy; {new Date().getFullYear()} Nova Business OS. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 md:hidden">
          <Link href="/">
            <NovaLogo size="md" />
          </Link>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[var(--nova-text)]">Welcome back</h1>
            <p className="mt-1 text-sm text-[var(--nova-muted)]">
              Sign in to your NovaPOS account
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
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
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--nova-muted)]">
            No account?{" "}
            <Link
              href="/signup"
              className="text-[var(--nova-accent)] hover:opacity-80 font-medium transition-opacity"
            >
              Create one free
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-6 rounded-xl border border-[var(--nova-border)] bg-[var(--nova-card)] p-4">
            <p className="mb-3 text-center text-[10px] font-semibold uppercase tracking-wider text-[var(--nova-dim)]">
              Demo account
            </p>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isPending}
              className="flex w-full items-center justify-between rounded-lg border border-[var(--nova-border)] bg-[var(--nova-tint-1)] px-3 py-2.5 text-left transition-colors hover:border-[var(--nova-accent)]/30 hover:bg-[var(--nova-tint-2)] disabled:opacity-50"
            >
              <div className="space-y-0.5">
                <p className="font-mono text-xs text-[var(--nova-muted)]">{DEMO.email}</p>
                <p className="font-mono text-xs text-[var(--nova-dim)]">{DEMO.password}</p>
              </div>
              <span className="text-[10px] font-medium text-[var(--nova-accent)]">Sign in</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
