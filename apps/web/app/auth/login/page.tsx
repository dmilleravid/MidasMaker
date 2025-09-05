"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLoginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/login-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");
      if (data.token) {
        // Set cookie (client-side) and localStorage
        document.cookie = `auth_token=${data.token}; path=/`;
        localStorage.setItem("auth_token", data.token);
        const next = new URLSearchParams(window.location.search).get("next") || "/";
        window.location.href = next;
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onLoginGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/google/start`;
  };

  return (
    <div className="oauth-container">
      <main className="oauth-main oauth-main-lgap">
        <h1 className="text-2xl font-semibold tracking-[-.01em]">Login</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button onClick={onLoginGoogle} className="oauth-btn">Continue with Google</button>
        <form onSubmit={onLoginEmail} className="flex flex-col gap-3 w-full max-w-sm">
          <input className="oauth-btn" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="oauth-btn" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="oauth-btn" type="submit">{loading ? "Signing in..." : "Sign in"}</button>
        </form>
        <Link href="/auth/signup" className="oauth-btn">Sign Up</Link>
      </main>
    </div>
  );
}


