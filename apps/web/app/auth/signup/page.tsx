"use client";
import React, { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSignupEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Signup failed");
      if (data.token) {
        document.cookie = `auth_token=${data.token}; path=/`;
        localStorage.setItem("auth_token", data.token);
        window.location.href = "/";
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const onSignupGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/google/start`;
  };

  return (
    <div className="oauth-container">
      <main className="oauth-main oauth-main-lgap">
        <h1 className="text-2xl font-semibold tracking-[-.01em]">Sign Up</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button onClick={onSignupGoogle} className="oauth-btn">Continue with Google</button>
        <form onSubmit={onSignupEmail} className="flex flex-col gap-3 w-full max-w-sm">
          <input className="oauth-btn" placeholder="Name (optional)" type="text" value={name} onChange={(e) => setName(e.target.value)} />
          <input className="oauth-btn" placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="oauth-btn" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} className="oauth-btn" type="submit">{loading ? "Creating account..." : "Create account"}</button>
        </form>
        <Link href="/auth/login" className="oauth-btn">Back to Login</Link>
      </main>
    </div>
  );
}


