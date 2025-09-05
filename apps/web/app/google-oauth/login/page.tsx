"use client";
import React from "react";
import Link from "next/link";

export default function GoogleLoginPage() {
  const handleLogin = () => {
    // Redirect to API start endpoint
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001"}/api/auth/google/start`;
  };

  return (
    <div className="oauth-container">
      <main className="oauth-main oauth-main-lgap">
        <h1 className="text-2xl font-semibold tracking-[-.01em]">Sign in with Google</h1>
        <button onClick={handleLogin} className="oauth-btn">Continue with Google</button>
        <Link href="/" className="oauth-btn">Back to Home</Link>
      </main>
    </div>
  );
}


